# Plano de Desenvolvimento por Módulos — Diário Inteligente
**Cronograma, Prioridades e Checklist de Implementação**

**Versão:** 1.0  
**Data:** Julho/2026

---

## Visão Geral do Plano

### Metodologia
- Desenvolvimento modular e incremental
- MVP funcional ao final da Fase 1
- Cada módulo tem critérios claros de "Done"
- Testes mínimos antes de avançar para o próximo módulo

### Estimativa de Tempo

| Fase | Duração | Resultado |
|---|---|---|
| Fase 0 — Setup | 2-3 dias | Ambiente configurado e rodando |
| Fase 1 — Core MVP | 2 semanas | Sistema funcional básico |
| Fase 2 — Melhorias | 1-2 semanas | Funcionalidades completas V1 |
| Fase 3 — Polimento | 1 semana | UX refinada, testes |
| **Total V1** | **~5 semanas** | **Produto V1 completo** |

---

## FASE 0 — Setup do Ambiente (2-3 dias)

### Módulo 0.1 — Repositório e Estrutura

- [ ] Criar repositório Git
- [ ] Criar estrutura de pastas do backend (FastAPI)
- [ ] Criar estrutura de pastas do frontend (Next.js)
- [ ] Configurar `.gitignore` (Python + Node.js)
- [ ] Criar `README.md` inicial

### Módulo 0.2 — Backend Base

- [ ] Criar ambiente virtual Python (`venv`)
- [ ] Instalar dependências (`requirements.txt`)
- [ ] Configurar FastAPI com Uvicorn
- [ ] Criar arquivo `main.py` com app base
- [ ] Configurar variáveis de ambiente (`.env` + `.env.example`)
- [ ] Configurar Loguru para logging estruturado
- [ ] Testar: `uvicorn app.main:app --reload` funciona

### Módulo 0.3 — Banco de Dados

- [ ] Criar projeto no Supabase
- [ ] Configurar conexão SQLAlchemy async
- [ ] Instalar Alembic e configurar
- [ ] Criar migration inicial (todas as tabelas)
- [ ] Executar migration: `alembic upgrade head`
- [ ] Testar: conectar ao banco via SQLAlchemy

### Módulo 0.4 — Frontend Base

- [ ] Criar projeto Next.js com TypeScript
- [ ] Instalar Tailwind CSS + shadcn/ui
- [ ] Configurar cliente API (Axios ou fetch)
- [ ] Criar layout raiz com Sidebar
- [ ] Configurar temas (claro/escuro)
- [ ] Testar: `npm run dev` funciona na porta 3000

### Módulo 0.5 — Docker (Opcional para Dev)

- [ ] Criar `Dockerfile` para backend
- [ ] Criar `docker-compose.yml` com PostgreSQL local
- [ ] Testar: `docker-compose up` sobe tudo

**✅ Critério de Done Fase 0:**
> Backend rodando em :8000, frontend em :3000, banco de dados conectado, migrations executadas.

---

## FASE 1 — Core MVP (2 semanas)

### Módulo 1.1 — Autenticação (2-3 dias)

**Backend:**
- [ ] Criar modelo `User` (SQLAlchemy)
- [ ] Criar schemas Pydantic (UserCreate, UserResponse, etc.)
- [ ] Implementar hash de senha com bcrypt
- [ ] Implementar geração de JWT (access + refresh)
- [ ] Criar endpoint `POST /auth/register`
- [ ] Criar endpoint `POST /auth/login`
- [ ] Criar endpoint `POST /auth/refresh`
- [ ] Criar endpoint `POST /auth/logout`
- [ ] Criar dependência `get_current_user` (middleware de auth)
- [ ] Criar endpoint protegido de teste `GET /users/me`

**Frontend:**
- [ ] Criar página `/login`
- [ ] Criar página `/register`
- [ ] Implementar formulário de login com validação
- [ ] Implementar armazenamento seguro do token (httpOnly cookie ou localStorage)
- [ ] Criar hook `useAuth()`
- [ ] Implementar redirect para login se não autenticado
- [ ] Testar fluxo completo login → dashboard

