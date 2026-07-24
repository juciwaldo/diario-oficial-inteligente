"""
scraper.py — Motor de Scraping HTML-first para Diários Oficiais

Estratégia:
  1. Tenta HTML (rápido, sem OCR, texto limpo)
  2. Fallback para PDF se HTML indisponível
  3. OCR apenas se PDF for escaneado

Diários suportados:
  - DOU (Diário Oficial da União)  → in.gov.br — HTML/API disponível
  - DOBA (Diário Oficial da Bahia) → egba.ba.gov.br — HTML + PDF fallback
"""

import httpx
import asyncio
import json
from datetime import date, datetime
from bs4 import BeautifulSoup
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# MODELOS
# ─────────────────────────────────────────────────────────────────────────────

class ExtractionMethod(str, Enum):
    HTML = "html"
    PDF_NATIVE = "pdf_native"
    PDF_OCR = "pdf_ocr"


@dataclass
class PageContent:
    page_number: int
    text: str
    section: str = ""  # ex: "Convocação", "Nomeação"


@dataclass
class DiarioContent:
    journal: str           # "DOU" ou "DOBA"
    edition_date: date
    method: ExtractionMethod
    pages: list[PageContent]
    total_chars: int = 0
    source_url: str = ""

    def full_text(self) -> str:
        return "\n\n".join(p.text for p in self.pages)


# ─────────────────────────────────────────────────────────────────────────────
# DOU — Diário Oficial da União
# Fonte: in.gov.br
# HTML disponível por seção e data
# ─────────────────────────────────────────────────────────────────────────────

