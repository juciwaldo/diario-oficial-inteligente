# Prompts para o Lovable — Diário Inteligente
**Sequência de Prompts para Implementação Modular**

**Versão:** 1.0  
**Data:** Julho/2026  
**Plataforma:** Lovable.dev

---

## Instruções de Uso

1. **Use os prompts na ordem apresentada**
2. Cada prompt é autossuficiente — contém todo o contexto necessário
3. Após cada prompt, **revise o resultado** antes de avançar
4. Se algo não ficar correto, use o prompt de correção da seção
5. Para o Lovable, seja sempre específico com cores, tamanhos e comportamentos

---

## PROMPT 0 — Contexto Inicial (Enviar Primeiro)

```
Vou criar um sistema web chamado "Diário Inteligente — Sistema de Monitoramento 
de Diários Oficiais para Concursos Públicos".

CONTEXTO DO SISTEMA:
- O sistema monitora automaticamente Diários Oficiais (PDFs governamentais)
- Pesquisa o nome do usuário nos documentos
- Envia alertas quando encontra citações (convocações, nomeações, etc.)
- É voltado para candidatos de concursos públicos no Brasil

STACK TÉCNICA:
- Frontend: React + Next.js + TypeScript
- Estilização: Tailwind CSS + shadcn/ui
- Design: Dark mode elegante, profissional, inspirado no Linear/Vercel

PALETA DE CORES:
- Background principal: slate-900 (#0F172A)
- Cards: slate-800 (#1E293B)  
- Accent/Primário: blue-600 (#2563EB)
- Texto principal: slate-100 (#F1F5F9)
- Texto secundário: slate-400 (#94A3B8)
- Sucesso: green-500 (#22C55E)
- Alerta crítico: red-500 (#EF4444)
- Aviso: yellow-500 (#EAB308)

FONTE: Inter (Google Fonts)

Confirme que entendeu o contexto e está pronto para receber os prompts de 
implementação.
```

---

## PROMPT 1 — Layout Base + Sidebar

```
Crie o layout base do sistema "Diário Inteligente" com as seguintes 
especificações:

SIDEBAR (Desktop - 240px fixo, lado esquerdo):
- Background: slate-900 com border-right slate-800
- Logo no topo: ícone Search em azul (w-8 h-8 bg-blue-600 rounded-lg) + 
  "Diário Inteligente" (text-sm font-semibold text-white) + 
  "Monitoramento" (text-xs text-slate-400)
- Separador border-slate-800
- Itens de navegação (espaçamento: px-3 py-2, rounded-lg):
  * Dashboard — ícone BarChart3
  * Pesquisa — ícone Search
  * Histórico — ícone FileText (com badge numérico vermelho quando há resultados)
  * Concursos — ícone Trophy
  * Palavras-chave — ícone Tag
  * Configurações — ícone Settings
- Item ativo: bg-blue-600/15 text-blue-400 font-medium
- Item inativo: text-slate-400 hover:text-white hover:bg-slate-800
- Rodapé: avatar do usuário (círculo azul com inicial) + nome + email truncados

ÁREA DE CONTEÚDO:
- Ocupa o restante da tela (flex-1)
- Background: slate-900
- Padding interno: p-8
- Max-width do conteúdo interno: 1200px, centralizado

HEADER DA PÁGINA:
- Título da página (text-2xl font-bold text-white)
- Subtítulo/descrição opcional (text-sm text-slate-400)
- Slot para botão de ação no lado direito

MOBILE (< 768px):
- Sidebar colapsa
- Navegação por bottom nav com 5 itens principais
- Bottom nav: bg-slate-900 border-t border-slate-800
- Padding bottom no conteúdo para não ficar atrás do nav

Mostre o layout com a página Dashboard ativa como exemplo.
```

---

## PROMPT 2 — Dashboard Principal

