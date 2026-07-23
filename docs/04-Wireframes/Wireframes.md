# Wireframes — Diário Inteligente
**Especificações de Todas as Telas do Sistema**

**Versão:** 1.0  
**Data:** Julho/2026  
**Ferramenta sugerida:** Figma / Excalidraw / Papel

---

> **Nota:** Este documento descreve os wireframes em formato textual/ASCII.
> Para uso com Figma, utilize os Prompts do documento 09-Prompts-Lovable que  
> especificam as telas com detalhes de cores, espaçamentos e comportamentos.

---

## Índice de Telas

| # | Tela | Rota | Prioridade |
|---|---|---|---|
| W01 | Login | /login | P0 |
| W02 | Cadastro | /register | P0 |
| W03 | Onboarding — Passo 1 | /onboarding | P0 |
| W04 | Onboarding — Passo 2 | /onboarding | P0 |
| W05 | Onboarding — Passo 3 | /onboarding | P0 |
| W06 | Onboarding — Passo 4 | /onboarding | P0 |
| W07 | Onboarding — Passo 5 | /onboarding | P0 |
| W08 | Dashboard | / | P0 |
| W09 | Modal — Pesquisa Manual | / (modal) | P0 |
| W10 | Modal — Progresso da Pesquisa | / (modal) | P0 |
| W11 | Histórico de Pesquisas | /history | P0 |
| W12 | Detalhes do Resultado | /history/[id] | P0 |
| W13 | Concursos — Lista | /competitions | P0 |
| W14 | Concursos — Formulário | /competitions/new | P0 |
| W15 | Palavras-chave | /keywords | P1 |
| W16 | Configurações — Perfil | /settings/profile | P0 |
| W17 | Configurações — Notificações | /settings/notifications | P0 |
| W18 | Configurações — Agendamento | /settings/schedule | P1 |
| W19 | Configurações — Diários | /settings/journals | P1 |
| W20 | Mobile — Bottom Navigation | global | P0 |

---

## W01 — Tela de Login

```
┌─────────────────────────────────────────────────────────────────────┐
│ DESKTOP (1280px)                                                     │
├───────────────────────────┬─────────────────────────────────────────┤
│                           │                                         │
│  LADO ESQUERDO            │  LADO DIREITO                           │
│  (gradient azul escuro)   │  (bg slate-900)                        │
│                           │                                         │
│  ┌─────────────────────┐  │  ┌────────────────────────────────┐    │
│  │  🔍 DIÁRIO          │  │  │                                │    │
│  │    INTELIGENTE      │  │  │  Bem-vindo de volta            │    │
│  └─────────────────────┘  │  │  (text-2xl font-bold)          │    │
│                           │  │  Acesse sua conta              │    │
│  ✓ Monitoramento diário   │  │  (text-sm text-slate-400)      │    │
│  ✓ Alertas no Telegram    │  │                                │    │
│  ✓ Histórico completo     │  │  [E-mail          ✉️]          │    │
│  ✓ Resumo por IA          │  │  [Senha           👁]          │    │
│                           │  │                                │    │
│                           │  │  Esqueceu sua senha?           │    │
│                           │  │                                │    │
│                           │  │  [    Entrar    ] ← blue-600  │    │
│                           │  │                                │    │
│                           │  │  ─────── ou ───────           │    │
│                           │  │                                │    │
│                           │  │  Não tem conta?               │    │
│                           │  │  [Criar conta →]              │    │
│                           │  │                                │    │
│                           │  └────────────────────────────────┘    │
│                           │                                         │
└───────────────────────────┴─────────────────────────────────────────┘

MOBILE (375px)
┌─────────────────────┐
│  bg-slate-900       │
│                     │
│  🔍 DIÁRIO INTEL.   │  ← logo pequeno centralizado
│                     │
│  Bem-vindo de volta │
│  (text-xl)          │
│                     │
│  [E-mail         ] │
│  [Senha          ] │
│                     │
│  Esqueceu a senha?  │
│                     │
│  [    Entrar     ]  │
│                     │
│  Não tem conta?     │
│  [Criar conta →]    │
│                     │
└─────────────────────┘

ESTADOS:
├── Normal: como acima
├── Loading: botão mostra spinner, desabilitado
├── Erro: campos com borda vermelha + "E-mail ou senha incorretos"
└── Sucesso: redireciona para Dashboard ou Onboarding
```

---

## W02 — Cadastro

