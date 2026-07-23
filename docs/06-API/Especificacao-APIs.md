# Especificação de APIs — Diário Inteligente
**Documentação Completa dos Endpoints REST**

**Versão:** 1.0  
**Data:** Julho/2026  
**Base URL:** `http://localhost:8000/api/v1`  
**Autenticação:** Bearer JWT

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Autenticação](#2-autenticação)
3. [Usuário e Perfil](#3-usuário-e-perfil)
4. [Concursos](#4-concursos)
5. [Palavras-chave](#5-palavras-chave)
6. [Variações de Nome](#6-variações-de-nome)
7. [Documentos (PDFs)](#7-documentos-pdfs)
8. [Pesquisa](#8-pesquisa)
9. [Matches (Resultados)](#9-matches-resultados)
10. [Notificações](#10-notificações)
11. [Configurações](#11-configurações)
12. [Dashboard](#12-dashboard)
13. [WebSocket Events](#13-websocket-events)
14. [Códigos de Erro](#14-códigos-de-erro)

---

## 1. Visão Geral

### 1.1 Formato de Resposta

Todas as respostas seguem o padrão:

```json
// Sucesso
{
    "success": true,
    "data": { ... },
    "meta": {
        "total": 100,
        "page": 1,
        "per_page": 20
    }
}

// Erro
{
    "success": false,
    "error": {
        "code": "NOT_FOUND",
        "message": "Recurso não encontrado.",
        "details": { ... }
    }
}
```

### 1.2 Autenticação

Todas as rotas (exceto `/auth/*`) requerem:
```
Authorization: Bearer <access_token>
```

### 1.3 Paginação

Parâmetros de query para listas:
- `page` (int, default: 1)
- `per_page` (int, default: 20, max: 100)
- `sort_by` (string)
- `sort_order` (asc/desc)

---

## 2. Autenticação

### POST /auth/register
Cria uma nova conta de usuário.

**Request Body:**
```json
{
    "email": "jucivaldo@email.com",
    "password": "minhasenha123",
    "full_name": "Jucivaldo Souza dos Santos"
}
```

**Response 201:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "uuid-do-usuario",
            "email": "jucivaldo@email.com",
            "full_name": "Jucivaldo Souza dos Santos",
            "created_at": "2026-07-22T06:00:00Z"
        },
        "access_token": "eyJ...",
        "refresh_token": "eyJ...",
        "token_type": "bearer",
        "expires_in": 86400
    }
}
```

**Erros:**
- `422` — Dados inválidos (email já existe, senha fraca)

---

### POST /auth/login
Autenticar usuário existente.

**Request Body:**
```json
{
    "email": "jucivaldo@email.com",
    "password": "minhasenha123"
}
```

**Response 200:**
```json
{
    "success": true,
    "data": {
        "access_token": "eyJ...",
        "refresh_token": "eyJ...",
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": "uuid",
            "email": "jucivaldo@email.com",
            "full_name": "Jucivaldo Souza dos Santos"
        }
    }
}
```

**Erros:**
- `401` — Credenciais inválidas

---

### POST /auth/refresh
Renovar access token usando refresh token.

**Request Body:**
```json
{
    "refresh_token": "eyJ..."
}
```

**Response 200:**
```json
{
    "success": true,
    "data": {
        "access_token": "eyJ...",
        "expires_in": 86400
    }
}
```

---

### POST /auth/logout
Invalidar token do usuário.

**Response 204:** (sem corpo)

---

## 3. Usuário e Perfil

### GET /users/me
Retorna dados do usuário autenticado.

**Response 200:**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "jucivaldo@email.com",
        "full_name": "Jucivaldo Souza dos Santos",
        "has_cpf": true,
        "has_rg": false,
        "is_active": true,
        "created_at": "2026-01-15T10:00:00Z",
        "last_login_at": "2026-07-22T08:00:00Z"
    }
}
```

---

### PATCH /users/me
Atualizar dados do perfil.

**Request Body:**
```json
{
    "full_name": "Jucivaldo Souza dos Santos",
    "cpf": "000.000.000-00",
    "rg": "00000000-0"
}
```

**Response 200:**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "full_name": "Jucivaldo Souza dos Santos",
        "has_cpf": true,
        "updated_at": "2026-07-22T10:00:00Z"
    }
}
```

---

### PUT /users/me/password
Alterar senha.

**Request Body:**
```json
{
    "current_password": "senhaatual123",
    "new_password": "novasenha456",
    "confirm_password": "novasenha456"
}
```

**Response 200:** `{"success": true}`

---

## 4. Concursos

### GET /competitions
Lista todos os concursos do usuário.

**Query Params:**
- `status` (string) — filtrar por status
- `is_active` (bool) — apenas ativos
- `year` (int) — filtrar por ano

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "organ_name": "TJBA",
            "position": "Técnico Judiciário",
            "year": 2024,
            "status": "classified_waiting",
            "status_label": "Classificado — aguardando convocação",
            "registration_number": "2024001234",
            "examining_board": "CEBRASPE",
            "edital_url": "https://...",
            "notes": null,
            "is_active": true,
            "created_at": "2026-01-15T10:00:00Z"
        }
    ],
    "meta": {
        "total": 7,
        "active": 6
    }
}
```

---

### POST /competitions
Criar novo concurso.

**Request Body:**
```json
{
    "organ_name": "Receita Federal",
    "position": "Auditor Fiscal",
    "year": 2024,
    "status": "waiting_result",
    "registration_number": "2024RF0001",
    "examining_board": "CEBRASPE",
    "edital_url": "https://www.cebraspe.org.br/...",
    "notes": "Prova aplicada em março/2024"
}
```

**Response 201:** objeto do concurso criado

---

### GET /competitions/{id}
Detalhes de um concurso.

**Response 200:** objeto do concurso

---

### PATCH /competitions/{id}
Atualizar concurso.

**Request Body:** (campos opcionais)
```json
{
    "status": "summoned",
    "notes": "Convocado em julho/2026"
}
```

**Response 200:** objeto atualizado

---

### DELETE /competitions/{id}
Excluir concurso.

**Response 204**

---

### PATCH /competitions/{id}/toggle
Ativar/desativar concurso.

**Response 200:**
```json
{
    "success": true,
    "data": { "is_active": false }
}
```

---

## 5. Palavras-chave

### GET /keywords
Lista palavras-chave do usuário.

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "word": "Convocação",
            "priority": "high",
            "category": "positive",
            "is_active": true,
            "is_default": true
        },
        {
            "id": "uuid",
            "word": "Eliminação",
            "priority": "high",
            "category": "negative",
            "is_active": true,
            "is_default": true
        }
    ]
}
```

---

### POST /keywords
Adicionar palavra-chave.

**Request Body:**
```json
{
    "word": "Reconvocação",
    "priority": "high",
    "category": "positive"
}
```

**Response 201:** objeto criado

---

### PATCH /keywords/{id}
Atualizar palavra-chave.

---

### DELETE /keywords/{id}
Excluir palavra-chave (não pode excluir padrões).

**Erros:**
- `403` — Não pode excluir palavra padrão

---

### PATCH /keywords/{id}/toggle
Ativar/desativar.

---

## 6. Variações de Nome

### GET /name-variations
Lista variações do nome configuradas.

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "variation": "Jucivaldo Souza dos Santos",
            "is_active": true,
            "is_auto_generated": false
        },
        {
            "id": "uuid",
            "variation": "JUCIVALDO SOUZA DOS SANTOS",
            "is_active": true,
            "is_auto_generated": true
        }
    ]
}
```

---

### POST /name-variations/generate
Gerar variações automáticas baseadas no nome completo.

**Request Body:**
```json
{
    "full_name": "Jucivaldo Souza dos Santos"
}
```

**Response 200:**
```json
{
    "success": true,
    "data": {
        "generated": [
            "Jucivaldo Souza dos Santos",
            "Jucivaldo Santos",
            "Jucivaldo",
            "JUCIVALDO SOUZA DOS SANTOS",
            "J. Souza dos Santos"
        ],
        "saved": 5
    }
}
```

---

### POST /name-variations
Adicionar variação manual.

---

### DELETE /name-variations/{id}
Excluir variação.

---

## 7. Documentos (PDFs)

### GET /documents
Lista PDFs baixados.

**Query Params:**
- `journal` (string) — DOBA, DOU_S1, etc.
- `from_date` (date)
- `to_date` (date)
- `extraction_status` (string)

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "journal_name": "DOBA",
            "edition_date": "2026-07-22",
            "file_size_bytes": 2458624,
            "total_pages": 167,
            "extraction_status": "done",
            "ocr_applied": false,
            "extraction_quality": 0.97,
            "created_at": "2026-07-22T06:05:00Z"
        }
    ],
    "meta": {
        "total": 142,
        "total_size_bytes": 345000000
    }
}
```

---

### GET /documents/{id}/download
Faz o download do PDF.

**Response 200:** `Content-Type: application/pdf`

---

### GET /documents/{id}/page/{page_number}
Retorna texto de uma página específica.

**Response 200:**
```json
{
    "success": true,
    "data": {
        "page_number": 52,
        "text": "...",
        "ocr_applied": false,
        "quality_score": 0.98
    }
}
```

---

### POST /documents/download-now
Forçar download de um diário específico agora.

**Request Body:**
```json
{
    "journal": "DOBA",
    "date": "2026-07-22"
}
```

**Response 202:**
```json
{
    "success": true,
    "data": {
        "job_id": "job-uuid",
        "message": "Download iniciado. Acompanhe pelo WebSocket."
    }
}
```

---

## 8. Pesquisa

### POST /search/run
Iniciar uma pesquisa manual.

**Request Body:**
```json
{
    "journals": ["DOBA", "DOU_S1"],
    "date_from": "2026-07-22",
    "date_to": "2026-07-22",
    "execution_type": "manual"
}
```

**Response 202:**
```json
{
    "success": true,
    "data": {
        "job_id": "job-uuid",
        "estimated_documents": 2,
        "message": "Pesquisa iniciada. Acompanhe pelo WebSocket."
    }
}
```

---

### POST /search/retroactive
Iniciar pesquisa retroativa.

**Request Body:**
```json
{
    "journals": ["DOBA", "DOU_S1", "DOU_S2"],
    "date_from": "2026-01-01",
    "date_to": "2026-07-22"
}
```

**Response 202:** job_id + estimativa de tempo

---

### GET /search/history
Lista histórico de pesquisas.

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "executed_at": "2026-07-22T06:08:43Z",
            "execution_type": "auto",
            "pages_searched": 167,
            "duration_seconds": 163.4,
            "matches_found": 1,
            "status": "success",
            "document": {
                "journal_name": "DOBA",
                "edition_date": "2026-07-22"
            }
        }
    ]
}
```

---

### GET /search/jobs/{job_id}
Status de um job de pesquisa.

**Response 200:**
```json
{
    "success": true,
    "data": {
        "job_id": "uuid",
        "status": "running",
        "progress": {
            "current_document": 1,
            "total_documents": 2,
            "current_page": 87,
            "total_pages": 167,
            "percentage": 52
        },
        "started_at": "2026-07-22T10:30:00Z"
    }
}
```

---

## 9. Matches (Resultados)

### GET /matches
Lista todos os resultados encontrados.

**Query Params:**
- `from_date` (date)
- `to_date` (date)
- `journal` (string)
- `keyword` (string)
- `min_relevance` (float)

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "page_number": 52,
            "match_text": "...JUCIVALDO SOUZA DOS SANTOS...",
            "context_before": "...texto anterior...",
            "context_after": "...texto posterior...",
            "matched_variation": "JUCIVALDO SOUZA DOS SANTOS",
            "keyword_triggered": "Convocação",
            "relevance_score": 130.0,
            "ai_summary": "Você foi convocado...",
            "created_at": "2026-07-22T06:10:00Z",
            "document": {
                "journal_name": "DOBA",
                "edition_date": "2026-07-22",
                "total_pages": 167
            }
        }
    ]
}
```

---

### GET /matches/{id}
Detalhes de um resultado.

**Response 200:** objeto completo do match

---

### POST /matches/{id}/generate-summary
Gerar (ou re-gerar) resumo IA para um match.

**Response 200:**
```json
{
    "success": true,
    "data": {
        "ai_summary": "Você foi CONVOCADO...",
        "generated_at": "2026-07-22T11:00:00Z"
    }
}
```

---

## 10. Notificações

### GET /notifications
Lista histórico de notificações enviadas.

**Response 200:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "channel": "telegram",
            "status": "sent",
            "sent_at": "2026-07-22T06:11:00Z",
            "match": {
                "id": "uuid",
                "keyword_triggered": "Convocação",
                "document": {
                    "journal_name": "DOBA",
                    "edition_date": "2026-07-22"
                }
            }
        }
    ]
}
```

