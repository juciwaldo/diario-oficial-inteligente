# Arquitetura do Sistema — Diário Inteligente
**Sistema de Monitoramento de Diários Oficiais**

**Versão:** 1.0  
**Data:** Julho/2026  

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitetura de Alto Nível](#3-arquitetura-de-alto-nível)
4. [Componentes do Backend](#4-componentes-do-backend)
5. [Componentes do Frontend](#5-componentes-do-frontend)
6. [Banco de Dados](#6-banco-de-dados)
7. [Sistema de Filas e Agendamento](#7-sistema-de-filas-e-agendamento)
8. [Pipeline de Processamento de PDFs](#8-pipeline-de-processamento-de-pdfs)
9. [Módulo de Pesquisa](#9-módulo-de-pesquisa)
10. [Módulo de Notificações](#10-módulo-de-notificações)
11. [Armazenamento de Arquivos](#11-armazenamento-de-arquivos)
12. [Segurança](#12-segurança)
13. [Infraestrutura e Deploy](#13-infraestrutura-e-deploy)
14. [Decisões de Arquitetura (ADRs)](#14-decisões-de-arquitetura-adrs)
15. [Diagrama Completo](#15-diagrama-completo)

---

## 1. Visão Geral da Arquitetura

O sistema segue uma arquitetura **monolítica modular** para a versão 1.0 (uso pessoal), evoluindo para **microserviços** na versão 2.0 (multi-usuário).

### 1.1 Estilo Arquitetural

- **Pattern:** Monolito modular com separação clara de responsabilidades
- **API:** REST com FastAPI
- **Frontend:** Server-Side Rendering com Next.js
- **Background Jobs:** APScheduler integrado ao FastAPI
- **Comunicação:** REST API (frontend ↔ backend) + WebSockets (status em tempo real)

### 1.2 Princípios Guiadores

1. **Simplicidade primeiro** — MVP funcional antes de otimizações
2. **Separação de responsabilidades** — cada módulo tem uma única função
3. **Resiliência** — falhas isoladas não derrubam o sistema todo
4. **Observabilidade** — logs estruturados em todas as operações críticas
5. **Evolução gradual** — arquitetura preparada para crescer

---

## 2. Stack Tecnológico

### 2.1 Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Next.js | 14+ | Framework React com SSR/SSG |
| React | 18+ | Biblioteca de UI |
| TypeScript | 5+ | Tipagem estática |
| Tailwind CSS | 3+ | Estilização utilitária |
| shadcn/ui | latest | Componentes UI prontos |
| React Query | 5+ | Cache e sincronização de dados do servidor |
| Zustand | 4+ | Estado global do cliente |
| React PDF | 7+ | Visualizador de PDF embutido |
| Socket.io Client | 4+ | Atualizações em tempo real |
| Lucide React | latest | Ícones |
| date-fns | 3+ | Manipulação de datas |

### 2.2 Backend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Python | 3.11+ | Linguagem principal do backend |
| FastAPI | 0.110+ | Framework REST API assíncrono |
| SQLAlchemy | 2.0+ | ORM para banco de dados |
| Alembic | 1.13+ | Migrações de banco de dados |
| APScheduler | 3.10+ | Agendamento de jobs em background |
| Pydantic | 2.0+ | Validação e serialização de dados |
| python-jose | 3.3+ | JWT para autenticação |
| passlib | 1.7+ | Hashing de senhas (bcrypt) |
| httpx | 0.27+ | Cliente HTTP assíncrono |
| aiofiles | 23+ | I/O assíncrono de arquivos |
| python-dotenv | 1.0+ | Gerenciamento de variáveis de ambiente |
| loguru | 0.7+ | Logging estruturado |
| uvicorn | 0.29+ | Servidor ASGI |

### 2.3 Processamento de PDFs

| Tecnologia | Versão | Finalidade |
|---|---|---|
| PyMuPDF (fitz) | 1.24+ | Extração de texto nativo de PDFs |
| pdfplumber | 0.11+ | Extração alternativa (tabelas, layout) |
| pytesseract | 0.3+ | Interface Python para Tesseract OCR |
| Tesseract OCR | 5.3+ | Motor de reconhecimento óptico de caracteres |
| Pillow | 10+ | Manipulação de imagens para OCR |
| pdf2image | 1.17+ | Conversão de páginas PDF para imagem |

### 2.4 Banco de Dados e Storage

| Tecnologia | Versão | Finalidade |
|---|---|---|
| PostgreSQL | 15+ | Banco de dados principal |
| Supabase | - | BaaS: Postgres + Auth + Storage + Realtime |
| Redis | 7+ | Cache e sessões (opcional V1) |

### 2.5 Integrações Externas

| Serviço | SDK/Biblioteca | Finalidade |
|---|---|---|
| Telegram Bot API | python-telegram-bot 21+ | Notificações via Telegram |
| OpenAI API | openai 1.30+ | Resumo de resultados por IA |
| SendGrid | sendgrid 6+ | E-mail de alertas |
| Google OAuth | authlib | Login social (V2) |

---

## 3. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIO                                   │
│                    Browser / Mobile                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                     FRONTEND — Next.js                           │
│   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│   │Dashboard│  │Histórico │  │Concursos │  │ Configurações  │  │
│   └────┬────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│        └────────────┴─────────────┴────────────────┘           │
│                           │ REST API / WebSocket                 │
└──────────────────────────▼──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND — FastAPI                             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────────┐  ┌───────────────────┐   │
│  │   Auth API  │  │   Data API      │  │   Job Scheduler   │   │
│  │  /auth/*    │  │  /users/*       │  │   APScheduler     │   │
│  │  JWT/OAuth  │  │  /competitions/*│  │   Cron 06:00      │   │
│  └─────────────┘  │  /keywords/*    │  └────────┬──────────┘   │
│                   │  /history/*     │           │               │
│                   │  /matches/*     │  ┌────────▼──────────┐   │
│                   │  /notifications/│  │  Pipeline Worker  │   │
│                   └─────────────────┘  │  Download → OCR   │   │
│                                        │  → Search → Alert │   │
│  ┌─────────────────────────────────┐   └───────────────────┘   │
│  │         WebSocket Manager       │                            │
│  │    Progresso em tempo real      │                            │
│  └─────────────────────────────────┘                            │
└─────────────────────┬───────────────────────┬───────────────────┘
                      │                       │
          ┌───────────▼──────────┐  ┌─────────▼──────────────┐
          │  PostgreSQL/Supabase │  │  File Storage (Local)  │
          │  ┌──────────────┐   │  │  /storage/pdfs/        │
          │  │ Users        │   │  │  /storage/extracted/   │
          │  │ Competitions │   │  │  /storage/logs/        │
          │  │ Keywords     │   │  └────────────────────────┘
          │  │ Documents    │   │
          │  │ SearchHistory│   │
          │  │ Matches      │   │
          │  │ Notifications│   │
          │  │ Settings     │   │
          │  │ Logs         │   │
          │  └──────────────┘   │
          └──────────────────────┘
                      │
          ┌───────────▼───────────────────────────┐
          │         SERVIÇOS EXTERNOS              │
          │  ┌──────────┐  ┌────────┐  ┌───────┐  │
          │  │ Telegram │  │OpenAI  │  │ SMTP  │  │
          │  │  Bot API │  │  API   │  │Email  │  │
          │  └──────────┘  └────────┘  └───────┘  │
          └───────────────────────────────────────┘
```

---

## 4. Componentes do Backend

### 4.1 Estrutura de Pastas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Entry point FastAPI
│   ├── config.py                # Configurações centralizadas
│   ├── database.py              # Conexão com banco
│   │
│   ├── api/                     # Rotas da API
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependências (auth, db)
│   │   ├── auth.py              # Login, logout, refresh
│   │   ├── users.py             # Perfil do usuário
│   │   ├── competitions.py      # CRUD de concursos
│   │   ├── keywords.py          # CRUD de palavras-chave
│   │   ├── documents.py         # Documentos/PDFs
│   │   ├── search.py            # Histórico e busca manual
│   │   ├── matches.py           # Resultados encontrados
│   │   ├── notifications.py     # Configurações de notif.
│   │   ├── settings.py          # Configurações gerais
│   │   └── websocket.py         # WebSocket endpoints
│   │
│   ├── models/                  # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── competition.py
│   │   ├── keyword.py
│   │   ├── document.py
│   │   ├── search_history.py
│   │   ├── match.py
│   │   ├── notification.py
│   │   ├── setting.py
│   │   └── log.py
│   │
│   ├── schemas/                 # Schemas Pydantic
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── competition.py
│   │   ├── keyword.py
│   │   ├── document.py
│   │   ├── search.py
│   │   ├── match.py
│   │   └── notification.py
│   │
│   ├── services/                # Lógica de negócio
│   │   ├── __init__.py
│   │   ├── downloader.py        # Download de PDFs
│   │   ├── extractor.py         # OCR e extração de texto
│   │   ├── searcher.py          # Algoritmo de busca
│   │   ├── notifier.py          # Envio de notificações
│   │   ├── ai_summarizer.py     # Resumo por IA
│   │   └── scheduler.py         # Agendamento de jobs
│   │
│   ├── workers/                 # Background jobs
│   │   ├── __init__.py
│   │   ├── daily_job.py         # Job diário principal
│   │   ├── download_worker.py   # Worker de download
│   │   ├── search_worker.py     # Worker de pesquisa
│   │   └── notification_worker.py
│   │
│   ├── scrapers/                # Scrapers por diário
│   │   ├── __init__.py
│   │   ├── base.py              # Classe base abstrata
│   │   ├── doba_scraper.py      # DOBA
│   │   └── dou_scraper.py       # DOU
│   │
│   └── utils/
│       ├── __init__.py
│       ├── text_utils.py        # Normalização de texto
│       ├── name_variations.py   # Gerador de variações
│       ├── pdf_utils.py         # Utilitários de PDF
│       └── date_utils.py        # Utilitários de data
│
├── alembic/                     # Migrações
│   ├── versions/
│   └── env.py
│
├── tests/                       # Testes
│   ├── unit/
│   ├── integration/
│   └── conftest.py
│
├── storage/                     # Arquivos locais
│   ├── pdfs/
│   │   ├── doba/2026/07/
│   │   └── dou/2026/07/
│   ├── extracted/
│   └── logs/
│
├── .env                         # Variáveis de ambiente
├── .env.example
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### 4.2 Fluxo de Dados do Backend

```
HTTP Request
    ↓
FastAPI Router
    ↓
Dependency Injection (auth, db session)
    ↓
Pydantic Schema Validation
    ↓
Service Layer (business logic)
    ↓
SQLAlchemy ORM
    ↓
PostgreSQL
```

### 4.3 Design da Classe Base do Scraper

```python
# scrapers/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from pathlib import Path

@dataclass
class DownloadResult:
    success: bool
    file_path: Path | None
    edition_date: date
    pages: int
    file_size_bytes: int
    error: str | None = None

class BaseScraper(ABC):
    """Classe base para todos os scrapers de diários."""
    
    name: str           # "DOBA", "DOU"
    base_url: str       # URL base do portal
    
    @abstractmethod
    async def get_edition_url(self, target_date: date) -> str | None:
        """Retorna URL do PDF para a data informada."""
        pass
    
    @abstractmethod
    async def download(self, target_date: date) -> DownloadResult:
        """Baixa o PDF do diário para a data informada."""
        pass
    
    async def edition_exists(self, target_date: date) -> bool:
        """Verifica se a edição do dia já existe no storage."""
        pass
```

---

## 5. Componentes do Frontend

### 5.1 Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Layout raiz
│   │   ├── page.tsx             # Dashboard (/)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── history/
│   │   │   ├── page.tsx         # Histórico de pesquisas
│   │   │   └── [id]/page.tsx    # Detalhes de resultado
│   │   ├── competitions/
│   │   │   ├── page.tsx         # Lista de concursos
│   │   │   └── [id]/page.tsx    # Detalhes do concurso
│   │   ├── keywords/page.tsx    # Palavras-chave
│   │   ├── search/page.tsx      # Pesquisa manual/retroativa
│   │   ├── settings/
│   │   │   ├── page.tsx         # Configurações gerais
│   │   │   ├── profile/page.tsx
│   │   │   └── notifications/page.tsx
│   │   └── api/                 # Route Handlers Next.js
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── SearchTimeline.tsx
│   │   │   ├── RecentMatches.tsx
│   │   │   └── SystemStatus.tsx
│   │   ├── history/
│   │   │   ├── SearchHistoryList.tsx
│   │   │   ├── MatchCard.tsx
│   │   │   └── AIResumeBadge.tsx
│   │   ├── competitions/
│   │   │   ├── CompetitionForm.tsx
│   │   │   └── CompetitionCard.tsx
│   │   ├── search/
│   │   │   ├── ManualSearchButton.tsx
│   │   │   ├── RetroactiveSearch.tsx
│   │   │   └── SearchProgress.tsx
│   │   ├── pdf/
│   │   │   ├── PDFViewer.tsx
│   │   │   └── HighlightedPage.tsx
│   │   └── notifications/
│   │       ├── TelegramSetup.tsx
│   │       └── EmailSetup.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSearchStatus.ts   # WebSocket hook
│   │   ├── useCompetitions.ts
│   │   ├── useKeywords.ts
│   │   └── useHistory.ts
│   │
│   ├── lib/
│   │   ├── api.ts               # Cliente Axios/fetch
│   │   ├── auth.ts              # Helpers de autenticação
│   │   └── utils.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   └── searchStore.ts
│   │
│   └── types/
│       ├── api.ts               # Tipos da API
│       └── index.ts
│
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 5.2 Gerenciamento de Estado

```
React Query (server state)          Zustand (client state)
├── competitions                    ├── auth (user, token)
├── keywords                        ├── search status (ws)
├── searchHistory                   └── ui preferences
├── matches
└── notifications
```

---

## 6. Banco de Dados

### 6.1 Estratégia

- **PostgreSQL via Supabase** para a versão 1.0
- ORM SQLAlchemy 2.0 com suporte assíncrono
- Migrações gerenciadas pelo Alembic

### 6.2 Diagrama de Entidades

```
users ─────────────────────────────────────────────────────┐
│ id (UUID PK)                                              │
│ email (UNIQUE)                                            │
│ password_hash                                             │
│ full_name                                                 │
│ cpf_encrypted (nullable)                                  │
│ rg (nullable)                                             │
│ is_active (boolean)                                       │
│ created_at                                                │
│ updated_at                                                │
└───┬───────────────────────────────────────────────────────┘
    │ 1
    │ N
    ├──▶ competitions
    │    │ id (UUID PK)
    │    │ user_id (FK → users.id)
    │    │ organ_name
    │    │ position
    │    │ year
    │    │ status (enum)
    │    │ registration_number (nullable)
    │    │ examining_board (nullable)
    │    │ edital_url (nullable)
    │    │ notes
    │    │ is_active (boolean)
    │    │ created_at
    │
    ├──▶ keywords
    │    │ id (UUID PK)
    │    │ user_id (FK → users.id)
    │    │ word
    │    │ priority (high/medium/low)
    │    │ category (positive/negative/neutral)
    │    │ is_active (boolean)
    │    │ is_default (boolean)
    │    │ created_at
    │
    ├──▶ settings
    │    │ id (UUID PK)
    │    │ user_id (FK → users.id, UNIQUE)
    │    │ telegram_token (nullable)
    │    │ telegram_chat_id (nullable)
    │    │ notification_email (nullable)
    │    │ schedule_time (time) DEFAULT '06:00'
    │    │ schedule_frequency (enum)
    │    │ name_variations (JSONB)
    │    │ monitored_journals (JSONB)
    │    │ theme (light/dark)
    │    │ language (pt-BR)
    │    │ updated_at
    │
    ├──▶ documents
    │    │ id (UUID PK)
    │    │ user_id (FK → users.id)
    │    │ journal_name (DOBA/DOU)
    │    │ edition_date (date)
    │    │ file_path (local path)
    │    │ file_size_bytes (bigint)
    │    │ total_pages (integer)
    │    │ file_hash (MD5/SHA256)
    │    │ extraction_status (enum)
    │    │ ocr_applied (boolean)
    │    │ created_at
    │
    ├──▶ search_history
    │    │ id (UUID PK)
    │    │ user_id (FK → users.id)
    │    │ document_id (FK → documents.id)
    │    │ executed_at (timestamp)
    │    │ execution_type (auto/manual/retroactive)
    │    │ pages_searched (integer)
    │    │ duration_seconds (float)
    │    │ matches_found (integer)
    │    │ status (success/error/partial)
    │    │ error_message (nullable)
    │
    ├──▶ matches
    │    │ id (UUID PK)
    │    │ search_history_id (FK → search_history.id)
    │    │ document_id (FK → documents.id)
    │    │ page_number (integer)
    │    │ match_text (text)        ← trecho encontrado
    │    │ context_before (text)    ← 300 chars antes
    │    │ context_after (text)     ← 300 chars depois
    │    │ matched_variation (text) ← qual variação bateu
    │    │ keyword_triggered (text) ← palavra-chave
    │    │ relevance_score (float)
    │    │ ai_summary (text, nullable)
    │    │ created_at
    │
    ├──▶ notifications
    │    │ id (UUID PK)
    │    │ user_id (FK → users.id)
    │    │ match_id (FK → matches.id)
    │    │ channel (telegram/email)
    │    │ status (sent/failed/pending)
    │    │ sent_at (timestamp, nullable)
    │    │ error_message (nullable)
    │    │ retry_count (integer)
    │
    └──▶ logs
         │ id (UUID PK)
         │ user_id (FK → users.id, nullable)
         │ level (INFO/WARNING/ERROR/CRITICAL)
         │ module (downloader/extractor/searcher/notifier)
         │ message (text)
         │ metadata (JSONB)
         │ created_at
```

---

## 7. Sistema de Filas e Agendamento

### 7.1 APScheduler

Para a versão 1.0 (uso pessoal), utilizamos APScheduler integrado ao FastAPI:

```python
# workers/daily_job.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler()

async def daily_search_job():
    """Job executado diariamente para download e pesquisa."""
    user = await get_user()  # único usuário na V1
    settings = await get_settings(user.id)
    
    for journal in settings.monitored_journals:
        # 1. Download
        result = await downloader.download(journal, date.today())
        if not result.success:
            await notifier.send_error(user, f"Falha ao baixar {journal}")
            continue
        
        # 2. Extração
        text_data = await extractor.extract(result.file_path)
        
        # 3. Pesquisa
        matches = await searcher.search(text_data, user)
        
        # 4. Notificações
        if matches:
            for match in matches:
                summary = await ai_summarizer.summarize(match.context)
                await notifier.send_alert(user, match, summary)

# Configuração do trigger
scheduler.add_job(
    daily_search_job,
    CronTrigger(hour=6, minute=0),
    id="daily_search",
    replace_existing=True,
    misfire_grace_time=3600
)
```

### 7.2 Fluxo de Jobs

```
Trigger (06:00 cron)
    ↓
daily_search_job()
    ├── [DOBA] download_worker()
    │   ├── Verifica se edição existe → já existe? skip
    │   ├── GET request para URL do dia
    │   ├── Salva PDF em storage
    │   ├── Registra metadados no DB
    │   └── Emite evento WebSocket: "download_complete"
    │
    ├── [DOBA] extraction_worker()
    │   ├── Tenta extração nativa (PyMuPDF)
    │   ├── Se falhar → aplica OCR (Tesseract)
    │   ├── Salva texto extraído por página
    │   └── Emite evento: "extraction_complete"
    │
    ├── [DOBA] search_worker()
    │   ├── Carrega variações do nome do usuário
    │   ├── Para cada página do documento:
    │   │   ├── Busca exata
    │   │   ├── Busca por variações
    │   │   └── Busca por proximidade
    │   ├── Salva matches no DB
    │   └── Emite evento: "search_complete"
    │
    ├── [DOBA] notification_worker()
    │   ├── Para cada match novo:
    │   │   ├── Gera resumo (IA)
    │   │   ├── Envia Telegram
    │   │   └── Envia e-mail
    │   └── Emite evento: "notifications_sent"
    │
    └── [DOU] → repete o mesmo fluxo
```

---

## 8. Pipeline de Processamento de PDFs

### 8.1 Fluxo de Extração

```python
# services/extractor.py

async def extract_text(file_path: Path) -> dict[int, str]:
    """
    Extrai texto de um PDF.
    Retorna: {numero_pagina: texto_extraido}
    """
    
    # Fase 1: Tentar extração nativa (PyMuPDF)
    result = await extract_native(file_path)
    
    # Avaliar qualidade
    quality = evaluate_quality(result)
    
    if quality >= 0.8:  # 80% de qualidade = aceitável
        return result
    
    # Fase 2: Fallback para OCR (Tesseract)
    return await extract_with_ocr(file_path)


async def extract_native(file_path: Path) -> dict[int, str]:
    """Extração usando PyMuPDF."""
    import fitz
    
    text_by_page = {}
    doc = fitz.open(file_path)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        text_by_page[page_num + 1] = normalize_text(text)
    
    return text_by_page


async def extract_with_ocr(file_path: Path) -> dict[int, str]:
    """OCR com Tesseract."""
    from pdf2image import convert_from_path
    import pytesseract
    
    images = convert_from_path(file_path, dpi=300)
    text_by_page = {}
    
    for i, image in enumerate(images):
        text = pytesseract.image_to_string(
            image, 
            lang='por',  # Português
            config='--psm 1'  # Detecção automática de orientação
        )
        text_by_page[i + 1] = normalize_text(text)
    
    return text_by_page
```

### 8.2 Normalização de Texto

```python
# utils/text_utils.py
import unicodedata
import re

def normalize_text(text: str) -> str:
    """
    Normaliza texto extraído de PDF.
    - Remove caracteres especiais problemáticos
    - Normaliza espaços
    - Preserva acentuação do português
    """
    # Normalizar unicode
    text = unicodedata.normalize('NFC', text)
    
    # Remover quebras de linha excessivas
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Normalizar espaços
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Preservar pontuação relevante
    # ...
    
    return text.strip()
```

---

## 9. Módulo de Pesquisa

### 9.1 Algoritmo de Busca em Camadas

```python
# services/searcher.py

class SearchEngine:
    
    async def search_document(
        self, 
        text_by_page: dict[int, str],
        user: User,
        settings: Settings
    ) -> list[Match]:
        
        matches = []
        variations = self.get_name_variations(user, settings)
        keywords = await self.get_active_keywords(user.id)
        
        for page_num, page_text in text_by_page.items():
            
            # Nível 1: Busca exata do nome completo
            exact_matches = self.find_exact(page_text, user.full_name)
            
            # Nível 2: Busca por variações
            variation_matches = []
            for variation in variations:
                found = self.find_exact(page_text, variation)
                variation_matches.extend(found)
            
            # Nível 3: Busca por CPF (se configurado)
            cpf_matches = []
            if user.cpf:
                cpf_matches = self.find_cpf(page_text, user.cpf)
            
            # Combinar e deduplicar
            all_matches = self.deduplicate(
                exact_matches + variation_matches + cpf_matches
            )
            
            # Calcular relevância
            for match in all_matches:
                match.relevance_score = self.calculate_relevance(
                    match, keywords, page_text
                )
                match.page_number = page_num
                match.context = self.extract_context(
                    page_text, match.position, window=300
                )
            
            matches.extend(all_matches)
        
        return sorted(matches, key=lambda m: m.relevance_score, reverse=True)
    
    def calculate_relevance(self, match, keywords, page_text) -> float:
        score = 0.0
        
        # Nome exato: +100
        if match.is_exact:
            score += 100
        else:
            score += 50  # Variação
        
        # Palavra-chave na mesma frase
        sentence = self.get_sentence(page_text, match.position)
        for keyword in keywords:
            if keyword.word.lower() in sentence.lower():
                if keyword.priority == "high":
                    score += 40
                elif keyword.priority == "medium":
                    score += 25
                else:
                    score += 10
        
        # CPF encontrado
        if match.type == "cpf":
            score += 50
        
        return score
```

### 9.2 Gerador de Variações de Nome

```python
# utils/name_variations.py

def generate_name_variations(full_name: str) -> list[str]:
    """
    Gera variações automáticas do nome para pesquisa.
    
    Entrada: "Jucivaldo Souza dos Santos"
    Saída: [
        "Jucivaldo Souza dos Santos",  # completo
        "Jucivaldo Santos",            # primeiro + último
        "Jucivaldo",                   # apenas primeiro
        "Souza dos Santos",            # sem primeiro nome
        "J. Souza dos Santos",         # inicial + resto
        "J. S. Santos",                # iniciais
        "JUCIVALDO SOUZA DOS SANTOS",  # maiúsculas
    ]
    """
    parts = full_name.split()
    variations = []
    
    if len(parts) == 0:
        return []
    
    first = parts[0]
    last = parts[-1]
    middle = parts[1:-1]
    
    # Nome completo
    variations.append(full_name)
    
    # Primeiro nome apenas
    if len(first) >= 4:
        variations.append(first)
    
    # Primeiro + último sobrenome
    variations.append(f"{first} {last}")
    
    # Sem o primeiro nome
    if len(parts) > 2:
        variations.append(" ".join(parts[1:]))
    
    # Inicial + resto
    variations.append(f"{first[0]}. {' '.join(parts[1:])}")
    
    # Versão maiúscula (comum em diários)
    variations.append(full_name.upper())
    
    # Remover duplicatas e variações muito curtas
    return list(set(v for v in variations if len(v) >= 4))
```

---

## 10. Módulo de Notificações

### 10.1 Telegram

```python
# services/notifier.py

import telegram

class TelegramNotifier:
    
    def __init__(self, token: str):
        self.bot = telegram.Bot(token=token)
    
    async def send_match_alert(
        self, 
        chat_id: str, 
        match: Match, 
        summary: str | None
    ):
        text = f"""
🚨 *ALERTA — DIÁRIO INTELIGENTE*

📰 *Diário:* {match.journal_name}
📅 *Edição:* {match.edition_date.strftime('%d/%m/%Y')}
📄 *Página:* {match.page_number}
🔍 *Palavra-chave:* {match.keyword_triggered or 'N/A'}

*Trecho encontrado:*
_{match.match_text[:300]}_

{f"📋 *Resumo:*{chr(10)}{summary}" if summary else ""}

🔗 [Ver no sistema]({settings.APP_URL}/history/{match.id})
        """
        
        await self.bot.send_message(
            chat_id=chat_id,
            text=text,
            parse_mode='Markdown'
        )
```

### 10.2 Resumo por IA

```python
# services/ai_summarizer.py

from openai import AsyncOpenAI

class AISummarizer:
    
    def __init__(self):
        self.client = AsyncOpenAI()
    
    async def summarize(self, context: str, match_type: str) -> str:
        prompt = f"""
Você é um assistente especializado em Diários Oficiais brasileiros.
Analise o trecho abaixo e forneça um resumo claro e conciso em português.

Explique:
1. O que o ato significa (convocação, nomeação, etc.)
2. Qual o prazo (se mencionado)
3. O que o candidato deve fazer
4. Quais documentos são necessários (se mencionados)
5. Algum alerta importante

Use linguagem simples e direta. Máximo 200 palavras.

Trecho do Diário Oficial:
---
{context}
---
"""
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3
        )
        
        return response.choices[0].message.content
```

---

## 11. Armazenamento de Arquivos

### 11.1 Estrutura de Pastas

```
storage/
├── pdfs/
│   ├── doba/
│   │   ├── 2026/
│   │   │   ├── 01/
│   │   │   │   ├── DOBA_2026_01_02.pdf
│   │   │   │   └── DOBA_2026_01_03.pdf
│   │   │   └── 07/
│   │   │       └── DOBA_2026_07_22.pdf
│   └── dou/
│       └── 2026/
│           └── 07/
│               ├── DOU_S1_2026_07_22.pdf
│               ├── DOU_S2_2026_07_22.pdf
│               └── DOU_S3_2026_07_22.pdf
│
├── extracted/               ← textos extraídos (cache)
│   ├── doba/
│   └── dou/
│
└── logs/
    ├── app.log
    ├── jobs.log
    └── errors.log
```

### 11.2 Convenção de Nomes de Arquivo

```
Formato: {SIGLA}_{SECAO}_{ANO}_{MES}_{DIA}.pdf
Exemplos:
  DOBA_2026_07_22.pdf
  DOU_S1_2026_07_22.pdf
  DOU_S2_2026_07_22.pdf
```

---

## 12. Segurança

### 12.1 Autenticação e Autorização

```python
# Fluxo JWT
1. POST /auth/login {email, password}
2. Backend verifica hash da senha (bcrypt)
3. Gera access_token (JWT, 24h) + refresh_token (7d)
4. Frontend armazena access_token em httpOnly cookie
5. Todas as rotas protegidas verificam o token
6. Refresh automático quando access_token expira
```

### 12.2 Criptografia de Dados Sensíveis

```python
# CPF criptografado com Fernet (AES-128)
from cryptography.fernet import Fernet

class EncryptionService:
    def __init__(self, key: bytes):
        self.fernet = Fernet(key)
    
    def encrypt(self, data: str) -> str:
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted: str) -> str:
        return self.fernet.decrypt(encrypted.encode()).decode()
```

### 12.3 Variáveis de Ambiente

```bash
# .env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SECRET_KEY=...          # JWT secret (256 bits)
ENCRYPTION_KEY=...      # Fernet key
TELEGRAM_BOT_TOKEN=...
OPENAI_API_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASSWORD=...
STORAGE_PATH=./storage
APP_URL=http://localhost:3000
```

---

## 13. Infraestrutura e Deploy

### 13.1 Desenvolvimento Local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev  # porta 3000

# Banco de dados
docker-compose up -d postgres
```

### 13.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: diario_inteligente
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - postgres
    volumes:
      - ./storage:/app/storage

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: .env.local

volumes:
  postgres_data:
```

---

## 14. Decisões de Arquitetura (ADRs)

### ADR-001: FastAPI vs Django

**Decisão:** FastAPI  
**Razão:** Suporte nativo a async/await (essencial para I/O de rede e PDFs), auto-documentação Swagger, Pydantic integrado, performance superior para operações concorrentes.

### ADR-002: APScheduler vs Celery

**Decisão:** APScheduler  
**Razão:** Para uso pessoal (V1), APScheduler integrado ao FastAPI é suficiente e muito mais simples de configurar. Celery + Redis seria over-engineering para um único usuário. Migrar para Celery na V2.

### ADR-003: PyMuPDF vs pdfplumber vs Camelot

**Decisão:** PyMuPDF como primário, pdfplumber como secundário  
**Razão:** PyMuPDF é mais rápido e consome menos memória. pdfplumber é melhor para tabelas. Ambos como fallback antes do OCR.

### ADR-004: Supabase vs PostgreSQL puro

**Decisão:** Supabase  
**Razão:** Oferece PostgreSQL + autenticação pronta + storage + realtime em um serviço gerenciado. Acelera o desenvolvimento da V1. Na V2, pode migrar para PostgreSQL puro em VPS.

### ADR-005: Monolito vs Microserviços

**Decisão:** Monolito modular (V1)  
**Razão:** Menor complexidade operacional, desenvolvimento mais rápido, fácil refatoração. A separação por módulos (scrapers, extractor, searcher, notifier) facilita a migração para microserviços na V2.

---

## 15. Diagrama Completo

```
╔══════════════════════════════════════════════════════════════════╗
║                     DIÁRIO INTELIGENTE v1.0                     ║
╠══════════════════════════════════════════════════════════════════╣
║  FRONTEND (Next.js :3000)                                        ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   ║
║  │Dashboard │ │ Histórico│ │Concursos │ │   Configurações  │   ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   ║
║         │REST API          │WebSocket                            ║
╠══════════════════════════════════════════════════════════════════╣
║  BACKEND (FastAPI :8000)                                         ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   ║
║  │Auth API  │ │ Data API │ │Scheduler │ │   WebSocket Hub  │   ║
║  └──────────┘ └──────────┘ └────┬─────┘ └──────────────────┘   ║
║                                 │                                ║
║                           Pipeline:                              ║
║               ┌─────────────────┼──────────────────┐            ║
║         Downloader         Extractor           Searcher          ║
║          (httpx)        (PyMuPDF/OCR)       (Regex/NLP)          ║
║               └─────────────────┼──────────────────┘            ║
║                                 │                                ║
║                           Notifier + AI                          ║
║                       (Telegram + OpenAI)                        ║
╠══════════════════════════════════════════════════════════════════╣
║  DATABASE                      STORAGE                           ║
║  PostgreSQL (Supabase)         /storage/pdfs/                   ║
║  ┌─────────────────────┐       /storage/extracted/               ║
║  │ users, competitions │                                         ║
║  │ keywords, documents │                                         ║
║  │ search_history      │                                         ║
║  │ matches, notifications│                                       ║
║  └─────────────────────┘                                         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

*Documento gerado em: Julho/2026*