```
┌─────────────────────────────────┐
│  Criar sua conta                │
│  (text-2xl font-bold)           │
│                                 │
│  Nome completo *                │
│  [________________________]     │
│                                 │
│  E-mail *                       │
│  [________________________]     │
│                                 │
│  Senha *                        │
│  [________________________ 👁]  │
│  ℹ️ Mínimo 8 caracteres         │
│                                 │
│  Confirmar senha *              │
│  [________________________ 👁]  │
│                                 │
│  [    Criar conta    ]          │
│                                 │
│  Já tem conta? [Entrar →]       │
└─────────────────────────────────┘

VALIDAÇÕES:
- Nome: obrigatório, mínimo 3 caracteres
- E-mail: formato válido, único no sistema
- Senha: mínimo 8 caracteres
- Confirmar: deve bater com senha
```

---

## W03 a W07 — Onboarding (5 Passos)

```
BARRA DE PROGRESSO (comum a todos os passos):
┌─────────────────────────────────────────────────────┐
│  ●────●────○────○────○                              │
│  1    2    3    4    5                               │
│  (preenchido = azul, vazio = slate-700)             │
└─────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────
W03 — PASSO 1: Nome Completo
─────────────────────────────────────────────────────
┌────────────────────────────────────────────────┐
│  👋 Olá! Como você se chama?                   │
│  (text-2xl font-semibold text-white)           │
│                                                │
│  Seu nome completo                             │
│  [Jucivaldo Souza dos Santos         ]         │
│  ℹ️ Usaremos para pesquisar nos diários       │
│                                                │
│  ⬇ Variações geradas (aparece ao digitar):    │
│  ┌──────────────────────────────────────────┐ │
│  │ • Jucivaldo Souza dos Santos             │ │
│  │ • JUCIVALDO SOUZA DOS SANTOS             │ │
│  │ • Jucivaldo Santos                       │ │
│  │ • Jucivaldo                              │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│                        [Próximo →]             │
└────────────────────────────────────────────────┘

─────────────────────────────────────────────────────
W04 — PASSO 2: Revisar Variações
─────────────────────────────────────────────────────
┌────────────────────────────────────────────────┐
│  Variações do seu nome para pesquisa           │
│  (text-xl font-semibold)                       │
│                                                │
│  O sistema pesquisará todas essas variações    │
│  nos Diários Oficiais:                         │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ [x] Jucivaldo Souza dos Santos           │ │
│  │ [x] JUCIVALDO SOUZA DOS SANTOS           │ │
│  │ [x] Jucivaldo Santos                     │ │
│  │ [x] Jucivaldo                            │ │
│  │ [x] Souza dos Santos                     │ │
│  │ [x] J. Souza dos Santos                  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [+ Adicionar variação manualmente]            │
│                                                │
│  [← Voltar]              [Próximo →]           │
└────────────────────────────────────────────────┘

─────────────────────────────────────────────────────
W05 — PASSO 3: Concursos
─────────────────────────────────────────────────────
┌────────────────────────────────────────────────┐
│  🏆 Seus concursos                             │
│                                                │
│  Selecione os concursos que participou:        │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ ☑ TJBA — Tribunal de Justiça da Bahia   │ │
│  │ ☑ Polícia Civil BA                       │ │
│  │ ☑ INSS                                   │ │
│  │ ☑ Correios (ECT)                         │ │
│  │ ☑ EMBASA                                 │ │
│  │ ☑ IBGE                                   │ │
│  │ ☑ Receita Federal                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [+ Adicionar outro concurso]                  │
│                                                │
│  [← Voltar]              [Próximo →]           │
└────────────────────────────────────────────────┘

─────────────────────────────────────────────────────
W06 — PASSO 4: Telegram (Opcional)
─────────────────────────────────────────────────────
┌────────────────────────────────────────────────┐
│  🔔 Receba alertas no Telegram                 │
│                                                │
│  Configure para receber notificações           │
│  instantâneas quando seu nome aparecer         │
│                                                │
│  ▸ Como configurar:                            │
│  1. Abra o Telegram                            │
│  2. Busque @BotFather                          │
│  3. Crie um bot com /newbot                    │
│  4. Copie o token gerado                       │
│                                                │
│  Token do Bot:                                 │
│  [________________________________]            │
│                                                │
│  Seu Chat ID:                                  │
│  [________________________________]            │
│  ℹ️ Como encontrar meu Chat ID?               │
│                                                │
│  [Testar conexão]                              │
│                                                │
│  [← Voltar]  [Pular por agora]  [Próximo →]   │
└────────────────────────────────────────────────┘

─────────────────────────────────────────────────────
W07 — PASSO 5: Confirmação
─────────────────────────────────────────────────────
┌────────────────────────────────────────────────┐
│  🎉 Tudo configurado!                          │
│                                                │
│  Resumo:                                       │
│  ✅ Nome: Jucivaldo Souza dos Santos           │
│  ✅ 6 variações de nome                        │
│  ✅ 7 concursos cadastrados                    │
│  ✅ Telegram configurado                        │
│  ✅ Pesquisa diária às 06:00                   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 🔍 Pesquisar nos últimos 30 dias agora?  │ │
│  │                                          │ │
│  │ ●  Sim, pesquisar agora (recomendado)    │ │
│  │ ○  Não, aguardar a pesquisa de amanhã    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [        Começar! →       ] ← blue-600 lg   │
└────────────────────────────────────────────────┘
```