---

### POST /notifications/test
Enviar notificação de teste para um canal.

**Request Body:**
```json
{
    "channel": "telegram"
}
```

**Response 200:**
```json
{
    "success": true,
    "data": {
        "sent": true,
        "message": "Mensagem de teste enviada com sucesso!"
    }
}
```

**Erros:**
- `400` — Canal não configurado
- `502` — Falha ao enviar (Telegram offline, etc.)

---

### POST /notifications/retry/{id}
Retentar envio de notificação falha.

**Response 200:** status atualizado

---

## 11. Configurações

### GET /settings
Retorna configurações do usuário.

**Response 200:**
```json
{
    "success": true,
    "data": {
        "telegram_enabled": true,
        "telegram_configured": true,
        "email_enabled": false,
        "notification_email": null,
        "schedule_time": "06:00:00",
        "schedule_frequency": "daily",
        "search_enabled": true,
        "monitored_journals": ["DOBA", "DOU_S1", "DOU_S2"],
        "theme": "dark",
        "language": "pt-BR",
        "pdf_retention_days": 90
    }
}
```

---

### PATCH /settings
Atualizar configurações.

**Request Body:** (todos os campos opcionais)
```json
{
    "telegram_token": "bot123:ABC",
    "telegram_chat_id": "123456789",
    "telegram_enabled": true,
    "schedule_time": "06:00",
    "schedule_frequency": "daily",
    "monitored_journals": ["DOBA", "DOU_S1"],
    "theme": "dark"
}
```