class DOUScraper:
    """
    Acessa o DOU em HTML via in.gov.br.
    Seções relevantes para concursos:
      - Seção 1: Atos do Poder Executivo (nomeações, exonerações)
      - Seção 2: Atos de interesse dos servidores (concursos, resultados)
      - Seção 3: Contratos, editais e avisos
    """

    BASE_URL = "https://www.in.gov.br"
    # Endpoint de leitura jornal — retorna publicações em HTML
    JORNAL_URL = "https://www.in.gov.br/leiturajornal"

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    SECTIONS = ["do1", "do2", "do3"]  # Seções 1, 2 e 3

    async def fetch(self, target_date: date = None) -> DiarioContent | None:
        """Busca o DOU do dia em HTML. Retorna None se indisponível."""
        if target_date is None:
            target_date = date.today()

        date_str = target_date.strftime("%d-%m-%Y")
        all_pages = []

        async with httpx.AsyncClient(headers=self.HEADERS, timeout=30.0, follow_redirects=True) as client:
            for section in self.SECTIONS:
                # Tenta primeiro com o parâmetro "secao" e depois "jornal" se necessário
                url = f"{self.JORNAL_URL}?data={date_str}&secao={section}"
                logger.info(f"DOU HTML: buscando {section} em {date_str} -> {url}")

                try:
                    response = await client.get(url)

                    if response.status_code != 200:
                        logger.warning(f"DOU {section}: HTTP {response.status_code}")
                        continue

                    # Extrai a lista de matérias do script#params
                    soup = BeautifulSoup(response.text, "html.parser")
                    script_tag = soup.find("script", id="params")
                    
                    if not script_tag:
                        logger.warning(f"DOU {section}: script#params não encontrado")
                        continue

                    try:
                        json_data = json.loads(script_tag.string or "")
                        json_array = json_data.get("jsonArray", [])
                    except Exception as json_err:
                        logger.error(f"DOU {section}: erro ao decodificar JSON do script: {json_err}")
                        continue

                    if not json_array:
                        logger.info(f"DOU {section}: nenhuma matéria encontrada")
                        continue

                    logger.info(f"DOU {section}: extraídas {len(json_array)} matérias no índice")

                    # Download das matérias em paralelo com semáforo para controle de concorrência
                    sem = asyncio.Semaphore(20)

                    async def fetch_article(item):
                        url_title = item.get("urlTitle")
                        if not url_title:
                            return None
                        art_url = f"{self.BASE_URL}/web/dou/-/{url_title}"
                        async with sem:
                            try:
                                # Verifica se a matéria já tem o conteúdo bruto disponível no JSON
                                content_text = item.get("content") or item.get("materia")
                                if content_text and len(content_text) > 50:
                                    if "<" in content_text and ">" in content_text:
                                        content_text = BeautifulSoup(content_text, "html.parser").get_text(separator=" ", strip=True)
                                    return art_url, content_text, item.get("pageNumber", "1"), item.get("title", "")

                                # Senão, baixa o artigo completo
                                res = await client.get(art_url, timeout=15)
                                if res.status_code == 200:
                                    art_soup = BeautifulSoup(res.text, "html.parser")
                                    art_body = (
                                        art_soup.select_one("div.texto-dou") or
                                        art_soup.select_one("div.dou-paragraph") or
                                        art_soup.select_one("article.materia") or
                                        art_soup.select_one("div.materia-texto") or
                                        art_soup.select_one("div#detalheMateria") or
                                        art_soup.select_one("body")
                                    )
                                    if art_body:
                                        text = art_body.get_text(separator=" ", strip=True)
                                        text = self._normalize_text(text)
                                        return art_url, text, item.get("pageNumber", "1"), item.get("title", "")
                            except Exception as ex:
                                logger.warning(f"DOU: erro ao baixar matéria {url_title}: {ex}")
                        return None

                    tasks = [fetch_article(item) for item in json_array]
                    results = await asyncio.gather(*tasks, return_exceptions=True)

                    page_num = len(all_pages)
                    for res in results:
                        if isinstance(res, tuple):
                            art_url, text, page_val, title = res
                            if len(text) > 20:
                                page_num += 1
                                try:
                                    p_num = int(page_val)
                                except ValueError:
                                    p_num = page_num
                                all_pages.append(PageContent(
                                    page_number=p_num,
                                    text=text,
                                    section=title or section.upper(),
                                ))

                    logger.info(f"DOU {section}: {len(all_pages)} matérias processadas com sucesso")
                    await asyncio.sleep(1)

                except httpx.TimeoutException:
                    logger.error(f"DOU {section}: timeout")
                except Exception as e:
                    logger.error(f"DOU {section}: erro inesperado — {e}")

        if not all_pages:
            logger.warning(f"DOU {date_str}: nenhum conteúdo HTML obtido")
            return None

        total = sum(len(p.text) for p in all_pages)
        logger.info(f"DOU {date_str}: {len(all_pages)} matérias, {total:,} caracteres")

        return DiarioContent(
            journal="DOU",
            edition_date=target_date,
            method=ExtractionMethod.HTML,
            pages=all_pages,
            total_chars=total,
            source_url=f"{self.JORNAL_URL}?data={date_str}",
        )

    def _normalize_text(self, text: str) -> str:
        """Remove espaços extras e normaliza o texto."""
        import re
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text


# ─────────────────────────────────────────────────────────────────────────────
# DOBA — Diário Oficial do Estado da Bahia
# Fonte: egba.ba.gov.br
# Estratégia: HTML quando disponível, PDF como fallback
# ─────────────────────────────────────────────────────────────────────────────