---

## W08 — Dashboard Principal

```
DESKTOP (1280px)
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  CONTEÚDO PRINCIPAL                                        │
│ 240px   │  ─────────────────────────────────────────────────────    │
│         │                                                            │
│ 🔍      │  Dashboard                    [🔍 Pesquisar Agora]        │
│ Diário  │  22 de julho de 2026                                       │
│ Intel.  │                                                            │
│         │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐   │
│ ▣ Dash  │  │ 🔍       │ │ 🚨       │ │ 📄       │ │ ⏰         │   │
│ 🔍 Busca│  │ Pesquisas│ │Resultados│ │ Último   │ │ Próxima    │   │
│ 📋 Hist │  │   127    │ │    3     │ │  DOBA    │ │ 06:00      │   │
│ 🏆 Conc │  │ desde o  │ │encontrado│ │22/07/2026│ │ em 11h 52m │   │
│ 🏷 Pal  │  │ início   │ │     s    │ │167 págs. │ │            │   │
│ ⚙ Config│  └──────────┘ └──────────┘ └──────────┘ └────────────┘   │
│         │                                                            │
│ J       │  STATUS DOS DIÁRIOS                                        │
│ Jucival │  ┌──────────────────────────────────────────────────────┐ │
│ juc@... │  │ ● DOBA — OK · Atualizado 22/07 às 06:05             │ │
│         │  │ ● DOU  — OK · Atualizado 22/07 às 06:08             │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  PESQUISAS (últimos 14 dias)           ─────────────     │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  ▁▁▂▁▁▁▂▃▁▁▁▁▂▁  ← barras azuis (pesquisas)       │ │
│         │  │               ■  ← barra vermelha (resultado)       │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ÚLTIMOS RESULTADOS              [Ver todos →]            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │ 🚨 22/07 DOBA p.52 · Convocação    [Ver] [PDF]      │ │
│         │  │    "...JUCIVALDO SOUZA DOS SANTOS ficam CONV..."     │ │
│         │  │ ─────────────────────────────────────────────────    │ │
│         │  │ ℹ️ 15/06 DOU  p.31 · Nomeação      [Ver] [PDF]     │ │
│         │  │    "...Jucivaldo Souza dos Santos, CPF 123..."       │ │
│         │  └──────────────────────────────────────────────────────┘ │
└─────────┴──────────────────────────────────────────────────────────-┘
```

---

## W09 — Modal: Pesquisa Manual

```
OVERLAY (bg-black/60)
┌──────────────────────────────────────────────────────┐
│                                                      │
│   ┌────────────────────────────────────────────┐    │
│   │ Pesquisa Manual                        [✕] │    │
│   │ Selecione os diários e o período           │    │
│   │                                            │    │
│   │ DIÁRIOS PARA PESQUISAR                     │    │
│   │ ┌──────────────────────────────────────┐  │    │
│   │ │ ☑ DOBA — Diário Oficial da Bahia    │  │    │
│   │ │ ☑ DOU  — Diário Oficial da União    │  │    │
│   │ └──────────────────────────────────────┘  │    │
│   │                                            │    │
│   │ PERÍODO                                    │    │
│   │ ● Hoje                                     │    │
│   │ ○ Últimos 7 dias                           │    │
│   │ ○ Últimos 30 dias                          │    │
│   │ ○ Personalizado                            │    │
│   │   De [____/____/____] Até [____/____/____] │    │
│   │                                            │    │
│   │ ┌──────────┐  ┌──────────────────────┐    │    │
│   │ │ Cancelar │  │  Iniciar Pesquisa → │    │    │
│   │ └──────────┘  └──────────────────────┘    │    │
│   └────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## W10 — Modal: Progresso da Pesquisa

```
┌────────────────────────────────────────────────────┐
│ Pesquisa em Andamento...                       [✕] │
│                                                    │
│ ████████████████░░░░░░░░░░░░░░░░ 52%               │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ ✅ DOBA — Download completo (2,3 MB)       │    │
│ │ ✅ DOBA — Extração concluída (167 pgs)     │    │
│ │ 🔄 DOBA — Pesquisando...                  │    │
│ │    ██████░░░░░░░░ 87 / 167 páginas         │    │
│ │ ⏳ DOU  — Aguardando...                   │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ 87 páginas analisadas · 1m 23s decorridos          │
│                                                    │
│              [Cancelar pesquisa]                   │
└────────────────────────────────────────────────────┘