**Response 200:** configurações atualizadas

---

### PATCH /settings/schedule
Atualizar apenas configurações de agendamento.

**Request Body:**
```json
{
    "schedule_time": "07:00",
    "schedule_frequency": "every_6h",
    "search_enabled": true
}
```

**Response 200:** confirmação + próxima execução prevista

---

## 12. Dashboard

### GET /dashboard/stats
Estatísticas para o dashboard.

**Response 200:**
```json
{
    "success": true,
    "data": {
        "total_searches": 127,
        "total_matches": 3,
        "total_pdfs": 142,
        "total_size_bytes": 345000000,
        "last_search": {
            "at": "2026-07-22T06:08:00Z",
            "journal": "DOU",
            "matches": 0
        },
        "next_scheduled_search": "2026-07-23T06:00:00Z",
        "system_status": {
            "scheduler": "running",
            "last_job_status": "success",
            "doba_status": "ok",
            "dou_status": "ok"
        },
        "recent_matches": [
            {
                "id": "uuid",
                "keyword_triggered": "Convocação",
                "journal": "DOBA",
                "edition_date": "2026-07-22",
                "created_at": "2026-07-22T06:10:00Z"
            }
        ]
    }
}
```

---

### GET /dashboard/timeline
Dados para gráfico de linha do tempo.

