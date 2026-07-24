import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { auth, user as userApi, competitions as competitionsApi } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Criar conta — Diário Inteligente" },
      {
        name: "description",
        content:
          "Configure seu perfil, variações de nome e concursos em poucos passos.",
      },
      { property: "og:title", content: "Criar conta — Diário Inteligente" },
      {
        property: "og:description",
        content: "Onboarding rápido para começar a monitorar Diários Oficiais.",
      },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  { key: 1, label: "Nome" },
  { key: 2, label: "Variações" },
  { key: 3, label: "Concursos" },
  { key: 4, label: "Telegram" },
  { key: 5, label: "Pronto" },
];

const PRESET_CONCURSOS = [
  "TJBA — Tribunal de Justiça da Bahia",
  "Polícia Civil BA",
  "INSS",
  "Correios",
  "EMBASA",
  "IBGE",
  "Receita Federal",
  "Banco do Brasil",
];

function generateVariations(name: string): string[] {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) return [];
  const parts = clean.split(" ");
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1);
  const noAccents = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const set = new Set<string>([
    clean,
    noAccents,
    `${first[0]}. ${[...middle, last].join(" ")}`.trim(),
    parts.map((p) => p[0]).join(". ") + ".",
    parts.length > 1
      ? `${last.toUpperCase()}, ${[first, ...middle].join(" ")}`.trim()
      : "",
    clean.toUpperCase(),
  ]);
  return [...set].filter(Boolean);
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [variations, setVariations] = useState<string[]>([]);
  const [newVar, setNewVar] = useState("");
  const [selectedConcursos, setSelectedConcursos] = useState<Set<string>>(
    new Set(),
  );
  const [concursosList, setConcursosList] = useState<string[]>(PRESET_CONCURSOS);
  const [newConcursoInput, setNewConcursoInput] = useState("");
  const [tgToken, setTgToken] = useState("");
  const [tgChat, setTgChat] = useState("");
  const [initialSearch, setInitialSearch] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const previewVariations = useMemo(() => generateVariations(name), [name]);

  async function finish() {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (!auth.isAuthenticated()) {
        if (!email || !password || password.length < 6) {
          toast.error("Informe e-mail e senha (mín. 6 caracteres).");
          setStep(1);
          setSubmitting(false);
          return;
        }
        try {
          await auth.register(email, password, name);
        } catch (regErr: any) {
          // Se o e-mail já existe, faz o login automático
          if (regErr?.message?.toLowerCase().includes("cadastrado") || regErr?.message?.includes("400")) {
            await auth.login(email, password);
          } else {
            throw regErr;
          }
        }
      }

      // Adiciona variações de nome
      for (const v of variations) {
        try {
          await userApi.addVariation(v);
        } catch {
          /* ignora duplicatas */
        }
      }

      // Adiciona concursos selecionados
      for (const concursoStr of selectedConcursos) {
        try {
          const parts = concursoStr.split(" — ");
          const organ = parts[0] || concursoStr;
          const pos = parts[1] || "Concurso";
          await competitionsApi.create({
            organ_name: organ,
            position: pos,
            year: new Date().getFullYear(),
            status: "waiting_result",
            is_active: true,
          });
        } catch {
          /* não impeditivo */
        }
      }

      if (tgToken && tgChat) {
        try {
          await userApi.updateProfile({
            telegram_bot_token: tgToken,
            telegram_chat_id: tgChat,
            telegram_notifications: true,
          });
        } catch {
          /* não impeditivo */
        }
      }

      try {
        await userApi.completeOnboarding();
      } catch {
        /* não impeditivo */
      }

      toast.success("Configuração concluída com sucesso!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message || "Falha ao concluir onboarding");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step === 1) {
      setVariations((prev) => (prev.length ? prev : previewVariations));
    }
    if (step < 5) setStep((s) => s + 1);
    else finish();
  }
  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  const canNext =
    (step === 1 &&
      name.trim().length >= 3 &&
      email.includes("@") &&
      password.length >= 6) ||
    (step === 2 && variations.length > 0) ||
    step === 3 ||
    step === 4 ||
    step === 5;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Search className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Diário Inteligente
            </p>
            <p className="text-xs text-slate-400">
              Vamos configurar sua conta em 5 passos
            </p>
          </div>
        </div>
        <StepDots current={step} />
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {step === 1 && (
          <StepShell
            title="Como você se chama?"
            subtitle="Usaremos seu nome para buscar em cada edição dos Diários Oficiais."
          >
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome completo
              </Label>
              <Input
                id="name"
                autoFocus
                placeholder="Ex.: João Pedro da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="pwd" className="text-slate-300">
                Senha
              </Label>
              <Input
                id="pwd"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 text-base"
              />
            </div>


            {previewVariations.length > 0 && (
              <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  Vamos buscar também por estas variações:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {previewVariations.map((v) => (
                    <span
                      key={v}
                      className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 font-mono text-[11px] text-slate-200"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title="Revise as variações do seu nome"
            subtitle="Remova o que não faz sentido ou adicione formas específicas usadas em editais."
          >
            <div className="flex flex-wrap gap-2">
              {variations.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100"
                >
                  <span className="font-mono">{v}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setVariations((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-slate-500 hover:text-red-400"
                    aria-label="Remover"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {variations.length === 0 && (
                <p className="text-xs text-slate-500">
                  Nenhuma variação — adicione ao menos uma.
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Adicionar variação (ex.: J. P. Silva)"
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
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="Seus concursos"
            subtitle="Selecione os concursos que você quer acompanhar ou adicione os seus próprios."
          >
            <div className="grid gap-2">
              {concursosList.map((c) => {
                const checked = selectedConcursos.has(c);
                return (
                  <label
                    key={c}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      checked
                        ? "border-blue-800 bg-blue-600/10 text-blue-200"
                        : "border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-600",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        setSelectedConcursos((prev) => {
                          const next = new Set(prev);
                          if (v) next.add(c);
                          else next.delete(c);
                          return next;
                        });
                      }}
                    />
                    {c}
                  </label>
                );
              })}

              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Nome do concurso (ex.: TJ-SP — Escrevente)"
                  value={newConcursoInput}
                  onChange={(e) => setNewConcursoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = newConcursoInput.trim();
                      if (val) {
                        setConcursosList((prev) => [...prev, val]);
                        setSelectedConcursos((prev) => new Set(prev).add(val));
                        setNewConcursoInput("");
                      }
                    }
                  }}
                  className="h-10 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const val = newConcursoInput.trim();
                    if (!val) return;
                    setConcursosList((prev) => [...prev, val]);
                    setSelectedConcursos((prev) => new Set(prev).add(val));
                    setNewConcursoInput("");
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Configurar Telegram (opcional)"
            subtitle="Receba alertas em tempo real assim que seu nome aparecer em um Diário."
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-300">Token do Bot</Label>
                <Input
                  placeholder="123456:ABC-DEF…"
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Seu Chat ID</Label>
                <Input
                  placeholder="Ex.: 123456789"
                  value={tgChat}
                  onChange={(e) => setTgChat(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" className="w-fit">
                <Send className="h-4 w-4" /> Enviar mensagem de teste
              </Button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="text-left text-xs text-slate-400 hover:text-slate-200"
              >
                Pular por enquanto →
              </button>
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            title="Tudo pronto para começar 🎉"
            subtitle="Revise sua configuração antes de iniciar o monitoramento."
          >
            <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-5 text-sm">
              <SummaryRow label="Nome" value={name || "—"} />
              <SummaryRow
                label="Variações"
                value={`${variations.length} configuradas`}
              />
              <SummaryRow
                label="Concursos"
                value={
                  selectedConcursos.size > 0
                    ? `${selectedConcursos.size} selecionados`
                    : "Nenhum ainda"
                }
              />
              <SummaryRow
                label="Telegram"
                value={
                  tgToken && tgChat ? "Configurado" : "Não configurado"
                }
              />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Pesquisar nos últimos 30 dias agora?
                </p>
                <p className="text-xs text-slate-400">
                  Faz uma varredura inicial para trazer resultados históricos.
                </p>
              </div>
              <Switch
                checked={initialSearch}
                onCheckedChange={setInitialSearch}
              />
            </div>
          </StepShell>
        )}

        <div className="mt-10 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={step === 1}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>

          <Button
            type="button"
            onClick={next}
            disabled={!canNext || submitting}
            className={cn(
              "bg-blue-600 hover:bg-blue-500",
              step === 5 && "h-11 px-6 text-base",
            )}
          >
            {step === 5 ? (
              <>
                <Check className="h-4 w-4" /> Começar!
              </>
            ) : (
              <>
                Continuar <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}

function StepDots({ current }: { current: number }) {
  return (
    <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 pb-4">
      {STEPS.map((s, i) => {
        const done = s.key < current;
        const active = s.key === current;
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                  done && "border-blue-600 bg-blue-600 text-white",
                  active &&
                    "border-blue-500 bg-blue-600/20 text-blue-300 ring-2 ring-blue-500/30",
                  !done && !active && "border-slate-700 bg-slate-800 text-slate-500",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : s.key}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:inline",
                  active ? "text-slate-200" : "text-slate-500",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 transition-colors",
                  done ? "bg-blue-600" : "bg-slate-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-center text-2xl font-bold text-white">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-slate-400">{subtitle}</p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-100">{value}</span>
    </div>
  );
}
