# Guia de UI/UX — Diário Inteligente
**Design System: Cores, Tipografia, Componentes e Responsividade**

**Versão:** 1.0  
**Data:** Julho/2026  
**Stack:** Next.js + Tailwind CSS + shadcn/ui

---

## Sumário

1. [Filosofia de Design](#1-filosofia-de-design)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento e Grid](#4-espaçamento-e-grid)
5. [Componentes Base](#5-componentes-base)
6. [Ícones e Status Visuais](#6-ícones-e-status-visuais)
7. [Temas (Claro e Escuro)](#7-temas-claro-e-escuro)
8. [Layout e Navegação](#8-layout-e-navegação)
9. [Responsividade](#9-responsividade)
10. [Animações e Micro-interações](#10-animações-e-micro-interações)
11. [Acessibilidade](#11-acessibilidade)
12. [Configuração Tailwind](#12-configuração-tailwind)

---

## 1. Filosofia de Design

### 1.1 Princípios

**Clareza acima de tudo**
O sistema lida com informações críticas (convocações, prazos). A interface deve transmitir informações sem ambiguidade. Hierarquia visual clara, sem ruído.

**Urgência e calma**
Alertas devem ser imediatamente perceptíveis (vermelho, ícone de alerta). Mas o estado "normal" (sem resultados) deve ser tranquilizador e não ansioso.

**Eficiência**
O usuário acessa o sistema para verificar se foi encontrado. O dashboard deve responder essa pergunta em menos de 3 segundos de leitura.

**Confiança**
Design que transmite confiabilidade: sistema monitorando 24/7. Mostrar status em tempo real, última atualização, próxima pesquisa.

### 1.2 Referências Visuais

- **Linear** — interface limpa com sidebar elegante
- **Vercel Dashboard** — métricas e status em cards minimalistas
- **Notion** — tipografia confortável para leitura
- **Tailwind UI** — componentes bem estruturados

---

## 2. Paleta de Cores

### 2.1 Cores Primárias

```css
/* Azul profissional — cor de ação e links */
--primary-50:  #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;   /* ← Principal */
--primary-600: #2563EB;   /* ← Hover */
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;
```

### 2.2 Cores de Status

```css
/* Verde — sucesso, sem problemas */
--success-light: #DCFCE7;
--success:       #22C55E;
--success-dark:  #16A34A;

/* Vermelho — alerta crítico, resultado encontrado */
--danger-light:  #FEE2E2;
--danger:        #EF4444;
--danger-dark:   #DC2626;

/* Âmbar — aviso, atenção */
--warning-light: #FEF9C3;
--warning:       #EAB308;
--warning-dark:  #CA8A04;

/* Cinza neutro — sem resultado, aguardando */
--neutral-light: #F3F4F6;
--neutral:       #6B7280;
--neutral-dark:  #374151;
```

### 2.3 Cores de Background

```css
/* Tema Claro */
--bg-primary:    #FFFFFF;
--bg-secondary:  #F9FAFB;
--bg-tertiary:   #F3F4F6;
--border:        #E5E7EB;
--border-focus:  #3B82F6;

/* Tema Escuro */
--bg-primary-dark:   #0F172A;  /* slate-900 */
--bg-secondary-dark: #1E293B;  /* slate-800 */
--bg-tertiary-dark:  #334155;  /* slate-700 */
--border-dark:       #475569;  /* slate-600 */
```

### 2.4 Cores de Texto

```css
/* Tema Claro */
--text-primary:   #111827;  /* gray-900 */
--text-secondary: #6B7280;  /* gray-500 */
--text-tertiary:  #9CA3AF;  /* gray-400 */

/* Tema Escuro */
--text-primary-dark:   #F1F5F9;  /* slate-100 */
--text-secondary-dark: #94A3B8;  /* slate-400 */
--text-tertiary-dark:  #64748B;  /* slate-500 */
```

### 2.5 Cores Especiais

```css
/* Cor de destaque do nome encontrado no PDF */
--highlight-bg:   #FEF08A;  /* yellow-200 */
--highlight-text: #713F12;  /* yellow-900 */

/* Gradient do sidebar */
--sidebar-gradient: linear-gradient(
    180deg, 
    #0F172A 0%, 
    #1E293B 100%
);
```

---

## 3. Tipografia

### 3.1 Fonte Principal

```css
/* Google Fonts — Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### 3.2 Escala Tipográfica

| Nome | Tamanho | Peso | Line Height | Uso |
|---|---|---|---|---|
| `display` | 2.25rem (36px) | 700 | 1.2 | Títulos de página |
| `h1` | 1.875rem (30px) | 700 | 1.3 | Cabeçalhos principais |
| `h2` | 1.5rem (24px) | 600 | 1.3 | Seções |
| `h3` | 1.25rem (20px) | 600 | 1.4 | Sub-seções |
| `h4` | 1.125rem (18px) | 600 | 1.4 | Cards |
| `body-lg` | 1rem (16px) | 400 | 1.6 | Texto principal |
| `body` | 0.875rem (14px) | 400 | 1.5 | Texto secundário |
| `body-sm` | 0.8125rem (13px) | 400 | 1.5 | Metadados, labels |
| `caption` | 0.75rem (12px) | 400 | 1.5 | Legendas, timestamps |
| `code` | 0.875rem (14px) | 400 | 1.6 | Trechos de código |

```css
/* Tailwind classes correspondentes */
display:   text-4xl font-bold
h1:        text-3xl font-bold
h2:        text-2xl font-semibold
h3:        text-xl font-semibold
h4:        text-lg font-semibold
body-lg:   text-base font-normal
body:      text-sm font-normal
body-sm:   text-[13px] font-normal
caption:   text-xs font-normal
```

### 3.3 Fonte Mono (para trechos de diário)

```css
/* Para exibir trechos dos diários oficiais */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

---

## 4. Espaçamento e Grid

### 4.1 Sistema de Espaçamento

Base: **4px** (0.25rem)

| Token | Valor | px | Uso |
|---|---|---|---|
| `space-1` | 0.25rem | 4px | Micro espaçamento |
| `space-2` | 0.5rem | 8px | Espaço interno pequeno |
| `space-3` | 0.75rem | 12px | Padding de chips/badges |
| `space-4` | 1rem | 16px | Espaçamento padrão |
| `space-5` | 1.25rem | 20px | Entre itens de lista |
| `space-6` | 1.5rem | 24px | Padding de cards |
| `space-8` | 2rem | 32px | Seções |
| `space-10` | 2.5rem | 40px | Grandes seções |
| `space-12` | 3rem | 48px | Entre seções da página |
| `space-16` | 4rem | 64px | Padding de página |

### 4.2 Layout Principal

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixo)  │  CONTEÚDO (flex-grow)      │
│                         │                            │
│  ← 240px →             │  ← max-width: 1200px →     │
│                         │  padding: 24px             │
└─────────────────────────────────────────────────────┘

Mobile (< 768px): sidebar colapsa para nav inferior
```

### 4.3 Grid de Cards

```css
/* Dashboard stats cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

/* Tailwind */
class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
```

---

## 5. Componentes Base

### 5.1 Botões

```jsx
/* Primary */
<Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
    Pesquisar Agora
</Button>

/* Secondary */
<Button variant="outline" className="border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg">
    Cancelar
</Button>

/* Danger */
<Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
    Excluir
</Button>

/* Ghost */
<Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg">
    Configurações
</Button>
```

### 5.2 Cards

```jsx
/* Card base */
<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 
               rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    {/* conteúdo */}
</div>

/* Card de Resultado (Alerta) */
<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 
               rounded-xl p-5">
    <div className="flex items-start gap-3">
        <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
            {/* conteúdo do alerta */}
        </div>
    </div>
</div>

/* Card de Stats */
<div className="bg-white dark:bg-slate-800 border rounded-xl p-5">
    <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">
        Total de Pesquisas
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
        127
    </div>
    <div className="text-xs text-gray-400 mt-1">
        Desde o início
    </div>
</div>
```

### 5.3 Badges de Status

```jsx
/* Status dos concursos */
const StatusBadge = ({ status }) => {
    const variants = {
        waiting_result:     "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300",
        classified_waiting: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        summoned:           "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
        taking_office:      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        eliminated:         "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        closed:             "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500",
    };
    
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
            {statusLabels[status]}
        </span>
    );
};
```

### 5.4 Input Fields

```jsx
/* Input padrão */
<div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
        Nome completo
    </label>
    <input 
        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 
                   rounded-lg bg-white dark:bg-slate-800 
                   text-gray-900 dark:text-white
                   placeholder-gray-400 dark:placeholder-slate-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-shadow"
        placeholder="Ex: Jucivaldo Souza dos Santos"
    />
    <p className="text-xs text-gray-500">
        O sistema pesquisará variações deste nome.
    </p>
</div>
```

### 5.5 Progress Bar

```jsx
/* Progresso de pesquisa */
<div className="space-y-2">
    <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-slate-400">Analisando DOBA...</span>
        <span className="font-medium">52%</span>
    </div>
    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: '52%' }}
        />
    </div>
    <div className="text-xs text-gray-400">87 de 167 páginas</div>
</div>
```

---

## 6. Ícones e Status Visuais

### 6.1 Biblioteca de Ícones

Usar **Lucide React** (já incluído no shadcn/ui):

```jsx
import { 
    Search,        // Pesquisar
    Bell,          // Notificações
    FileText,      // Documentos/PDFs
    Trophy,        // Concursos
    Tag,           // Palavras-chave
    Settings,      // Configurações
    BarChart3,     // Dashboard
    AlertCircle,   // Alerta/resultado encontrado
    CheckCircle2,  // Sucesso
    XCircle,       // Erro
    Clock,         // Agendamento
    Download,      // Download
    Eye,           // Visualizar
    RefreshCw,     // Atualizar/re-pesquisar
    Zap,           // Pesquisa rápida/instantânea
    Calendar,      // Data
    ChevronRight,  // Navegação
} from 'lucide-react';
```

### 6.2 Indicadores de Status do Sistema

```jsx
/* Status indicator dot */
const StatusDot = ({ status }) => (
    <span className={`
        inline-block w-2 h-2 rounded-full
        ${status === 'ok' ? 'bg-green-500' : ''}
        ${status === 'warning' ? 'bg-yellow-500' : ''}
        ${status === 'error' ? 'bg-red-500 animate-pulse' : ''}
        ${status === 'running' ? 'bg-blue-500 animate-pulse' : ''}
    `} />
);
```

### 6.3 Indicador de Resultado no Histórico

```jsx
/* Linha do histórico */
const HistoryRow = ({ search }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-slate-800">
        {search.matches_found > 0 ? (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        ) : (
            <CheckCircle2 className="w-5 h-5 text-gray-300 dark:text-slate-600 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
                {search.document.journal_name} — {formatDate(search.document.edition_date)}
            </div>
            <div className="text-xs text-gray-400">
                {search.pages_searched} páginas · {formatDuration(search.duration_seconds)}
            </div>
        </div>
        {search.matches_found > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {search.matches_found} resultado{search.matches_found > 1 ? 's' : ''}
            </span>
        )}
    </div>
);
```

---

## 7. Temas (Claro e Escuro)

### 7.1 Implementação com Tailwind

```js
// tailwind.config.js
module.exports = {
    darkMode: 'class',  // Toggleado via JavaScript
    // ...
}
```

```jsx
// Componente de toggle de tema
const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    
    return (
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
    );
};
```

### 7.2 Tema Escuro (Padrão para desenvolvedor)

```css
/* Fundo principal muito escuro */
.dark body { background: #0F172A; }

/* Cards levemente mais claros */
.dark .card { background: #1E293B; }

/* Texto principal claro */
.dark .text-primary { color: #F1F5F9; }

/* Accent azul mantido */
.dark .accent { color: #60A5FA; }
```

### 7.3 Sidebar no Tema Escuro

```jsx
<aside className="
    w-60 h-screen fixed left-0 top-0
    bg-slate-900 border-r border-slate-800
    flex flex-col
">
    {/* Logo */}
    <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
            </div>
            <div>
                <div className="text-sm font-semibold text-white">Diário Inteligente</div>
                <div className="text-xs text-slate-400">Monitoramento</div>
            </div>
        </div>
    </div>
    
    {/* Nav Items */}
    <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
            <NavItem key={item.href} {...item} />
        ))}
    </nav>
    
    {/* User */}
    <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-400">J</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">Jucivaldo</div>
                <div className="text-xs text-slate-500 truncate">jucivaldo@email.com</div>
            </div>
        </div>
    </div>
</aside>
```

---

## 8. Layout e Navegação

### 8.1 Sidebar Desktop

```
SIDEBAR (240px)
┌────────────────────┐
│ 🔍 Diário Intel.   │  ← Logo
│    Monitoramento   │
├────────────────────┤
│                    │
│ ▣  Dashboard       │  ← Ativo: fundo azul
│ 🔍 Pesquisa        │
│ 📋 Histórico   3   │  ← Badge com notificação
│ 🏆 Concursos       │
│ 🏷️  Palavras-chave  │
│ ⚙️  Configurações   │
│                    │
├────────────────────┤
│ J Jucivaldo        │  ← Avatar + nome
│   jucivaldo@...    │
└────────────────────┘
```

### 8.2 NavItem Component

```jsx
const NavItem = ({ href, icon: Icon, label, badge }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link href={href} className={`
            flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            transition-colors duration-150
            ${isActive 
                ? 'bg-blue-600/15 text-blue-400 font-medium' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }
        `}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
};
```

### 8.3 Header da Página

```jsx
const PageHeader = ({ title, description, action }) => (
    <div className="flex items-start justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
            </h1>
            {description && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    {description}
                </p>
            )}
        </div>
        {action}
    </div>
);
```

---

## 9. Responsividade

### 9.1 Breakpoints

| Breakpoint | px | Tailwind | Layout |
|---|---|---|---|
| Mobile | < 640px | (default) | Sidebar → Bottom nav |
| Tablet | 640-1024px | `sm:`, `md:` | Sidebar colapsada |
| Desktop | > 1024px | `lg:` | Sidebar expandida |
| Wide | > 1280px | `xl:` | Content max-width |

### 9.2 Mobile Navigation (Bottom Nav)

```jsx
/* Em telas menores que md: */
<nav className="fixed bottom-0 left-0 right-0 
               bg-white dark:bg-slate-900 
               border-t border-gray-200 dark:border-slate-800
               flex md:hidden z-50">
    {navItems.slice(0, 5).map(item => (
        <MobileNavItem key={item.href} {...item} />
    ))}
</nav>
```

### 9.3 Cards Responsivos

```jsx
/* Stats grid — 1 col mobile, 2 tablet, 4 desktop */
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {/* cards */}
</div>

/* Tabela → Cards em mobile */
<div className="hidden md:block">
    <Table>...</Table>
</div>
<div className="block md:hidden space-y-3">
    {items.map(item => <MobileCard key={item.id} item={item} />)}
</div>
```

---

## 10. Animações e Micro-interações

### 10.1 Transições Base

```css
/* Todas as transições suaves */
* {
    transition-property: color, background-color, border-color, opacity, transform;
    transition-duration: 150ms;
    transition-timing-function: ease;
}
```

### 10.2 Progress Bar Animada

```jsx
/* Barra de progresso suave */
<div 
    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
    style={{ width: `${percentage}%` }}
/>
```

### 10.3 Skeleton Loading

```jsx
/* Skeleton para cards carregando */
const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
    </div>
);
```

### 10.4 Notificação de Match (Toast)

```jsx
/* Toast quando novo resultado é encontrado em tempo real */
toast.custom((t) => (
    <div className={`
        bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg
        flex items-center gap-3 max-w-sm
        ${t.visible ? 'animate-slide-in' : 'animate-slide-out'}
    `}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
            <div className="font-semibold">🚨 Resultado encontrado!</div>
            <div className="text-sm text-red-100">
                Página 52 do DOBA — Convocação
            </div>
        </div>
    </div>
), { duration: 10000 });
```

### 10.5 Animação de Pulse para Status

```jsx
/* Indicador pulsante enquanto processando */
<div className="flex items-center gap-2">
    <div className="relative">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-75" />
    </div>
    <span className="text-sm text-blue-500">Processando...</span>
</div>
```

---

## 11. Acessibilidade

### 11.1 Contraste

| Combinação | Ratio | Status |
|---|---|---|
| Texto cinza (#111827) em branco (#FFF) | 16:1 | ✅ AAA |
| Texto azul (#2563EB) em branco (#FFF) | 6.1:1 | ✅ AA |
| Texto slate-100 em slate-900 | 15:1 | ✅ AAA |
| Danger text em danger-light | 4.6:1 | ✅ AA |

### 11.2 Keyboard Navigation

```jsx
/* Focus rings visíveis */
<button className="
    focus:outline-none 
    focus-visible:ring-2 
    focus-visible:ring-blue-500 
    focus-visible:ring-offset-2
">
```

### 11.3 Labels e ARIA

```jsx
/* Sempre usar label para inputs */
<label htmlFor="email-input" className="sr-only">
    E-mail
</label>
<input id="email-input" type="email" aria-required="true" />

/* Status em tempo real */
<div role="status" aria-live="polite" aria-atomic="true">
    {isSearching && "Pesquisando..."}
    {searchDone && `${matchCount} resultados encontrados`}
</div>
```

---

## 12. Configuração Tailwind

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50:  '#EFF6FF',
                    100: '#DBEAFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    900: '#1E3A8A',
                },
                brand: {
                    DEFAULT: '#2563EB',
                    dark: '#1D4ED8',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
            },
            animation: {
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-out': 'slideOut 0.3s ease-in',
                'fade-in': 'fadeIn 0.2s ease-out',
            },
            keyframes: {
                slideIn: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                'card-hover': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
```

---

## Checklist de Qualidade Visual

Antes de considerar uma tela "pronta":

- [ ] Funciona no tema claro **e** escuro?
- [ ] Responsivo em 375px (iPhone SE)?
- [ ] Responsivo em 768px (tablet)?
- [ ] Loading state implementado?
- [ ] Empty state implementado?
- [ ] Estado de erro implementado?
- [ ] Hover states em todos os botões e links?
- [ ] Focus states visíveis (keyboard navigation)?
- [ ] Contraste de texto adequado (≥ 4.5:1)?
- [ ] Textos longos truncam corretamente?
- [ ] Números grandes cabem nos cards?

---

*Documento gerado em: Julho/2026*
