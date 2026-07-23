import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Search,
  FileText,
  Trophy,
  Tag,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: number;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: BarChart3 },
  { label: "Pesquisa", to: "/pesquisa", icon: Search },
  { label: "Histórico", to: "/historico", icon: FileText, badge: 3 },
  { label: "Concursos", to: "/concursos", icon: Trophy },
  { label: "Palavras-chave", to: "/palavras-chave", icon: Tag },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
];

function useIsActive(path: string) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

function NavRow({ item }: { item: NavItem }) {
  const active = useIsActive(item.to);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={[
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
        active
          ? "bg-primary/15 font-medium text-primary-glow"
          : "text-muted-foreground hover:bg-card hover:text-foreground hover:translate-x-0.5",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-primary transition-all duration-300 ease-out",
          active ? "h-6 opacity-100" : "h-0 opacity-0",
        ].join(" ")}
      />
      <Icon
        className={[
          "h-4 w-4 shrink-0 transition-transform duration-200",
          "group-hover:scale-110",
        ].join(" ")}
        strokeWidth={2}
      />
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <span
          key={item.badge}
          className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground animate-bounce-in"
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary shadow-elegant">
          <Search className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            Diário Inteligente
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Monitoramento
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </nav>

      <div className="h-px bg-border" />

      {/* User footer */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          M
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            Maria Silva
          </div>
          <div className="truncate text-xs text-muted-foreground">
            maria@exemplo.com
          </div>
        </div>
      </div>
    </aside>
  );
}
