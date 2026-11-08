import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StatCard, Button, Badge } from '@sysgov/ui';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  RefreshCw,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface DashboardStats {
  total_sermons: number;
  approved_sermons: number;
  pending_reviews: number;
  rejected_sermons: number;
  total_schedules: number;
  pending_schedules: number;
  active_volunteers: number;
  approval_rate: number;
  organization?: {
    id: number;
    name: string;
    type: string;
  };
}

interface StatsOverviewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ onNavigateToTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/dashboard/stats');
      const data = res?.data || res;
      setStats(data || null);
    } catch (err) {
      console.error('Falha ao obter métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="stats-overview w-full space-y-3.5">
      {/* Header com Unidade e Botão Atualizar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">
            Visão Operacional
          </h2>
          {stats?.organization && (
            <Badge variant="outline" className="text-xs font-mono font-medium border-primary/30 bg-primary/10 text-foreground">
              {stats.organization.name}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="text-xs h-8 gap-1.5 cursor-pointer border-border hover:bg-muted font-semibold"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Atualizar Indicadores</span>
        </Button>
      </div>

      {/* Grid de StatCards com Bordas Laterais Coloridas e Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Fila de Revisão (Lateral Vermelha / Âmbar) */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('review')}
          className="min-w-0 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <StatCard
            label="Fila de Revisão"
            value={stats ? stats.pending_reviews : (loading ? '...' : 0)}
            hint={stats?.pending_reviews ? `${stats.pending_reviews} aguardando revisão` : 'Fila zerada e em dia'}
            accent={stats && stats.pending_reviews > 0 ? 'critical' : 'warning'}
            icon={<Clock className="size-4" />}
          />
        </div>

        {/* Card 2: Homologadas para Células (Lateral Verde) */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('sermons')}
          className="min-w-0 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <StatCard
            label="Homologadas"
            value={stats ? stats.approved_sermons : (loading ? '...' : 0)}
            hint={stats ? `${stats.approval_rate}% do acervo total` : 'Aprovadas'}
            accent="success"
            icon={<CheckCircle2 className="size-4" />}
          />
        </div>

        {/* Card 3: Ministrações Registradas (Lateral Azul Royal) */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('sermons')}
          className="min-w-0 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <StatCard
            label="Total Ministrações"
            value={stats ? stats.total_sermons : (loading ? '...' : 0)}
            hint="Rascunhos e finalizadas"
            accent="primary"
            icon={<FileText className="size-4" />}
          />
        </div>

        {/* Card 4: Escalas Dominicais (Lateral Dourada / Alerta) */}
        <div
          onClick={() => onNavigateToTab && onNavigateToTab('schedules')}
          className="min-w-0 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <StatCard
            label="Escalas"
            value={stats ? stats.total_schedules : (loading ? '...' : 0)}
            hint={stats ? `${stats.pending_schedules} pendentes` : 'Plantões'}
            accent="warning"
            icon={<Calendar className="size-4" />}
          />
        </div>

        {/* Card 5: Voluntários Ativos (Lateral Azul Navy) */}
        <div
          onClick={() => onNavigateToTab && ['admin', 'unit_admin'].includes(user?.role ?? '') && onNavigateToTab('users')}
          className="min-w-0 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <StatCard
            label="Equipe Ativa"
            value={stats ? stats.active_volunteers : (loading ? '...' : 0)}
            hint="Escribas e revisores"
            accent="neutral"
            icon={<Users className="size-4" />}
          />
        </div>
      </div>
    </div>
  );
};
