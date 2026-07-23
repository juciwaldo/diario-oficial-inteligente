# Fluxos de Navegação — Diário Inteligente
**Mapeamento Completo de Telas e Transições**

**Versão:** 1.0  
**Data:** Julho/2026

---

## Sumário

1. [Mapa do Site](#1-mapa-do-site)
2. [Fluxo de Autenticação](#2-fluxo-de-autenticação)
3. [Fluxo de Onboarding](#3-fluxo-de-onboarding)
4. [Fluxo Principal — Dashboard](#4-fluxo-principal--dashboard)
5. [Fluxo de Pesquisa Manual](#5-fluxo-de-pesquisa-manual)
6. [Fluxo de Concursos](#6-fluxo-de-concursos)
7. [Fluxo de Histórico e Resultados](#7-fluxo-de-histórico-e-resultados)
8. [Fluxo de Configurações](#8-fluxo-de-configurações)
9. [Fluxo de Notificação (Recebimento)](#9-fluxo-de-notificação-recebimento)
10. [Estados de Erro](#10-estados-de-erro)

---

## 1. Mapa do Site

```
/
├── (Público)
│   ├── /login                  ← Tela de login
│   └── /register               ← Criar conta
│
└── (Autenticado)
    ├── /                       ← Dashboard (home)
    │
    ├── /search                 ← Pesquisa
    │   ├── /search/manual      ← Pesquisa manual agora
    │   └── /search/retroactive ← Pesquisa retroativa
    │
    ├── /history                ← Histórico de pesquisas
    │   └── /history/[id]       ← Detalhes de um resultado
    │
    ├── /competitions           ← Lista de concursos
    │   ├── /competitions/new   ← Adicionar concurso
    │   └── /competitions/[id]  ← Editar concurso
    │
    ├── /keywords               ← Palavras-chave
    │
    └── /settings               ← Configurações
        ├── /settings/profile   ← Perfil e dados pessoais
        ├── /settings/notifications ← Telegram e e-mail
        ├── /settings/schedule  ← Horário de pesquisa
        └── /settings/journals  ← Diários monitorados
```

---

## 2. Fluxo de Autenticação

### 2.1 Login

```
[Usuário não autenticado acessa qualquer rota]
            ↓
    Redirect → /login
            ↓
┌─────────────────────────────┐
│         TELA DE LOGIN        │
│                             │
│  Email: [____________]      │
│  Senha: [____________]      │
│                             │
│  [Entrar]                   │
│                             │
│  Não tem conta? [Cadastrar] │
│  Esqueceu a senha? [Reset]  │
└─────────────────────────────┘
            ↓
    ┌───────────────────┐
    │ Credenciais OK?   │
    ├───────────────────┤
    │ Sim → Dashboard   │
    │ Não → Erro inline │
    └───────────────────┘
```

### 2.2 Cadastro

```
┌─────────────────────────────┐
│        CRIAR CONTA           │
│                             │
│  Nome completo: [________]  │
│  Email: [________________]  │
│  Senha: [________________]  │
│  Confirmar: [____________]  │
│                             │
│  [Criar conta]              │
│                             │
│  Já tem conta? [Entrar]     │
└─────────────────────────────┘
            ↓
    Redireciona para:
    → Onboarding (primeiro acesso)
```

---

## 3. Fluxo de Onboarding

```
┌──────────────────────────────────────────────────────┐
│  ASSISTENTE DE CONFIGURAÇÃO INICIAL (5 passos)        │
│  ●──○──○──○──○                                        │
└──────────────────────────────────────────────────────┘

PASSO 1: Confirmar nome
┌─────────────────────────────┐
│  Qual é o seu nome completo?│
│                             │
│  [Jucivaldo Souza dos Santos│
│                             │
│  ℹ️ O sistema pesquisará    │
│  variações deste nome.      │
│                             │
│  [Próximo →]                │
└─────────────────────────────┘
            ↓
PASSO 2: Revisar variações geradas automaticamente
┌─────────────────────────────┐
│  Variações do seu nome:     │
│                             │
│  ✓ Jucivaldo Souza dos Sant.│
│  ✓ Jucivaldo Santos         │
│  ✓ Jucivaldo                │
│  ✓ JUCIVALDO SOUZA DOS SANT.│
│                             │
│  + Adicionar variação       │
│                             │
│  [← Voltar] [Próximo →]     │
└─────────────────────────────┘
            ↓
PASSO 3: Adicionar concursos (opcional)
┌─────────────────────────────┐
│  Adicione seus concursos:   │
│                             │
│  ✓ TJBA (já cadastrado)     │
│  ✓ Polícia Civil BA         │
│  ✓ INSS                     │
│  + Adicionar concurso       │
│                             │
│  [← Voltar] [Próximo →]     │
└─────────────────────────────┘
            ↓
PASSO 4: Configurar Telegram (opcional)
┌─────────────────────────────┐
│  Configure alertas Telegram:│
│                             │
│  Token do bot:              │
│  [____________________]     │
│                             │
│  Seu chat ID:               │
│  [____________________]     │
│                             │
│  [Testar] [Pular por agora] │
│                             │
│  [← Voltar] [Próximo →]     │
└─────────────────────────────┘
            ↓
PASSO 5: Definir horário
┌─────────────────────────────┐
│  Horário de pesquisa diária:│
│                             │
│  ○ 05:00  ● 06:00  ○ 07:00  │
│  ○ Personalizado: [__:__]   │
│                             │
│  Frequência:                │
│  ● Uma vez por dia          │
│  ○ A cada 6 horas           │
│  ○ A cada 12 horas          │
│                             │
│  [← Voltar] [Finalizar ✓]  │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│  🎉 Tudo configurado!       │
│                             │
│  Próxima pesquisa: hoje,    │
│  às 06:00.                  │
│                             │
│  Deseja fazer uma pesquisa  │
│  agora nos últimos 30 dias? │
│                             │
│  [Pesquisar agora]          │
│  [Ir para o dashboard]      │
└─────────────────────────────┘
```

---

## 4. Fluxo Principal — Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  DASHBOARD                                    [Pesquisar] │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Total    │ │Resultados│ │ Último   │ │ Próxima  │   │
│  │Pesquisas │ │Encontrad.│ │ Diário   │ │ Busca    │   │
│  │   127    │ │    3     │ │ DOBA     │ │ 06:00    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  LINHA DO TEMPO (últimos 30 dias)                   │ │
│  │  ▁▂▁▁▁▂▃▁▁▁▁▂▁▁▁▁▁▁▁▂▁▁▁█▁▁▁▁▂▁                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ÚLTIMOS RESULTADOS                         [Ver todos →] │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🚨 22/07 DOBA p.52 — Convocação   [Ver] [PDF]       │ │
│  │ ℹ️ 15/06 DOU  p.31 — Nomeação    [Ver] [PDF]       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  STATUS DO SISTEMA                                        │
│  ✅ DOBA — 22/07 — OK                                    │
│  ✅ DOU   — 22/07 — OK                                   │
└──────────────────────────────────────────────────────────┘
```

### 4.1 Ações no Dashboard

```
Dashboard
    ├── [Pesquisar Agora] → Fluxo Pesquisa Manual
    ├── [Ver todos →] (histórico) → /history
    ├── Click em resultado → /history/[id]
    └── Sidebar:
        ├── Dashboard (/)
        ├── Pesquisa (/search)
        ├── Histórico (/history)
        ├── Concursos (/competitions)
        ├── Palavras-chave (/keywords)
        └── Configurações (/settings)
```

---

## 5. Fluxo de Pesquisa Manual

### 5.1 Iniciar Pesquisa

```
Usuário clica em [Pesquisar Agora]
        ↓
┌─────────────────────────────────┐
│  PESQUISA MANUAL                │
│                                 │
│  Pesquisar em:                  │
│  ☑ DOBA — Diário Oficial BA    │
│  ☑ DOU  — Diário Oficial União │
│                                 │
│  Período:                       │
│  ● Hoje                         │
│  ○ Últimos 7 dias               │
│  ○ Últimos 30 dias              │
│  ○ Personalizado                │
│                                 │
│  [Cancelar] [Pesquisar →]       │
└─────────────────────────────────┘
        ↓
Confirmação → Pesquisa inicia
        ↓
┌─────────────────────────────────┐
│  PESQUISA EM ANDAMENTO          │
│                                 │
│  ████████░░░░░░░░ 52%           │
│                                 │
│  ✅ DOBA — Download completo    │
│  ✅ DOBA — Extração completa    │
│  🔄 DOBA — Pesquisando...       │
│  ⏳ DOU  — Aguardando          │
│                                 │
│  Páginas analisadas: 87/167     │
│  Tempo: 1m 23s                  │
│                                 │
│  [Cancelar pesquisa]            │
└─────────────────────────────────┘
        ↓
[Conclusão — Sem resultado]        [Conclusão — Com resultado]
┌─────────────────────────┐        ┌──────────────────────────┐
│ ✅ Pesquisa concluída   │        │ 🚨 Resultado encontrado! │
│                         │        │                          │
│ 167 páginas analisadas  │        │ 1 resultado no DOBA      │
│ 0 resultados            │        │ Página 52                │
│                         │        │                          │
│ [OK]                    │        │ [Ver detalhes]           │
└─────────────────────────┘        └──────────────────────────┘
```

### 5.2 Pesquisa Retroativa

```
/search/retroactive
┌─────────────────────────────────┐
│  PESQUISA RETROATIVA            │
│                                 │
│  Pesquisar em:                  │
│  ☑ DOBA  ☑ DOU                 │
│                                 │
│  Período:                       │
│  De: [01/01/2026 ▼]            │
│  Até: [22/07/2026 ▼]           │
│                                 │
│  Diários disponíveis: 142       │
│  Estimativa: ~45 minutos        │
│                                 │
│  [Iniciar Pesquisa Retroativa]  │
└─────────────────────────────────┘
        ↓
Progresso em tempo real (WebSocket)
        ↓
Resultados agrupados por data
```

---

## 6. Fluxo de Concursos

### 6.1 Lista de Concursos

```
/competitions
┌─────────────────────────────────────────┐
│  CONCURSOS              [+ Adicionar]    │
│  Filtrar: [Todos ▼]                     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ TJBA                    [Editar]  │  │
│  │ Técnico Judiciário · 2024         │  │
│  │ 🟡 Aguardando resultado           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Polícia Civil BA        [Editar]  │  │
│  │ Investigador · 2023               │  │
│  │ 🟢 Classificado — aguard. conv.   │  │
│  └───────────────────────────────────┘  │
│  ...                                    │
└─────────────────────────────────────────┘
```

### 6.2 Adicionar Concurso

```
/competitions/new
┌─────────────────────────────────┐
│  NOVO CONCURSO                  │
│                                 │
│  Órgão: [_____________________] │
│  Cargo: [_____________________] │
│  Ano:   [2024 ▼]               │
│  Status:[Aguardando result. ▼]  │
│                                 │
│  N° Inscrição: [_____________]  │
│  Banca: [____________________]  │
│  Link do Edital: [___________]  │
│                                 │
│  Observações:                   │
│  [_____________________________]│
│                                 │
│  [Cancelar] [Salvar ✓]         │
└─────────────────────────────────┘
        ↓
Redirect → /competitions
Mensagem de sucesso: "Concurso adicionado!"
```

---

## 7. Fluxo de Histórico e Resultados

### 7.1 Lista de Histórico

```
/history
┌─────────────────────────────────────────────┐
│  HISTÓRICO DE PESQUISAS                      │
│                                              │
│  Filtrar: [Todos ▼] [Diário ▼] [Período ▼]  │
│  Mostrar só: ☐ Com resultado                 │
│                                              │
│  22/07/2026 ─────────────────               │
│  ┌─────────────────────────────────────┐    │
│  │ 🚨 06:12 DOBA  p.52  Convocação    │    │
│  │    Jucivaldo... foi convocado para  │    │
│  │    [Ver detalhes] [Abrir PDF]       │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ ✅ 06:08 DOU   0 resultados         │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  21/07/2026 ─────────────────               │
│  ┌─────────────────────────────────────┐    │
│  │ ✅ 06:05 DOBA  0 resultados         │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  [Carregar mais]                             │
└─────────────────────────────────────────────┘
```

### 7.2 Detalhes do Resultado

```
/history/[id]
┌─────────────────────────────────────────────┐
│  ← Voltar                                    │
│                                              │
│  🚨 RESULTADO ENCONTRADO                     │
│                                              │
│  📰 Diário: Diário Oficial da Bahia (DOBA)  │
│  📅 Edição: 22 de julho de 2026             │
│  📄 Página: 52                               │
│  🔍 Ativado por: "Convocação"               │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  TRECHO ENCONTRADO                  │    │
│  │                                     │    │
│  │  "...Secretaria de Administração,   │    │
│  │  ficam CONVOCADOS os candidatos     │    │
│  │  abaixo relacionados, aprovados no  │    │
│  │  [JUCIVALDO SOUZA DOS SANTOS]       │    │
│  │  CPF: 000.000.000-00..."            │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  📋 RESUMO DA IA                    │    │
│  │                                     │    │
│  │  ✅ Você foi CONVOCADO!             │    │
│  │                                     │    │
│  │  Prazo: 30 dias (até 21/08/2026)   │    │
│  │                                     │    │
│  │  Documentos necessários:            │    │
│  │  • RG (original + cópia)            │    │
│  │  • CPF (original + cópia)           │    │
│  │  • Comp. de residência              │    │
│  │                                     │    │
│  │  Local: Secretaria de Administ.     │    │
│  │  Endereço: [endereço]               │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  VISUALIZADOR DE PDF                │    │
│  │  [embedded PDF na página 52]        │    │
│  │  ← Anterior  52/167  Próxima →     │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  [📥 Baixar PDF completo]                   │
│  [📤 Compartilhar resultado]                │
└─────────────────────────────────────────────┘
```

---

## 8. Fluxo de Configurações

### 8.1 Menu de Configurações

```
/settings
┌─────────────────────────────────────────┐
│  CONFIGURAÇÕES                          │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 👤 Perfil e Dados Pessoais  →    │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🔔 Notificações            →     │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ ⏰ Agendamento             →     │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 📰 Diários Monitorados     →     │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🎨 Aparência               →     │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 8.2 Configuração de Telegram

```
/settings/notifications
┌─────────────────────────────────────────┐
│  NOTIFICAÇÕES                           │
│                                         │
│  TELEGRAM                               │
│  ─────────                              │
│  Status: ○ Não configurado              │
│                                         │
│  Como configurar:                       │
│  1. Abra o Telegram                     │
│  2. Busque: @BotFather                  │
│  3. Digite: /newbot                     │
│  4. Siga as instruções                  │
│  5. Copie o token gerado                │
│                                         │
│  Token do Bot:                          │
│  [____________________________]         │
│                                         │
│  Chat ID:                               │
│  [____________________________]         │
│  ℹ️ Como encontrar meu chat ID?        │
│                                         │
│  [Enviar mensagem de teste]             │
│  [Salvar]                               │
│                                         │
│  ─────────────────────────────         │
│  E-MAIL                                 │
│  E-mail para alertas:                   │
│  [____________________________]         │
│  [Salvar]                               │
└─────────────────────────────────────────┘
```

---

## 9. Fluxo de Notificação (Recebimento)

### 9.1 Via Telegram

```
Sistema encontra resultado
        ↓
Notifier envia mensagem Telegram
        ↓
Usuário recebe no celular:

┌─────────────────────────────┐
│  🤖 Diário Inteligente      │
│  ─────────────────────────  │
│  🚨 ALERTA — DIÁRIO INTEL.  │
│                             │
│  📰 Diário: DOBA            │
│  📅 22/07/2026 · p.52       │
│  🔍 Convocação              │
│                             │
│  "...ficam CONVOCADOS os   │
│  candidatos...              │
│  JUCIVALDO SOUZA DOS SANTOS │
│  CPF: 000.000.000-00..."    │
│                             │
│  📋 Resumo: Você foi conv.  │
│  Prazo: 30 dias             │
│                             │
│  🔗 Ver no sistema          │
└─────────────────────────────┘
        ↓
Usuário clica em [Ver no sistema]
        ↓
Abre browser → /history/[id]
        ↓
Vê detalhes completos + PDF
```

---

## 10. Estados de Erro

### 10.1 Diário Indisponível

```
┌─────────────────────────────────┐
│  ⚠️ AVISO                       │
│                                 │
│  O DOBA não foi encontrado      │
│  hoje às 06:00.                 │
│                                 │
│  Próxima tentativa: 07:00       │
│                                 │
│  Se o problema persistir, o     │
│  sistema tentará até 08:00 e    │
│  você será notificado.          │
│                                 │
│  [OK] [Tentar agora]            │
└─────────────────────────────────┘
```

### 10.2 Erro de OCR

```
┌─────────────────────────────────┐
│  ℹ️ ATENÇÃO                      │
│                                 │
│  O PDF do DOBA (22/07/2026)     │
│  parece ser uma imagem          │
│  escaneada.                     │
│                                 │
│  Aplicando OCR...               │
│  Isso pode levar mais tempo.    │
│                                 │
│  [OK]                           │
└─────────────────────────────────┘
```

### 10.3 Sem Resultados

```
┌─────────────────────────────────┐
│  ✅ PESQUISA CONCLUÍDA          │
│                                 │
│  Nenhuma citação encontrada     │
│  nos diários de hoje.           │
│                                 │
│  167 páginas analisadas.        │
│  Duração: 2m 43s                │
│                                 │
│  Continue estudando! 📚         │
│                                 │
│  [OK]                           │
└─────────────────────────────────┘
```

---

## Legenda dos Ícones de Status

| Ícone | Significado |
|---|---|
| 🚨 | Resultado encontrado (alta relevância) |
| ⚠️ | Aviso ou resultado de atenção |
| ✅ | Sucesso / sem resultado |
| ⏳ | Aguardando / em fila |
| 🔄 | Processando |
| ❌ | Erro |
| 📥 | Download |
| 🔍 | Pesquisa |
| 📋 | Resumo IA |
| 📄 | PDF / Documento |

---

*Documento gerado em: Julho/2026*