**Query Params:**
- `days` (int, default: 30)

**Response 200:**
```json
{
    "success": true,
    "data": {
        "labels": ["2026-06-22", "2026-06-23", ...],
        "searches": [2, 2, 2, 0, 0, 2, ...],
        "matches": [0, 0, 1, 0, 0, 0, ...]
    }
}
```

---

## 13. WebSocket Events

### Endpoint: `ws://localhost:8000/ws/{user_id}`

### Eventos emitidos pelo servidor:

```json
// Início de download
{
    "event": "download_started",
    "data": {
        "journal": "DOBA",
        "date": "2026-07-22"
    }
}

// Progresso de download
{
    "event": "download_progress",
    "data": {
        "journal": "DOBA",
        "bytes_downloaded": 1024000,
        "total_bytes": 2048000,
        "percentage": 50
    }
}

// Download completo
{
    "event": "download_complete",
    "data": {
        "journal": "DOBA",
        "document_id": "uuid",
        "pages": 167,
        "size_bytes": 2458624
    }
}

// Progresso de extração
{
    "event": "extraction_progress",
    "data": {
        "journal": "DOBA",
        "current_page": 87,
        "total_pages": 167,
        "percentage": 52
    }
}

// Progresso de pesquisa
{
    "event": "search_progress",
    "data": {
        "journal": "DOBA",
        "current_page": 45,
        "total_pages": 167,
        "matches_so_far": 0,
        "percentage": 27
    }
}

// Resultado encontrado (em tempo real)
{
    "event": "match_found",
    "data": {
        "match_id": "uuid",
        "page_number": 52,
        "keyword_triggered": "Convocação",
        "preview": "...JUCIVALDO SOUZA DOS SANTOS..."
    }
}

// Job completo
{
    "event": "job_complete",
    "data": {
        "job_id": "uuid",
        "total_matches": 1,
        "duration_seconds": 163.4,
        "journals_searched": ["DOBA", "DOU"]
    }
}

// Erro
{
    "event": "job_error",
    "data": {
        "journal": "DOU",
        "error": "Timeout ao baixar PDF"
    }
}
```