```
Implemente a página Dashboard do "Diário Inteligente" com estas seções:

1. CARDS DE ESTATÍSTICAS (grid 4 colunas desktop, 2 tablet, 1 mobile):
   Card 1 - "Total de Pesquisas"
   - Ícone: Search (text-blue-400)
   - Número grande: ex "127" (text-3xl font-bold text-white)
   - Label: "desde o início" (text-xs text-slate-500)
   
   Card 2 - "Resultados Encontrados"
   - Ícone: AlertCircle (text-red-400)
   - Número: "3" 
   - Label: "citações encontradas"
   - Se > 0: borda sutil vermelha (border-red-900/50)
   
   Card 3 - "Último Diário Analisado"
   - Ícone: FileText (text-green-400)
   - Texto: "DOBA" (text-xl font-bold)
   - Sub: "22/07/2026 · 167 páginas"
   
   Card 4 - "Próxima Pesquisa"
   - Ícone: Clock (text-yellow-400)
   - Texto: "06:00" amanhã
   - Countdown dinâmico: "em 12h 30min"

2. STATUS DOS DIÁRIOS (abaixo dos cards):
   - Título: "Status dos Diários" (text-sm font-semibold text-slate-300)
   - DOBA: dot verde + "DOBA — Diário Oficial BA" + "Atualizado às 06:05" 
   - DOU: dot verde + "DOU — Diário Oficial União" + "Atualizado às 06:08"
   - Se offline: dot vermelho pulsante

3. LINHA DO TEMPO (gráfico de barras simples — últimos 14 dias):
   - Título: "Pesquisas por dia"
   - Barras azuis (pesquisas) e vermelhas (resultados encontrados)
   - Legenda embaixo: azul = pesquisas, vermelho = resultados
   - Usar recharts ou Chart.js simples
   - Altura: 120px

4. ÚLTIMOS RESULTADOS (lista):
   - Título + link "Ver todos →" (text-blue-400)
   - Para cada resultado:
     * Ícone AlertCircle vermelho (se resultado) ou CheckCircle2 cinza (sem resultado)
     * "DOBA — 22/07/2026 — pág. 52"
     * Badge "Convocação" vermelho
     * Botão "Ver" pequeno
   - Se vazio: empty state com ícone Search + "Nenhum resultado ainda. O sistema está monitorando."

5. BOTÃO "PESQUISAR AGORA":
   - Posicionado no header da página, lado direito
   - bg-blue-600 hover:bg-blue-700
   - Ícone Search + texto "Pesquisar Agora"
   - Ao clicar: abre modal de confirmação

Todos os cards: bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm
```

---

## PROMPT 3 — Modal de Pesquisa + Progress

```
Implemente o sistema de pesquisa manual com dois estados:

MODAL DE CONFIGURAÇÃO (aparece ao clicar "Pesquisar Agora"):
- Overlay: bg-black/60 backdrop-blur-sm
- Card central: bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md
- Título: "Pesquisa Manual" (text-xl font-semibold text-white)
- Subtítulo: "Selecione os diários e o período"

- Seção "Diários":
  * Checkbox estilizado para "DOBA — Diário Oficial BA" (marcado por padrão)
  * Checkbox para "DOU — Diário Oficial União" (marcado)
  * Labels com ícone FileText pequeno

- Seção "Período":
  * Radio buttons:
    - Hoje (marcado)
    - Últimos 7 dias
    - Últimos 30 dias
    - Personalizado → mostra dois date pickers

- Botões: 
  * "Cancelar" (outline, fecha modal)
  * "Iniciar Pesquisa →" (blue-600, inicia pesquisa)

TELA DE PROGRESSO (substitui o modal após confirmar):
- Card maior: max-w-lg
- Título: "Pesquisa em Andamento..."
- Progress bar geral: h-3 rounded-full, azul animado com transition-all duration-500

- Lista de etapas com ícones de status:
  * ✅ (CheckCircle2 verde) DOBA — Download completo (2,3 MB)
  * ✅ DOBA — Extração de texto concluída (167 páginas)
  * 🔄 (spin azul) DOBA — Pesquisando... 
    → sub-progresso: "87 / 167 páginas"
  * ⏳ (Clock cinza) DOU — Aguardando...

- Contador: "87 páginas analisadas · 1m 23s"
- Botão: "Cancelar pesquisa" (ghost/vermelho, menor)

ESTADO FINAL — SEM RESULTADO:
- ✅ grande verde centralizado
- "Pesquisa concluída!"
- "167 páginas analisadas · 0 resultados · 2m 43s"
- Mensagem motivacional: "Continue estudando! Nenhuma citação hoje."
- Botão: "Fechar"

ESTADO FINAL — COM RESULTADO:
- 🚨 (AlertCircle vermelho grande, com anel pulsante ao redor)
- "1 resultado encontrado!"
- Preview: "Página 52 do DOBA — Convocação"
- Botão primário: "Ver detalhes →" (azul)
- Botão secundário: "Fechar" (ghost)
```

