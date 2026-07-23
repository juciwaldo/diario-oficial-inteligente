import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/app-shell";

export const Route = createFileRoute("/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisa — Diário Inteligente" },
      {
        name: "description",
        content: "Pesquise nomes e termos nos Diários Oficiais monitorados.",
      },
      { property: "og:title", content: "Pesquisa — Diário Inteligente" },
      {
        property: "og:description",
        content: "Pesquise nomes e termos nos Diários Oficiais monitorados.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <PageHeader
        title="Pesquisa"
        description="Consulte nomes e termos nos Diários Oficiais."
      />
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-card">
        Em breve.
      </div>
    </AppShell>
  ),
});
