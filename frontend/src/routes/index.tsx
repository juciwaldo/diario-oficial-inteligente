import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { SearchDialog } from "@/components/search/search-dialog";
import {
  dashboard as dashboardApi,
  type ApiDashboardStats,
} from "@/services/api";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Dashboard —Consulta Diário Oficial Inteligente" },
      {
        name: "description",
        content:
          "Visão geral do monitoramento dos seus nomes nos Diários Oficiais.",
      },
      { property: "og:title", content: "Dashboard —Consulta Diário Oficial Inteligente" },
      {
        property: "og:description",
        content:
          "Visão geral do monitoramento dos seus nomes nos Diários Oficiais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});


const diarios = [
  { code: "DOBA", name: "DOBA — Diário Oficial BA", online: true },
  { code: "DOU", name: "DOU — Diário Oficial União", online: true },
];

function useCountdown(target: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    const [h, m] = (target || "06:00").split(":").map(Number);
    const t = new Date(now);
    t.setHours(h || 6, m || 0, 0, 0);
    if (t <= now) t.setDate(t.getDate() + 1);
    const diff = t.getTime() - now.getTime();
    const hh = Math.floor(diff / 3_600_000);
    const mm = Math.floor((diff % 3_600_000) / 60_000);
    return `em ${hh}h ${mm}min`;
  }, [now, target]);
}

function Dashboard() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      toast.error(err?.message || "Falha ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const countdown = useCountdown(stats?.next_search_time || "06:00");

  const lastSearchLabel = stats?.last_search
    ? `${safeDate(stats.last_search.date)} · ${stats.last_search.pages} páginas`
    : "sem dados ainda";

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu monitoramento nos Diários Oficiais."
        action={
          <button
            onClick={() => setOpenConfirm(true)}
            className="group inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-elegant transition-all duration-150 hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
          >
            <Search
              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
              strokeWidth={2.5}
            />
            Pesquisar Agora
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          icon={<Search className="h-5 w-5 text-blue-400" />}
          title="Total de Pesquisas"
          value={loading ? "…" : String(stats?.total_searches ?? 0)}
          label="desde o início"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5 text-red-400" />}
          title="Resultados Encontrados"
          value={loading ? "…" : String(stats?.total_matches ?? 0)}
          label="citações encontradas"
          highlight={
            (stats?.total_matches ?? 0) > 0 ? "border-red-900/50" : ""
          }
        />
        <StatCard
          icon={<FileText className="h-5 w-5 text-green-400" />}
          title="Último Diário Analisado"
          value={stats?.last_search?.journal ?? "—"}
          valueClass="text-xl"
          label={lastSearchLabel}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-400" />}
          title="Próxima Pesquisa"
          value={stats?.next_search_time ?? "06:00"}
          valueClass="text-xl"
          label={countdown}
        />
      </div>

      {/* Status dos Diários */}
      <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-slate-300">
          Status dos Diários
        </h2>
        <ul className="mt-4 space-y-3">
          {diarios.map((d) => (
            <li key={d.code} className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {d.online && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    d.online ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </span>
              <span className="text-sm text-slate-100">{d.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Últimos resultados */}
      <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">
            Últimos resultados
          </h2>
          <Link
            to="/historico"
            className="text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-slate-700/50"
              />
            ))}
          </div>
        ) : !stats?.recent_matches?.length ? (
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-slate-500" />
            <p className="mt-3 text-sm text-slate-400">
              Nenhum resultado ainda. O sistema está monitorando.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-700/60">
            {stats.recent_matches.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span className="truncate text-sm text-slate-100">
                  {r.journal} — {safeDate(r.edition_date)} — pág.{" "}
                  {r.page_number}
                </span>
                {r.keywords_nearby?.[0] && (
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400 ring-1 ring-inset ring-red-500/30">
                    {r.keywords_nearby[0]}
                  </span>
                )}
                <Link
                  to="/historico/$id"
                  params={{ id: r.id }}
                  className="ml-auto rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-slate-700"
                >
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SearchDialog
        open={openConfirm}
        onOpenChange={(v) => {
          setOpenConfirm(v);
          if (!v) load();
        }}
      />
    </AppShell>
  );
}

function safeDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
}

function StatCard({
  icon,
  title,
  value,
  label,
  valueClass = "text-3xl",
  highlight = "",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  label: string;
  valueClass?: string;
  highlight?: string;
}) {
  return (
    <div
      className={`card-hover rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-sm ${highlight}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {icon}
      </div>
      <div className={`mt-3 font-bold text-white ${valueClass}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
