import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { search as searchApi } from "@/services/api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Phase = "config" | "progress" | "done-empty" | "done-found";
type Periodo = "hoje" | "7d" | "30d" | "custom";

const DIARIOS = [
  { code: "DOBA", name: "DOBA — Diário Oficial BA", pages: 167, sizeMb: 2.3 },
  { code: "DOU", name: "DOU — Diário Oficial União", pages: 220, sizeMb: 3.1 },
];

export function SearchDialog({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<Phase>("config");
  const [selected, setSelected] = useState<Record<string, boolean>>({
    DOBA: true,
    DOU: true,
  });
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  useEffect(() => {
    if (!open) {
      // reset when closed
      const t = setTimeout(() => setPhase("config"), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-slate-700 bg-slate-800 p-6 text-slate-100 shadow-2xl",
          phase === "config" ? "max-w-md" : "max-w-lg",
        )}
      >
        {phase === "config" && (
          <ConfigStep
            selected={selected}
            setSelected={setSelected}
            periodo={periodo}
            setPeriodo={setPeriodo}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onCancel={() => onOpenChange(false)}
            onStart={async () => {
              const journals = Object.keys(selected).filter((k) => selected[k]);
              if (!journals.length) {
                toast.error("Selecione ao menos um diário");
                return;
              }
              setPhase("progress");
              try {
                const targetDate =
                  periodo === "custom" && dateFrom
                    ? format(dateFrom, "yyyy-MM-dd")
                    : undefined;
                await searchApi.run(journals, targetDate);
                toast.success("Pesquisa iniciada");
              } catch (err: any) {
                toast.error(err?.message || "Falha ao iniciar pesquisa");
              }
            }}
          />
        )}

        {phase === "progress" && (
          <ProgressStep
            selectedCodes={Object.keys(selected).filter((k) => selected[k])}
            onCancel={() => onOpenChange(false)}
            onDone={(found) =>
              setPhase(found ? "done-found" : "done-empty")
            }
          />
        )}

        {phase === "done-empty" && (
          <DoneEmpty onClose={() => onOpenChange(false)} />
        )}

        {phase === "done-found" && (
          <DoneFound onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- STEP 1: Config ---------- */

function ConfigStep(props: {
  selected: Record<string, boolean>;
  setSelected: (s: Record<string, boolean>) => void;
  periodo: Periodo;
  setPeriodo: (p: Periodo) => void;
  dateFrom: Date | undefined;
  setDateFrom: (d: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (d: Date | undefined) => void;
  onCancel: () => void;
  onStart: () => void;
}) {
  const {
    selected,
    setSelected,
    periodo,
    setPeriodo,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    onCancel,
    onStart,
  } = props;

  const canStart =
    Object.values(selected).some(Boolean) &&
    (periodo !== "custom" || (dateFrom && dateTo));

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Pesquisa Manual</h2>
      <p className="mt-1 text-sm text-slate-400">
        Selecione os diários e o período
      </p>

      {/* Diários */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Diários
        </h3>
        <div className="mt-3 space-y-2">
          {DIARIOS.map((d) => {
            const checked = !!selected[d.code];
            return (
              <label
                key={d.code}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition",
                  checked
                    ? "border-blue-600/50 bg-blue-600/10"
                    : "border-slate-700 bg-slate-900/40 hover:border-slate-600",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border transition",
                    checked
                      ? "border-blue-500 bg-blue-600"
                      : "border-slate-500 bg-slate-800",
                  )}
                >
                  {checked && (
                    <CheckCircle2
                      className="h-3 w-3 text-white"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-100">{d.name}</span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={(e) =>
                    setSelected({ ...selected, [d.code]: e.target.checked })
                  }
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Período */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Período
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              ["hoje", "Hoje"],
              ["7d", "Últimos 7 dias"],
              ["30d", "Últimos 30 dias"],
              ["custom", "Personalizado"],
            ] as const
          ).map(([value, label]) => {
            const active = periodo === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPeriodo(value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                  active
                    ? "border-blue-600/50 bg-blue-600/10 text-blue-300"
                    : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    active ? "border-blue-500" : "border-slate-500",
                  )}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {periodo === "custom" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <DateField
              label="De"
              value={dateFrom}
              onChange={setDateFrom}
            />
            <DateField label="Até" value={dateTo} onChange={setDateTo} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          onClick={onStart}
          disabled={!canStart}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          Iniciar Pesquisa →
        </button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-medium text-slate-400">
        {label}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-left text-sm transition hover:border-slate-600",
              !value && "text-slate-500",
            )}
          >
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : "Escolher"}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-slate-700 bg-slate-800 p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ---------- STEP 2: Progress ---------- */

function ProgressStep({
  selectedCodes,
  onCancel,
  onDone,
}: {
  selectedCodes: string[];
  onCancel: () => void;
  onDone: (found: boolean) => void;
}) {
  const diarios = useMemo(
    () => DIARIOS.filter((d) => selectedCodes.includes(d.code)),
    [selectedCodes],
  );
  const totalPages = diarios.reduce((sum, d) => sum + d.pages, 0);

  const [analyzedPages, setAnalyzedPages] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const step = setInterval(() => {
      setAnalyzedPages((p) => {
        const next = p + Math.max(3, Math.round(totalPages / 40));
        if (next >= totalPages) {
          clearInterval(step);
          setTimeout(() => onDone(Math.random() > 0.5), 400);
          return totalPages;
        }
        return next;
      });
    }, 180);
    return () => clearInterval(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overallPct = Math.min(100, (analyzedPages / totalPages) * 100);

  // Compute per-diario status
  let pagesRemaining = analyzedPages;
  const perDiario = diarios.map((d) => {
    const done = Math.min(d.pages, pagesRemaining);
    pagesRemaining = Math.max(0, pagesRemaining - d.pages);
    let status: "waiting" | "downloading" | "extracting" | "searching" | "done";
    if (done === 0) status = "waiting";
    else if (done < d.pages) status = "searching";
    else status = "done";
    return { ...d, done, status };
  });

  // Force first diario to show downloading/extracting steps when it's mid-way
  const firstActiveIndex = perDiario.findIndex((d) => d.status !== "done");

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">
        Pesquisa em Andamento...
      </h2>

      {/* overall bar */}
      <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${overallPct}%` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"
        />
      </div>

      {/* steps */}
      <ul className="mt-5 space-y-3">
        {perDiario.map((d, idx) => {
          if (d.status === "waiting") {
            return (
              <StepRow
                key={d.code}
                icon={<Clock className="h-4 w-4 text-slate-500" />}
                label={`${d.code} — Aguardando...`}
                muted
              />
            );
          }
          if (d.status === "done") {
            return (
              <div key={d.code} className="space-y-2">
                <StepRow
                  icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                  label={`${d.code} — Download completo (${d.sizeMb} MB)`}
                />
                <StepRow
                  icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                  label={`${d.code} — Extração de texto concluída (${d.pages} páginas)`}
                />
                <StepRow
                  icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                  label={`${d.code} — Pesquisa concluída`}
                />
              </div>
            );
          }
          // searching
          return (
            <div key={d.code} className="space-y-2">
              <StepRow
                icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                label={`${d.code} — Download completo (${d.sizeMb} MB)`}
              />
              <StepRow
                icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                label={`${d.code} — Extração de texto concluída (${d.pages} páginas)`}
              />
              <div>
                <StepRow
                  icon={
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  }
                  label={`${d.code} — Pesquisando...`}
                />
                <div className="ml-7 mt-1 text-xs text-slate-400">
                  {d.done} / {d.pages} páginas
                </div>
              </div>
              {/* remaining ones show waiting */}
              {perDiario.slice(idx + 1).map((next) => (
                <StepRow
                  key={next.code}
                  icon={<Clock className="h-4 w-4 text-slate-500" />}
                  label={`${next.code} — Aguardando...`}
                  muted
                />
              ))}
            </div>
          );
        })}
        {firstActiveIndex === -1 && null}
      </ul>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
        <span>
          {analyzedPages} páginas analisadas · {formatElapsed(elapsed)}
        </span>
        <button
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-red-400 transition hover:bg-red-500/10"
        >
          Cancelar pesquisa
        </button>
      </div>
    </div>
  );
}

function StepRow({
  icon,
  label,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span
        className={cn(
          "text-sm",
          muted ? "text-slate-500" : "text-slate-200",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/* ---------- STEP 3: Done Empty ---------- */

function DoneEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
        <CheckCircle2 className="h-9 w-9 text-green-500" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">
        Pesquisa concluída!
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        167 páginas analisadas · 0 resultados · 2m 43s
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Continue estudando! Nenhuma citação hoje.
      </p>
      <button
        onClick={onClose}
        className="mt-6 rounded-lg border border-slate-600 px-5 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
      >
        Fechar
      </button>
    </div>
  );
}

/* ---------- STEP 4: Done Found ---------- */

function DoneFound({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
        <span className="absolute inset-0 rounded-full bg-red-500/15 ring-1 ring-red-500/40" />
        <AlertCircle className="relative h-9 w-9 text-red-500" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">
        1 resultado encontrado!
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Página 52 do DOBA — Convocação
      </p>
      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-slate-400 transition hover:text-slate-200"
        >
          Fechar
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Ver detalhes →
        </button>
      </div>
    </div>
  );
}