─── RESULTADO: MATCH ENCONTRADO ───
┌────────────────────────────────────────────────────┐
│ 🚨 1 Resultado Encontrado!                         │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ 📄 DOBA — Página 52                        │    │
│ │ 🔍 Palavra-chave: Convocação               │    │
│ │ "...JUCIVALDO SOUZA DOS SANTOS ficam..."   │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ [   Fechar   ]    [  Ver detalhes →  ]            │
└────────────────────────────────────────────────────┘
```

---

## W11 — Histórico de Pesquisas

```
┌──────────────────────────────────────────────────────────────┐
│ Histórico de Pesquisas                                        │
│                                                               │
│ [Todos os diários ▼] [Qualquer período ▼] [☐ Só resultados] │
│                                                               │
│ 22 DE JULHO DE 2026, TERÇA-FEIRA ─────────────────────────   │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🚨  06:12  ·  DOBA  ·  1 resultado                      │ │
│ │     Página 52 · Convocação                               │ │
│ │     "...JUCIVALDO SOUZA DOS SANTOS ficam CONV..."        │ │
│ │                          [Ver detalhes]  [Abrir PDF]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ✅  06:08  ·  DOU  ·  0 resultados  ·  234 páginas      │ │
│ │     Duração: 3m 12s                                      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ 21 DE JULHO DE 2026, SEGUNDA-FEIRA ───────────────────────   │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ✅  06:05  ·  DOBA  ·  0 resultados  ·  143 páginas     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ✅  06:02  ·  DOU  ·  0 resultados  ·  267 páginas      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│              [Carregar mais 20 registros]                     │
│              Exibindo 4 de 127 pesquisas                      │
└──────────────────────────────────────────────────────────────┘
```

---

## W12 — Detalhes do Resultado

```
← Voltar ao histórico

┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  [🚨 RESULTADO ENCONTRADO]  ← badge vermelho                 │
│                                                               │
│  INFORMAÇÕES  ────────────────────────────────────────────   │
│  ┌─────────────────────┐ ┌─────────────────────────────────┐ │
│  │ 📰 Diário           │ │ 📅 Edição                       │ │
│  │ Diário Oficial BA   │ │ 22 de julho de 2026             │ │
│  │ (DOBA)              │ │                                 │ │
│  └─────────────────────┘ └─────────────────────────────────┘ │
│  ┌─────────────────────┐ ┌─────────────────────────────────┐ │
│  │ 📄 Página           │ │ 🔍 Palavra-chave               │ │
│  │ 52 de 167           │ │ [Convocação]← badge vermelho    │ │
│  └─────────────────────┘ └─────────────────────────────────┘ │
│                                                               │
│  TRECHO ENCONTRADO  ──────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ bg-slate-900, fonte mono                             │   │
│  │                                                      │   │
│  │ "...SECRETARIA DE ADMINISTRAÇÃO                      │   │
│  │                                                      │   │
│  │ Ficam CONVOCADOS os candidatos abaixo:               │   │
│  │                                                      │   │
│  │ [JUCIVALDO SOUZA DOS SANTOS] ← highlight amarelo     │   │
│  │ CPF: 123.456.789-00                                  │   │
│  │                                                      │   │
│  │ Prazo: 30 dias a partir desta data..."               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  📋 RESUMO DA IA  ─────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ bg-blue-950/30, borda azul                           │   │
│  │                                                      │   │
│  │  ✅ Você foi CONVOCADO!                              │   │
│  │                                                      │   │
│  │  ⏰ Prazo: 30 dias (até 21/08/2026)                 │   │
│  │                                                      │   │
│  │  📎 Documentos necessários:                          │   │
│  │  • RG (original + cópia)                             │   │
│  │  • CPF (original + cópia)                            │   │
│  │  • Comprovante de residência                         │   │
│  │  • Diploma de escolaridade                           │   │
│  │                                                      │   │
│  │  📍 Local: Secretaria de Administração               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  VISUALIZADOR DE PDF — Página 52/167  ────────────────────   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [← pág 51] [52/167] [pág 53 →]  [−] [+] [⛶]       │   │
│  │                                                      │   │
│  │                                                      │   │
│  │   [Conteúdo do PDF renderizado aqui]                 │   │
│  │                                                      │   │
│  │                  600px de altura                     │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  [📥 Baixar PDF completo]   [📤 Compartilhar]               │
└──────────────────────────────────────────────────────────────┘
```

---

## W13 — Concursos: Lista

```
┌──────────────────────────────────────────────────────────────┐
│ Meus Concursos              [+ Adicionar Concurso]           │
│ 7 concursos cadastrados · 6 ativos                           │
│                                                               │
│ [Todos(7)] [Aguardando(4)] [Classificado(1)] [Eliminado(0)]  │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ⚖ TJBA                                        [Editar]  │ │
│ │ Tribunal de Justiça da Bahia                             │ │
│ │ Técnico Judiciário · 2024                                │ │
│ │                                                          │ │
│ │ [🟢 Classificado — aguardando convocação]                │ │
│ │                                                          │ │
│ │ Inscrição: 2024001234 · Banca: CEBRASPE                 │ │
│ │ [🔗 Edital]  [📋 3 pesquisas relacionadas]              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🏛 Polícia Civil BA                           [Editar]  │ │
│ │ Investigador · 2023                                      │ │
│ │ [🔵 Aguardando resultado]                                │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ... (demais concursos) ...                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## W14 — Concursos: Formulário

