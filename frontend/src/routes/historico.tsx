import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { SearchDialog } from "@/components/search/search-dialog";
import { cn } from "@/lib/utils";
import { search as searchApi, type ApiHistoryRecord } from "@/services/api";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Diário Inteligente" },
      {
        name: "description",
        content:
          "Todas as pesquisas realizadas nos Diários Oficiais, agrupadas por data.",
      },
      { property: "og:title", content: "Histórico — Diário Inteligente" },
      {
        property: "og:description",
        content:
          "Reveja pesquisas passadas, filtre por diário e veja citações encontradas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoricoPage,
});

type DiarioFilter = "all" | "DOBA" | "DOU";
type PeriodoFilter = "any" | "today" | "week" | "month";

function isInPeriod(iso: string, p: PeriodoFilter) {
  if (p === "any") return true;
  try {
    const d = parseISO(iso);
    const now = new Date();
    const ms = now.getTime() - d.getTime();
    if (p === "today") return d.toDateString() === now.toDateString();
    if (p === "week") return ms <= 7 * 864e5;
    if (p === "month") return ms <= 30 * 864e5;
  } catch {}
  return true;
}

function HistoricoPage() {
  const [diario, setDiario] = useState<DiarioFilter>("all");
  const [periodo, setPeriodo] = useState<PeriodoFilter>("any");
  const [onlyResults, setOnlyResults] = useState(false);
  const [limit, setLimit] = useState(20);
  const [openSearch, setOpenSearch] = useState(false);
  const [records, setRecords] = useState<ApiHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await searchApi.getHistory(
        1,
        100,
        diario === "all" ? undefined : diario,
        onlyResults,
      );
      setRecords(res.records || []);
    } catch (err: any) {
      toast.error(err?.message || "Falha ao carregar histórico");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diario, onlyResults]);

  const hasFilters = diario !== "all" || periodo !== "any" || onlyResults;

  const filtered = useMemo(() => {
    return records.filter((p) => isInPeriod(p.edition_date, periodo));
  }, [records, periodo]);

  const visible = filtered.slice(0, limit);

  const groups = useMemo(() => {
    const map = new Map<string, ApiHistoryRecord[]>();
    for (const p of visible) {
      const key = (p.edition_date || "").slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [visible]);

  const isEmpty = records.length === 0;

  const clearFilters = () => {
    setDiario("all");
    setPeriodo("any");
    setOnlyResults(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Histórico de Pesquisas"
        description="Reveja todas as pesquisas executadas pelo sistema."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={diario}
          onChange={(v) => setDiario(v as DiarioFilter)}
          options={[
            { value: "all", label: "Todos os diários" },
            { value: "DOBA", label: "DOBA" },
            { value: "DOU", label: "DOU" },
          ]}
        />
        <FilterSelect
          value={periodo}
          onChange={(v) => setPeriodo(v as PeriodoFilter)}
          options={[
            { value: "any", label: "Qualquer período" },
            { value: "today", label: "Hoje" },
            { value: "week", label: "Esta semana" },
            { value: "month", label: "Este mês" },
          ]}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600">
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border transition",
              onlyResults
                ? "border-blue-500 bg-blue-600"
                : "border-slate-500 bg-slate-900",
            )}
          >
            {onlyResults && (
              <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
            )}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={onlyResults}
            onChange={(e) => setOnlyResults(e.target.checked)}
          />
          Mostrar apenas com resultado
        </label>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState onSearch={() => setOpenSearch(true)} />
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-sm text-slate-400">
            Nenhuma pesquisa corresponde aos filtros atuais.
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {groups.map(([date, items]) => (
                <div key={date}>
                  <DateSeparator date={date} />
                  <ul className="mt-4 space-y-2">
                    {items.map((p) => (
                      <PesquisaRow key={p.id} p={p} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              {visible.length < filtered.length && (
                <button
                  onClick={() => setLimit((l) => l + 20)}
                  className="rounded-lg px-5 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Carregar mais
                </button>
              )}
              <p className="text-xs text-slate-500">
                Exibindo {visible.length} de {filtered.length} pesquisas
              </p>
            </div>
          </>
        )}
      </div>

      <SearchDialog
        open={openSearch}
        onOpenChange={(v) => {
          setOpenSearch(v);
          if (!v) load();
        }}
      />
    </AppShell>
  );
}

function DateSeparator({ date }: { date: string }) {
  let label = date;
  try {
    label = format(parseISO(date), "d 'de' MMMM 'de' yyyy, EEEE", {
      locale: ptBR,
    });
  } catch {}
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="h-px flex-1 bg-slate-800" />
    </div>
  );
}

function PesquisaRow({ p }: { p: ApiHistoryRecord }) {
  const time = safeTime(p.created_at);
  const found = p.matches_found > 0;
  const duration = `${Math.round(p.duration_seconds || 0)}s`;

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800 px-4 py-3 transition hover:bg-slate-800/60">
      {found ? (
        <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      ) : (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-700" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {found && (
            <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
              {p.matches_found} resultado{p.matches_found > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-sm text-slate-200">
            {found ? (
              <>
                {time} · {p.journal} · {p.pages_searched} páginas
              </>
            ) : (
              <span className="text-slate-400">
                {time} · {p.journal} · {p.pages_searched} páginas · 0 resultados
              </span>
            )}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{duration}</p>
      </div>

      {found && (
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/historico/$id"
            params={{ id: p.id }}
            className="rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-slate-700"
          >
            Ver
          </Link>
        </div>
      )}
    </li>
  );
}

function safeTime(iso: string) {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-slate-700 bg-slate-800 pl-3 pr-8 text-sm text-slate-200 transition hover:border-slate-600 focus:border-blue-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-800">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function EmptyState({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-800/40 py-16 text-center">
      <FileText className="h-16 w-16 text-slate-700" strokeWidth={1.5} />
      <h3 className="mt-4 text-base font-semibold text-slate-200">
        Nenhuma pesquisa realizada ainda.
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        O sistema executará automaticamente todos os dias no horário definido.
      </p>
      <button
        onClick={onSearch}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <Search className="h-4 w-4" />
        Pesquisar agora
      </button>
    </div>
  );
}