**✅ Critério de Done 1.1:**
> Usuário pode criar conta, fazer login, e ser redirecionado ao dashboard. Token é renovado automaticamente.

---

### Módulo 1.2 — Perfil e Configurações Básicas (1 dia)

**Backend:**
- [ ] `PATCH /users/me` — atualizar nome e dados
- [ ] `PUT /users/me/password` — alterar senha
- [ ] `GET /settings` — retornar configurações
- [ ] `PATCH /settings` — salvar configurações
- [ ] Encriptação de CPF implementada

**Frontend:**
- [ ] Página `/settings/profile` com formulário
- [ ] Tela de onboarding (5 passos)
- [ ] Validações client-side

---

### Módulo 1.3 — Concursos e Palavras-chave (1 dia)

**Backend:**
- [ ] CRUD completo `/competitions`
- [ ] CRUD completo `/keywords`
- [ ] Seed de keywords padrão ao criar usuário
- [ ] Seed de concursos pré-definidos

**Frontend:**
- [ ] Página `/competitions` com lista
- [ ] Formulário de adicionar/editar concurso
- [ ] Página `/keywords` com toggle de ativação
- [ ] Adicionar palavra-chave personalizada

---

### Módulo 1.4 — Gerador de Variações de Nome (0.5 dia)

**Backend:**
- [ ] Função `generate_name_variations(full_name)` implementada
- [ ] Endpoint `POST /name-variations/generate`
- [ ] CRUD `/name-variations`
- [ ] Variações geradas automaticamente ao salvar nome

**Frontend:**
- [ ] Lista de variações com toggle
- [ ] Adicionar variação manual
- [ ] Preview durante onboarding

---

### Módulo 1.5 — Scraper e Download de PDFs (3-4 dias)

**Backend:**
- [ ] Classe base abstrata `BaseScraper` implementada
- [ ] `DOBAScraper` — detectar URL do dia e baixar PDF
- [ ] `DOUScraper` — detectar URL do dia e baixar PDF (seções 1, 2, 3)
- [ ] Modelo `Document` e endpoints básicos
- [ ] Sistema de armazenamento local de PDFs
- [ ] Verificação de duplicata (hash do arquivo)
- [ ] Log de downloads com metadados (tamanho, páginas)
- [ ] Retry automático em caso de falha (3 tentativas)
- [ ] Endpoint `POST /documents/download-now`

**Testes:**
- [ ] Testar download manual do DOBA
- [ ] Testar download manual do DOU
- [ ] Verificar que PDFs são salvos na pasta correta
- [ ] Verificar que metadados são salvos no banco

**✅ Critério de Done 1.5:**
> Sistema baixa PDFs do DOBA e DOU automaticamente e salva localmente.

---

### Módulo 1.6 — Extração de Texto (2 dias)

**Backend:**
- [ ] Serviço `TextExtractor` implementado
- [ ] Extração nativa com PyMuPDF
- [ ] Extração alternativa com pdfplumber
- [ ] OCR com Tesseract (para PDFs escaneados)
- [ ] Avaliação de qualidade do texto extraído
- [ ] Normalização de texto (remover ruído)
- [ ] Cache do texto extraído (não re-extrair)
- [ ] Atualização do status de extração no banco

**Testes:**
- [ ] Testar extração em PDF nativo (texto selecionável)
- [ ] Testar OCR em PDF escaneado
- [ ] Verificar qualidade e precisão do texto extraído

---

### Módulo 1.7 — Motor de Pesquisa (2 dias)

**Backend:**
- [ ] `SearchEngine` implementado
- [ ] Busca por nome exato (case-insensitive)
- [ ] Busca por todas as variações
- [ ] Busca por CPF (formatos variados)
- [ ] Algoritmo de scoring de relevância
- [ ] Extração de contexto (300 chars antes/depois)
- [ ] Deduplicação de resultados
- [ ] Salvar `SearchHistory` e `Matches` no banco
- [ ] Endpoint `POST /search/run`
- [ ] Endpoint `GET /search/history`

**Testes:**
- [ ] Criar PDF de teste com nome do usuário
- [ ] Verificar que sistema encontra todas as variações
- [ ] Verificar que scoring funciona corretamente
- [ ] Verificar que contexto é extraído corretamente

