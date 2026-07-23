"""
teste_scraper.py — Teste rápido do scraper HTML-first

Testa:
  1. Busca do DOU em HTML (in.gov.br)
  2. Busca do DOBA em HTML (egba.ba.gov.br)
  3. Motor de busca com variações de nome
  4. Cálculo de score e contexto

Execute: python teste_scraper.py
"""

import asyncio
import sys
from datetime import date


# ─────────────────────────────────────────────────────────────
# CONFIGURAÇÃO DO TESTE
# ─────────────────────────────────────────────────────────────

# ← Coloque seu nome aqui para testar
SEU_NOME = "Jucivaldo Souza dos Santos"

# Variações que serão pesquisadas
VARIACOES = [
    SEU_NOME,
    SEU_NOME.upper(),
    SEU_NOME.split()[0],                    # Primeiro nome
    f"{SEU_NOME.split()[0]} {SEU_NOME.split()[-1]}",  # Primeiro + Último
]

# Palavras-chave relevantes
PALAVRAS_CHAVE = [
    "Convocação", "Convocado", "Nomeação", "Nomeado",
    "Posse", "Eliminado", "Resultado Final", "Homologação",
    "Cadastro Reserva", "Aprovado",
]

# Data do teste (hoje por padrão)
DATA_TESTE = date.today()


# ─────────────────────────────────────────────────────────────
# IMPORTA O SCRAPER
# ─────────────────────────────────────────────────────────────

try:
    from scraper import DOUScraper, DOBAScraper, SearchEngine, DiarioOrchestrator
    print("✅ scraper.py importado com sucesso\n")
except ImportError as e:
    print(f"❌ Erro ao importar scraper.py: {e}")
    sys.exit(1)


# ─────────────────────────────────────────────────────────────
# FUNÇÕES DE TESTE
# ─────────────────────────────────────────────────────────────

def separador(titulo: str):
    print(f"\n{'─'*55}")
    print(f"  {titulo}")
    print(f"{'─'*55}")


async def testar_dou():
    """Testa acesso ao DOU via HTML."""
    separador("TESTE 1 — DOU (Diário Oficial da União)")
    print(f"  Data: {DATA_TESTE.strftime('%d/%m/%Y')}")
    print(f"  Fonte: in.gov.br\n")

    scraper = DOUScraper()

    print("  Buscando DOU em HTML...")
    try:
        content = await scraper.fetch(DATA_TESTE)

        if content:
            print(f"  ✅ Conteúdo obtido via: {content.method.value}")
            print(f"  📄 Blocos extraídos: {len(content.pages)}")
            print(f"  📝 Total de caracteres: {content.total_chars:,}")
            print(f"  🔗 Fonte: {content.source_url}")

            # Mostra preview do primeiro bloco
            if content.pages:
                preview = content.pages[0].text[:200]
                print(f"\n  Preview (primeiros 200 chars):")
                print(f"  {preview!r}")
        else:
            print("  ⚠️  DOU não disponível para hoje via HTML")
            print("  (Isso pode acontecer aos fins de semana ou feriados)")

    except Exception as e:
        print(f"  ❌ Erro: {e}")

    return content if 'content' in dir() else None


async def testar_doba():
    """Testa acesso ao DOBA via HTML (com fallback)."""
    separador("TESTE 2 — DOBA (Diário Oficial da Bahia)")
    print(f"  Data: {DATA_TESTE.strftime('%d/%m/%Y')}")
    print(f"  Fonte: egba.ba.gov.br\n")

    scraper = DOBAScraper()

    print("  Buscando DOBA (HTML primeiro, PDF como fallback)...")
    try:
        content = await scraper.fetch(DATA_TESTE)

        if content:
            print(f"  ✅ Conteúdo obtido via: {content.method.value}")
            print(f"  📄 Páginas/blocos: {len(content.pages)}")
            print(f"  📝 Total de caracteres: {content.total_chars:,}")
            print(f"  🔗 Fonte: {content.source_url}")

            if content.pages:
                preview = content.pages[0].text[:200]
                print(f"\n  Preview (primeiros 200 chars):")
                print(f"  {preview!r}")
        else:
            print("  ⚠️  DOBA não disponível para hoje")
            print("  (Verifique se o site está acessível)")

    except Exception as e:
        print(f"  ❌ Erro: {e}")

    return content if 'content' in dir() else None