---

## 14. Códigos de Erro

### HTTP Status Codes

| Status | Código | Descrição |
|---|---|---|
| 400 | BAD_REQUEST | Dados inválidos |
| 401 | UNAUTHORIZED | Não autenticado |
| 403 | FORBIDDEN | Sem permissão |
| 404 | NOT_FOUND | Recurso não encontrado |
| 409 | CONFLICT | Conflito (ex: e-mail já cadastrado) |
| 422 | VALIDATION_ERROR | Falha na validação dos dados |
| 429 | RATE_LIMITED | Muitas requisições |
| 500 | INTERNAL_ERROR | Erro interno do servidor |
| 502 | EXTERNAL_ERROR | Falha em serviço externo (Telegram, etc.) |
| 503 | SERVICE_UNAVAILABLE | Serviço temporariamente indisponível |

### Exemplos de Erros

```json
// 401 Não autenticado
{
    "success": false,
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Token inválido ou expirado. Faça login novamente."
    }
}

// 422 Validação
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dados inválidos.",
        "details": {
            "email": ["Este campo deve ser um e-mail válido."],
            "password": ["A senha deve ter pelo menos 8 caracteres."]
        }
    }
}

// 409 Conflito
{
    "success": false,
    "error": {
        "code": "EMAIL_ALREADY_EXISTS",
        "message": "Este e-mail já está cadastrado."
    }
}

// 502 Serviço externo
{
    "success": false,
    "error": {
        "code": "TELEGRAM_SEND_FAILED",
        "message": "Não foi possível enviar a mensagem pelo Telegram. Verifique o token e o chat ID."
    }
}
```

---

## Apêndice — Enums

### Competition Status
| Valor | Label PT-BR |
|---|---|
| `waiting_result` | Aguardando resultado |
| `classified_waiting` | Classificado — aguardando convocação |
| `summoned` | Convocado |
| `taking_office` | Em posse |
| `eliminated` | Eliminado |
| `closed` | Encerrado |

### Keyword Priority
| Valor | Label |
|---|---|
| `high` | Alta |
| `medium` | Média |
| `low` | Baixa |

### Schedule Frequency
| Valor | Label |
|---|---|
| `daily` | Uma vez por dia |
| `every_6h` | A cada 6 horas |
| `every_12h` | A cada 12 horas |
| `manual_only` | Apenas manual |

### Monitored Journals
| Valor | Nome Completo |
|---|---|
| `DOBA` | Diário Oficial do Estado da Bahia |
| `DOU_S1` | Diário Oficial da União — Seção 1 |
| `DOU_S2` | Diário Oficial da União — Seção 2 |
| `DOU_S3` | Diário Oficial da União — Seção 3 |

---

*Documento gerado em: Julho/2026*
