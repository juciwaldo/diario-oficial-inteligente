# Plano de Testes e Checklist de Validação — Diário Inteligente
**Estratégia de Testes para o Sistema de Monitoramento de Diários**

**Versão:** 1.0  
**Data:** Julho/2026

---

## Sumário

1. [Estratégia de Testes](#1-estratégia-de-testes)
2. [Testes Unitários](#2-testes-unitários)
3. [Testes de Integração](#3-testes-de-integração)
4. [Testes End-to-End](#4-testes-end-to-end)
5. [Testes de Performance](#5-testes-de-performance)
6. [Testes de Segurança](#6-testes-de-segurança)
7. [Checklist de Validação Manual](#7-checklist-de-validação-manual)
8. [Testes de Cenários Críticos](#8-testes-de-cenários-críticos)
9. [Dados de Teste](#9-dados-de-teste)
10. [Ambiente de Testes](#10-ambiente-de-testes)

---

## 1. Estratégia de Testes

### 1.1 Pirâmide de Testes

```
           /\
          /  \        E2E Tests
         /    \       (poucos, críticos)
        /──────\
       /        \     Integration Tests
      /          \    (principais fluxos)
     /────────────\
    /              \  Unit Tests
   /________________\ (base sólida)
```

### 1.2 Cobertura Mínima por Módulo

| Módulo | Cobertura Alvo | Prioridade |
|---|---|---|
| `searcher.py` | 90%+ | Crítico |
| `extractor.py` | 85%+ | Crítico |
| `downloader.py` | 80%+ | Alto |
| `notifier.py` | 80%+ | Alto |
| `ai_summarizer.py` | 70%+ | Médio |
| `scheduler.py` | 75%+ | Alto |
| API endpoints | 80%+ | Alto |

### 1.3 Ferramentas

| Ferramenta | Uso |
|---|---|
| `pytest` | Framework de testes Python |
| `pytest-asyncio` | Testes assíncronos |
| `pytest-cov` | Cobertura de código |
| `httpx` | Cliente HTTP para testar API |
| `factory_boy` | Geração de dados de teste |
| `freezegun` | Controle de tempo em testes |
| `pytest-mock` | Mocking/patching |

---

## 2. Testes Unitários

### 2.1 Módulo: Gerador de Variações de Nome

```python
# tests/unit/test_name_variations.py
import pytest
from app.utils.name_variations import generate_name_variations

class TestNameVariations:
    
    def test_nome_completo_incluido(self):
        """Nome completo deve estar na lista de variações."""
        variations = generate_name_variations("Jucivaldo Souza dos Santos")
        assert "Jucivaldo Souza dos Santos" in variations
    
    def test_versao_maiuscula_incluida(self):
        """Versão em maiúsculas deve ser incluída (comum em diários)."""
        variations = generate_name_variations("Jucivaldo Souza dos Santos")
        assert "JUCIVALDO SOUZA DOS SANTOS" in variations
    
    def test_primeiro_nome_incluido(self):
        """Apenas o primeiro nome deve ser gerado."""
        variations = generate_name_variations("Jucivaldo Souza dos Santos")
        assert "Jucivaldo" in variations
    
    def test_primeiro_e_ultimo_sobrenome(self):
        """Primeiro nome + último sobrenome."""
        variations = generate_name_variations("Jucivaldo Souza dos Santos")
        assert "Jucivaldo Santos" in variations
    
    def test_variacao_sem_primeiro_nome(self):
        """Sobrenomes sem o primeiro nome."""
        variations = generate_name_variations("Jucivaldo Souza dos Santos")
        assert "Souza dos Santos" in variations
    
    def test_sem_variacoes_curtas(self):
        """Nenhuma variação deve ter menos de 4 caracteres."""
        variations = generate_name_variations("Ana Maria")
        for v in variations:
            assert len(v) >= 4, f"Variação muito curta: '{v}'"
    
    def test_nome_unico(self):
        """Nome com apenas uma palavra."""
        variations = generate_name_variations("Jucivaldo")
        assert "Jucivaldo" in variations
        assert "JUCIVALDO" in variations
    
    def test_sem_duplicatas(self):
        """Não deve haver variações duplicadas."""
        variations = generate_name_variations("Jucivaldo Souza dos Santos")
        assert len(variations) == len(set(v.lower() for v in variations))
    
    def test_nome_com_preposicoes(self):
        """Preposições (de, do, da, dos, das) tratadas corretamente."""
        variations = generate_name_variations("Maria da Silva de Souza")
        assert "Maria da Silva de Souza" in variations
        assert "MARIA DA SILVA DE SOUZA" in variations
    
    @pytest.mark.parametrize("name,expected_min", [
        ("João Silva", 2),
        ("Maria Aparecida dos Santos", 5),
        ("José", 2),
    ])
    def test_quantidade_minima_variacoes(self, name, expected_min):
        """Deve gerar pelo menos N variações."""
        variations = generate_name_variations(name)
        assert len(variations) >= expected_min
```

### 2.2 Módulo: Motor de Busca (Searcher)

```python
# tests/unit/test_searcher.py
import pytest
from app.services.searcher import SearchEngine

class TestSearchEngine:
    
    @pytest.fixture
    def engine(self):
        return SearchEngine()
    
    @pytest.fixture
    def sample_text(self):
        return """
        SECRETARIA DE ADMINISTRAÇÃO
        
        CONVOCAÇÃO
        
        Ficam CONVOCADOS os candidatos abaixo relacionados,
        aprovados no concurso público do TJBA, para apresentação
        de documentos:
        
        JUCIVALDO SOUZA DOS SANTOS - CPF: 123.456.789-00
        MARIA DA SILVA - CPF: 987.654.321-00
        
        Os candidatos deverão comparecer no prazo de 30 dias.
        """
    
    def test_encontra_nome_exato(self, engine, sample_text):
        """Deve encontrar o nome exato no texto."""
        result = engine.find_exact(sample_text, "JUCIVALDO SOUZA DOS SANTOS")
        assert len(result) > 0
    
    def test_encontra_nome_case_insensitive(self, engine, sample_text):
        """Busca deve ser case-insensitive."""
        result = engine.find_exact(sample_text, "jucivaldo souza dos santos")
        assert len(result) > 0
    
    def test_nao_encontra_nome_ausente(self, engine, sample_text):
        """Não deve retornar resultados para nome ausente."""
        result = engine.find_exact(sample_text, "Pedro Henrique")
        assert len(result) == 0
    
    def test_encontra_cpf_formatado(self, engine, sample_text):
        """Deve encontrar CPF no formato 000.000.000-00."""
        result = engine.find_cpf(sample_text, "123.456.789-00")
        assert len(result) > 0
    
    def test_extrai_contexto_correto(self, engine, sample_text):
        """Contexto deve ter 300 chars antes e depois."""
        matches = engine.find_exact(sample_text, "JUCIVALDO SOUZA DOS SANTOS")
        for match in matches:
            context = engine.extract_context(sample_text, match.position, window=300)
            assert "CONVOCAÇÃO" in context or "CONVOCADOS" in context
    
    def test_score_nome_exato_maior(self, engine, sample_text):
        """Nome exato deve ter score maior que variação."""
        exact = engine.find_exact(sample_text, "JUCIVALDO SOUZA DOS SANTOS")
        variation = engine.find_exact(sample_text, "JUCIVALDO")
        
        if exact and variation:
            assert exact[0].base_score >= variation[0].base_score
    
    def test_palavra_chave_aumenta_score(self, engine, sample_text):
        """Palavra-chave na mesma frase deve aumentar o score."""
        # Texto com nome próximo de palavra-chave
        text_with_keyword = "CONVOCAÇÃO: JUCIVALDO SOUZA DOS SANTOS"
        # Texto com nome sem palavra-chave
        text_without = "JUCIVALDO SOUZA DOS SANTOS é aluno."
        
        matches_with = engine.find_exact(text_with_keyword, "JUCIVALDO SOUZA DOS SANTOS")
        matches_without = engine.find_exact(text_without, "JUCIVALDO SOUZA DOS SANTOS")
        
        keywords = [MockKeyword("CONVOCAÇÃO", priority="high")]
        
        score_with = engine.calculate_relevance(matches_with[0], keywords, text_with_keyword)
        score_without = engine.calculate_relevance(matches_without[0], keywords, text_without)
        
        assert score_with > score_without
    
    def test_deduplicacao(self, engine):
        """Resultados duplicados não devem aparecer duas vezes."""
        text = "JUCIVALDO SOUZA DOS SANTOS foi chamado. JUCIVALDO SOUZA DOS SANTOS confirmou."
        variations = ["JUCIVALDO SOUZA DOS SANTOS", "jucivaldo souza dos santos"]
        
        all_matches = []
        for var in variations:
            all_matches.extend(engine.find_exact(text, var))
        
        deduped = engine.deduplicate(all_matches)
        # 2 ocorrências reais, não 4 (2 variações × 2 ocorrências)
        assert len(deduped) == 2
```

### 2.3 Módulo: Extração de Texto

```python
# tests/unit/test_extractor.py
import pytest
from pathlib import Path
from app.services.extractor import TextExtractor, normalize_text

class TestNormalizeText:
    
    def test_remove_espacos_extras(self):
        text = "João   da   Silva"
        assert normalize_text(text) == "João da Silva"
    
    def test_normaliza_quebras_de_linha(self):
        text = "Linha 1\n\n\n\nLinha 2"
        result = normalize_text(text)
        assert "\n\n\n" not in result
    
    def test_preserva_acentuacao(self):
        text = "convocação nomeação eliminação posse"
        result = normalize_text(text)
        assert "convocação" in result
        assert "nomeação" in result
    
    def test_texto_vazio(self):
        assert normalize_text("") == ""
        assert normalize_text("   ") == ""


class TestQualityEvaluation:
    
    @pytest.fixture
    def extractor(self):
        return TextExtractor()
    
    def test_texto_bom_qualidade(self, extractor):
        """Texto claro deve ter qualidade alta."""
        good_text = "Diário Oficial do Estado da Bahia. Convocação de candidatos."
        quality = extractor.evaluate_quality({"1": good_text})
        assert quality >= 0.8
    
    def test_texto_ocr_ruim(self, extractor):
        """Texto com muitos erros OCR deve ter qualidade baixa."""
        bad_text = "D!4r10 0f!c!@l d0 Es74d0 d@ B@h14"
        quality = extractor.evaluate_quality({"1": bad_text})
        assert quality < 0.5
    
    def test_texto_vazio(self, extractor):
        """Páginas vazias devem resultar em qualidade zero."""
        empty = {"1": "", "2": "  "}
        quality = extractor.evaluate_quality(empty)
        assert quality == 0.0
```

### 2.4 Módulo: Notificações

```python
# tests/unit/test_notifier.py
import pytest
from unittest.mock import AsyncMock, patch
from app.services.notifier import TelegramNotifier

class TestTelegramNotifier:
    
    @pytest.fixture
    def notifier(self):
        return TelegramNotifier(token="fake-token-for-testing")
    
    @pytest.fixture
    def sample_match(self):
        return MockMatch(
            journal_name="DOBA",
            edition_date="2026-07-22",
            page_number=52,
            match_text="JUCIVALDO SOUZA DOS SANTOS ficam CONVOCADOS",
            keyword_triggered="Convocação",
            id="uuid-1234"
        )
    
    @pytest.mark.asyncio
    async def test_formata_mensagem_corretamente(self, notifier, sample_match):
        """Mensagem deve conter todas as informações necessárias."""
        message = notifier.format_message(sample_match, ai_summary=None)
        
        assert "DOBA" in message
        assert "22/07/2026" in message
        assert "52" in message
        assert "Convocação" in message
        assert "JUCIVALDO" in message
    
    @pytest.mark.asyncio
    async def test_inclui_resumo_ia_se_disponivel(self, notifier, sample_match):
        """Mensagem deve incluir resumo da IA quando disponível."""
        summary = "Você foi convocado. Prazo: 30 dias."
        message = notifier.format_message(sample_match, ai_summary=summary)
        
        assert summary in message
    
    @pytest.mark.asyncio
    async def test_envia_mensagem_telegram(self, notifier, sample_match):
        """Deve chamar a API do Telegram com os parâmetros corretos."""
        with patch.object(notifier.bot, 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True
            
            result = await notifier.send_match_alert(
                chat_id="123456",
                match=sample_match,
                summary=None
            )
            
            mock_send.assert_called_once()
            call_kwargs = mock_send.call_args.kwargs
            assert call_kwargs['chat_id'] == "123456"
            assert "DOBA" in call_kwargs['text']
    
    @pytest.mark.asyncio
    async def test_retorna_false_se_falhar(self, notifier, sample_match):
        """Deve retornar False se o envio falhar."""
        with patch.object(notifier.bot, 'send_message', side_effect=Exception("Network error")):
            result = await notifier.send_match_alert("123456", sample_match, None)
            assert result == False
```

---

## 3. Testes de Integração

### 3.1 Endpoints de Autenticação

```python
# tests/integration/test_auth_api.py
import pytest
from httpx import AsyncClient
from app.main import app

class TestAuthAPI:
    
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "senha123456",
            "full_name": "Usuário Teste"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] == True
        assert "access_token" in data["data"]
        assert data["data"]["user"]["email"] == "test@example.com"
    
    @pytest.mark.asyncio
    async def test_register_email_duplicado(self, client, existing_user):
        response = await client.post("/api/v1/auth/register", json={
            "email": existing_user.email,
            "password": "senha123456",
            "full_name": "Outro Usuário"
        })
        
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"
    
    @pytest.mark.asyncio
    async def test_login_success(self, client, existing_user):
        response = await client.post("/api/v1/auth/login", json={
            "email": "jucivaldo@test.com",
            "password": "senha123456"
        })
        
        assert response.status_code == 200
        assert "access_token" in response.json()["data"]
    
    @pytest.mark.asyncio
    async def test_login_credenciais_invalidas(self, client):
        response = await client.post("/api/v1/auth/login", json={
            "email": "wrong@email.com",
            "password": "senhaerrada"
        })
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_rota_protegida_sem_token(self, client):
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_rota_protegida_com_token_valido(self, authenticated_client):
        response = await authenticated_client.get("/api/v1/users/me")
        assert response.status_code == 200
        assert response.json()["data"]["email"] is not None
```

### 3.2 Pipeline de Download e Pesquisa

```python
# tests/integration/test_pipeline.py
import pytest
from pathlib import Path
from unittest.mock import patch, AsyncMock

class TestDownloadPipeline:
    
    @pytest.mark.asyncio
    async def test_pipeline_completo_com_resultado(
        self, db, test_user, mock_pdf_with_match
    ):
        """Testa o pipeline completo: download → extração → pesquisa → notificação."""
        
        # Mock do download (retorna PDF de teste)
        with patch('app.services.downloader.download_pdf', 
                   return_value=mock_pdf_with_match):
            
            # Mock da notificação
            with patch('app.services.notifier.TelegramNotifier.send_match_alert', 
                       return_value=True) as mock_notify:
                
                from app.workers.daily_job import run_daily_search
                result = await run_daily_search(user_id=test_user.id, journal="DOBA")
                
                assert result.success == True
                assert result.matches_found >= 1
                mock_notify.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_pipeline_sem_resultado(self, db, test_user, mock_pdf_no_match):
        """Pipeline deve completar sem erros quando não há resultado."""
        
        with patch('app.services.downloader.download_pdf',
                   return_value=mock_pdf_no_match):
            with patch('app.services.notifier.TelegramNotifier.send_match_alert') as mock_notify:
                
                result = await run_daily_search(user_id=test_user.id, journal="DOBA")
                
                assert result.success == True
                assert result.matches_found == 0
                mock_notify.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_pipeline_falha_no_download(self, db, test_user):
        """Pipeline deve tratar falha de download gracefully."""
        
        with patch('app.services.downloader.download_pdf', 
                   side_effect=Exception("Connection timeout")):
            
            result = await run_daily_search(user_id=test_user.id, journal="DOBA")
            
            assert result.success == False
            assert result.error is not None
            # Deve registrar o erro no banco
            # Deve não crashar o sistema
```

---

## 4. Testes End-to-End

### 4.1 Fluxo de Onboarding

```
CENÁRIO: Usuário se cadastra pela primeira vez

PASSOS:
1. Acessar /register
2. Preencher: email, senha, nome completo
3. Clicar "Criar conta"
4. ESPERADO: Redireciona para onboarding

5. Passo 1: informar nome "Jucivaldo Souza dos Santos"
6. ESPERADO: Variações geradas aparecem abaixo
7. Clicar "Próximo"

8. Passo 2: revisar variações
9. ESPERADO: 5+ variações listadas
10. Clicar "Próximo"

11. Passo 3: selecionar TJBA e INSS
12. Clicar "Próximo"

13. Passo 4: pular Telegram
14. Clicar "Pular por enquanto"

15. Passo 5: clicar "Começar!"
16. ESPERADO: Redireciona para Dashboard
17. ESPERADO: Dashboard mostra dados do usuário
18. ESPERADO: Nenhum erro no console
```

### 4.2 Fluxo de Pesquisa Manual

```
CENÁRIO: Usuário executa pesquisa manual e vê resultado

PRÉ-CONDIÇÕES: Usuário logado, PDF de teste disponível

PASSOS:
1. Acessar Dashboard
2. Clicar "Pesquisar Agora"
3. ESPERADO: Modal de configuração aparece
4. Selecionar DOBA, período "Hoje"
5. Clicar "Iniciar Pesquisa"
6. ESPERADO: Modal muda para tela de progresso
7. ESPERADO: Progress bar avança em tempo real
8. ESPERADO: "1 resultado encontrado!" aparece
9. Clicar "Ver detalhes"
10. ESPERADO: Abre página de detalhes do resultado
11. ESPERADO: Trecho com nome destacado visível
12. ESPERADO: Resumo IA carregado
13. ESPERADO: Botão de download do PDF disponível
```

---

## 5. Testes de Performance

### 5.1 Benchmarks Mínimos

```python
# tests/performance/test_benchmarks.py
import pytest
import time

class TestPerformanceBenchmarks:
    
    @pytest.mark.asyncio
    async def test_extracao_pdf_nativo_100_paginas(self, extractor, sample_pdf_100_pages):
        """Extração nativa de 100 páginas em menos de 30 segundos."""
        start = time.time()
        result = await extractor.extract_native(sample_pdf_100_pages)
        duration = time.time() - start
        
        assert duration < 30, f"Extração lenta: {duration:.1f}s"
        assert len(result) == 100
    
    @pytest.mark.asyncio
    async def test_pesquisa_100_paginas(self, engine, text_100_pages, user_config):
        """Pesquisa em 100 páginas em menos de 10 segundos."""
        start = time.time()
        matches = await engine.search_document(text_100_pages, user_config)
        duration = time.time() - start
        
        assert duration < 10, f"Pesquisa lenta: {duration:.1f}s"
    
    @pytest.mark.asyncio
    async def test_api_response_time(self, authenticated_client):
        """Endpoints devem responder em menos de 2 segundos."""
        endpoints = [
            "/api/v1/dashboard/stats",
            "/api/v1/competitions",
            "/api/v1/keywords",
            "/api/v1/search/history",
        ]
        
        for endpoint in endpoints:
            start = time.time()
            response = await authenticated_client.get(endpoint)
            duration = time.time() - start
            
            assert response.status_code == 200
            assert duration < 2.0, f"{endpoint} muito lento: {duration:.2f}s"
```

---

## 6. Testes de Segurança

### 6.1 Autenticação e Autorização

```python
class TestSecurity:
    
    @pytest.mark.asyncio
    async def test_token_invalido_rejeitado(self, client):
        """Token adulterado deve ser rejeitado."""
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer token.invalido.aqui"}
        )
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_cpf_nao_retornado_em_claro(self, authenticated_client):
        """CPF jamais deve ser retornado em texto claro na API."""
        response = await authenticated_client.get("/api/v1/users/me")
        data = response.json()
        
        assert "cpf" not in data["data"]
        assert "has_cpf" in data["data"]  # apenas indicador boolean
    
    @pytest.mark.asyncio
    async def test_usuario_nao_acessa_dados_de_outro(self, client_user1, client_user2):
        """Usuário não deve acessar dados de outro usuário."""
        # Criar concurso do usuário 1
        resp = await client_user1.post("/api/v1/competitions", json={
            "organ_name": "TJBA", "position": "Técnico", "year": 2024
        })
        competition_id = resp.json()["data"]["id"]
        
        # Tentar acessar com usuário 2
        response = await client_user2.get(f"/api/v1/competitions/{competition_id}")
        assert response.status_code == 404  # Não deve retornar 403 (evita enumeration)
    
    @pytest.mark.asyncio
    async def test_rate_limit_login(self, client):
        """Deve bloquear após 5 tentativas de login falhas seguidas."""
        for i in range(5):
            await client.post("/api/v1/auth/login", json={
                "email": "alvo@test.com",
                "password": f"senhaerrada{i}"
            })
        
        # 6ª tentativa deve ser bloqueada
        response = await client.post("/api/v1/auth/login", json={
            "email": "alvo@test.com",
            "password": "senhaerrada5"
        })
        assert response.status_code == 429
```

---

## 7. Checklist de Validação Manual

### 7.1 Funcionalidades Principais

#### Download de PDFs

- [ ] DOBA: Sistema baixa o PDF do dia atual
- [ ] DOU: Sistema baixa as seções do DOU do dia atual
- [ ] PDFs ficam salvos na pasta correta (`/storage/pdfs/doba/AAAA/MM/`)
- [ ] Metadados (tamanho, páginas, hash) são registrados no banco
- [ ] Sistema detecta quando o PDF já foi baixado (não baixa novamente)
- [ ] Sistema faz retry quando o portal está fora do ar
- [ ] Notificação de falha enviada após 3 tentativas sem sucesso
- [ ] Log de download registrado corretamente

#### Extração de Texto

- [ ] PDF com texto nativo: extração funciona sem OCR
- [ ] PDF escaneado: OCR ativado automaticamente
- [ ] Texto extraído preserva acentuação (ã, é, ç, etc.)
- [ ] Números de página são preservados corretamente
- [ ] Texto normalizado (sem espaços duplos, quebras excessivas)
- [ ] Status de extração atualizado no banco (`done` ou `error`)

#### Pesquisa

- [ ] Nome completo encontrado: "Jucivaldo Souza dos Santos"
- [ ] Nome em maiúsculas encontrado: "JUCIVALDO SOUZA DOS SANTOS"
- [ ] Primeiro nome encontrado: "Jucivaldo"
- [ ] CPF encontrado (se configurado): "123.456.789-00"
- [ ] Contexto de 300 chars extraído corretamente
- [ ] Score de relevância calculado
- [ ] Match salvo no banco sem duplicatas
- [ ] Nome não encontrado: retorna 0 resultados (sem falsos positivos)

#### Notificações

- [ ] Telegram: mensagem recebida com todos os dados corretos
- [ ] Telegram: link para ver no sistema funciona
- [ ] E-mail: mensagem HTML recebida corretamente
- [ ] Notificação não duplicada para o mesmo match
- [ ] Histórico de notificações salvo no banco
- [ ] Teste de notificação funciona na página de configurações

#### Agendador

- [ ] Job executa automaticamente no horário configurado
- [ ] Log da execução registrado
- [ ] Job não executa nos fins de semana (se configurado)
- [ ] Horário pode ser alterado pelo usuário
- [ ] Próxima execução é exibida corretamente no dashboard

### 7.2 Interface e UX

#### Dashboard

- [ ] Cards exibem números corretos (não zerados sem motivo)
- [ ] Status dos diários atualizado
- [ ] Últimos resultados aparecem na lista
- [ ] Botão "Pesquisar Agora" funciona
- [ ] Countdown para próxima pesquisa funciona

#### Histórico

- [ ] Lista mostra pesquisas em ordem decrescente de data
- [ ] Filtros funcionam corretamente
- [ ] Items com resultado têm ícone vermelho
- [ ] Items sem resultado têm ícone cinza discreto
- [ ] Paginação carrega mais itens

#### Detalhes do Resultado

- [ ] Trecho exibido corretamente
- [ ] Nome destacado em amarelo
- [ ] Resumo IA carregado (ou mensagem de erro se falhar)
- [ ] Visualizador de PDF abre na página correta
- [ ] Botão de download funciona

#### Concursos

- [ ] Lista exibe todos os concursos cadastrados
- [ ] Adicionar concurso funciona e aparece na lista
- [ ] Editar concurso salva corretamente
- [ ] Desativar concurso remove da pesquisa ativa
- [ ] Status exibido com cor correta

#### Configurações

- [ ] Alterar nome gera novas variações automaticamente
- [ ] Configuração Telegram: token + teste funcionam
- [ ] Alterar horário muda o agendador
- [ ] Toggle de diários ativa/desativa corretamente

### 7.3 Responsividade

- [ ] Dashboard: mobile (375px) ✓
- [ ] Dashboard: tablet (768px) ✓
- [ ] Dashboard: desktop (1280px) ✓
- [ ] Bottom nav aparece em mobile ✓
- [ ] Sidebar aparece em desktop ✓
- [ ] Formulários usáveis no mobile ✓
- [ ] Botões têm tamanho adequado para toque (44px) ✓
- [ ] Textos não cortados em nenhuma tela ✓

### 7.4 Temas

- [ ] Tema escuro: todos os textos legíveis ✓
- [ ] Tema claro: todos os textos legíveis ✓
- [ ] Toggle de tema funciona sem recarregar página ✓
- [ ] Preferência de tema salva ✓
- [ ] Ícones visíveis nos dois temas ✓

---

## 8. Testes de Cenários Críticos

### Cenário 1: PDF com OCR Necessário

```
PRÉ-CONDIÇÃO: PDF escaneado do DOBA (imagem, sem texto selecionável)

1. Sistema tenta extração nativa
2. ESPERADO: Retorna texto vazio ou qualidade < 0.5
3. Sistema ativa OCR automaticamente  
4. ESPERADO: OCR extrai texto com qualidade > 0.7
5. Sistema pesquisa no texto OCR
6. ESPERADO: Nome encontrado se presente

CRITÉRIO DE SUCESSO: Sistema encontra "JUCIVALDO" em PDF escaneado
```

### Cenário 2: Falha de Rede Durante Download

```
PRÉ-CONDIÇÃO: Internet cai durante download do PDF

1. Sistema inicia download às 06:00
2. Conexão cai após 30% baixado
3. ESPERADO: Sistema captura o erro
4. ESPERADO: Agenda retry para 07:00
5. Internet volta às 06:30
6. ESPERADO: Retry às 07:00 completa o download
7. ESPERADO: Pipeline continua normalmente

CRITÉRIO DE SUCESSO: PDF baixado com sucesso na 2ª tentativa, sem crash
```

### Cenário 3: Nome em Diferentes Posições na Página

```
PRÉ-CONDIÇÃO: PDF de teste com nome em 3 contextos:
1. Na lista: "JUCIVALDO SOUZA DOS SANTOS - APROVADO"
2. No meio de um parágrafo: "...candidato Jucivaldo Souza dos Santos deverá..."
3. Invertido: "SANTOS, Jucivaldo Souza"

ESPERADO: Sistema encontra todas as 3 ocorrências
ESPERADO: Cada uma com contexto de 300 chars correto
ESPERADO: Sem duplicatas se mesmo bloco de texto
```

### Cenário 4: Notificação Falha + Retry

```
PRÉ-CONDIÇÃO: Bot Telegram com token válido mas chat ID errado

1. Sistema encontra match
2. Tenta enviar Telegram
3. ESPERADO: Telegram retorna erro 400 (chat not found)
4. Sistema registra falha no banco
5. ESPERADO: Sistema agenda retry em 5 minutos
6. Usuário corrige chat ID nas configurações
7. 2ª tentativa: chat ID corrigido → envio bem-sucedido
8. ESPERADO: Notificação chega ao usuário
```

### Cenário 5: Pesquisa Retroativa de 30 Dias

```
PRÉ-CONDIÇÃO: 30 dias de PDFs baixados no storage

1. Usuário seleciona "Pesquisa retroativa - últimos 30 dias"
2. ESPERADO: Sistema identifica ~60 documentos (DOBA + DOU)
3. ESPERADO: Exibe estimativa de tempo (~20-45 min)
4. Usuário confirma
5. ESPERADO: Progress em tempo real via WebSocket
6. ESPERADO: Resultados históricos aparecem ao serem encontrados
7. ESPERADO: Ao final: resumo com total de matches por data

CRITÉRIO DE SUCESSO: Todos os 60 documentos pesquisados, sem crash
```

---

## 9. Dados de Teste

### 9.1 PDF de Teste para Matches

```python
# tests/fixtures/create_test_pdf.py
"""Script para criar PDFs de teste com conteúdo controlado."""

import fitz  # PyMuPDF

def create_pdf_with_match():
    """Cria PDF com nome do usuário na página 5."""
    doc = fitz.open()
    
    # 4 páginas sem resultado
    for i in range(4):
        page = doc.new_page()
        page.insert_text((72, 72), f"Página {i+1}\nConteúdo sem resultado.", fontsize=12)
    
    # Página 5 COM resultado
    page = doc.new_page()
    content = """
    SECRETARIA DE ADMINISTRAÇÃO DO ESTADO DA BAHIA
    
    CONVOCAÇÃO Nº 001/2026
    
    Ficam convocados os candidatos abaixo para apresentação de documentos:
    
    JUCIVALDO SOUZA DOS SANTOS - CPF: 123.456.789-00 - Cargo: Técnico Judiciário
    
    Prazo: 30 (trinta) dias a contar desta publicação.
    """
    page.insert_text((72, 72), content, fontsize=11)
    
    doc.save("tests/fixtures/test_with_match.pdf")
    return "tests/fixtures/test_with_match.pdf"


def create_pdf_without_match():
    """Cria PDF sem o nome do usuário."""
    doc = fitz.open()
    for i in range(10):
        page = doc.new_page()
        page.insert_text((72, 72), 
            f"Página {i+1}\nConteúdo genérico sem o nome procurado.", 
            fontsize=12)
    doc.save("tests/fixtures/test_without_match.pdf")
```

### 9.2 Usuário de Teste Padrão

```python
# tests/conftest.py
TEST_USER = {
    "email": "jucivaldo.test@diariointeligente.com",
    "password": "senha_teste_12345",
    "full_name": "Jucivaldo Souza dos Santos",
    "cpf": "123.456.789-00"
}

TEST_VARIATIONS = [
    "Jucivaldo Souza dos Santos",
    "JUCIVALDO SOUZA DOS SANTOS",
    "Jucivaldo Santos",
    "Jucivaldo",
    "Souza dos Santos"
]

TEST_COMPETITIONS = [
    {"organ_name": "TJBA", "position": "Técnico Judiciário", "year": 2024},
    {"organ_name": "INSS", "position": "Técnico do Seguro Social", "year": 2024},
]

TEST_KEYWORDS = [
    "Convocação", "Nomeação", "Eliminação", "Posse"
]
```

---

## 10. Ambiente de Testes

### 10.1 Configuração

```bash
# Instalar dependências de teste
pip install pytest pytest-asyncio pytest-cov pytest-mock httpx factory-boy freezegun

# Criar banco de dados de teste
DATABASE_URL_TEST=postgresql+asyncpg://user:pass@localhost/diario_test
alembic upgrade head --database $DATABASE_URL_TEST

# Criar PDFs de teste
python tests/fixtures/create_test_pdf.py

# Executar todos os testes
pytest tests/ -v --cov=app --cov-report=html

# Apenas testes unitários (rápido)
pytest tests/unit/ -v

# Apenas testes de integração
pytest tests/integration/ -v

# Testes com cobertura detalhada
pytest tests/ --cov=app --cov-report=term-missing

# Verificar cobertura mínima
pytest tests/ --cov=app --cov-fail-under=70
```

### 10.2 CI/CD (GitHub Actions)

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Install Tesseract
        run: sudo apt-get install -y tesseract-ocr tesseract-ocr-por
      
      - name: Run migrations
        run: alembic upgrade head
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost/test_db
      
      - name: Run tests
        run: pytest tests/ --cov=app --cov-fail-under=70 -v
```

---

*Documento gerado em: Julho/2026*
