import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-black font-sans text-slate-100 selection:bg-white/20 selection:text-white">
      {/* 1. Imagem de fundo em proporção perfeita (sem distorção) */}
      <img
        src="/login-bg.jpg"
        alt=""
        className="absolute inset-0 size-full scale-105 object-cover object-center blur-[2px] select-none"
        aria-hidden="true"
      />

      {/* 2. Filtro fumê translúcido neutro */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Alternador de tema discreto no canto superior direito */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle className="text-slate-200 hover:bg-white/10 hover:text-white" />
      </div>

      {/* Conteúdo central: card com efeito vidro fumê */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <Card className="relative gap-0 overflow-hidden rounded-3xl border border-white/15 bg-black/60 p-6 text-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:p-8">
            {/* Linha superior luminosa sutil */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            {/* Cabeçalho do card */}
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg">
                <ScrollText className="size-7 text-white" aria-hidden />
              </div>

              <div className="mt-4">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-3 py-1 text-[10px] font-mono font-semibold text-emerald-400">
                  <ShieldCheck className="size-3" />
                  <span>ACESSO SEGURO CRIPTOGRAFADO</span>
                </div>

                <p className="text-[11px] font-black uppercase tracking-[0.25em]">
                  <span className="text-blue-400">SYS</span>
                  <span className="text-emerald-400">-OUTLINE</span>
                  <span className="ml-2 font-medium normal-case text-slate-300">
                    Escriba da Palavra
                  </span>
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                  Acesso ao Sistema
                </h1>
                <p className="mt-1 text-xs text-slate-300">
                  Informe suas credenciais para redigir ou revisar os resumos da ministração.
                </p>
              </div>
            </div>

            {/* Formulário de acesso */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-300">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-300"
                >
                  E-mail de acesso
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="usuario@escriba.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/15 bg-black/60 pl-10 text-sm font-medium text-white transition-all placeholder:text-slate-500 focus:border-amber-400/80 focus:ring-4 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-300"
                  >
                    Senha de acesso
                  </Label>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/15 bg-black/60 pr-11 pl-10 font-mono text-sm text-white transition-all placeholder:text-slate-500 focus:border-amber-400/80 focus:ring-4 focus:ring-amber-500/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 right-1.5 size-8 -translate-y-1/2 p-0 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword(current => !current)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="h-11 w-full cursor-pointer gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-[0_0_30px_rgba(37,99,235,0.55)] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Autenticando…
                  </>
                ) : (
                  <>
                    Entrar no painel
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-slate-400">
                Acesso restrito a usuários autorizados com perfil ativo.
              </p>
            </form>

            {/* Acesso rápido para demonstração */}
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
              <span className="block text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Acesso Rápido para Demonstração
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin@escriba.com')}
                  className="h-8 border-white/15 bg-white/5 text-[11px] font-semibold text-blue-300 hover:bg-white/10 hover:text-blue-200"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('revisor@escriba.com')}
                  className="h-8 border-white/15 bg-white/5 text-[11px] font-semibold text-amber-300 hover:bg-white/10 hover:text-amber-200"
                >
                  Revisor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('escriba@escriba.com')}
                  className="h-8 border-white/15 bg-white/5 text-[11px] font-semibold text-emerald-300 hover:bg-white/10 hover:text-emerald-200"
                >
                  Escriba
                </Button>
              </div>
              <p className="pt-1 text-center font-mono text-[10px] text-slate-400">
                Senha padrão: <span className="font-bold text-slate-200">password123</span>
              </p>
            </div>
          </Card>

          <p className="mt-5 text-center text-[11px] font-medium text-white/80 drop-shadow-sm">
            Operações auditadas em conformidade com políticas de segurança da informação.
          </p>
        </div>
      </main>

      {/* Rodapé institucional fumê */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 px-4 py-3.5 text-center text-xs backdrop-blur-md">
        <p className="font-semibold tracking-wide text-slate-200">
          SYSTRAT INTELIGÊNCIA EM GESTÃO E TECNOLOGIA LTDA
        </p>
        <p className="mt-1 font-mono text-[11px] text-slate-400">
          SYS-OUTLINE — Escriba da Palavra • © {new Date().getFullYear()} Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};
