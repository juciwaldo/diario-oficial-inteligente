import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  User,
  Bell,
  Clock,
  FileText,
  Palette,
  BadgeCheck,
  Eye,
  EyeOff,
  Plus,
  X,
  RefreshCw,
  Lock,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Send,
  CheckCircle2,
  Circle,
  Info,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Diário Inteligente" },
      {
        name: "description",
        content:
          "Gerencie perfil, notificações, agendamento, diários e aparência do Diário Inteligente.",
      },
      { property: "og:title", content: "Configurações — Diário Inteligente" },
      {
        property: "og:description",
        content: "Ajuste suas preferências e integrações do sistema.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

type TabKey =
  | "perfil"
  | "notificacoes"
  | "agendamento"
  | "diarios"
  | "aparencia";

function ConfiguracoesPage() {
  const [tab, setTab] = useState<TabKey>("perfil");
  const [notifConfigured, setNotifConfigured] = useState(false);

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: boolean;
  }[] = [
    { key: "perfil", label: "Perfil", icon: User },
    {
      key: "notificacoes",
      label: "Notificações",
      icon: Bell,
      badge: !notifConfigured,
    },
    { key: "agendamento", label: "Agendamento", icon: Clock },
    { key: "diarios", label: "Diários", icon: FileText },
    { key: "aparencia", label: "Aparência", icon: Palette },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Configurações"
        description="Gerencie sua conta, notificações e preferências do sistema."
      />

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "border-blue-800 bg-blue-600/15 text-blue-400"
                    : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {t.label}
                </span>
                {t.badge ? (
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div>
          {tab === "perfil" && <ProfileTab />}
          {tab === "notificacoes" && (
            <NotificationsTab
              onConfigured={() => setNotifConfigured(true)}
              configured={notifConfigured}
            />
          )}
          {tab === "agendamento" && <ScheduleTab />}
          {tab === "diarios" && <DiariesTab />}
          {tab === "aparencia" && <AppearanceTab />}
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- CARD WRAPPER ---------- */
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------- PERFIL ---------- */
function ProfileTab() {
  const [name, setName] = useState("João Pedro da Silva");
  const [variations, setVariations] = useState<string[]>([
    "João Pedro da Silva",
    "João P. da Silva",
    "J. P. da Silva",
    "Joao Pedro da Silva",
    "SILVA, JOÃO PEDRO",
  ]);
  const [newVar, setNewVar] = useState("");
  const [pwdOpen, setPwdOpen] = useState(false);

  function regenerate() {
    const base = name.trim();
    if (!base) return;
    const parts = base.split(/\s+/);
    const first = parts[0];
    const last = parts[parts.length - 1];
    const initials = parts.map((p) => p[0]).join(". ");
    setVariations([
      base,
      `${first[0]}. ${parts.slice(1).join(" ")}`,
      initials + ".",
      base.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      `${last.toUpperCase()}, ${parts.slice(0, -1).join(" ")}`,
    ]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="E-mail">
            <div className="relative">
              <Input
                value="joao.silva@example.com"
                readOnly
                className="pr-24"
              />
              <Badge className="absolute right-1.5 top-1/2 -translate-y-1/2 border border-green-900 bg-green-500/10 text-green-400">
                <BadgeCheck className="mr-1 h-3 w-3" />
                verificado
              </Badge>
            </div>
          </Field>
          <Field
            label="CPF"
            hint="Usado para busca adicional — não é obrigatório"
          >
            <Input placeholder="000.000.000-00" />
          </Field>
          <Field label="RG">
            <Input placeholder="00.000.000-0" />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Variações do nome
            </h3>
            <p className="text-xs text-slate-400">
              Todas as formas usadas na busca dentro dos diários.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={regenerate}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Regenerar
          </Button>
        </div>

        <ul className="space-y-2">
          {variations.map((v, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
            >
              <span className="font-mono text-xs">{v}</span>
              <button
                onClick={() =>
                  setVariations((prev) => prev.filter((_, j) => j !== i))
                }
                className="text-slate-500 hover:text-red-400"
                aria-label="Remover"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Adicionar variação manual"
            value={newVar}
            onChange={(e) => setNewVar(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!newVar.trim()) return;
              setVariations((prev) => [...prev, newVar.trim()]);
              setNewVar("");
            }}
          >
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-500">
          Salvar alterações
        </Button>
      </div>

      <Card className="border-red-900/50 bg-red-950/20">
        <Collapsible open={pwdOpen} onOpenChange={setPwdOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Alterar senha
                </p>
                <p className="text-xs text-slate-400">
                  Ação sensível — exige senha atual.
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform",
                pwdOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <Input type="password" placeholder="Senha atual" />
            <Input type="password" placeholder="Nova senha" />
            <Input type="password" placeholder="Confirmar nova senha" />
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-500"
            >
              Atualizar senha
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-slate-300">{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

/* ---------- NOTIFICAÇÕES ---------- */
function NotificationsTab({
  onConfigured,
  configured,
}: {
  onConfigured: () => void;
  configured: boolean;
}) {
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [tgEnabled, setTgEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [test, setTest] = useState<null | "ok" | "err">(null);

  function sendTest() {
    if (!token || token.length < 10) {
      setTest("err");
      return;
    }
    setTest("ok");
    onConfigured();
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">Telegram</h3>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
              configured
                ? "border border-green-900 bg-green-500/10 text-green-400"
                : "border border-slate-700 bg-slate-700/50 text-slate-300",
            )}
          >
            {configured ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Configurado
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" /> Não configurado
              </>
            )}
          </span>
        </div>

        <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-left text-sm text-slate-200">
            <span className="inline-flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" /> Como configurar
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform",
                guideOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
            <ol className="list-decimal space-y-1 pl-5">
              <li>Abra o Telegram no seu celular ou desktop.</li>
              <li>
                Busque por{" "}
                <span className="font-mono text-blue-400">@BotFather</span>.
              </li>
              <li>
                Envie <span className="font-mono">/newbot</span> e siga as
                instruções para criar seu bot.
              </li>
              <li>Copie o token que ele enviar e cole abaixo.</li>
            </ol>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-4 grid gap-4">
          <Field label="Token do Bot">
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456:ABC-DEF..."
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>
          <Field label="Seu Chat ID">
            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Ex.: 123456789"
            />
            <a
              href="https://core.telegram.org/bots/features#botfather"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline"
            >
              Como encontrar meu Chat ID?
            </a>
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={sendTest}>
              <Send className="h-4 w-4" /> Enviar mensagem de teste
            </Button>
            {test === "ok" && (
              <span className="text-xs text-green-400">
                ✅ Mensagem enviada!
              </span>
            )}
            {test === "err" && (
              <span className="text-xs text-red-400">
                ❌ Erro: token inválido
              </span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2">
            <div>
              <p className="text-sm text-slate-100">
                Ativar notificações Telegram
              </p>
              <p className="text-xs text-slate-400">
                Envia alertas assim que um resultado é encontrado.
              </p>
            </div>
            <Switch checked={tgEnabled} onCheckedChange={setTgEnabled} />
          </div>

          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-500">Salvar</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">E-mail</h3>
        </div>
        <div className="grid gap-4">
          <Field label="E-mail para alertas">
            <Input
              type="email"
              placeholder="voce@exemplo.com"
              defaultValue="joao.silva@example.com"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2">
            <div>
              <p className="text-sm text-slate-100">
                Ativar notificações por e-mail
              </p>
              <p className="text-xs text-slate-400">
                Resumo diário e alertas críticos.
              </p>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-500">Salvar</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------- AGENDAMENTO ---------- */
function ScheduleTab() {
  const [hour, setHour] = useState<number>(6);
  const [freq, setFreq] = useState<"diaria" | "6h" | "12h" | "manual">(
    "diaria",
  );
  const [enabled, setEnabled] = useState(true);

  const nextRuns = useMemo(() => {
    const runs: string[] = [];
    const base = new Date();
    base.setHours(hour, 0, 0, 0);
    if (base.getTime() <= Date.now()) base.setDate(base.getDate() + 1);

    const stepHours =
      freq === "diaria" ? 24 : freq === "6h" ? 6 : freq === "12h" ? 12 : 0;

    if (stepHours === 0) return [];

    for (let i = 0; i < 5; i++) {
      const d = new Date(base.getTime() + i * stepHours * 3600_000);
      const day = String(d.getDate()).padStart(2, "0");
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const yr = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      runs.push(`${day}/${mo}/${yr} — ${hh}:${mm}`);
    }
    return runs;
  }, [hour, freq]);

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold text-slate-100">
          Horário da pesquisa diária
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Escolha o horário em que o sistema fará a varredura automaticamente.
        </p>
        <div className="mt-6">
          <Slider
            value={[hour]}
            max={23}
            min={0}
            step={1}
            onValueChange={(v) => setHour(v[0])}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>00:00</span>
            <span className="text-sm font-medium text-blue-400">
              Todos os dias às {String(hour).padStart(2, "0")}:00
            </span>
            <span>23:00</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-100">Frequência</h3>
        <RadioGroup
          value={freq}
          onValueChange={(v) => setFreq(v as typeof freq)}
          className="mt-4 grid gap-2 sm:grid-cols-2"
        >
          {[
            { v: "diaria", l: "Diária (recomendado)" },
            { v: "6h", l: "A cada 6 horas" },
            { v: "12h", l: "A cada 12 horas" },
            { v: "manual", l: "Apenas manual" },
          ].map((o) => (
            <label
              key={o.v}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                freq === o.v
                  ? "border-blue-800 bg-blue-600/10 text-blue-300"
                  : "border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600",
              )}
            >
              <RadioGroupItem value={o.v} />
              {o.l}
            </label>
          ))}
        </RadioGroup>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-100">
          Próximas execuções previstas
        </h3>
        {nextRuns.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">
            Nenhuma — modo apenas manual.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            {nextRuns.map((r, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 font-mono text-xs"
              >
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                {r}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              Pesquisa automática ativada
            </p>
            <p className="text-xs text-slate-400">
              Master switch — desliga todas as execuções programadas.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </Card>
    </div>
  );
}

/* ---------- DIÁRIOS ---------- */
type Diary = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  soon?: boolean;
};

function DiariesTab() {
  const [diaries, setDiaries] = useState<Diary[]>([
    {
      id: "doba",
      name: "DOBA",
      description: "Diário Oficial do Estado da Bahia",
      active: true,
    },
    {
      id: "dou1",
      name: "DOU Seção 1",
      description: "Atos do Poder Executivo",
      active: true,
    },
    {
      id: "dou2",
      name: "DOU Seção 2",
      description: "Concursos e nomeações",
      active: true,
    },
    {
      id: "dou3",
      name: "DOU Seção 3",
      description: "Contratos e licitações",
      active: false,
    },
    {
      id: "trt",
      name: "Diário da Justiça TRT",
      description: "Tribunal Regional do Trabalho",
      active: false,
      soon: true,
    },
    {
      id: "tce",
      name: "TCE-BA",
      description: "Tribunal de Contas do Estado da Bahia",
      active: false,
      soon: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {diaries.map((d) => (
          <div
            key={d.id}
            className={cn(
              "flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4",
              d.soon && "opacity-60",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {d.name}
                  {d.soon ? (
                    <span className="ml-2 rounded-md border border-slate-700 bg-slate-700/60 px-1.5 py-0.5 text-[10px] font-normal uppercase text-slate-300">
                      em breve
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-400">{d.description}</p>
              </div>
            </div>
            <Switch
              checked={d.active}
              disabled={d.soon}
              onCheckedChange={(v) =>
                setDiaries((prev) =>
                  prev.map((p) => (p.id === d.id ? { ...p, active: v } : p)),
                )
              }
            />
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              Retenção de PDFs
            </p>
            <p className="text-xs text-slate-400">
              Por quanto tempo os arquivos ficam disponíveis no seu histórico.
            </p>
          </div>
          <Select defaultValue="60">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="inf">Indefinido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}

/* ---------- APARÊNCIA ---------- */
function AppearanceTab() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const options: {
    v: "light" | "dark" | "system";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    preview: string;
    text: string;
  }[] = [
    {
      v: "light",
      label: "Claro",
      icon: Sun,
      preview: "bg-white border-slate-200",
      text: "text-slate-900",
    },
    {
      v: "dark",
      label: "Escuro",
      icon: Moon,
      preview: "bg-slate-900 border-slate-700",
      text: "text-slate-100",
    },
    {
      v: "system",
      label: "Sistema",
      icon: Monitor,
      preview:
        "bg-gradient-to-br from-white via-slate-500 to-slate-900 border-slate-600",
      text: "text-slate-100",
    },
  ];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-100">Tema</h3>
      <p className="text-xs text-slate-400">
        Escolha a aparência da interface. Padrão atual: escuro.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {options.map((o) => {
          const Icon = o.icon;
          const active = theme === o.v;
          return (
            <button
              key={o.v}
              onClick={() => setTheme(o.v)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-blue-500 ring-2 ring-blue-500/40"
                  : "border-slate-700 hover:border-slate-500",
              )}
            >
              <div
                className={cn(
                  "flex h-24 items-center justify-center rounded-lg border",
                  o.preview,
                )}
              >
                <div className="space-y-1 text-center">
                  <div
                    className={cn("mx-auto h-2 w-16 rounded", {
                      "bg-slate-300": o.v === "light",
                      "bg-slate-700": o.v !== "light",
                    })}
                  />
                  <div
                    className={cn("mx-auto h-2 w-10 rounded", {
                      "bg-slate-200": o.v === "light",
                      "bg-slate-800": o.v !== "light",
                    })}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-100">
                  <Icon className="h-4 w-4" />
                  {o.label}
                </span>
                {active ? (
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
