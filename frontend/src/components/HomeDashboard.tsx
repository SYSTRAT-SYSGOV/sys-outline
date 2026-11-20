import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Check, Clock, FileText, MessageSquareText } from 'lucide-react';
import { Button } from '@sysgov/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { StatsOverview } from './StatsOverview';
import { PunctualityCard } from './PunctualityCard';
import { RecentSwapsCard } from './RecentSwapsCard';
import type { TabKey } from './AppLayout';
import type { DutyScheduleItem } from './DutyRoster';

interface MySchedule {
  id: number;
  organization_id: number;
  service_date: string;
  service_time: string;
  deadline_at: string;
  status: string;
  scribe_user_id?: number;
  swapped_at?: string | null;
  swapped_from?: { name: string } | null;
  organization?: { id: number; name: string; type: string };
  summary?: { id: number; status: string; summary_text?: string | null } | null;
}

interface RecentSermon {
  id: number;
  theme?: string | null;
  service_date: string;
  status: string;
  summary_text?: string | null;
}

interface HomeDashboardProps {
  onNavigate: (tab: TabKey) => void;
  /** Abre o editor a partir de uma escala (mesmo comportamento do botão "Escrever" em Escalas). */
  onWrite: (schedule: DutyScheduleItem) => void;
}

const STEPS = ['Rascunho', 'Submetido', 'Em revisão', 'Aprovado'];
const DAY = 86_400_000;

const SERMON_STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-background text-slate-600 border-border' },
  submitted: { label: 'Submetido', className: 'bg-info-surface text-info-strong border-info-border' },
  in_review: { label: 'Em revisão', className: 'bg-warning-surface text-warning-strong border-warning-border' },
  rejected: { label: 'Devolvido', className: 'bg-critical-surface text-critical-strong border-critical-border' },
  approved: { label: 'Aprovado', className: 'bg-success-surface text-success-strong border-success-border' },
};

const toItem = (s: MySchedule): DutyScheduleItem =>
  ({
    ...s,
    user_id: s.scribe_user_id ?? 0,
    shift: s.service_time < '12:00:00' ? 'manha' : s.service_time < '17:00:00' ? 'integral' : 'noite',
    status: s.status === 'pending' ? 'scheduled' : s.status,
    sermon_summary: s.summary,
  }) as unknown as DutyScheduleItem;

const stageOf = (status?: string) => (status === 'submitted' ? 1 : status === 'in_review' ? 2 : status === 'approved' ? 3 : 0);

