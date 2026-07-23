import { Link, useRouterState } from "@tanstack/react-router";
import { navItems } from "./app-sidebar";

// Bottom nav mostra 5 itens principais (esconde "Palavras-chave" para caber)
const bottomItems = navItems.filter((i) => i.label !== "Palavras-chave");

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-16 grid-cols-5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <li key={item.to} className="flex">
              <Link
                to={item.to}
                aria-label={item.label}
                className={[
                  "relative flex min-h-[44px] w-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors",
                  active
                    ? "text-blue-400"
                    : "text-slate-500 hover:text-slate-200",
                ].join(" ")}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {item.badge ? (
                    <span className="absolute -right-2 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="truncate leading-none">{item.label}</span>
                {active && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-blue-500" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