class DOBAScraper:
    """
    Acessa o DOBA (Diário Oficial do Estado da Bahia) via API HTML de edições e matérias.
    Fonte oficial: dool.egba.ba.gov.br
    """

    BASE_URL = "https://dool.egba.ba.gov.br"

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (compatible; DiarioInteligente/1.0)",
        "Accept": "application/json, text/html, */*",
    }

    async def fetch(self, target_date: date = None) -> DiarioContent | None:
        """Busca a edição do DOBA na data especificada e extrai todas as matérias em HTML."""
        if target_date is None:
            target_date = date.today()

        date_str = target_date.strftime("%Y-%m-%d")
        logger.info(f"DOBA: buscando edicao para {date_str}")

        try:
            limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
            async with httpx.AsyncClient(verify=False, timeout=45.0, headers=self.HEADERS, limits=limits) as client:
                api_url = f"{self.BASE_URL}/apifront/portal/edicoes/edicoes_from_data/{date_str}"
                res = await client.get(api_url)
                if res.status_code != 200:
                    logger.warning(f"DOBA: HTTP {res.status_code} na API edicoes")
                    return None

                data = res.json()
                if data.get("erro") or not data.get("itens"):
                    logger.warning(f"DOBA: nenhuma edicao encontrada para {date_str}")
                    return None

                edicao = data["itens"][0]
                edicao_id = edicao["id"]

                # Busca arquivo HTML com a lista de materias
                html_url = f"{self.BASE_URL}/html/{edicao_id}.html"
                res_html = await client.get(html_url)
                if res_html.status_code != 200:
                    logger.warning(f"DOBA: falha ao baixar {html_url}")
                    return None

                soup = BeautifulSoup(res_html.text, "html.parser")
                materias = [a.get("identificador") for a in soup.find_all("a", attrs={"identificador": True}) if a.get("identificador")]

                if not materias:
                    logger.warning(f"DOBA edicao {edicao_id}: nenhuma materia cadastrada")
                    return None

                # Baixa materias em paralelo com semáforo para evitar rate limit
                pages = []
                sem = asyncio.Semaphore(25)

                async def fetch_materia(m_id):
                    async with sem:
                        try:
                            r = await client.get(f"{self.BASE_URL}/apifront/portal/edicoes/publicacoes_ver_conteudo/{m_id}")
                            if r.status_code == 200:
                                return m_id, r.text
                        except Exception as ex:
                            logger.warning(f"DOBA: erro ao baixar materia {m_id}: {ex}")
                        return m_id, None

                tasks = [fetch_materia(m_id) for m_id in materias]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                for res in results:
                    if isinstance(res, tuple):
                        m_id, html_content = res
                        if html_content:
                            m_soup = BeautifulSoup(html_content, "html.parser")
                            text = m_soup.get_text(separator=" ", strip=True)
                            if len(text) > 30:
                                pages.append(PageContent(
                                    page_number=len(pages) + 1,
                                    text=text,
                                    section=f"Materia {m_id}",
                                ))

                if not pages:
                    return None

                total = sum(len(p.text) for p in pages)
                logger.info(f"DOBA {date_str}: {len(pages)} materias lidas ({total:,} chars)")
                return DiarioContent(
                    journal="DOBA",
                    edition_date=target_date,
                    method=ExtractionMethod.HTML,
                    pages=pages,
                    total_chars=total,
                    source_url=f"{self.BASE_URL}/ver-html/{edicao_id}",
                )

        except Exception as e:
            logger.error(f"DOBA erro: {e}")
            return None

    async def _extract_pdf_text(self, pdf_bytes: bytes) -> list[PageContent]:
        """Extrai texto do PDF (nativo primeiro, OCR como fallback)."""
        try:
            import fitz  # PyMuPDF
            pages = []
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")

            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                text = self._normalize_text(text)

                if len(text) < 50:
                    # Texto insuficiente — tenta OCR nessa página
                    text = await self._ocr_page(page)

                if text:
                    pages.append(PageContent(
                        page_number=page_num + 1,
                        text=text,
                    ))

            doc.close()
            return pages

        except ImportError:
            logger.error("PyMuPDF não instalado: pip install pymupdf")
            return []
        except Exception as e:
            logger.error(f"Erro ao extrair PDF: {e}")
            return []

    async def _ocr_page(self, page) -> str:
        """OCR de uma página usando Tesseract."""
        try:
            import pytesseract
            from PIL import Image
            import io

            # Renderiza página como imagem em alta resolução
            mat = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
            img_bytes = mat.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            text = pytesseract.image_to_string(img, lang="por")
            return self._normalize_text(text)

        except Exception as e:
            logger.warning(f"OCR falhou: {e}")
            return ""

    def _parse_html(self, html: str) -> list[PageContent]:
        """Extrai texto do HTML do DOBA."""
        soup = BeautifulSoup(html, "html.parser")

        # Remove elementos desnecessários
        for tag in soup(["script", "style", "nav", "header", "footer"]):
            tag.decompose()

        # Tenta encontrar o conteúdo principal
        main = (
            soup.find("main") or
            soup.find("div", class_="content") or
            soup.find("div", id="content") or
            soup.find("article") or
            soup.body
        )

        if not main:
            return []

        text = main.get_text(separator="\n", strip=True)
        text = self._normalize_text(text)

        if len(text) < 100:
            return []

        return [PageContent(page_number=1, text=text, section="DOBA")]

    def _normalize_text(self, text: str) -> str:
        import re
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# MOTOR PRINCIPAL DE BUSCA
# ─────────────────────────────────────────────────────────────────────────────