---

## PROMPT 4 — Página de Histórico

```
Implemente a página /history (Histórico de Pesquisas):

HEADER:
- Título: "Histórico de Pesquisas"
- Filtros em linha (abaixo do título):
  * Select "Todos os diários" / "DOBA" / "DOU"
  * Select "Qualquer período" / "Hoje" / "Esta semana" / "Este mês"
  * Toggle checkbox: "Mostrar apenas com resultado"
  * Botão "Limpar filtros" (aparece quando há filtros ativos)

LISTA AGRUPADA POR DATA:
- Separador de data: "22 de julho de 2026, terça-feira" 
  (text-xs text-slate-500 uppercase tracking-wider, linha decorativa ao lado)

- Cada item da lista (bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-lg px-4 py-3):
  
  [COM RESULTADO]:
  * Ícone AlertCircle vermelho (w-5 h-5)
  * Badge "1 resultado" (bg-red-500/10 text-red-400 text-xs)
  * "06:12 · DOBA · pág. 52 · Convocação"
  * Trecho: "...JUCIVALDO SOUZA DOS SANTOS ficam CONVOCADOS..." 
    (text-xs text-slate-400 truncate max-w-sm italic)
  * Botões: [Ver] [PDF] (pequenos, outline, lado direito)
  
  [SEM RESULTADO]:
  * Ícone CheckCircle2 slate-700 (w-5 h-5) — discreto
  * "06:08 · DOU · 234 páginas · 0 resultados"
  * Sem trecho
  * Apenas tempo de execução: "3m 12s"

PAGINAÇÃO:
- Botão "Carregar mais" centralizado (ghost button)
- Texto: "Exibindo 20 de 127 pesquisas"

EMPTY STATE:
- Ícone FileText grande (text-slate-700 w-16 h-16) centralizado
- "Nenhuma pesquisa realizada ainda."
- "O sistema executará automaticamente todos os dias às 06:00."
- Botão: "Pesquisar agora"
```

---

## PROMPT 5 — Detalhes do Resultado

