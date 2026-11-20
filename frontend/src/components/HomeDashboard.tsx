import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckSquare, FileText, BookOpen, Users, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Badge } from '@sysgov/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StatsOverview } from './StatsOverview';
import { PunctualityCard } from './PunctualityCard';
import type { TabKey } from './AppLayout';

interface MySchedule {
  id: number;
  service_date: string;
  deadline_at: string;
  status: string;
}

interface Shortcut {
  tab: TabKey;
  label: string;
  icon: LucideIcon;
  roles: string[];
}

const SHORTCUTS: Shortcut[] = [
  { tab: 'editor', label: 'Escrever resumo', icon: FileText, roles: ['scribe', 'admin', 'unit_admin', 'reviewer'] },
  { tab: 'schedules', label: 'Escalas', icon: CalendarDays, roles: ['scribe', 'admin', 'unit_admin', 'reviewer'] },
  { tab: 'review', label: 'Fila de revisão', icon: CheckSquare, roles: ['reviewer', 'admin', 'unit_admin'] },
  { tab: 'sermons', label: 'Biblioteca', icon: BookOpen, roles: ['scribe', 'admin', 'unit_admin', 'reviewer'] },
  { tab: 'users', label: 'Voluntários', icon: Users, roles: ['admin', 'unit_admin'] },
  { tab: 'settings', label: 'Configurações', icon: Settings, roles: ['admin', 'unit_admin'] },
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/**
 * Tela inicial: próxima entrega do escriba, atalhos do papel e, para gestores, a visão operacional.
 */
export const HomeDashboard: React.FC<{ onNavigate: (tab: TabKey) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const role = user?.role ?? '';
  const isManager = role === 'admin' || role === 'unit_admin' || role === 'reviewer';
  const [schedules, setSchedules] = useState<MySchedule[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    api
      .get<MySchedule[]>('/api/schedules/my')
      .then(setSchedules)
      .catch(() => setSchedules([]));
  }, [userId]);

  const next = (schedules ?? [])
    .filter(s => s.status === 'pending' || s.status === 'delayed')
    .sort((a, b) => a.deadline_at.localeCompare(b.deadline_at))[0];

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Olá, {firstName}</h2>
        {user?.organization?.name && <p className="text-sm text-muted-foreground">{user.organization.name}</p>}
      </div>

      {schedules !== null && (
        <section aria-labelledby="home-next" className="rounded-xl border border-border bg-card p-4">
          <h3 id="home-next" className="text-sm font-semibold text-foreground">
            Sua próxima entrega
          </h3>
          {next ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex-1 text-sm">
                <p className="tabular-nums">
                  Culto de {new Date(`${next.service_date.slice(0, 10)}T00:00`).toLocaleDateString('pt-BR')} · prazo{' '}
                  {formatDateTime(next.deadline_at)}
                </p>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {next.status === 'delayed' ? 'Prazo vencido' : 'Pendente'}
                </Badge>
              </div>
              <Button type="button" onClick={() => onNavigate('schedules')}>
                Ver minhas escalas
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Nenhuma entrega pendente no momento.</p>
          )}
        </section>
      )}

      <nav aria-label="Atalhos" className="flex flex-wrap gap-2">
        {SHORTCUTS.filter(s => s.roles.includes(role)).map(s => (
          <Button key={s.tab} type="button" variant="outline" size="sm" onClick={() => onNavigate(s.tab)}>
            <s.icon className="mr-1.5 size-4" />
            {s.label}
          </Button>
        ))}
      </nav>

      {isManager && <StatsOverview onNavigateToTab={tab => onNavigate(tab as TabKey)} />}

      {(role === 'admin' || role === 'unit_admin') && <PunctualityCard />}
    </div>
  );
};
