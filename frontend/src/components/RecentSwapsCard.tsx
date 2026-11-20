import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface SwappedSchedule {
  id: number;
  service_date: string;
  swapped_at: string | null;
  swapped_from?: { name: string } | null;
  scribe?: { name: string } | null;
}

const WINDOW_DAYS = 14;

/**
 * Avisa a coordenação das escalas passadas entre escribas nos últimos dias.
 */
export const RecentSwapsCard: React.FC = () => {
  const [schedules, setSchedules] = useState<SwappedSchedule[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    api
      .get<SwappedSchedule[]>('/api/schedules')
      .then(data => setSchedules(Array.isArray(data) ? data : []))
      .catch(() => setSchedules([]));
  }, []);

  const recent = schedules
    .filter(s => s.swapped_at && now - new Date(s.swapped_at).getTime() <= WINDOW_DAYS * 86_400_000)
    .sort((a, b) => (b.swapped_at ?? '').localeCompare(a.swapped_at ?? ''));

  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-swaps" className="rounded-xl border border-border bg-card p-4">
      <h3 id="recent-swaps" className="text-sm font-semibold text-foreground">
        Trocas de escala recentes
        <span className="ml-2 text-xs font-normal text-muted-foreground">últimos {WINDOW_DAYS} dias</span>
      </h3>
      <ul className="mt-2 space-y-1 text-sm">
        {recent.map(s => (
          <li key={s.id} className="tabular-nums">
            Culto de {new Date(`${s.service_date.slice(0, 10)}T00:00`).toLocaleDateString('pt-BR')}:{' '}
            {s.swapped_from?.name ?? 'escriba anterior'} passou para <strong>{s.scribe?.name}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
};