```
Implemente a página /history/[id] (detalhes de um resultado encontrado):

BREADCRUMB:
← Voltar ao histórico (link text-blue-400)

HEADER DO RESULTADO:
- Badge grande: "🚨 RESULTADO ENCONTRADO" 
  (bg-red-500/10 text-red-400 border border-red-800 rounded-full px-4 py-1.5 text-sm font-medium)

CARDS DE METADADOS (grid 2 colunas):
- 📰 Diário: "Diário Oficial da Bahia (DOBA)"
- 📅 Edição: "22 de julho de 2026"
- 📄 Página: "52 de 167"
- 🔍 Ativado por: badge "Convocação" (vermelho)
- Variação encontrada: "JUCIVALDO SOUZA DOS SANTOS" (monospace, yellow highlight)
- Relevância: barra de progresso 87% "Alta relevância"

SEÇÃO "TRECHO ENCONTRADO":
- Título: "Trecho Encontrado" com ícone FileText
- Box: bg-slate-900 border border-slate-700 rounded-lg p-4
- Texto do trecho em font-mono text-sm text-slate-300
- O nome encontrado DESTACADO: bg-yellow-400/20 text-yellow-300 px-0.5 rounded
- Contexto antes e depois em text-slate-500

SEÇÃO "RESUMO DA IA":
- Título: "📋 Resumo Gerado por IA" + badge "Powered by GPT-4o-mini"
- Box: bg-blue-950/30 border border-blue-900/50 rounded-lg p-4
- Ícone ✅ + "Você foi CONVOCADO!" (text-green-400 font-semibold text-lg)
- Seção "⏰ Prazo": "30 dias (até 21/08/2026)" (text-yellow-400)
- Seção "📎 Documentos necessários": lista com bullet points
- Seção "📍 Local": endereço
- Botão "Regerar resumo" (outline pequeno, lado direito)

SEÇÃO "VISUALIZADOR DE PDF":
- Título: "Visualizador de PDF — Página 52"
- Área do viewer: bg-slate-900 border rounded-xl overflow-hidden
- Barra de controles: página anterior/próxima, número, zoom in/out, fullscreen
- Área branca do PDF (react-pdf ou iframe)
- Altura: 600px com scroll

AÇÕES:
- Botão primário: "📥 Baixar PDF completo" (blue-600)
- Botão secundário: "📤 Compartilhar" (outline)
- Botão terciário: "✓ Marcar como revisado" (ghost verde)
```

---

## PROMPT 6 — Concursos

```
Implemente a página /competitions (Concursos):

HEADER:
- Título: "Meus Concursos"
- Subtítulo: "7 concursos cadastrados · 6 ativos"
- Botão: "+ Adicionar Concurso" (blue-600)

FILTRO DE STATUS (tabs/pills horizontais):
- Todos (7) | Ativos (6) | Convocado (1) | Aguardando (4) | Eliminado (0)
- Pill ativo: bg-blue-600/15 text-blue-400 border border-blue-800

LISTA DE CONCURSOS:
Cada card (bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600):

┌─────────────────────────────────────────────┐
│ [Logo/Inicial do órgão]  TJBA    [Editar ✎] │
│                          Tribunal de Justiça │
│                          da Bahia            │
│ Técnico Judiciário · Cargo Efetivo · 2024   │
│                                              │
│ [🟢 Classificado — aguardando convocação]   │
│                                              │
│ Inscrição: 2024001234 · Banca: CEBRASPE     │
│ [🔗 Edital] [📋 Histórico de pesquisas: 3] │
└─────────────────────────────────────────────┘

STATUS BADGES:
- waiting_result: bg-slate-700/50 text-slate-400 "Aguardando resultado"
- classified_waiting: bg-blue-500/10 text-blue-400 border border-blue-900 "Classificado ✦"
- summoned: bg-orange-500/10 text-orange-400 border border-orange-900 "🚨 CONVOCADO"
- taking_office: bg-green-500/10 text-green-400 border border-green-900 "✅ Em posse"
- eliminated: bg-red-500/10 text-red-400 border border-red-900 "❌ Eliminado"

MODAL DE ADICIONAR/EDITAR CONCURSO:
- Overlay dark
- Formulário com os campos:
  * Órgão/Instituição (input text, obrigatório)
  * Cargo (input text, obrigatório)
  * Ano (select 2020-2026)
  * Status (select com labels em PT-BR)
  * Número de inscrição (input text)
  * Banca organizadora (input text)
  * Link do edital (input url)
  * Observações (textarea 3 linhas)
  * Toggle "Concurso ativo" (padrão: ativo)
- Botões: Cancelar | Salvar

Pré-populate com os 7 concursos: TJBA, Polícia Civil BA, INSS, Correios, EMBASA, IBGE, Receita Federal
```

---

## PROMPT 7 — Palavras-chave

