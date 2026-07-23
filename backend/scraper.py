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
        "User-Agent": "Mozilla/5.0 (compatible; DiarioInteligente/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
    }

    SECTIONS = ["do1", "do2", "do3"]  # Seções 1, 2 e 3

    async def fetch(self, target_date: date = None) -> DiarioContent | None:
        """Busca o DOU do dia em HTML. Retorna None se indisponível."""
        if target_date is None:
            target_date = date.today()

        date_str = target_date.strftime("%d-%m-%Y")
        all_pages = []

        async with httpx.AsyncClient(headers=self.HEADERS, timeout=30) as client:
            for section in self.SECTIONS:
                url = f"{self.JORNAL_URL}?data={date_str}&jornal={section}"
                logger.info(f"DOU HTML: buscando {section} em {date_str}")

                try:
                    response = await client.get(url)

                    if response.status_code != 200:
                        logger.warning(f"DOU {section}: HTTP {response.status_code}")
                        continue

                    pages = self._parse_html(response.text, section)
                    all_pages.extend(pages)
                    logger.info(f"DOU {section}: {len(pages)} blocos extraídos")

                    # Respeita o servidor — pausa entre seções
                    await asyncio.sleep(1)

                except httpx.TimeoutException:
                    logger.error(f"DOU {section}: timeout")
                except Exception as e:
                    logger.error(f"DOU {section}: erro inesperado — {e}")

        if not all_pages:
            logger.warning(f"DOU {date_str}: nenhum conteúdo HTML obtido")
            return None

        total = sum(len(p.text) for p in all_pages)
        logger.info(f"DOU {date_str}: {len(all_pages)} blocos, {total:,} caracteres")

        return DiarioContent(
            journal="DOU",
            edition_date=target_date,
            method=ExtractionMethod.HTML,
            pages=all_pages,
            total_chars=total,
            source_url=f"{self.JORNAL_URL}?data={date_str}",
        )

    def _parse_html(self, html: str, section: str) -> list[PageContent]:
        """Extrai blocos de texto do HTML do DOU."""
        soup = BeautifulSoup(html, "html.parser")
        pages = []
        page_num = 0

        # O DOU organiza publicações em divs com classe "dou-paragraph" ou similar
        # Cada publicação é um bloco independente
        selectors = [
            "div.dou-paragraph",   # Padrão atual
            "article.materia",     # Formato alternativo
            "div.materia-texto",   # Outro formato possível
            "p",                   # Fallback genérico
        ]

        blocks = []
        for selector in selectors:
            blocks = soup.select(selector)
            if blocks:
                break

        # Se nenhum seletor específico funcionou, pega o texto do body completo
        if not blocks:
            body_text = soup.get_text(separator="\n", strip=True)
            if len(body_text) > 100:
                pages.append(PageContent(
                    page_number=1,
                    text=body_text,
                    section=section.upper(),
                ))
            return pages

        for block in blocks:
            text = block.get_text(separator=" ", strip=True)
            text = self._normalize_text(text)

            if len(text) < 20:  # Ignora blocos muito pequenos
                continue

            page_num += 1
            # Tenta identificar a seção/tipo do bloco pelo título
            title_elem = block.find(["h1", "h2", "h3", "strong", "b"])
            section_name = title_elem.get_text(strip=True) if title_elem else section.upper()

            pages.append(PageContent(
                page_number=page_num,
                text=text,
                section=section_name,
            ))

        return pages

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
    Acessa o DOBA preferencialmente em HTML.
    Fallback para PDF se HTML não estiver disponível.
    """

    BASE_URL = "https://www.egba.ba.gov.br"
    REVISTA_URL = "https://www.egba.ba.gov.br/revista"

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (compatible; DiarioInteligente/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/pdf",
        "Accept-Language": "pt-BR,pt;q=0.9",
    }

    async def fetch(self, target_date: date = None) -> DiarioContent | None:
        """
        Tenta HTML primeiro.
        Se falhar, tenta PDF.
        """
        if target_date is None:
            target_date = date.today()

        logger.info(f"DOBA: iniciando busca para {target_date}")

        # TENTATIVA 1: HTML
        content = await self._try_html(target_date)
        if content:
            logger.info(f"DOBA: sucesso via HTML ({content.total_chars:,} chars)")
            return content

        # TENTATIVA 2: PDF fallback
        logger.warning("DOBA: HTML indisponível, tentando PDF...")
        content = await self._try_pdf(target_date)
        if content:
            logger.info(f"DOBA: sucesso via PDF ({content.total_chars:,} chars)")
            return content

        logger.error(f"DOBA: sem conteúdo disponível para {target_date}")
        return None

    async def _try_html(self, target_date: date) -> DiarioContent | None:
        """Tenta buscar o DOBA em HTML."""
        # Formatos de URL comuns do portal DOBA
        date_formats = [
            target_date.strftime("%Y%m%d"),    # 20260722
            target_date.strftime("%d/%m/%Y"),  # 22/07/2026
            target_date.strftime("%Y-%m-%d"),  # 2026-07-22
        ]

        url_candidates = [
            f"{self.REVISTA_URL}/{date_formats[0]}",
            f"{self.BASE_URL}/diario/{date_formats[0]}",
            f"{self.REVISTA_URL}?data={date_formats[2]}",
        ]

        async with httpx.AsyncClient(headers=self.HEADERS, timeout=20) as client:
            for url in url_candidates:
                try:
                    response = await client.get(url, follow_redirects=True)

                    # Verifica se retornou HTML real (não PDF, não redirect para 404)
                    content_type = response.headers.get("content-type", "")
                    if response.status_code == 200 and "text/html" in content_type:
                        pages = self._parse_html(response.text)
                        if pages:
                            total = sum(len(p.text) for p in pages)
                            return DiarioContent(
                                journal="DOBA",
                                edition_date=target_date,
                                method=ExtractionMethod.HTML,
                                pages=pages,
                                total_chars=total,
                                source_url=url,
                            )

                except Exception as e:
                    logger.debug(f"DOBA HTML {url}: {e}")
                    continue

        return None

    async def _try_pdf(self, target_date: date) -> DiarioContent | None:
        """Fallback: baixa e extrai o PDF do DOBA."""
        pdf_url = await self._find_pdf_url(target_date)
        if not pdf_url:
            return None

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.get(pdf_url)
                if response.status_code != 200:
                    return None

                pdf_bytes = response.content
                pages = await self._extract_pdf_text(pdf_bytes)

                if not pages:
                    return None

                # Detecta método usado (nativo ou OCR)
                method = ExtractionMethod.PDF_NATIVE
                avg_text = sum(len(p.text) for p in pages) / max(len(pages), 1)
                if avg_text < 50:  # Texto muito escasso = provavelmente OCR foi usado
                    method = ExtractionMethod.PDF_OCR

                total = sum(len(p.text) for p in pages)
                return DiarioContent(
                    journal="DOBA",
                    edition_date=target_date,
                    method=method,
                    pages=pages,
                    total_chars=total,
                    source_url=pdf_url,
                )

        except Exception as e:
            logger.error(f"DOBA PDF: erro ao processar — {e}")
            return None

    async def _find_pdf_url(self, target_date: date) -> str | None:
        """Descobre a URL do PDF do DOBA para uma data específica."""
        # O portal lista os PDFs disponíveis em uma página de índice
        index_url = f"{self.REVISTA_URL}"

        try:
            async with httpx.AsyncClient(headers=self.HEADERS, timeout=15) as client:
                response = await client.get(index_url)
                if response.status_code != 200:
                    return None

                soup = BeautifulSoup(response.text, "html.parser")
                date_str = target_date.strftime("%d/%m/%Y")
                date_str_alt = target_date.strftime("%d-%m-%Y")

                # Procura links de PDF que contenham a data
                for link in soup.find_all("a", href=True):
                    href = link["href"]
                    text = link.get_text()
                    if (date_str in text or date_str_alt in text or
                            date_str in href or date_str_alt in href):
                        if href.endswith(".pdf") or "pdf" in href.lower():
                            if not href.startswith("http"):
                                href = f"{self.BASE_URL}{href}"
                            return href

        except Exception as e:
            logger.error(f"DOBA: erro ao buscar índice de PDFs — {e}")

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
        """Encontra todas as posições de um termo no texto (case-insensitive)."""
        import re
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        return [m.start() for m in pattern.finditer(text)]

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