const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso.slice(0, 10)}T00:00`).toLocaleDateString('pt-BR', opts);

function countdown(deadlineAt: string, now: number) {
  const hours = Math.round((new Date(deadlineAt).getTime() - now) / 3_600_000);
  if (hours < 0) return { text: 'Prazo vencido', late: true };
  if (hours < 1) return { text: 'vence em menos de 1 hora', late: false };
  if (hours < 24) return { text: `vence em ${hours} h`, late: false };
  const days = Math.round(hours / 24);
  return { text: `vence em ${days} ${days === 1 ? 'dia' : 'dias'}`, late: false };
}

/**
 * Tela inicial: o que precisa da sua atenção agora. Escriba vê a próxima entrega; gestores veem a visão operacional.
 */
export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, onWrite }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const userId = user?.id;
  const role = user?.role ?? '';
  const isManager = role === 'admin' || role === 'unit_admin' || role === 'reviewer';
  const isCoordination = role === 'admin' || role === 'unit_admin';
  const [now] = useState(() => Date.now());
  const [schedules, setSchedules] = useState<MySchedule[] | null>(null);
  const [recent, setRecent] = useState<RecentSermon[]>([]);
  const [comments, setComments] = useState<{ sermonId: number; open: number } | null>(null);

  useEffect(() => {
    if (!userId) return;
    api
      .get<MySchedule[]>('/api/schedules/my')
      .then(setSchedules)
      .catch(() => setSchedules([]));
    api
      .get<RecentSermon[]>(`/api/sermons?scribe_user_id=${userId}`)
      .then(res => setRecent(Array.isArray(res) ? res : []))
      .catch(() => setRecent([]));
  }, [userId]);

  const next = (schedules ?? [])
    .filter(s => s.status === 'pending' || s.status === 'delayed')
    .sort((a, b) => a.deadline_at.localeCompare(b.deadline_at))[0];
  const sermonId = next?.summary?.id;

  useEffect(() => {
    if (!sermonId) return;
    api
      .get<Array<{ resolved_at: string | null }>>(`/api/sermons/${sermonId}/comments`)
      .then(list => setComments({ sermonId, open: list.filter(c => !c.resolved_at).length }))
      .catch(() => setComments(null));
  }, [sermonId]);

  const received = (schedules ?? []).filter(
    s => s.swapped_at && s.swapped_from && s.scribe_user_id === userId && now - new Date(s.swapped_at).getTime() <= 7 * DAY,
  );
  const openComments = comments && comments.sermonId === sermonId ? comments.open : 0;

  const stage = stageOf(next?.summary?.status);
  const chars = next?.summary?.summary_text?.length ?? 0;
  const limit = settings.summary_char_limit;
  const pct = Math.min(100, Math.round((chars / limit) * 100));
  const barColor = chars > limit ? 'bg-critical-strong' : pct >= 90 ? 'bg-warning' : 'bg-success-strong';
  const due = next ? countdown(next.deadline_at, now) : null;
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      <header className="space-y-0.5">
        <h2 className="text-[26px] leading-[34px] font-extrabold text-foreground">Olá, {firstName}</h2>
        {user?.organization?.name && <p className="text-sm text-slate-600">{user.organization.name}</p>}
      </header>

      {received.map(s => (
        <div key={s.id} role="status" className="flex items-center gap-3 rounded-xl border border-info-border bg-info-surface p-4 text-sm">
          <ArrowLeftRight className="size-5 shrink-0 text-info-strong" aria-hidden />
          <p>
            <strong className="font-bold text-info-strong">Você recebeu uma escala.</strong>{' '}
            {s.swapped_from?.name} passou o culto de{' '}
            <span className="font-semibold tabular-nums">{formatDate(s.service_date, { dateStyle: 'short' })}</span> para você.
          </p>
        </div>
      ))}

      {schedules !== null && (isManager ? !!next : true) && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <section aria-labelledby="home-next" className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 id="home-next" className="text-[13px] font-bold tracking-wide text-slate-600 uppercase">
                Sua próxima entrega
              </h3>
              {next && due && (
                <span
                  className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                    due.late ? 'bg-critical-surface text-critical-strong' : 'bg-warning-surface text-warning-strong'
                  }`}
                >
                  <Clock className="size-3.5" aria-hidden />
                  {due.text}
                </span>
              )}
            </div>

            {next ? (
              <>
                <div className="space-y-1">
                  <p className="text-[22px] leading-[30px] font-extrabold text-foreground">
                    Culto de {formatDate(next.service_date, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    Entrega até{' '}
                    {new Date(next.deadline_at).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                    {next.organization?.name ? ` · ${next.organization.name}` : ''}
                  </p>
                </div>

                <ol aria-label="Etapas do resumo" className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[13px]">
                  {STEPS.map((label, i) => {
                    const done = i < stage;
                    const current = i === stage;
                    return (
                      <li key={label} aria-current={current ? 'step' : undefined} className="flex items-center gap-2.5">
                        <span
                          className={`flex size-7 items-center justify-center rounded-full text-[13px] font-bold ${
                            done
                              ? 'bg-success-strong text-white'
                              : current
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-muted-foreground bg-card text-slate-600'
                          }`}
                        >
                          {done ? <Check className="size-4" aria-hidden /> : i + 1}
                        </span>
                        <span className={current ? 'font-bold text-foreground' : 'font-medium text-slate-600'}>{label}</span>
                        {i < STEPS.length - 1 && <span aria-hidden className="h-0.5 w-7 rounded bg-border" />}
                      </li>
                    );
                  })}
                </ol>

                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] font-semibold">
                    <span>Resumo da palavra</span>
                    <span className="text-slate-600 tabular-nums">
                      {chars.toLocaleString('pt-BR')} / {limit.toLocaleString('pt-BR')} caracteres
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Caracteres do resumo"
                    aria-valuemin={0}
                    aria-valuemax={limit}
                    aria-valuenow={chars}
                    className="h-2 overflow-hidden rounded bg-muted"
                  >
                    <div className={`h-full rounded ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => onWrite(toItem(next))} className="min-h-11 gap-2">
                    <FileText className="size-4" aria-hidden />
                    {next.summary ? 'Continuar escrevendo' : 'Começar a escrever'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onNavigate('schedules')} className="min-h-11 gap-2">
                    <ArrowLeftRight className="size-4" aria-hidden />
                    Passar escala
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">Nenhuma entrega pendente no momento. Bom trabalho!</p>
            )}
          </section>

          {next && openComments > 0 && (
            <aside aria-labelledby="home-comments" className="space-y-3 rounded-xl border border-warning-border bg-warning-surface p-5">
              <h3 id="home-comments" className="flex items-center gap-2 text-[15px] font-bold text-warning-strong">
                <MessageSquareText className="size-[18px]" aria-hidden />
                {openComments} {openComments === 1 ? 'comentário da revisão' : 'comentários da revisão'}
              </h3>
              <p className="text-sm text-slate-600">Veja o que o revisor pediu e marque como resolvido antes de reenviar.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => onWrite(toItem(next))} className="min-h-9">
                Ver comentários
              </Button>
            </aside>
          )}
        </div>
      )}

      {!isManager && (
        <section aria-labelledby="home-recent" className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 id="home-recent" className="text-base font-bold">
              Seus resumos recentes
            </h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('sermons')} className="text-primary">
              Ver biblioteca
            </Button>
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Você ainda não escreveu nenhum resumo.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {recent
                .slice()
                .sort((a, b) => b.service_date.localeCompare(a.service_date))
                .slice(0, 3)
                .map(s => {
                  const st = SERMON_STATUS[s.status] ?? SERMON_STATUS.draft;
                  return (
                    <li key={s.id} className="flex items-center gap-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{s.theme || 'Sem tema'}</p>
                        <p className="text-xs text-slate-600 tabular-nums">
                          Culto de {formatDate(s.service_date, { dateStyle: 'short' })}
                          {s.summary_text ? ` · ${s.summary_text.length.toLocaleString('pt-BR')} caracteres` : ''}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${st.className}`}>{st.label}</span>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>
      )}

      {isManager && <StatsOverview onNavigateToTab={tab => onNavigate(tab as TabKey)} />}
      {isCoordination && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <RecentSwapsCard />
          <PunctualityCard />
        </div>
      )}
    </div>
  );
};