```
Implemente a página /keywords (Palavras-chave de Busca):

HEADER:
- Título: "Palavras-chave"
- Subtítulo: "18 palavras configuradas · 16 ativas"
- Botão: "+ Adicionar palavra"

LEGENDA DE CATEGORIAS:
- 🟢 Positivo (convocação, aprovação)
- 🔴 Negativo (eliminação, desclassificação)  
- ⚪ Neutro (recursos, prazo)

GRID DE KEYWORDS (3 colunas desktop, 2 tablet, 1 mobile):
Cada palavra como chip/card:

[CHIP COM RESULTADO]:
bg-slate-800 border border-slate-700 rounded-xl p-4
- Prioridade no canto: "🔴 Alta" (badge pequeno)
- Palavra: "Convocação" (text-lg font-semibold text-white)
- Categoria: tag colorida por tipo
- Status: Toggle switch (ativo/inativo)
- Rodapé: "encontrada 2 vezes · padrão do sistema"
- Hover: border-slate-500

[CHIP DESATIVADO]:
- opacity-50
- Toggle desligado (cinza)
- Texto riscado não, mas mais apagado

PALAVRAS PADRÃO DO SISTEMA:
- Convocação (Alta/Positivo) ✅
- Nomeação (Alta/Positivo) ✅
- Nomeado (Alta/Positivo) ✅
- Convocado (Alta/Positivo) ✅
- Homologação (Média/Positivo) ✅
- Resultado Final (Média/Positivo) ✅
- Posse (Alta/Positivo) ✅
- Cadastro Reserva (Média/Positivo) ✅
- Classificação (Média/Positivo) ✅
- Eliminação (Alta/Negativo) ✅
- Eliminado (Alta/Negativo) ✅
- Recursos (Baixa/Neutro) ✅
- Prazo (Média/Neutro) ✅
- Aprovado (Alta/Positivo) ✅
- Habilitado (Média/Positivo) ✅

MODAL ADICIONAR PALAVRA:
- Campo: palavra ou frase
- Prioridade: select (Alta/Média/Baixa)
- Categoria: select (Positivo/Negativo/Neutro)
- Preview: "A pesquisa buscará por: [palavra]"
- Botões: Cancelar | Adicionar
```

---

## PROMPT 8 — Configurações

```
Implemente a página /settings (Configurações) com 4 sub-seções:

NAVEGAÇÃO INTERNA (tabs verticais lado esquerdo):
- Perfil
- Notificações  [badge se não configurado]
- Agendamento
- Diários
- Aparência

==== ABA: PERFIL ====
- Nome completo (input text)
- E-mail (somente leitura, com badge "verificado")
- CPF (input com máscara, dica: "Usado para busca adicional — não é obrigatório")
- RG (input text)
- Variações do nome (lista editável):
  * Mostra todas as variações geradas
  * Botão de remover em cada uma (x)
  * Botão "+ Adicionar variação manual"
  * Botão "🔄 Regenerar automaticamente"
- Botão "Salvar alterações" (blue-600)
- Seção perigosa: "Alterar senha" (collapsible)

==== ABA: NOTIFICAÇÕES ====
TELEGRAM:
- Status: "⚪ Não configurado" ou "✅ Configurado"
- Guia passo a passo expansível "Como configurar":
  1. Abra o Telegram
  2. Busque @BotFather
  3. /newbot e siga instruções
  4. Copie o token
- Input: "Token do Bot" (masked input, show/hide)
- Input: "Seu Chat ID" com link "Como encontrar?"
- Botão: "Enviar mensagem de teste" (outline)
  → Feedback: "✅ Mensagem enviada!" ou "❌ Erro: token inválido"
- Toggle: "Ativar notificações Telegram"
- Salvar

E-MAIL:
- Input: "E-mail para alertas"
- Toggle: "Ativar notificações por e-mail"
- Salvar

==== ABA: AGENDAMENTO ====
- "Horário da pesquisa diária"
  → Slider de hora: 00:00 às 23:00 (valor padrão: 06:00)
  → Display: "Todos os dias às 06:00"

- "Frequência"
  → Radio: Diária (padrão) / A cada 6h / A cada 12h / Apenas manual

- "Próximas execuções previstas":
  * 23/07/2026 — 06:00
  * 24/07/2026 — 06:00
  * ...

- Toggle "Pesquisa automática ativada" (master switch)

==== ABA: DIÁRIOS ====
- Cards toggleáveis para cada diário:
  *DOBA — Diário Oficial da Bahia ✅ (ativo)
  * DOU Seção 1 — Atos do Executivo ✅
  * DOU Seção 2 — Concursos ✅
  * DOU Seção 3 — Contratos/Licitações (inativo)
  * Diário da Justiça TRT (em breve — bloqueado)
  * TCE-BA (em breve — bloqueado)
  
- "Retenção de PDFs":
  → Select: 30 dias / 60 dias / 90 dias / Indefinido

==== ABA: APARÊNCIA ====
- Tema: 3 opções visuais com preview
  * Claro (preview card branco)
  * Escuro (preview card slate-900) ← padrão atual
  * Sistema (segue o SO)
```

