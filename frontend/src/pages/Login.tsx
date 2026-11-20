import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LockKeyhole,
  Mail,
  ScrollText,
} from 'lucide-react';

const HIGHLIGHTS = [
  { icon: FileText, text: 'Resumo estruturado com limite que cabe em uma página' },
  { icon: CheckCircle2, text: 'Revisão com comentários e comparação entre envios' },
  { icon: CalendarDays, text: 'Escalas e prazos claros para cada escriba' },
];

const CURRENT_YEAR = new Date().getFullYear();

const FIELD_CLASS =
  'h-12 w-full rounded-[10px] border border-slate-400 bg-[#0b1220] pl-11 text-[15px] text-white placeholder:text-slate-400 transition-shadow focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400/40';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Move o foco para o aviso de erro, para leitores de tela e teclado perceberem a falha.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || 'E-mail ou senha incorretos. Confira os dados e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="grid min-h-dvh bg-[#090d16] font-sans text-slate-100 selection:bg-white/20 lg:grid-cols-[1.4fr_1fr]">
      {/* Apresentação do sistema: no celular vira um cabeçalho curto acima do cartão */}
      <section
        aria-label="Sobre o sistema"
        className="flex flex-col justify-center gap-6 bg-linear-to-br from-[#172554] to-[#090d16] px-5 pt-10 pb-2 lg:gap-8 lg:px-16 lg:py-16"
      >
        <p className="max-w-[18ch] text-2xl font-extrabold leading-tight text-balance text-white sm:text-3xl lg:max-w-[16ch] lg:text-5xl lg:leading-[1.15]">
          A palavra de domingo, na mesa da célula.
        </p>
        <p className="hidden max-w-[34rem] text-lg leading-7 text-slate-300 text-pretty lg:block">
          Registre a mensagem, revise com cuidado e entregue em uma única folha A4 para os líderes.
        </p>
        <ul className="hidden flex-col gap-3.5 lg:flex">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-[15px] text-slate-200">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* Acesso */}
      <main className="flex flex-col items-center justify-center gap-6 px-5 py-8 lg:px-10">
        <div className="w-full max-w-[440px] rounded-[20px] border border-white/15 bg-[#0f172a] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] sm:p-9">
          <header className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-white">
                <ScrollText className="size-6" aria-hidden />
              </span>
              <p className="leading-tight">
                <span className="block text-base font-extrabold">
                  <span className="text-blue-400">SYS</span>
                  <span className="text-emerald-400">-OUTLINE</span>
                </span>
                <span className="block text-xs text-slate-400">Escriba da Palavra</span>
              </p>
            </div>
            <h1 className="pt-3 text-[26px] leading-[34px] font-extrabold text-white">Acesso ao sistema</h1>
            <p className="text-sm leading-5 text-slate-400">
              Entre para escrever ou revisar os resumos da ministração.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate aria-label="Acesso ao sistema">
            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                id="login-error"
                className="flex items-start gap-2.5 rounded-[10px] border border-red-400 bg-[#2a0f12] p-3 text-[13px] leading-[18px] font-medium text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                <AlertCircle className="mt-px size-5 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  placeholder="nome@igreja.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'login-error' : undefined}
                  className={`${FIELD_CLASS} pr-3.5`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white">
                Senha
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  enterKeyHint="go"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'login-error' : undefined}
                  className={`${FIELD_CLASS} pr-14`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(current => !current)}
                  className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-[50px] w-full cursor-pointer gap-2 rounded-[10px] bg-blue-600 text-[15px] font-bold text-white hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-400/50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Autenticando…
                </>
              ) : (
                'Entrar no painel'
              )}
            </Button>

            <p className="flex items-center gap-2 text-xs leading-4 text-slate-400">
              <LockKeyhole className="size-3.5 shrink-0" aria-hidden />
              Acesso restrito a usuários autorizados. Operações auditadas.
            </p>
          </form>

          {/* Acesso rápido: apenas em desenvolvimento local */}
          {import.meta.env.DEV && (
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
              <span className="block text-center text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Acesso rápido (somente desenvolvimento)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Admin', 'admin@escriba.com'],
                  ['Revisor', 'revisor@escriba.com'],
                  ['Escriba', 'escriba@escriba.com'],
                ].map(([label, demoEmail]) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickLogin(demoEmail)}
                    className="h-11 border-white/20 bg-white/5 text-xs font-semibold text-slate-100 hover:bg-white/10"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="text-center text-xs leading-4 text-slate-400">
          <p className="font-semibold text-slate-300">SYSTRAT Inteligência em Gestão e Tecnologia</p>
          <p className="mt-1">SYS-OUTLINE · © {CURRENT_YEAR} Todos os direitos reservados</p>
        </footer>
      </main>
    </div>
  );
};
