import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  competitions as competitionsApi,
  type ApiCompetition,
} from "@/services/api";
import {
  Pencil,
  Plus,
  ExternalLink,
  ClipboardList,
  Sparkles,
  Siren,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/concursos")({
  head: () => ({
    meta: [
      { title: "Meus Concursos — Diário Inteligente" },
      {
        name: "description",
        content:
          "Gerencie os concursos públicos que você acompanha no Diário Inteligente.",
      },
      { property: "og:title", content: "Meus Concursos — Diário Inteligente" },
      {
        property: "og:description",
        content:
          "Cadastre e acompanhe seus concursos, status e histórico de pesquisas.",
      },
    ],
  }),
  component: ConcursosPage,
});

type Status =
  | "waiting_result"
  | "classified_waiting"
  | "summoned"
  | "taking_office"
  | "eliminated";

type Concurso = {
  id: string;
  orgao: string;
  sigla: string;
  orgaoNome: string;
  cargo: string;
  tipoVaga: string;
  ano: number;
  status: Status;
  inscricao: string;
  banca: string;
  edital: string;
  observacoes?: string;
  ativo: boolean;
  pesquisas: number;
};

const STATUS_META: Record<
  Status,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  waiting_result: {
    label: "Aguardando resultado",
    className: "bg-slate-700/50 text-slate-300 border border-slate-700",
    icon: Hourglass,
  },
  classified_waiting: {
    label: "Classificado — aguardando convocação",
    className: "bg-blue-500/10 text-blue-400 border border-blue-900",
    icon: Sparkles,
  },
  summoned: {
    label: "CONVOCADO",
    className: "bg-orange-500/10 text-orange-400 border border-orange-900",
    icon: Siren,
  },
  taking_office: {
    label: "Em posse",
    className: "bg-green-500/10 text-green-400 border border-green-900",
    icon: CheckCircle2,
  },
  eliminated: {
    label: "Eliminado",
    className: "bg-red-500/10 text-red-400 border border-red-900",
    icon: XCircle,
  },
};

function siglaFrom(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??"
  );
}

function fromApi(c: ApiCompetition): Concurso {
  const status = ((): Status => {
    const s = c.status as Status;
    if (
      s === "waiting_result" ||
      s === "classified_waiting" ||
      s === "summoned" ||
      s === "taking_office" ||
      s === "eliminated"
    )
      return s;
    return "waiting_result";
  })();
  return {
    id: c.id,
    orgao: c.organ_name,
    sigla: siglaFrom(c.organ_name),
    orgaoNome: c.organ_name,
    cargo: c.position,
    tipoVaga: "Cargo Efetivo",
    ano: c.year,
    status,
    inscricao: c.registration_number ?? "",
    banca: c.organizing_body ?? "",
    edital: c.edital_url ?? "",
    ativo: c.is_active,
    pesquisas: 0,
  };
}


type FilterKey = "todos" | "ativos" | "convocado" | "aguardando" | "eliminado";

function matchesFilter(c: Concurso, f: FilterKey) {
  switch (f) {
    case "todos":
      return true;
    case "ativos":
      return c.ativo;
    case "convocado":
      return c.status === "summoned";
    case "aguardando":
      return (
        c.status === "waiting_result" || c.status === "classified_waiting"
      );
    case "eliminado":
      return c.status === "eliminated";
  }
}

function ConcursosPage() {
  const [items, setItems] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Concurso | null>(null);

  async function load() {
    setLoading(true);
    try {
      const list = await competitionsApi.list();
      setItems(list.map(fromApi));
    } catch (err: any) {
      toast.error(err?.message || "Falha ao carregar concursos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      todos: items.length,
      ativos: items.filter((c) => c.ativo).length,
      convocado: items.filter((c) => c.status === "summoned").length,
      aguardando: items.filter(
        (c) =>
          c.status === "waiting_result" || c.status === "classified_waiting",
      ).length,
      eliminado: items.filter((c) => c.status === "eliminated").length,
    }),
    [items],
  );

  const filtered = items.filter((c) => matchesFilter(c, filter));

  const filters: { key: FilterKey; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "ativos", label: "Ativos" },
    { key: "convocado", label: "Convocado" },
    { key: "aguardando", label: "Aguardando" },
    { key: "eliminado", label: "Eliminado" },
  ];

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(c: Concurso) {
    setEditing(c);
    setDialogOpen(true);
  }

  async function handleSave(data: Concurso) {
    const payload = {
      organ_name: data.orgao,
      position: data.cargo,
      year: data.ano,
      status: data.status,
      registration_number: data.inscricao || undefined,
      organizing_body: data.banca || undefined,
      edital_url: data.edital || undefined,
      notes: data.observacoes || undefined,
      is_active: data.ativo,
    };
    try {
      const existing = items.find((p) => p.id === data.id);
      if (existing) {
        const updated = await competitionsApi.update(data.id, payload);
        setItems((prev) =>
          prev.map((p) => (p.id === data.id ? fromApi(updated) : p)),
        );
        toast.success("Concurso atualizado");
      } else {
        const created = await competitionsApi.create(payload);
        setItems((prev) => [...prev, fromApi(created)]);
        toast.success("Concurso adicionado");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Falha ao salvar concurso");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Meus Concursos"
        description={`${counts.todos} concursos cadastrados · ${counts.ativos} ativos`}
        action={
          <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-500">
            <Plus className="h-4 w-4" />
            Adicionar Concurso
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-blue-800 bg-blue-600/15 text-blue-400"
                  : "border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-600",
              )}
            >
              {f.label} ({counts[f.key]})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-10 text-center text-sm text-slate-400">
          Nenhum concurso neste filtro.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <ConcursoCard key={c.id} concurso={c} onEdit={() => openEdit(c)} />
          ))}
        </div>
      )}

      <ConcursoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
    </AppShell>
  );
}

