import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <main
        className="md:pl-60 md:pb-0"
        style={{
          paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
        }}
      >
        <div
          key={pathname}
          className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 md:p-8 animate-fade-in-up"
        >
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl sm:truncate">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="sm:shrink-0 [&_button]:w-full sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </header>
  );
}
