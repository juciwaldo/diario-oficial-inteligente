import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Download,
  FileText,
  Loader2,
  Newspaper,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import { search as searchApi, type ApiMatch } from "@/services/api";

export const Route = createFileRoute("/historico/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Resultado ${params.id} — Diário Inteligente` },
      {
        name: "description",
        content:
          "Detalhes de uma citação encontrada em Diário Oficial: trecho, resumo por IA e visualizador de PDF.",
      },
      {
        property: "og:title",
        content: `Resultado ${params.id} — Diário Inteligente`,
      },
      {
        property: "og:description",
        content: "Detalhes de citação em Diário Oficial com resumo por IA.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DetalhePage,
  notFoundComponent: () => {
    const { id } = Route.useParams();
    return (
      <AppShell>
        <p className="text-sm text-slate-400">
          Resultado {id} não encontrado.
        </p>
      </AppShell>
    );
  },
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="rounded-xl border border-red-900/50 bg-red-500/10 p-6 text-sm text-red-300">
          Erro ao carregar o resultado.
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="ml-3 rounded-md border border-red-700 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/10"
          >
            Tentar novamente
          </button>
        </div>
      </AppShell>
    );
  },
});

function DetalhePage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<ApiMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await searchApi.getMatchDetail(id);
        setData(d);
        setReviewed(!!d.is_reviewed);
      } catch (err: any) {
        toast.error(err?.message || "Falha ao carregar resultado");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function toggleReviewed() {
    if (!data) return;
    setMarking(true);
    try {
      await searchApi.markReviewed(data.id);
      setReviewed((r) => !r);
      toast.success("Marcado como revisado");
    } catch (err: any) {
      toast.error(err?.message || "Falha ao marcar");
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <p className="text-sm text-slate-400">Resultado não encontrado.</p>
      </AppShell>
    );
  }

  const [contextBefore, contextAfter] = splitContext(
    data.context_text,
    data.variation_found,
  );
  const dateLabel = safeDate(data.edition_date);
  const relevancePct = Math.round((data.relevance_score || 0) * 100) || 0;

  return (
    <AppShell>
      <Link
        to="/historico"
        className="inline-flex items-center gap-1.5 text-sm text-blue-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao histórico
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-800 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400">
          <AlertCircle className="h-4 w-4" />
          RESULTADO ENCONTRADO
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MetaCard
          icon={<Newspaper className="h-4 w-4 text-blue-400" />}
          label="Diário"
          value={data.journal}
        />
        <MetaCard
          icon={<Calendar className="h-4 w-4 text-blue-400" />}
          label="Edição"
          value={dateLabel}
        />
        <MetaCard
          icon={<FileText className="h-4 w-4 text-blue-400" />}
          label="Página"
          value={String(data.page_number)}
        />
        <MetaCard
          icon={<Search className="h-4 w-4 text-blue-400" />}
          label="Palavras próximas"
          value={
            <div className="flex flex-wrap gap-1">
              {data.keywords_nearby?.length ? (
                data.keywords_nearby.map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/30"
                  >
                    {k}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">—</span>
              )}
            </div>
          }
        />
        <MetaCard
          label="Variação encontrada"
          value={
            <span className="rounded bg-yellow-400/20 px-1.5 py-0.5 font-mono text-sm text-yellow-300">
              {data.variation_found}
            </span>
          }
        />
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Relevância</span>
            <span className="font-medium text-slate-200">{relevancePct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${relevancePct}%` }}
            />
          </div>
        </div>
      </div>

      <Section
        icon={<FileText className="h-4 w-4 text-slate-300" />}
        title="Trecho Encontrado"
      >
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 font-mono text-sm leading-relaxed">
          <span className="text-slate-500">{contextBefore}</span>
          <span className="rounded bg-yellow-400/20 px-0.5 text-yellow-300">
            {data.variation_found}
          </span>
          <span className="text-slate-500">{contextAfter}</span>
        </div>
      </Section>

      {data.ai_summary && (
        <Section
          icon={<Sparkles className="h-4 w-4 text-blue-400" />}
          title="Resumo Gerado por IA"
          aside={
            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30">
              Powered by GPT-4o-mini
            </span>
          }
        >
          <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-5 text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
            {data.ai_summary}
          </div>
        </Section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {data.source_url && (
          <a
            href={data.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </a>
        )}
        <button
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copiado");
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
        <button
          onClick={toggleReviewed}
          disabled={marking}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition",
            reviewed
              ? "bg-green-500/10 text-green-400 hover:bg-green-500/15"
              : "text-green-400 hover:bg-green-500/10",
          )}
        >
          {marking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" strokeWidth={3} />
          )}
          {reviewed ? "Revisado" : "Marcar como revisado"}
        </button>
      </div>
    </AppShell>
  );
}

function splitContext(text: string, variation: string): [string, string] {
  if (!text) return ["", ""];
  if (!variation) return [text, ""];
  const idx = text.toLowerCase().indexOf(variation.toLowerCase());
  if (idx === -1) return [text, ""];
  return [text.slice(0, idx), text.slice(idx + variation.length)];
}

function safeDate(iso: string) {
  try {
    return format(parseISO(iso), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

function Section({
  icon,
  title,
  aside,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          {icon}
          {title}
        </h3>
        {aside && <div className="flex items-center text-xs">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm text-slate-100">{value}</div>
    </div>
  );
}