function ConcursoCard({
  concurso,
  onEdit,
}: {
  concurso: Concurso;
  onEdit: () => void;
}) {
  const meta = STATUS_META[concurso.status];
  const Icon = meta.icon;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 transition-colors hover:border-slate-600">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-sm font-semibold text-blue-400 ring-1 ring-blue-900">
          {concurso.sigla}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-100">
                {concurso.orgao}
              </h3>
              <p className="truncate text-xs text-slate-400">
                {concurso.orgaoNome}
              </p>
            </div>
            <button
              onClick={onEdit}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-100"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {concurso.cargo} · {concurso.tipoVaga} · {concurso.ano}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            meta.className,
            concurso.status === "summoned" && "animate-pulse",
          )}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      <div className="mt-4 border-t border-slate-700/60 pt-3 text-xs text-slate-400">
        <p>
          Inscrição:{" "}
          <span className="text-slate-300">{concurso.inscricao}</span> · Banca:{" "}
          <span className="text-slate-300">{concurso.banca}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href={concurso.edital}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
          >
            <ExternalLink className="h-3 w-3" /> Edital
          </a>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <ClipboardList className="h-3 w-3" /> Histórico de pesquisas:{" "}
            <span className="text-slate-200">{concurso.pesquisas}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ConcursoDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Concurso | null;
  onSave: (c: Concurso) => void;
}) {
  const empty: Concurso = {
    id: crypto.randomUUID(),
    orgao: "",
    sigla: "",
    orgaoNome: "",
    cargo: "",
    tipoVaga: "Cargo Efetivo",
    ano: new Date().getFullYear(),
    status: "waiting_result",
    inscricao: "",
    banca: "",
    edital: "",
    observacoes: "",
    ativo: true,
    pesquisas: 0,
  };
  const [form, setForm] = useState<Concurso>(initial ?? empty);

  // reset when opening
  useMemo(() => {
    if (open) setForm(initial ?? { ...empty, id: crypto.randomUUID() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const years = Array.from({ length: 7 }, (_, i) => 2020 + i);

  function update<K extends keyof Concurso>(key: K, value: Concurso[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.orgao || !form.cargo) return;
    const sigla =
      form.sigla ||
      form.orgao
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    onSave({ ...form, sigla, orgaoNome: form.orgaoNome || form.orgao });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 text-slate-100">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Editar concurso" : "Adicionar concurso"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="orgao">Órgão / Instituição *</Label>
            <Input
              id="orgao"
              value={form.orgao}
              onChange={(e) => update("orgao", e.target.value)}
              required
              placeholder="Ex.: TJBA"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cargo">Cargo *</Label>
            <Input
              id="cargo"
              value={form.cargo}
              onChange={(e) => update("cargo", e.target.value)}
              required
              placeholder="Ex.: Técnico Judiciário"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Ano</Label>
              <Select
                value={String(form.ano)}
                onValueChange={(v) => update("ano", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v as Status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiting_result">
                    Aguardando resultado
                  </SelectItem>
                  <SelectItem value="classified_waiting">
                    Classificado — aguardando convocação
                  </SelectItem>
                  <SelectItem value="summoned">Convocado</SelectItem>
                  <SelectItem value="taking_office">Em posse</SelectItem>
                  <SelectItem value="eliminated">Eliminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="inscricao">Nº de inscrição</Label>
              <Input
                id="inscricao"
                value={form.inscricao}
                onChange={(e) => update("inscricao", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banca">Banca organizadora</Label>
              <Input
                id="banca"
                value={form.banca}
                onChange={(e) => update("banca", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edital">Link do edital</Label>
            <Input
              id="edital"
              type="url"
              value={form.edital}
              onChange={(e) => update("edital", e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              rows={3}
              value={form.observacoes ?? ""}
              onChange={(e) => update("observacoes", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
            <div>
              <p className="text-sm text-slate-100">Concurso ativo</p>
              <p className="text-xs text-slate-400">
                Incluir nas pesquisas automáticas.
              </p>
            </div>
            <Switch
              checked={form.ativo}
              onCheckedChange={(v) => update("ativo", v)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
