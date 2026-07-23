# 📚 Índice da Documentação — Diário Inteligente

**Sistema Inteligente de Monitoramento de Diários Oficiais para Concursos Públicos**  
**Versão:** 1.0 · **Data:** Julho/2026

---

## Pacote Completo de Documentação

| # | Documento | Arquivo | Status | Descrição |
|---|---|---|---|---|
| 01 | PRD Completo | [PRD-Completo.md](./01-PRD/PRD-Completo.md) | ✅ Concluído | Visão geral, objetivos, requisitos funcionais e não-funcionais, escopo e roadmap |
| 02 | Arquitetura do Sistema | [Arquitetura-do-Sistema.md](./02-Arquitetura/Arquitetura-do-Sistema.md) | ✅ Concluído | Stack técnica, decisões arquiteturais, diagrama de módulos, fluxo de dados |
| 03 | Fluxos de Navegação | [Fluxos-de-Navegacao.md](./03-Fluxos/Fluxos-de-Navegacao.md) | ✅ Concluído | User flows, mapeamento de telas, casos de uso principais |
| 04 | Wireframes | [Wireframes.md](./04-Wireframes/Wireframes.md) | ✅ Concluído | Especificações visuais de 20 telas em formato ASCII/textual |
| 05 | ERD e Schema | [ERD-e-Schema.md](./05-Banco-de-Dados/ERD-e-Schema.md) | ✅ Concluído | Modelo de dados, SQL schema completo, índices, política de retenção |
| 06 | API REST | [Especificacao-APIs.md](./06-API/Especificacao-APIs.md) | ✅ Concluído | Todos os endpoints REST, WebSocket, contratos de request/response |
| 07 | Plano de Dev | [Plano-de-Desenvolvimento.md](./07-Plano-Dev/Plano-de-Desenvolvimento.md) | ✅ Concluído | Módulos, checklist por fase, estimativas, ordem de implementação |
| 08 | Guia UI/UX | [Guia-UI-UX.md](./08-UI-UX/Guia-UI-UX.md) | ✅ Concluído | Design system completo: cores, tipografia, componentes, responsividade |
| 09 | Prompts Lovable | [Prompts-Lovable.md](./09-Prompts-Lovable/Prompts-Lovable.md) | ✅ Concluído | 11 prompts sequenciais prontos para gerar o frontend no Lovable.dev |
| 10 | Plano de Testes | [Plano-de-Testes.md](./10-Testes/Plano-de-Testes.md) | ✅ Concluído | Testes unitários, integração, E2E, performance, segurança e checklist manual |

---

## Estrutura de Diretórios

```
docs/
├── README.md                          ← Este arquivo
├── 01-PRD/
│   └── PRD-Completo.md
├── 02-Arquitetura/
│   └── Arquitetura-do-Sistema.md
├── 03-Fluxos/
│   └── Fluxos-de-Navegacao.md
├── 04-Wireframes/
│   └── Wireframes.md
├── 05-Banco-de-Dados/
│   └── ERD-e-Schema.md
├── 06-API/
│   └── Especificacao-APIs.md
├── 07-Plano-Dev/
│   └── Plano-de-Desenvolvimento.md
├── 08-UI-UX/
│   └── Guia-UI-UX.md
├── 09-Prompts-Lovable/
│   └── Prompts-Lovable.md
└── 10-Testes/
    └── Plano-de-Testes.md
```

---

## Resumo Executivo do Projeto

### O que é
Sistema web **pessoal** que monitora automaticamente os Diários Oficiais (DOBA e DOU) todos os dias às 06:00, pesquisa o nome do usuário e envia alertas instantâneos pelo Telegram quando encontra convocações, nomeações ou qualquer citação relevante.

### Tecnologia
- **Frontend:** Next.js + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** FastAPI (Python) + PostgreSQL (Supabase)
- **IA:** OpenAI GPT-4o-mini para resumo dos trechos
- **Notificações:** Telegram Bot API
- **OCR:** Tesseract (PDFs escaneados)

### Funcionalidades Core (MVP)
1. ✅ Download automático diário (DOBA + DOU)
2. ✅ Extração de texto (nativo + OCR)
3. ✅ Pesquisa por variações de nome e CPF
4. ✅ Palavras-chave configuráveis (convocação, nomeação, etc.)
5. ✅ Resumo por IA do trecho encontrado
6. ✅ Notificação Telegram instantânea
7. ✅ Dashboard com histórico completo
8. ✅ Visualizador de PDF com destaque da página

### Primeiros Passos para Implementação
1. Ler o **PRD** (doc 01) para entender o escopo
2. Configurar o banco seguindo o **ERD** (doc 05)
3. Implementar os módulos na ordem do **Plano de Dev** (doc 07)
4. Usar os **Prompts do Lovable** (doc 09) para o frontend
5. Validar com o **Checklist de Testes** (doc 10)

---

## Links Rápidos por Papel

### 👨‍💻 Desenvolvedor Backend
→ Começar pelo: [02 Arquitetura](./02-Arquitetura/Arquitetura-do-Sistema.md) → [05 ERD](./05-Banco-de-Dados/ERD-e-Schema.md) → [06 API](./06-API/Especificacao-APIs.md) → [07 Plano](./07-Plano-Dev/Plano-de-Desenvolvimento.md)

### 🎨 Desenvolvedor Frontend
→ Começar pelo: [03 Fluxos](./03-Fluxos/Fluxos-de-Navegacao.md) → [04 Wireframes](./04-Wireframes/Wireframes.md) → [08 UI/UX](./08-UI-UX/Guia-UI-UX.md) → [09 Prompts](./09-Prompts-Lovable/Prompts-Lovable.md)

### 🧪 QA / Testes
→ Começar pelo: [10 Testes](./10-Testes/Plano-de-Testes.md)

### 📋 Gerente de Produto / PM
→ Começar pelo: [01 PRD](./01-PRD/PRD-Completo.md) → [07 Plano](./07-Plano-Dev/Plano-de-Desenvolvimento.md)

---

*Documentação completa gerada em: Julho/2026*  
*Total: 10 documentos · ~8.000 linhas de especificação*