class SearchEngine:
    """
    Pesquisa variações de nome e palavras-chave no conteúdo extraído.
    """

    def search(
        self,
        content: DiarioContent,
        name_variations: list[str],
        keywords: list[str],
        context_window: int = 400,
    ) -> list[dict]:
        """
        Retorna lista de matches encontrados.
        Cada match contém: variação, página, posição, contexto, score.
        """
        full_text = content.full_text()
        matches = []

        for variation in name_variations:
            positions = self._find_positions(full_text, variation)

            for pos in positions:
                context = self._extract_context(full_text, pos, variation, context_window)
                score = self._calculate_score(context, keywords, variation)
                page = self._find_page(content.pages, pos)

                matches.append({
                    "variation_found": variation,
                    "page_number": page,
                    "position": pos,
                    "context": context,
                    "score": score,
                    "keywords_nearby": self._keywords_in_context(context, keywords),
                    "extraction_method": content.method.value,
                })

        # Remove duplicatas muito próximas (mesmo trecho, variações diferentes)
        matches = self._deduplicate(matches, min_distance=200)

        # Ordena por score decrescente
        matches.sort(key=lambda x: x["score"], reverse=True)

        return matches

    def _find_positions(self, text: str, term: str) -> list[int]:
        """Encontra todas as posições de um termo no texto (case, acento e quebras de linha insensíveis)."""
        import re
        import unicodedata

        def strip_accents(s: str) -> str:
            return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").upper()

        norm_text = strip_accents(text)
        norm_term = strip_accents(term)

        words = norm_term.split()
        if not words:
            return []

        pattern_str = r"\s+".join(re.escape(w) for w in words)
        pattern = re.compile(pattern_str)
        return [m.start() for m in pattern.finditer(norm_text)]

    def _extract_context(
        self, text: str, pos: int, term: str, window: int
    ) -> str:
        """Extrai o contexto ao redor do match."""
        start = max(0, pos - window)
        end = min(len(text), pos + len(term) + window)
        return text[start:end].strip()

    def _calculate_score(
        self, context: str, keywords: list[str], variation: str
    ) -> float:
        """
        Calcula score de relevância do match.
        Score base + bônus por palavras-chave próximas.
        """
        score = 1.0

        context_upper = context.upper()
        for keyword in keywords:
            if keyword.upper() in context_upper:
                # Palavras como "convocação" e "nomeação" têm peso maior
                high_priority = ["CONVOCAÇÃO", "NOMEAÇÃO", "CONVOCADO", "NOMEADO", "POSSE"]
                if keyword.upper() in high_priority:
                    score += 3.0
                else:
                    score += 1.0

        return round(score, 2)

    def _keywords_in_context(self, context: str, keywords: list[str]) -> list[str]:
        """Retorna quais palavras-chave aparecem no contexto."""
        found = []
        context_upper = context.upper()
        for kw in keywords:
            if kw.upper() in context_upper:
                found.append(kw)
        return found

    def _find_page(self, pages: list[PageContent], position: int) -> int:
        """Encontra em qual página está uma posição do texto completo."""
        accumulated = 0
        for page in pages:
            accumulated += len(page.text) + 2  # +2 pelo separador \n\n
            if position < accumulated:
                return page.page_number
        return pages[-1].page_number if pages else 1

    def _deduplicate(self, matches: list[dict], min_distance: int) -> list[dict]:
        """Remove matches muito próximos (provavelmente o mesmo trecho)."""
        if not matches:
            return []

        unique = [matches[0]]
        for match in matches[1:]:
            is_duplicate = any(
                abs(match["position"] - u["position"]) < min_distance
                for u in unique
            )
            if not is_duplicate:
                unique.append(match)

        return unique


