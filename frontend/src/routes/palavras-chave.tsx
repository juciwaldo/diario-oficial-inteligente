import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  keywords as keywordsApi,
  type ApiKeyword,
} from "@/services/api";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/palavras-chave")({
  head: () => ({
    meta: [
      { title: "Palavras-chave — Diário Inteligente" },
      {
        name: "description",
        content:
          "Gerencie as palavras e frases monitoradas nas pesquisas dos Diários Oficiais.",
      },
      { property: "og:title", content: "Palavras-chave — Diário Inteligente" },
      {
        property: "og:description",
        content:
          "Configure prioridade e categoria das palavras usadas nas buscas.",
      },
    ],
  }),
  component: KeywordsPage,
});

type Priority = "alta" | "media" | "baixa";
type Category = "positivo" | "negativo" | "neutro";

type Keyword = {
  id: string;
  term: string;
  priority: Priority;
  category: Category;
  active: boolean;
  system: boolean;
  hits: number;
};

const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  alta: {
    label: "Alta",
    className: "bg-red-500/10 text-red-400 border border-red-900",
  },
  media: {
    label: "Média",
    className: "bg-yellow-500/10 text-yellow-400 border border-yellow-900",
  },
  baixa: {
    label: "Baixa",
    className: "bg-slate-700/60 text-slate-300 border border-slate-700",
  },
};

const CATEGORY_META: Record<
  Category,
  { label: string; dot: string; className: string }
> = {
  positivo: {
    label: "Positivo",
    dot: "bg-green-500",
    className: "bg-green-500/10 text-green-400 border border-green-900",
  },
  negativo: {
    label: "Negativo",
    dot: "bg-red-500",
    className: "bg-red-500/10 text-red-400 border border-red-900",
  },
  neutro: {
    label: "Neutro",
    dot: "bg-slate-400",
    className: "bg-slate-700/60 text-slate-300 border border-slate-700",
  },
};

const PRIORITY_TO_API: Record<Priority, "high" | "medium" | "low"> = {
  alta: "high",
  media: "medium",
  baixa: "low",
};
const PRIORITY_FROM_API: Record<"high" | "medium" | "low", Priority> = {
  high: "alta",
  medium: "media",
  low: "baixa",
};
const CATEGORY_TO_API: Record<
  Category,
  "positive" | "negative" | "neutral"
> = {
  positivo: "positive",
  negativo: "negative",
  neutro: "neutral",
};
const CATEGORY_FROM_API: Record<
  "positive" | "negative" | "neutral",
  Category
> = {
  positive: "positivo",
  negative: "negativo",
  neutral: "neutro",
};

function fromApi(k: ApiKeyword): Keyword {
  return {
    id: k.id,
    term: k.word,
    priority: PRIORITY_FROM_API[k.priority] ?? "media",
    category: CATEGORY_FROM_API[k.category] ?? "neutro",
    active: k.is_active,
    system: k.is_system_default,
    hits: 0,
  };
}

function KeywordsPage() {
  const [items, setItems] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const list = await keywordsApi.list();
      setItems(list.map(fromApi));
    } catch (err: any) {
      toast.error(err?.message || "Falha ao carregar palavras-chave");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      total: items.length,
      active: items.filter((k) => k.active).length,
    }),
    [items],
  );

  async function toggle(id: string, _v: boolean) {
    // optimistic
    setItems((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k)),
    );
    try {
      const updated = await keywordsApi.toggle(id);
      setItems((prev) => prev.map((k) => (k.id === id ? fromApi(updated) : k)));
    } catch (err: any) {
      toast.error(err?.message || "Falha ao alternar");
      // revert
      setItems((prev) =>
        prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k)),
      );
    }
  }

  async function add(k: Omit<Keyword, "id" | "hits" | "system" | "active">) {
    try {
      const created = await keywordsApi.create({
        word: k.term,
        priority: PRIORITY_TO_API[k.priority],
        category: CATEGORY_TO_API[k.category],
      });
      setItems((prev) => [...prev, fromApi(created)]);
      toast.success("Palavra adicionada");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Falha ao adicionar palavra");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Palavras-chave"
        description={`${counts.total} palavras configuradas · ${counts.active} ativas`}
        action={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Adicionar palavra
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-xs text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Positivo <span className="text-slate-500">(convocação, aprovação)</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Negativo{" "}
          <span className="text-slate-500">(eliminação, desclassificação)</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          Neutro <span className="text-slate-500">(recursos, prazo)</span>
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-10 text-center text-sm text-slate-400">
          Nenhuma palavra-chave cadastrada.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((k) => (
            <KeywordCard key={k.id} keyword={k} onToggle={toggle} />
          ))}
        </div>
      )}

      <AddKeywordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={add}
      />
    </AppShell>
  );
}

function KeywordCard({
  keyword,
  onToggle,
}: {
  keyword: Keyword;
  onToggle: (id: string, v: boolean) => void;
}) {
  const pri = PRIORITY_META[keyword.priority];
  const cat = CATEGORY_META[keyword.category];
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700 bg-slate-800 p-4 transition-colors hover:border-slate-500",
        !keyword.active && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            pri.className,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", cat.dot)} />
          {pri.label}
        </span>
        <Switch
          checked={keyword.active}
          onCheckedChange={(v) => onToggle(keyword.id, v)}
        />
      </div>

      <h3 className="mt-3 text-lg font-semibold text-white">{keyword.term}</h3>

      <div className="mt-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
            cat.className,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", cat.dot)} />
          {cat.label}
        </span>
      </div>

      <p className="mt-4 border-t border-slate-700/60 pt-3 text-xs text-slate-400">
        {keyword.hits > 0
          ? `encontrada ${keyword.hits} ${keyword.hits === 1 ? "vez" : "vezes"}`
          : "nenhuma ocorrência"}{" "}
        · {keyword.system ? "padrão do sistema" : "personalizada"}
      </p>
    </div>
  );
}

function AddKeywordDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (k: {
    term: string;
    priority: Priority;
    category: Category;
  }) => void;
}) {
  const [term, setTerm] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [category, setCategory] = useState<Category>("positivo");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    onAdd({ term: term.trim(), priority, category });
    setTerm("");
    setPriority("media");
    setCategory("positivo");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 text-slate-100">
        <DialogHeader>
          <DialogTitle>Adicionar palavra-chave</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="term">Palavra ou frase *</Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ex.: Nomeação"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Prioridade</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positivo">Positivo</SelectItem>
                  <SelectItem value="negativo">Negativo</SelectItem>
                  <SelectItem value="neutro">Neutro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-400">
            A pesquisa buscará por:{" "}
            <span className="font-mono text-yellow-300">
              {term.trim() || "—"}
            </span>
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
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
