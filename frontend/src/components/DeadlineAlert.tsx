import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@sysgov/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface MySchedule {
  id: number;
  service_date: string;
  deadline_at: string;
  status: string;
}

const WARNING_WINDOW_HOURS = 72;

function describeDeadline(deadlineAt: string, now: number): string {
  const hours = Math.round((new Date(deadlineAt).getTime() - now) / 3_600_000);
  if (hours < 1) return 'vence em menos de 1 hora';
  if (hours < 24) return `vence em ${hours} h`;
  const days = Math.round(hours / 24);
  return `vence em ${days} ${days === 1 ? 'dia' : 'dias'}`;
}

/**
 * Faixa de aviso para quem tem escala pendente com prazo próximo ou vencido.
 */
export const DeadlineAlert: React.FC<{ onOpenSchedules: () => void }> = ({ onOpenSchedules }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [schedules, setSchedules] = useState<MySchedule[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!userId) return;
    api
      .get<MySchedule[]>('/api/schedules/my')
      .then(setSchedules)
      .catch(() => setSchedules([]));
  }, [userId]);

  const delayed = schedules.filter(s => s.status === 'delayed');
  const upcoming = schedules
    .filter(s => {
      if (s.status !== 'pending') return false;
      const hours = (new Date(s.deadline_at).getTime() - now) / 3_600_000;
      return hours <= WARNING_WINDOW_HOURS;
    })
    .sort((a, b) => a.deadline_at.localeCompare(b.deadline_at));

  if (delayed.length === 0 && upcoming.length === 0) return null;

  const isLate = delayed.length > 0;
  const message = isLate
    ? `Você tem ${delayed.length} ${delayed.length === 1 ? 'escala com prazo vencido' : 'escalas com prazo vencido'}.`
    : `Seu resumo ${describeDeadline(upcoming[0].deadline_at, now)}.`;

  return (
    <div
      role="alert"
      className={`mb-4 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${
        isLate
          ? 'border-critical-border bg-critical-surface text-critical-strong'
          : 'border-warning-border bg-warning-surface text-warning-strong'
      }`}
    >
      {isLate ? <AlertTriangle className="size-4 shrink-0" /> : <Clock className="size-4 shrink-0" />}
      <span className="flex-1">{message}</span>
      <Button type="button" variant="outline" size="sm" onClick={onOpenSchedules} className="h-7 text-xs">
        Ver escalas
      </Button>
    </div>
  );
};