def testar_busca_local():
    """
    Testa o motor de busca com texto simulado.
    Não depende de internet — útil para validar a lógica de busca.
    """
    separador("TESTE 3 — Motor de Busca (texto simulado)")

    # Simula um trecho de diário oficial
    texto_simulado = f"""
    SECRETARIA DE ADMINISTRAÇÃO DO ESTADO DA BAHIA

    CONVOCAÇÃO Nº 001/2026

    A Secretaria de Administração convoca os candidatos abaixo
    relacionados, aprovados no Concurso Público do TJBA (Edital 001/2024),
    para apresentação dos documentos exigidos no edital:

    {SEU_NOME.upper()} - CPF: 123.456.789-00 - Cargo: Técnico Judiciário
    MARIA DA SILVA - CPF: 987.654.321-00 - Cargo: Técnico Judiciário

    Os candidatos deverão comparecer à Secretaria de Administração,
    situada na Avenida Paralela, s/n, Salvador - BA, no prazo de
    30 (trinta) dias a contar desta publicação.

    Salvador, 22 de julho de 2026.
    """

    from scraper import PageContent, DiarioContent, ExtractionMethod

    # Cria conteúdo simulado
    content = DiarioContent(
        journal="DOBA",
        edition_date=DATA_TESTE,
        method=ExtractionMethod.HTML,
        pages=[PageContent(page_number=1, text=texto_simulado, section="Convocação")],
        total_chars=len(texto_simulado),
        source_url="[simulado]",
    )

    engine = SearchEngine()
    matches = engine.search(
        content=content,
        name_variations=VARIACOES,
        keywords=PALAVRAS_CHAVE,
    )

    print(f"  Nome pesquisado: {SEU_NOME}")
    print(f"  Variações testadas: {len(VARIACOES)}")
    print(f"  Palavras-chave: {len(PALAVRAS_CHAVE)}\n")

    if matches:
        print(f"  ✅ {len(matches)} match(es) encontrado(s)!\n")
        for i, m in enumerate(matches, 1):
            print(f"  Match #{i}:")
            print(f"    Variação: {m['variation_found']}")
            print(f"    Página: {m['page_number']}")
            print(f"    Score: {m['score']}")
            print(f"    Palavras-chave próximas: {m['keywords_nearby']}")
            print(f"    Contexto: ...{m['context'][:150].strip()}...")
            print()
    else:
        print("  ❌ Nenhum match encontrado (verifique o nome configurado)")


async def testar_completo():
    """Teste completo: busca real + pesquisa do nome."""
    separador("TESTE 4 — Pipeline Completo (DOU real)")
    print(f"  Nome: {SEU_NOME}")
    print(f"  Data: {DATA_TESTE.strftime('%d/%m/%Y')}\n")

    orchestrator = DiarioOrchestrator()

    print("  Executando pipeline completo no DOU...")
    try:
        result = await orchestrator.run(
            journals=["DOU"],   # Só DOU para ser mais rápido
            name_variations=VARIACOES,
            keywords=PALAVRAS_CHAVE,
            target_date=DATA_TESTE,
        )

        print(f"  ✅ Pipeline concluído")
        print(f"  📊 Total de matches: {result['total_matches']}")

        for journal in result["journals_searched"]:
            print(f"\n  {journal['journal']}:")
            print(f"    Método: {journal['extraction_method']}")
            print(f"    Caracteres: {journal['total_chars']:,}")
            print(f"    Matches: {journal['matches_found']}")

        if result["total_matches"] == 0:
            print("\n  ℹ️  Nenhuma citação encontrada hoje (normal para testes)")
            print("  O sistema funcionou corretamente — apenas não há publicações")
            print("  com esse nome no DOU de hoje.")

        if result["errors"]:
            print(f"\n  ⚠️  Erros: {result['errors']}")

    except Exception as e:
        print(f"  ❌ Erro no pipeline: {e}")
        import traceback
        traceback.print_exc()


# ─────────────────────────────────────────────────────────────
# EXECUÇÃO DOS TESTES
# ─────────────────────────────────────────────────────────────

async def main():
    print("=" * 55)
    print("  DIÁRIO INTELIGENTE — Teste do Scraper HTML-first")
    print("=" * 55)
    print(f"  Python: {sys.version.split()[0]}")
    print(f"  Data de hoje: {date.today().strftime('%d/%m/%Y')}")

    # TESTE 3 — Local (sem internet) — sempre funciona
    testar_busca_local()

    # TESTE 1 — DOU via HTML
    await testar_dou()

    # TESTE 2 — DOBA via HTML/PDF
    await testar_doba()

    # TESTE 4 — Pipeline completo
    await testar_completo()

    separador("RESUMO")
    print("  Se o Teste 3 passou: motor de busca ✅ funcionando")
    print("  Se Teste 1 ou 2 falhou: portal pode estar fora do ar")
    print("  ou não publicou edição hoje (fins de semana/feriados).")
    print()


if __name__ == "__main__":
    asyncio.run(main())
