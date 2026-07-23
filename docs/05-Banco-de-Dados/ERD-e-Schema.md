# Banco de Dados — Diário Inteligente
**ERD, Schema SQL e Estratégia de Indexação**

**Versão:** 1.0  
**Data:** Julho/2026  
**SGBD:** PostgreSQL 15+ (via Supabase)

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Diagrama Entidade-Relacionamento](#2-diagrama-entidade-relacionamento)
3. [Schema SQL Completo](#3-schema-sql-completo)
4. [Índices e Performance](#4-índices-e-performance)
5. [Dados Iniciais (Seed)](#5-dados-iniciais-seed)
6. [Queries Principais](#6-queries-principais)
7. [Migrações Alembic](#7-migrações-alembic)
8. [Política de Retenção de Dados](#8-política-de-retenção-de-dados)

---

## 1. Visão Geral

### 1.1 Tabelas

| # | Tabela | Descrição | Linhas esperadas (V1) |
|---|---|---|---|
| 1 | `users` | Dados do usuário | 1 |
| 2 | `competitions` | Concursos cadastrados | 5-20 |
| 3 | `keywords` | Palavras-chave de busca | 10-30 |
| 4 | `name_variations` | Variações do nome para busca | 5-15 |
| 5 | `documents` | PDFs baixados | ~500/ano |
| 6 | `search_history` | Registro de cada pesquisa | ~500/ano |
| 7 | `matches` | Resultados encontrados | variável |
| 8 | `notifications` | Notificações enviadas | variável |
| 9 | `settings` | Configurações do usuário | 1 |
| 10 | `logs` | Log de operações | ~10.000/mês |

### 1.2 Convenções

- **Tipos de IDs:** UUID v4 (gerado pelo PostgreSQL com `gen_random_uuid()`)
- **Timestamps:** `TIMESTAMPTZ` (com fuso horário)
- **Strings:** `VARCHAR` com limite definido ou `TEXT` para campos longos
- **Enums:** PostgreSQL `TYPE ENUM` para campos com valores fixos
- **Nomenclatura:** `snake_case` para tabelas e colunas

---

## 2. Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────────────────────────────────────┐
│                           users                                  │
│  PK id UUID                                                      │
│     email VARCHAR(255) UNIQUE NOT NULL                           │
│     password_hash VARCHAR(255) NOT NULL                          │
│     full_name VARCHAR(200) NOT NULL                              │
│     cpf_encrypted VARCHAR(500)                                   │
│     rg VARCHAR(50)                                               │
│     is_active BOOLEAN DEFAULT true                               │
│     created_at TIMESTAMPTZ DEFAULT NOW()                         │
│     updated_at TIMESTAMPTZ DEFAULT NOW()                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 1:1
                ┌──────────▼────────────┐
                │       settings         │
                │  PK id UUID            │
                │  FK user_id UNIQUE     │
                │  telegram_token TEXT   │
                │  telegram_chat_id TEXT │
                │  notification_email    │
                │  schedule_time TIME    │
                │  schedule_frequency    │
                │  name_variations JSONB │
                │  monitored_journals    │
                │  theme VARCHAR(10)     │
                │  updated_at           │
                └───────────────────────┘

                           │ 1:N
           ┌───────────────┼───────────────────────────────┐
           │               │                               │
┌──────────▼──────┐ ┌──────▼──────────┐ ┌────────────────▼────┐
│  competitions   │ │    keywords     │ │  name_variations    │
│  PK id UUID     │ │  PK id UUID     │ │  PK id UUID         │
│  FK user_id     │ │  FK user_id     │ │  FK user_id         │
│  organ_name     │ │  word           │ │  variation          │
│  position       │ │  priority       │ │  is_active          │
│  year           │ │  category       │ │  is_auto_generated  │
│  status (enum)  │ │  is_active      │ │  created_at         │
│  reg_number     │ │  is_default     │ └─────────────────────┘
│  board          │ │  created_at     │
│  edital_url     │ └─────────────────┘
│  notes          │
│  is_active      │
│  created_at     │
└─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         documents                                │
│  PK id UUID                                                      │
│  FK user_id                                                      │
│     journal_name VARCHAR(20) NOT NULL  (DOBA, DOU_S1, etc.)     │
│     edition_date DATE NOT NULL                                   │
│     file_path TEXT NOT NULL                                      │
│     file_size_bytes BIGINT                                       │
│     total_pages INTEGER                                          │
│     file_hash VARCHAR(64)   (SHA-256)                           │
│     extraction_status VARCHAR(20)  (pending/done/error)         │
│     ocr_applied BOOLEAN DEFAULT false                            │
│     extraction_quality FLOAT   (0.0-1.0)                        │
│     created_at TIMESTAMPTZ DEFAULT NOW()                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 1:N
             ┌─────────────┴──────────────────┐
             │                                │
┌────────────▼────────────┐      ┌────────────▼────────────┐
│     search_history       │      │        matches          │
│  PK id UUID              │      │  PK id UUID             │
│  FK user_id              │      │  FK search_history_id   │
│  FK document_id          │      │  FK document_id         │
│     executed_at          │      │     page_number         │
│     execution_type       │      │     match_text TEXT      │
│     pages_searched INT   │      │     context_before TEXT  │
│     duration_seconds     │      │     context_after TEXT   │
│     matches_found INT    │      │     matched_variation    │
│     status               │      │     keyword_triggered    │
│     error_message        │      │     relevance_score      │
└──────────────────────────┘      │     ai_summary TEXT     │
                                  │     created_at          │
                                  └────────────┬────────────┘
                                               │ 1:N
                                  ┌────────────▼────────────┐
                                  │      notifications      │
                                  │  PK id UUID             │
                                  │  FK user_id             │
                                  │  FK match_id            │
                                  │     channel (enum)      │
                                  │     status (enum)       │
                                  │     sent_at             │
                                  │     error_message       │
                                  │     retry_count INT     │
                                  └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                            logs                                  │
│  PK id UUID                                                      │
│  FK user_id (nullable)                                           │
│     level VARCHAR(10)    (INFO/WARNING/ERROR/CRITICAL)          │
│     module VARCHAR(50)   (downloader/extractor/searcher/...)    │
│     message TEXT NOT NULL                                        │
│     metadata JSONB                                               │
│     created_at TIMESTAMPTZ DEFAULT NOW()                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Schema SQL Completo

### 3.1 Tipos ENUM

```sql
-- Tipos customizados
CREATE TYPE competition_status AS ENUM (
    'waiting_result',
    'classified_waiting',
    'summoned',
    'taking_office',
    'eliminated',
    'closed'
);

CREATE TYPE keyword_priority AS ENUM (
    'high',
    'medium', 
    'low'
);

CREATE TYPE keyword_category AS ENUM (
    'positive',
    'negative',
    'neutral'
);

CREATE TYPE execution_type AS ENUM (
    'auto',
    'manual',
    'retroactive'
);

CREATE TYPE search_status AS ENUM (
    'success',
    'error',
    'partial',
    'running'
);

CREATE TYPE extraction_status AS ENUM (
    'pending',
    'extracting',
    'done',
    'error'
);

CREATE TYPE notification_channel AS ENUM (
    'telegram',
    'email',
    'whatsapp',
    'push'
);

CREATE TYPE notification_status AS ENUM (
    'pending',
    'sent',
    'failed',
    'skipped'
);

CREATE TYPE schedule_frequency AS ENUM (
    'daily',
    'every_6h',
    'every_12h',
    'manual_only'
);

CREATE TYPE log_level AS ENUM (
    'DEBUG',
    'INFO',
    'WARNING',
    'ERROR',
    'CRITICAL'
);

CREATE TYPE theme_option AS ENUM (
    'light',
    'dark',
    'system'
);
```

### 3.2 Tabela: users

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name   VARCHAR(200) NOT NULL,
    cpf_encrypted VARCHAR(500),        -- AES-256 encrypted
    rg          VARCHAR(50),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    is_admin    BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 3.3 Tabela: settings

```sql
CREATE TABLE settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notificações
    telegram_token      TEXT,
    telegram_chat_id    TEXT,
    telegram_enabled    BOOLEAN NOT NULL DEFAULT false,
    notification_email  VARCHAR(255),
    email_enabled       BOOLEAN NOT NULL DEFAULT false,
    
    -- Agendamento
    schedule_time       TIME NOT NULL DEFAULT '06:00:00',
    schedule_frequency  schedule_frequency NOT NULL DEFAULT 'daily',
    search_enabled      BOOLEAN NOT NULL DEFAULT true,
    
    -- Configurações de busca
    name_variations     JSONB NOT NULL DEFAULT '[]',  -- array de strings
    monitored_journals  JSONB NOT NULL DEFAULT '["DOBA","DOU"]',
    
    -- Interface
    theme               theme_option NOT NULL DEFAULT 'system',
    language            VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    
    -- Storage
    pdf_retention_days  INTEGER NOT NULL DEFAULT 90,
    
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exemplo de name_variations:
-- ["Jucivaldo Souza dos Santos", "Jucivaldo Santos", "JUCIVALDO"]

-- Exemplo de monitored_journals:
-- ["DOBA", "DOU_S1", "DOU_S2", "DOU_S3"]
```

### 3.4 Tabela: competitions

```sql
CREATE TABLE competitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    organ_name          VARCHAR(200) NOT NULL,
    position            VARCHAR(200) NOT NULL,
    year                SMALLINT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    status              competition_status NOT NULL DEFAULT 'waiting_result',
    
    registration_number VARCHAR(50),
    examining_board     VARCHAR(100),
    edital_url          TEXT,
    notes               TEXT,
    
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 3.5 Tabela: keywords

```sql
CREATE TABLE keywords (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    word        VARCHAR(100) NOT NULL,
    priority    keyword_priority NOT NULL DEFAULT 'medium',
    category    keyword_category NOT NULL DEFAULT 'neutral',
    
    is_active   BOOLEAN NOT NULL DEFAULT true,
    is_default  BOOLEAN NOT NULL DEFAULT false,  -- pré-configurada pelo sistema
    
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, word)  -- evitar duplicatas por usuário
);
```

### 3.6 Tabela: name_variations

```sql
CREATE TABLE name_variations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    variation           VARCHAR(300) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    is_auto_generated   BOOLEAN NOT NULL DEFAULT false,
    
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, variation)
);
```

### 3.7 Tabela: documents

```sql
CREATE TABLE documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    journal_name        VARCHAR(20) NOT NULL,  -- DOBA, DOU_S1, DOU_S2, DOU_S3
    edition_date        DATE NOT NULL,
    
    file_path           TEXT NOT NULL,          -- caminho local do PDF
    file_size_bytes     BIGINT,
    total_pages         INTEGER,
    file_hash           CHAR(64),              -- SHA-256
    
    extraction_status   extraction_status NOT NULL DEFAULT 'pending',
    ocr_applied         BOOLEAN NOT NULL DEFAULT false,
    extraction_quality  FLOAT CHECK (extraction_quality BETWEEN 0 AND 1),
    
    -- URL de onde foi baixado (para referenciar futuramente)
    source_url          TEXT,
    
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(journal_name, edition_date, file_hash)  -- evitar duplicatas
);
```

### 3.8 Tabela: search_history

```sql
CREATE TABLE search_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    execution_type      execution_type NOT NULL DEFAULT 'auto',
    
    pages_searched      INTEGER NOT NULL DEFAULT 0,
    duration_seconds    FLOAT,
    matches_found       INTEGER NOT NULL DEFAULT 0,
    
    status              search_status NOT NULL DEFAULT 'running',
    error_message       TEXT,
    
    -- Snapshot das configurações usadas nesta pesquisa
    search_config       JSONB  -- variações usadas, palavras-chave ativas, etc.
);
```

### 3.9 Tabela: matches

```sql
CREATE TABLE matches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_history_id   UUID NOT NULL REFERENCES search_history(id) ON DELETE CASCADE,
    document_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    page_number         INTEGER NOT NULL,
    
    -- O trecho exato onde o nome foi encontrado
    match_text          TEXT NOT NULL,
    
    -- Contexto ao redor (300 chars antes e depois)
    context_before      TEXT,
    context_after       TEXT,
    
    -- O que causou o match
    matched_variation   VARCHAR(300),  -- qual variação do nome bateu
    keyword_triggered   VARCHAR(100),  -- qual palavra-chave
    
    relevance_score     FLOAT NOT NULL DEFAULT 0,
    
    -- Resumo gerado pela IA
    ai_summary          TEXT,
    ai_summary_at       TIMESTAMPTZ,
    
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Evitar duplicatas: mesmo documento, mesma página, mesmo trecho
    UNIQUE(document_id, page_number, match_text)
);
```

### 3.10 Tabela: notifications

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    
    channel         notification_channel NOT NULL,
    status          notification_status NOT NULL DEFAULT 'pending',
    
    sent_at         TIMESTAMPTZ,
    error_message   TEXT,
    retry_count     SMALLINT NOT NULL DEFAULT 0,
    next_retry_at   TIMESTAMPTZ,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Uma notificação por canal por match
    UNIQUE(match_id, channel)
);
```

### 3.11 Tabela: logs

```sql
CREATE TABLE logs (
    id          BIGSERIAL PRIMARY KEY,  -- BIGSERIAL para logs (alta frequência)
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    
    level       log_level NOT NULL DEFAULT 'INFO',
    module      VARCHAR(50) NOT NULL,
    message     TEXT NOT NULL,
    metadata    JSONB,
    
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Particionamento por mês para logs (performance)
-- (implementar na V2 se necessário)
```

---

## 4. Índices e Performance

### 4.1 Índices Críticos

```sql
-- documents: buscas por diário e data (mais frequente)
CREATE INDEX idx_documents_journal_date 
    ON documents(journal_name, edition_date DESC);

CREATE INDEX idx_documents_user_date 
    ON documents(user_id, created_at DESC);

-- search_history: histórico recente
CREATE INDEX idx_search_history_user_date 
    ON search_history(user_id, executed_at DESC);

CREATE INDEX idx_search_history_document 
    ON search_history(document_id);

-- matches: resultados por relevância
CREATE INDEX idx_matches_search_relevance 
    ON matches(search_history_id, relevance_score DESC);

CREATE INDEX idx_matches_document 
    ON matches(document_id, page_number);

-- notifications: pendentes de envio
CREATE INDEX idx_notifications_pending 
    ON notifications(status, next_retry_at) 
    WHERE status IN ('pending', 'failed');

-- keywords: ativas por usuário
CREATE INDEX idx_keywords_user_active 
    ON keywords(user_id, is_active) 
    WHERE is_active = true;

-- competitions: ativas por usuário
CREATE INDEX idx_competitions_user_active 
    ON competitions(user_id, is_active)
    WHERE is_active = true;

-- logs: últimos logs por módulo
CREATE INDEX idx_logs_module_date 
    ON logs(module, created_at DESC);

CREATE INDEX idx_logs_level_date
    ON logs(level, created_at DESC)
    WHERE level IN ('ERROR', 'CRITICAL');
```

### 4.2 Índice Full-Text (para busca no histórico)

```sql
-- Permite busca textual nos matches
ALTER TABLE matches 
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('portuguese', 
            COALESCE(match_text, '') || ' ' || 
            COALESCE(ai_summary, '')
        )
    ) STORED;

CREATE INDEX idx_matches_fts ON matches USING GIN(search_vector);

-- Uso:
-- SELECT * FROM matches 
-- WHERE search_vector @@ to_tsquery('portuguese', 'convocação & documentos');
```

---

## 5. Dados Iniciais (Seed)

### 5.1 Keywords Padrão

```sql
-- Inserir palavras-chave padrão (is_default = true)
-- Estas são criadas para o usuário durante o cadastro

INSERT INTO keywords (user_id, word, priority, category, is_default)
VALUES
    ('USER_UUID', 'Convocação',     'high',   'positive', true),
    ('USER_UUID', 'Nomeação',       'high',   'positive', true),
    ('USER_UUID', 'Nomeado',        'high',   'positive', true),
    ('USER_UUID', 'Convocado',      'high',   'positive', true),
    ('USER_UUID', 'Homologação',    'medium', 'positive', true),
    ('USER_UUID', 'Resultado Final','medium', 'positive', true),
    ('USER_UUID', 'Posse',          'high',   'positive', true),
    ('USER_UUID', 'Cadastro Reserva','medium','positive', true),
    ('USER_UUID', 'Classificação',  'medium', 'positive', true),
    ('USER_UUID', 'Eliminação',     'high',   'negative', true),
    ('USER_UUID', 'Eliminado',      'high',   'negative', true),
    ('USER_UUID', 'Recursos',       'low',    'neutral',  true),
    ('USER_UUID', 'Prazo',          'medium', 'neutral',  true),
    ('USER_UUID', 'Aprovado',       'high',   'positive', true),
    ('USER_UUID', 'Habilitado',     'medium', 'positive', true),
    ('USER_UUID', 'Desclassificado','high',   'negative', true),
    ('USER_UUID', 'Impugnação',     'medium', 'negative', true),
    ('USER_UUID', 'Gabarito',       'low',    'neutral',  true);
```

### 5.2 Concursos do Usuário Principal

```sql
INSERT INTO competitions (user_id, organ_name, position, year, status)
VALUES
    ('USER_UUID', 'TJBA - Tribunal de Justiça da Bahia', 'Técnico Judiciário', 2024, 'waiting_result'),
    ('USER_UUID', 'Polícia Civil BA', 'Delegado/Investigador', 2023, 'classified_waiting'),
    ('USER_UUID', 'INSS - Instituto Nacional do Seguro Social', 'Técnico do Seguro Social', 2024, 'waiting_result'),
    ('USER_UUID', 'ECT - Correios', 'Carteiro/Atendente', 2023, 'waiting_result'),
    ('USER_UUID', 'EMBASA', 'Analista/Técnico', 2023, 'waiting_result'),
    ('USER_UUID', 'IBGE', 'Agente Censitário', 2024, 'waiting_result'),
    ('USER_UUID', 'Receita Federal do Brasil', 'Auditor Fiscal', 2024, 'waiting_result');
```

---

## 6. Queries Principais

### 6.1 Dashboard — Estatísticas Gerais

```sql
-- Total de pesquisas e resultados
SELECT
    COUNT(DISTINCT sh.id) AS total_searches,
    COALESCE(SUM(sh.matches_found), 0) AS total_matches,
    MAX(d.edition_date) AS last_journal_date,
    MAX(d.journal_name) AS last_journal_name,
    COUNT(DISTINCT d.id) AS total_pdfs,
    COALESCE(SUM(d.file_size_bytes), 0) AS total_size_bytes
FROM search_history sh
JOIN documents d ON sh.document_id = d.id
WHERE sh.user_id = :user_id;
```

### 6.2 Histórico Recente de Pesquisas

```sql
SELECT
    sh.id,
    sh.executed_at,
    sh.execution_type,
    sh.pages_searched,
    sh.duration_seconds,
    sh.matches_found,
    sh.status,
    d.journal_name,
    d.edition_date
FROM search_history sh
JOIN documents d ON sh.document_id = d.id
WHERE sh.user_id = :user_id
ORDER BY sh.executed_at DESC
LIMIT 20 OFFSET :offset;
```

### 6.3 Matches com Detalhes

```sql
SELECT
    m.id,
    m.page_number,
    m.match_text,
    m.context_before,
    m.context_after,
    m.matched_variation,
    m.keyword_triggered,
    m.relevance_score,
    m.ai_summary,
    m.created_at,
    d.journal_name,
    d.edition_date,
    d.file_path
FROM matches m
JOIN search_history sh ON m.search_history_id = sh.id
JOIN documents d ON m.document_id = d.id
WHERE sh.user_id = :user_id
ORDER BY m.relevance_score DESC, m.created_at DESC
LIMIT 50;
```

### 6.4 Notificações Pendentes

```sql
SELECT
    n.id,
    n.match_id,
    n.channel,
    n.retry_count,
    m.match_text,
    m.ai_summary,
    d.journal_name,
    d.edition_date,
    d.file_path
FROM notifications n
JOIN matches m ON n.match_id = m.id
JOIN search_history sh ON m.search_history_id = sh.id
JOIN documents d ON m.document_id = d.id
WHERE n.status IN ('pending', 'failed')
  AND (n.next_retry_at IS NULL OR n.next_retry_at <= NOW())
  AND n.retry_count < 3
ORDER BY n.created_at;
```

### 6.5 Verificar se Edição Já Foi Processada

```sql
SELECT id, extraction_status
FROM documents
WHERE journal_name = :journal
  AND edition_date = :date
LIMIT 1;
```

### 6.6 Busca Retroativa por Período

```sql
SELECT
    d.id AS document_id,
    d.journal_name,
    d.edition_date,
    d.extraction_status
FROM documents d
WHERE d.user_id = :user_id
  AND d.edition_date BETWEEN :start_date AND :end_date
  AND d.extraction_status = 'done'
  AND NOT EXISTS (
      SELECT 1 FROM search_history sh
      WHERE sh.document_id = d.id
        AND sh.execution_type = 'retroactive'
  )
ORDER BY d.edition_date;
```

### 6.7 Limpeza de Logs Antigos (Cron Mensal)

```sql
DELETE FROM logs
WHERE created_at < NOW() - INTERVAL '30 days'
  AND level IN ('DEBUG', 'INFO');

-- Manter apenas WARNING+ por 90 dias
DELETE FROM logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 7. Migrações Alembic

### 7.1 Estrutura

```
alembic/
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_add_name_variations.py
│   ├── 003_add_fts_index.py
│   └── 004_add_log_partitioning.py
├── env.py
└── alembic.ini
```

### 7.2 Migration Inicial

```python
# alembic/versions/001_initial_schema.py
"""Initial schema

Revision ID: 001
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMPTZ

def upgrade():
    # Criar tipos ENUM
    op.execute("""
        CREATE TYPE competition_status AS ENUM (
            'waiting_result', 'classified_waiting', 'summoned',
            'taking_office', 'eliminated', 'closed'
        )
    """)
    # ... outros enums ...
    
    # Criar tabela users
    op.create_table('users',
        sa.Column('id', UUID(), server_default=sa.text('gen_random_uuid()'), 
                  primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('cpf_encrypted', sa.String(500)),
        sa.Column('rg', sa.String(50)),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', TIMESTAMPTZ(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', TIMESTAMPTZ(), server_default=sa.text('NOW()'))
    )
    # ... demais tabelas ...

def downgrade():
    op.drop_table('users')
    # ...
```

---

## 8. Política de Retenção de Dados

| Dado | Retenção | Ação |
|---|---|---|
| PDFs dos diários | 90 dias (configurável) | Deletar arquivo + manter metadados |
| Texto extraído | 90 dias | Deletar arquivo de cache |
| search_history | Indefinido | Manter sempre |
| matches | Indefinido | Manter sempre (dados preciosos) |
| notifications | 1 ano | Arquivar ou deletar |
| logs (DEBUG/INFO) | 30 dias | Deletar automaticamente |
| logs (WARNING+) | 90 dias | Deletar automaticamente |
| logs (CRITICAL) | 1 ano | Deletar ou arquivar |

### 8.1 Job de Limpeza Automática

```sql
-- Executar mensalmente
-- 1. Limpar PDFs antigos
DELETE FROM documents
WHERE created_at < NOW() - INTERVAL '90 days'
  AND user_id IN (
      SELECT user_id FROM settings 
      WHERE pdf_retention_days = 90
  );

-- 2. Limpar logs
DELETE FROM logs
WHERE created_at < NOW() - INTERVAL '30 days'
  AND level IN ('DEBUG', 'INFO');
```

---

*Documento gerado em: Julho/2026*
