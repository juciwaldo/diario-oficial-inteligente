import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Search,
  Bell,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { auth } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Diário Inteligente" },
      {
        name: "description",
        content:
          "Acesse o Diário Inteligente e continue monitorando as publicações dos Diários Oficiais.",
      },
      { property: "og:title", content: "Entrar — Diário Inteligente" },
      {
        property: "og:description",
        content:
          "Faça login para acompanhar seus concursos e receber alertas.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailInvalid = useMemo(
    () => Boolean(error && !email.includes("@")),
    [error, email],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await auth.login(email, password);
      toast.success("Login realizado com sucesso");
      navigate({ to: "/" });
    } catch (err: any) {
      const msg = err?.message || "Falha ao entrar";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-900 md:grid-cols-2">
      {/* LEFT — brand */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 to-slate-900 p-12 md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/50">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">
              Diário Inteligente
            </p>
            <p className="text-xs text-slate-400">
              Monitoramento de Diários Oficiais
            </p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="max-w-md text-3xl font-bold leading-tight text-white">
            Nunca mais perca uma convocação nos Diários Oficiais.
          </h1>
          <ul className="space-y-4 text-sm text-slate-300">
            <Benefit
              icon={<Search className="h-4 w-4" />}
              title="Monitoramento automático diário"
              desc="Varredura programada de DOBA e DOU, sem esforço manual."
            />
            <Benefit
              icon={<Bell className="h-4 w-4" />}
              title="Alertas instantâneos no Telegram"
              desc="Receba mensagens no segundo em que seu nome for citado."
            />
            <Benefit
              icon={<FileText className="h-4 w-4" />}
              title="Histórico completo com resumo IA"
              desc="Cada citação analisada por IA com prazos e documentos."
            />
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © 2026 Diário Inteligente · feito para concurseiros do Brasil.
        </p>
      </aside>

      {/* RIGHT — form */}
      <main className="flex flex-col items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Search className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-white">
              Diário Inteligente
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm text-slate-400">
            Entre com sua conta para continuar.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "pl-10",
                    emailInvalid && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-slate-300">
                  Senha
                </Label>
                <Link
                  to="/login"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="pwd"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "pl-10 pr-10",
                    error && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-red-900 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-500">
            <span className="h-px flex-1 bg-slate-700" />
            ou
            <span className="h-px flex-1 bg-slate-700" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Não tem conta?{" "}
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1 font-medium text-blue-400 hover:text-blue-300"
            >
              Criar conta <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Benefit({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400 ring-1 ring-blue-900">
        {icon}
      </span>
      <div>
        <p className="font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </li>
  );
}