# ─────────────────────────────────────────────────────────────────────────────
# ORQUESTRADOR — Junta tudo
# ─────────────────────────────────────────────────────────────────────────────

class DiarioOrchestrator:
    """
    Ponto de entrada principal.
    Coordena scraping → busca → resultado.
    """

    def __init__(self):
        self.dou = DOUScraper()
        self.doba = DOBAScraper()
        self.engine = SearchEngine()

    async def run(
        self,
        journals: list[str],          # ["DOU", "DOBA"]
        name_variations: list[str],   # ["JUCIVALDO SOUZA DOS SANTOS", ...]
        keywords: list[str],          # ["Convocação", "Nomeação", ...]
        target_date: date = None,
    ) -> dict:
        """
        Executa a pesquisa completa para os diários especificados.
        Retorna dict com resultados e metadados.
        """
        if target_date is None:
            target_date = date.today()

        results = {
            "date": target_date.isoformat(),
            "journals_searched": [],
            "total_matches": 0,
            "matches": [],
            "errors": [],
        }

        for journal in journals:
            logger.info(f"Iniciando: {journal} em {target_date}")

            try:
                # 1. Busca o conteúdo (HTML ou PDF)
                if journal == "DOU":
                    content = await self.dou.fetch(target_date)
                elif journal == "DOBA":
                    content = await self.doba.fetch(target_date)
                else:
                    logger.warning(f"Diário desconhecido: {journal}")
                    continue

                if not content:
                    results["errors"].append({
                        "journal": journal,
                        "error": "Conteúdo não disponível para esta data",
                    })
                    continue

                # 2. Pesquisa o conteúdo
                matches = self.engine.search(
                    content=content,
                    name_variations=name_variations,
                    keywords=keywords,
                )

                journal_result = {
                    "journal": journal,
                    "date": target_date.isoformat(),
                    "extraction_method": content.method.value,
                    "total_chars": content.total_chars,
                    "source_url": content.source_url,
                    "matches_found": len(matches),
                    "matches": matches,
                }

                results["journals_searched"].append(journal_result)
                results["matches"].extend(matches)
                results["total_matches"] += len(matches)

                logger.info(
                    f"{journal}: {len(matches)} match(es) encontrado(s) "
                    f"via {content.method.value}"
                )

            except Exception as e:
                logger.error(f"{journal}: erro inesperado — {e}")
                results["errors"].append({"journal": journal, "error": str(e)})

        return results


# ─────────────────────────────────────────────────────────────────────────────
# EXEMPLO DE USO
# ─────────────────────────────────────────────────────────────────────────────

async def example():
    orchestrator = DiarioOrchestrator()

    result = await orchestrator.run(
        journals=["DOU", "DOBA"],
        name_variations=[
            "Jucivaldo Souza dos Santos",
            "JUCIVALDO SOUZA DOS SANTOS",
            "Jucivaldo Santos",
            "Jucivaldo",
        ],
        keywords=[
            "Convocação", "Convocado", "Nomeação", "Nomeado",
            "Posse", "Eliminado", "Resultado Final", "Homologação",
        ],
        target_date=date.today(),
    )

    print(f"\n{'='*50}")
    print(f"Data: {result['date']}")
    print(f"Total de matches: {result['total_matches']}")

    for journal in result["journals_searched"]:
        print(f"\n{journal['journal']} — método: {journal['extraction_method']}")
        print(f"  Chars extraídos: {journal['total_chars']:,}")
        print(f"  Matches: {journal['matches_found']}")

        for match in journal["matches"]:
            print(f"\n  ► Variação: {match['variation_found']}")
            print(f"    Página: {match['page_number']}")
            print(f"    Score: {match['score']}")
            print(f"    Palavras-chave próximas: {match['keywords_nearby']}")
            print(f"    Contexto: ...{match['context'][:150]}...")

    if result["errors"]:
        print(f"\nErros: {result['errors']}")


if __name__ == "__main__":
    asyncio.run(example())
