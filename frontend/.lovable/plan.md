## Diário Inteligente — Plano da Fundação (Prompt 0)

Escopo: apenas o que o Prompt 0 pede — confirmar contexto e deixar a base pronta. Nenhuma feature de monitoramento, busca ou alerta é implementada agora; isso virá nos próximos prompts.

### Stack confirmada
- TanStack Start (React + TypeScript + Vite) — equivale ao Next.js para nosso caso, com SSR e file-based routing.
- Tailwind CSS v4 + shadcn/ui.
- Lovable Cloud (Postgres + Auth + Storage + Edge Functions) quando os próximos prompts pedirem backend, banco, login, upload de PDF, cron de monitoramento e envio de alertas.
- Fonte Inter via `<link>` no root (Tailwind v4 não permite `@import` remoto no CSS).

### O que faço nesta etapa
1. **Design system dark** em `src/styles.css` com a paleta exata do brief, em `oklch`:
   - `--background` → slate-900 `#0F172A`
   - `--card` / `--popover` → slate-800 `#1E293B`
   - `--primary` → blue-600 `#2563EB` (+ `--primary-glow` para gradientes/realces)
   - `--foreground` → slate-100 `#F1F5F9`
   - `--muted-foreground` → slate-400 `#94A3B8`
   - `--success` → green-500 `#22C55E`
   - `--destructive` → red-500 `#EF4444`
   - `--warning` → yellow-500 `#EAB308`
   - `--border` / `--input` → slate-700/800 sutil
   - Tokens de gradiente e sombra (`--gradient-primary`, `--shadow-elegant`) inspirados em Linear/Vercel.
   - Dark como tema padrão (aplicar `.dark` no `<html>`), sem toggle.
2. **Tipografia Inter** carregada via `links` em `src/routes/__root.tsx` e mapeada em `@theme` (`--font-sans`).
3. **Metadados** do root e do `/` atualizados: título "Diário Inteligente — Monitoramento de Diários Oficiais", descrição, og/twitter.
4. **Shell da home** (`src/routes/index.tsx`) removendo o placeholder e mostrando um hero mínimo de boas-vindas ("Diário Inteligente" + subtítulo), só para validar visualmente a paleta e a fonte. Sem seções de produto ainda — os próximos prompts vão definir landing, dashboard, auth, etc.
5. **Nada de backend nesta etapa.** Lovable Cloud só será ativado quando um Prompt seguinte exigir persistência, login ou processamento de PDF.

### Fora de escopo agora (aguardando próximos prompts)
- Autenticação / cadastro de candidatos.
- Cadastro dos nomes a monitorar.
- Ingestão e parsing dos Diários Oficiais (PDFs).
- Busca / matching / highlight de citações.
- Dashboard de alertas, notificações por e-mail, histórico.
- Landing page comercial completa.

### Detalhes técnicos
- Tokens ficam em `@theme inline` mapeando variáveis `:root`/`.dark`, seguindo o padrão shadcn v4.
- Inter carregada com `preconnect` + `stylesheet` no `head()` do `__root`.
- Sem `tailwind.config.js` (v4 é CSS-first).
- Sem `src/pages/`, sem React Router; rotas continuam em `src/routes/`.

Ao aprovar, aplico só essa fundação e fico pronto para receber o Prompt 1.