```
┌────────────────────────────────────────────────────┐
│ Novo Concurso                                  [✕] │
│                                                    │
│ Órgão / Instituição *                              │
│ [___________________________________________]      │
│                                                    │
│ Cargo pleiteado *                                  │
│ [___________________________________________]      │
│                                                    │
│ Ano do concurso *           Status *              │
│ [2024 ▼]                    [Aguardando result. ▼] │
│                                                    │
│ Número de inscrição         Banca organizadora     │
│ [________________]          [________________]     │
│                                                    │
│ Link do edital                                     │
│ [___________________________________________]      │
│                                                    │
│ Observações                                        │
│ ┌─────────────────────────────────────────────┐   │
│ │                                             │   │
│ │                                             │   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
│ [● Concurso ativo]                                 │
│                                                    │
│ ┌─────────────┐  ┌────────────────────────────┐   │
│ │  Cancelar   │  │       Salvar Concurso      │   │
│ └─────────────┘  └────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

---

## W20 — Mobile: Bottom Navigation

```
MOBILE (375px) — BOTTOM NAV
┌─────────────────────────────────────────┐
│                                         │
│  [CONTEÚDO DA PÁGINA ATUAL]             │
│                                         │
│                                         │
│  padding-bottom: 80px                   │
│  (para não ficar atrás do nav)          │
│                                         │
├─────────────────────────────────────────┤
│ bg-slate-900 border-t border-slate-800  │
│                                         │
│  ▣      🔍     📋      🏆      ⚙       │
│  Home  Busca  Hist.  Conc.  Config      │
│  azul  cinza  cinza  cinza   cinza      │
│  ← ativo                                │
│                                         │
│  [safe area inset bottom]               │
└─────────────────────────────────────────┘

COMPORTAMENTO:
- Item ativo: ícone azul (text-blue-400) + label azul
- Item inativo: ícone cinza (text-slate-500)
- Toque: feedback háptico se suportado
- Badge numérico no Histórico se há resultados não vistos
```

---

## Medidas e Especificações Técnicas

### Dimensões de Componentes

| Componente | Altura | Largura | Border Radius |
|---|---|---|---|
| Botão primário | 40px | variável | 8px |
| Botão secundário | 40px | variável | 8px |
| Input | 40px | 100% | 8px |
| Card | variável | 100% | 12px |
| Badge | 24px | variável | 9999px |
| Bottom nav | 64px + safe area | 100% | 0 |
| Sidebar | 100vh | 240px | 0 |
| Modal | variável | 480px max | 16px |

### Espaçamentos Padrão

| Contexto | Valor |
|---|---|
| Padding de página | 32px (desktop), 16px (mobile) |
| Gap entre cards | 16px |
| Padding interno de card | 20px |
| Espaço entre campos de form | 16px |
| Margem entre seções | 32px |

---

*Wireframes gerados em: Julho/2026*  
*Para implementação detalhada, consultar: 09-Prompts-Lovable*