---

## PROMPT 9 — Tela de Login e Onboarding

```
Implemente as telas de autenticação e onboarding:

TELA DE LOGIN (/login):
- Layout: dividido em 2 (desktop) — esquerda ilustração, direita formulário
- Lado esquerdo (hidden em mobile): 
  * Background gradient: from-blue-950 to-slate-900
  * Logo grande + nome do sistema
  * 3 bullets de benefícios:
    - "🔍 Monitoramento automático diário"
    - "🚨 Alertas instantâneos no Telegram"
    - "📋 Histórico completo com resumo IA"
  
- Lado direito / tela inteira (mobile):
  * bg-slate-900
  * Logo pequeno (mobile) ou sem logo (desktop)
  * "Bem-vindo de volta" (text-2xl font-bold)
  * Formulário:
    - E-mail (input com ícone Mail)
    - Senha (input com show/hide toggle)
    - Link "Esqueceu a senha?"
    - Botão "Entrar" (blue-600, full-width)
  * Separador "ou"
  * Link "Não tem conta? Criar conta →"
  
- Estados: loading (spinner no botão), erro (border vermelho + mensagem)

WIZARD DE ONBOARDING (5 passos):
- Progress bar no topo: passos como dots conectados
- Passo 1: Nome completo
  * "Como você se chama?" (h2 central)
  * Exemplo como placeholder
  * Preview das variações abaixo do campo (aparece ao digitar)
  
- Passo 2: Revisar variações
  * Lista com chips das variações geradas
  * Cada chip tem botão X para remover
  * Botão "+ Adicionar variação"
  
- Passo 3: Seus concursos
  * Lista de concursos pré-definidos com checkbox para selecionar
  * Botão "Adicionar outro..."
  
- Passo 4: Configurar Telegram (opcional)
  * Layout simplificado da config de Telegram
  * Botão "Pular por enquanto" (text-slate-400)
  
- Passo 5: Confirmação
  * Resumo do configurado
  * "Quer pesquisar nos últimos 30 dias agora?" (toggle, padrão: ativado)
  * Botão "Começar!" (blue-600 grande)
```

---

## PROMPT 10 — Responsividade Mobile