**✅ Critério de Done 1.7:**
> Sistema pesquisa um PDF baixado e encontra o nome do usuário com contexto correto.

---

### Módulo 1.8 — Agendador (Scheduler) (1 dia)

**Backend:**
- [ ] APScheduler integrado ao FastAPI startup
- [ ] Job diário configurável (padrão: 06:00)
- [ ] Pipeline completo: download → extração → pesquisa
- [ ] Endpoint `PATCH /settings/schedule` para alterar horário
- [ ] Log de execução de cada job
- [ ] Tratamento de erros no job (não derruba o servidor)

**Testes:**
- [ ] Ajustar horário para 1 minuto no futuro
- [ ] Verificar que job executa automaticamente
- [ ] Verificar que log registra a execução

---

### Módulo 1.9 — Notificações Telegram (1 dia)

**Backend:**
- [ ] Integração com python-telegram-bot
- [ ] Serviço `TelegramNotifier`
- [ ] Formato de mensagem com todas as informações
- [ ] Endpoint `POST /notifications/test`
- [ ] Salvar registro de notificação enviada no banco
- [ ] Evitar notificações duplicadas

**Frontend:**
- [ ] Página de configuração Telegram
- [ ] Botão "Enviar mensagem de teste"
- [ ] Feedback de sucesso/erro

**Testes:**
- [ ] Configurar bot real
- [ ] Enviar mensagem de teste
- [ ] Verificar que alerta automático chega após match

---

### Módulo 1.10 — Dashboard Básico (1 dia)

**Frontend:**
- [ ] Cards de estatísticas (total pesquisas, resultados, etc.)
- [ ] Lista de últimos resultados
- [ ] Status do sistema (DOBA: OK, DOU: OK)
- [ ] Conexão real com API
- [ ] Loading states para todos os dados

**Backend:**
- [ ] `GET /dashboard/stats` implementado

**✅ Critério de Done Fase 1 (MVP):**
> O sistema baixa PDFs diariamente, pesquisa o nome do usuário, salva o histórico e envia alerta via Telegram quando encontra resultado.

---

## FASE 2 — Melhorias (1-2 semanas)

### Módulo 2.1 — WebSocket para Progresso em Tempo Real (2 dias)

- [ ] Endpoint WebSocket implementado
- [ ] Eventos de download emitidos
- [ ] Eventos de extração emitidos
- [ ] Eventos de pesquisa emitidos
- [ ] Evento de match encontrado emitido
- [ ] Frontend conecta e exibe progresso animado

---

### Módulo 2.2 — Resumo por IA (1 dia)

- [ ] Serviço `AISummarizer` com OpenAI GPT-4o-mini
- [ ] Prompt otimizado para diários oficiais
- [ ] Fallback se API estiver indisponível
- [ ] Resumo exibido nos detalhes do resultado
- [ ] Botão "Gerar resumo" para matches antigos

---

### Módulo 2.3 — Visualizador de PDF (2 dias)

- [ ] Componente PDF viewer embutido (react-pdf)
- [ ] Navegar para página específica automaticamente
- [ ] Destacar (highlight) o nome encontrado
- [ ] Botão de download do PDF
- [ ] Controles de zoom e navegação

---

### Módulo 2.4 — Pesquisa Retroativa (1 dia)

- [ ] Interface de seleção de período
- [ ] Backend processa todos os PDFs do período
- [ ] Progresso em tempo real via WebSocket
- [ ] Resultados agrupados por data

---

### Módulo 2.5 — Notificação por E-mail (1 dia)

- [ ] Integração com SMTP (Gmail ou SendGrid)
- [ ] Template HTML do e-mail de alerta
- [ ] Configuração de e-mail nas settings
- [ ] Teste de envio
- [ ] Registro no banco

---

### Módulo 2.6 — Histórico e Filtros Avançados (1 dia)

- [ ] Filtros: por diário, data, resultado
- [ ] Paginação no histórico
- [ ] Exportar histórico como CSV
- [ ] Timeline visual no dashboard

---