```
Ajuste toda a interface para funcionar perfeitamente em telas mobile (375px - 430px):

1. SIDEBAR → BOTTOM NAV:
- Em telas < 768px, ocultar a sidebar completamente
- Mostrar bottom navigation bar fixada no rodapé:
  * 5 ícones: Dashboard, Pesquisa, Histórico, Concursos, Configurações
  * Ativo: ícone azul + label azul pequena
  * Inativo: ícone slate-500
  * Altura: 64px + safe area bottom (padding-bottom: env(safe-area-inset-bottom))
  * Borda topo: border-t border-slate-800
  * Background: bg-slate-900/95 backdrop-blur

2. DASHBOARD MOBILE:
- Cards de stats: 1 coluna (full-width cada)
- Status dos diários: empilhados verticalmente
- Gráfico: altura reduzida para 100px
- Últimos resultados: cards menores

3. LISTAS E TABELAS:
- Todo item de lista ocupa width total
- Ações secundárias em menu de 3 pontos (MoreVertical)
- Long press ou swipe para revelar ações

4. MODAIS:
- Em mobile: bottom sheet (animação slide-up)
- Max height: 90vh com scroll interno
- Drag indicator no topo (barra cinza small)

5. FORMULÁRIOS:
- Inputs full-width
- Label acima (nunca ao lado)
- Botões empilhados (cancel embaixo de save)

6. VISUALIZADOR DE PDF:
- Ocupa full-screen em mobile
- Controles flutuantes sobre o PDF
- Botão X para fechar no canto superior direito

7. TIPOGRAFIA MOBILE:
- Reduzir títulos: text-xl ao invés de text-2xl
- Aumentar tamanho de toque mínimo: 44x44px em todos os botões e links
```

---

## PROMPT 11 — Animações e Polimento Final

```
Adicione animações e micro-interações premium ao sistema:

1. ENTRADA DE PÁGINA:
- Cada página aparece com fade-in suave (opacity 0→1, translateY 8px→0)
- Duração: 200ms ease-out
- Cards aparecem sequencialmente (stagger de 50ms cada)

2. CARDS HOVER:
- Escala sutil: hover:scale-[1.01]
- Sombra aumenta: shadow-sm → shadow-lg
- Borda ilumina: border-slate-700 → border-slate-600
- Transição: 150ms ease

3. PROGRESS BAR DA PESQUISA:
- Atualiza suavemente (transition: width 500ms ease-out)
- Animação de "shimmer" enquanto processando (gradiente deslizante)
- Pulso suave nas bolinhas de step ativos

4. NOTIFICAÇÃO DE MATCH EM TEMPO REAL:
- Toast aparece no canto superior direito com slide-in
- Cor: bg-red-600 com glow (box-shadow: 0 0 20px rgba(239,68,68,0.4))
- Permanece 10 segundos
- Botão de fechar no canto
- Vibração suave se suportado (navigator.vibrate)

5. BOTÃO "PESQUISAR AGORA":
- Estado normal: ícone Search estático
- Hover: ícone levemente rotacionado
- Loading: ícone vira spinner (animate-spin)
- Success: ícone muda para CheckCircle2 por 2s

6. INDICADORES DE STATUS:
- Sistema "online": dot verde com ping animation (animate-ping)
- Sistema "processando": dot azul pulsante
- Sistema "offline": dot vermelho estático

7. NÚMERO NO BADGE:
- Quando muda: bounce animation (scale 1→1.4→1)

8. TOGGLE SWITCHES:
- Transição suave do knob (300ms)
- Cor muda de slate-600 para blue-600

9. SIDEBAR NAV ITEM:
- Indicador ativo: barra azul esquerda cresce suavemente em altura

10. SKELETON LOADING:
- Todos os estados de carregamento com skeleton animado
- Usar animate-pulse com bg-slate-700

Use CSS animations e Tailwind animate-* onde possível.
Para animações custom, adicionar no tailwind.config.js keyframes.
```

---

## PROMPT DE CORREÇÃO (usar quando algo não ficou certo)

```
Na página [NOME_DA_PÁGINA], corrija os seguintes problemas:

1. [Descreva o problema específico]
2. [Segundo problema]

Mantenha todo o restante exatamente como está.
Foque apenas nessas correções.
```

---

## Checklist Antes de Cada Prompt

- [ ] Revisei o resultado do prompt anterior
- [ ] O tema escuro está correto?
- [ ] Os componentes estão responsivos?
- [ ] Os estados de loading e error estão implementados?
- [ ] Passei para o próximo prompt na ordem correta?

---

*Prompts gerados em: Julho/2026*  
*Para uso com: Lovable.dev*