## FASE 3 — Polimento (1 semana)

### Módulo 3.1 — UX/UI Refinada

- [ ] Tema escuro completo e refinado
- [ ] Animações suaves nas transições
- [ ] Micro-interações (hover, loading, etc.)
- [ ] Mobile-first responsivo testado
- [ ] Mensagens de erro amigáveis em PT-BR
- [ ] Empty states com ilustrações

### Módulo 3.2 — Onboarding Completo

- [ ] Wizard de 5 passos implementado
- [ ] Detectar se é primeiro acesso
- [ ] Sugestão de pesquisa retroativa ao finalizar onboarding
- [ ] Tour guiado do dashboard (opcional)

### Módulo 3.3 — Configurações Completas

- [ ] Alterar horário de pesquisa
- [ ] Selecionar diários monitorados
- [ ] Período de retenção de PDFs
- [ ] Tema da interface
- [ ] Exportar dados do usuário

### Módulo 3.4 — Testes e Qualidade

- [ ] Testes unitários dos serviços críticos
- [ ] Testes de integração dos endpoints principais
- [ ] Testar com PDF real do DOBA
- [ ] Testar com PDF real do DOU
- [ ] Testar cenário de OCR (PDF escaneado)
- [ ] Testar falha e retry de notificação

### Módulo 3.5 — Documentação Final

- [ ] Atualizar README com instruções de instalação
- [ ] Documentar variáveis de ambiente
- [ ] Criar script de instalação automática
- [ ] Documentar como configurar o Telegram bot

---

## Dependências entre Módulos

```
0.1 → 0.2 → 0.3 → 0.4
         ↓
1.1 (Auth) → TODOS os outros módulos
         ↓
1.2 (Perfil) → 1.3 (Concursos) → 1.4 (Variações)
         ↓
1.5 (Download) → 1.6 (Extração) → 1.7 (Pesquisa)
         ↓                              ↓
1.8 (Scheduler) ←─────────────────────→ 1.9 (Notificações)
         ↓
1.10 (Dashboard) ← dados de todos
```

---

## Prioridade dos Módulos para MVP Rápido

Se o objetivo é ter algo funcional no menor tempo:

| Prioridade | Módulo | Tempo |
|---|---|---|
| P0 (obrigatório) | 0.1-0.4 Setup | 2 dias |
| P0 (obrigatório) | 1.1 Auth | 2 dias |
| P0 (obrigatório) | 1.5 Download PDFs | 2 dias |
| P0 (obrigatório) | 1.6 Extração texto | 1 dia |
| P0 (obrigatório) | 1.7 Pesquisa | 1 dia |
| P0 (obrigatório) | 1.8 Scheduler | 0.5 dia |
| P0 (obrigatório) | 1.9 Telegram | 0.5 dia |
| P1 (importante) | 1.10 Dashboard | 1 dia |
| P1 (importante) | 1.2-1.4 Perfil/Concursos | 1 dia |
| P2 (melhorias) | 2.x Todas | 1-2 semanas |
| P3 (polimento) | 3.x Todas | 1 semana |

**MVP mínimo funcional: ~10 dias de desenvolvimento**

---

## Comandos de Desenvolvimento

### Backend

```bash
# Instalar dependências
pip install -r requirements.txt

# Criar e executar migrations
alembic revision --autogenerate -m "description"
alembic upgrade head

# Executar servidor
uvicorn app.main:app --reload --port 8000

# Executar testes
pytest tests/ -v --cov=app

# Instalar dependências de sistema (OCR)
# Windows:
# Baixar Tesseract de: https://github.com/UB-Mannheim/tesseract/wiki
# Adicionar ao PATH

# Baixar modelo de idioma português
# Em Windows: copiar por.traineddata para pasta tessdata
```

### Frontend

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar tipos TypeScript
npm run type-check

# Lint
npm run lint
```

### Banco de Dados

```bash
# Resetar banco (CUIDADO: apaga tudo!)
alembic downgrade base
alembic upgrade head

# Inserir dados de seed
python scripts/seed.py

# Ver estrutura do banco
\dt  # no psql
```

---

*Documento gerado em: Julho/2026*
