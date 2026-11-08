import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DataTable, ColumnDef, DataTableFilter } from './DataTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Building,
  Edit,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';

export interface DutyScheduleItem {
  id: number;
  organization_id: number;
  user_id: number;
  substitute_user_id?: number | null;
  service_date: string;
  shift: 'manha' | 'noite' | 'integral';
  deadline_at: string;
  status: 'scheduled' | 'submitted' | 'reviewed' | 'completed' | 'delayed';
  notes?: string | null;
  organization?: { id: number; name: string; type: string };
  scribe?: { id: number; name: string; email: string };
  substitute?: { id: number; name: string; email: string } | null;
  sermon_summary?: { id: number; status: string; title_theme: string } | null;
}

interface UserOption {
  id: number;
  name: string;
  role: string;
}

interface OrgOption {
  id: number;
  name: string;
  type: string;
}

interface DutyRosterProps {
  onSelectScheduleForWriting?: (schedule: DutyScheduleItem) => void;
}

export const DutyRoster: React.FC<DutyRosterProps> = ({ onSelectScheduleForWriting }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<DutyScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  // Modal de criação
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [orgsList, setOrgsList] = useState<OrgOption[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [orgId, setOrgId] = useState<number>(user?.organization?.id || 1);
  const [scribeId, setScribeId] = useState<number | ''>('');
  const [substituteId, setSubstituteId] = useState<number | ''>('');
  const [serviceDate, setServiceDate] = useState('');
  const [shift, setShift] = useState<'manha' | 'noite' | 'integral'>('manha');
  const [deadlineAt, setDeadlineAt] = useState('');
  const [notes, setNotes] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'scribe' ? '/api/schedules/my' : '/api/schedules';
      const res = await api.get<any>(endpoint);
      const data = Array.isArray(res) ? res : res?.data || [];
      const list: DutyScheduleItem[] = data.map((schedule: any): DutyScheduleItem => {
        const shift: DutyScheduleItem['shift'] = schedule.service_time < '12:00:00'
          ? 'manha'
          : schedule.service_time < '17:00:00'
          ? 'integral'
          : 'noite';
        const status: DutyScheduleItem['status'] = schedule.status === 'pending'
          ? 'scheduled'
          : schedule.status;
        return {
          ...schedule,
          user_id: schedule.scribe_user_id,
          shift,
          status,
          sermon_summary: schedule.summary,
        };
      });
      setSchedules(list);
    } catch {
      showToast('Erro ao carregar escalas dominicais.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadDependencies = useCallback(async () => {
    if (user?.role !== 'admin' && user?.role !== 'unit_admin') return;
    try {
      const [orgsRes, usersRes] = await Promise.all([
        api.get<any>('/api/organizations'),
        api.get<any>('/api/users'),
      ]);
      setOrgsList(Array.isArray(orgsRes) ? orgsRes : orgsRes?.data || []);
      setUsersList(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
    } catch {
      // Ignora erro silencioso
    }
  }, [user]);

  useEffect(() => {
    loadSchedules();
    loadDependencies();
  }, [loadSchedules, loadDependencies]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate || !deadlineAt || !scribeId) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    setCreating(true);
    try {
      await api.post('/api/schedules', {
        organization_id: orgId,
        scribe_user_id: scribeId,
        substitute_user_id: substituteId || null,
        service_date: serviceDate,
        service_time: shift === 'manha' ? '09:00:00' : shift === 'noite' ? '18:30:00' : '12:00:00',
        deadline_at: deadlineAt,
        notes,
      });

      showToast('Escala dominical agendada com sucesso!', 'success');
      setShowCreateModal(false);
      resetForm();
      loadSchedules();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || 'Erro ao criar escala.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setServiceDate('');
    setDeadlineAt('');
    setScribeId('');
    setSubstituteId('');
    setNotes('');
  };

  // Filtragem dos dados
  const filteredSchedules = schedules.filter(sch => {
    if (statusFilter !== 'all' && sch.status !== statusFilter) return false;
    if (shiftFilter !== 'all' && sch.shift !== shiftFilter) return false;
    if (orgFilter !== 'all' && String(sch.organization_id) !== orgFilter) return false;
    return true;
  });

  const orgOptions = [
    { label: 'Todas as Unidades', value: 'all' },
    ...Array.from(
      new Map(
        schedules
          .filter(s => s.organization)
          .map(s => [String(s.organization!.id), s.organization!.name])
      ).entries()
    ).map(([val, label]) => ({ label, value: val })),
  ];

  const tableFilters: DataTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Todos os Status', value: 'all' },
        { label: 'Agendada', value: 'scheduled' },
        { label: 'Resumo Enviado', value: 'submitted' },
        { label: 'Concluída', value: 'completed' },
        { label: 'Atrasada', value: 'delayed' },
      ],
    },
    {
      key: 'shift',
      label: 'Turno',
      value: shiftFilter,
      onChange: setShiftFilter,
      options: [
        { label: 'Todos os Turnos', value: 'all' },
        { label: 'Manhã', value: 'manha' },
        { label: 'Noite', value: 'noite' },
        { label: 'Integral', value: 'integral' },
      ],
    },
    {
      key: 'organization',
      label: 'Unidade',
      value: orgFilter,
      onChange: setOrgFilter,
      options: orgOptions,
    },
  ];

  const columns: ColumnDef<DutyScheduleItem>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      className: 'w-16 font-mono font-bold text-foreground',
      render: sch => `#${sch.id}`,
    },
    {
      key: 'service_date',
      header: 'Data do Culto & Turno',
      sortable: true,
      className: 'min-w-[170px]',
      render: sch => (
        <div>
          <div className="font-bold text-foreground font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-foreground" />
            {sch.service_date}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
            Turno: {sch.shift}
          </span>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Unidade / Núcleo',
      sortable: true,
      className: 'min-w-[150px]',
      render: sch => (
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-gov-accent-gold shrink-0" />
          <span className="truncate">{sch.organization?.name || 'Catedral'}</span>
        </span>
      ),
    },
    {
      key: 'scribe',
      header: 'Escriba Titular',
      sortable: true,
      render: sch => (
        <div>
          <div className="font-medium text-foreground">{sch.scribe?.name || 'Não atribuído'}</div>
          {sch.substitute && (
            <div className="text-[11px] text-muted-foreground">Suplente: {sch.substitute.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'deadline_at',
      header: 'Prazo Limite',
      sortable: true,
      className: 'font-mono text-xs whitespace-nowrap',
      render: sch => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3 text-muted-foreground/70" />
          {sch.deadline_at?.replace('T', ' ').slice(0, 16)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'text-center',
      render: sch => {
        if (sch.status === 'delayed') {
          return (
            <Badge className="bg-critical-surface text-critical-strong border-critical-border font-mono text-[11px] font-semibold">
              Atrasada
            </Badge>
          );
        }
        if (sch.status === 'submitted') {
          return (
            <Badge className="bg-info-surface text-info-strong border-info-border font-mono text-[11px] font-semibold">
              Resumo Enviado
            </Badge>
          );
        }
        if (sch.status === 'completed' || sch.status === 'reviewed') {
          return (
            <Badge className="bg-success-surface text-success-strong border-success-border font-mono text-[11px] font-semibold">
              Concluída
            </Badge>
          );
        }
        return (
          <Badge className="bg-muted text-foreground border-input font-mono text-[11px] font-semibold">
            Agendada
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right min-w-[150px]',
      render: sch => (
        <div className="flex items-center justify-end gap-1.5">
          {onSelectScheduleForWriting && (
            <Button
              size="sm"
              onClick={() => onSelectScheduleForWriting(sch)}
              className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <FileEdit className="w-3 h-3 mr-1" />
              {sch.sermon_summary ? 'Editar Resumo' : 'Escrever'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl transition-all duration-300 flex items-center gap-2 ${
            toastType === 'success'
              ? 'bg-success text-white'
              : toastType === 'error'
              ? 'bg-critical text-white'
              : 'bg-primary text-white'
          }`}
        >
          {toastType === 'success' && <CheckCircle2 className="size-4" />}
          {toastType === 'error' && <AlertTriangle className="size-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="size-5 text-gov-accent-gold" />
            <span>{user?.role === 'scribe' ? 'Minhas Escalas Dominicais' : 'Gestão de Escalas Dominicais'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acompanhamento de plantões dominicais, prazos de entrega e responsabilidades de cobertura da palavra.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'unit_admin') && (
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-semibold shadow-xs self-start sm:self-auto gap-1.5"
          >
            <Plus className="size-4" />
            <span>Nova Escala</span>
          </Button>
        )}
      </div>

      {/* Tabela de Escalas */}
      <DataTable<DutyScheduleItem>
        data={filteredSchedules}
        columns={columns}
        searchPlaceholder="Buscar por voluntário, data, notas ou unidade..."
        filters={tableFilters}
        onClearFilters={() => {
          setStatusFilter('all');
          setShiftFilter('all');
          setOrgFilter('all');
        }}
        isLoading={loading}
        emptyMessage="Nenhuma escala dominical encontrada para os critérios informados."
        rowKey={sch => sch.id}
      />

      {/* Modal de Criação de Escala */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg p-6 border border-border space-y-4">
            <h3 className="font-bold text-base text-foreground border-b pb-2">Agendar Nova Escala Dominical</h3>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Unidade / Igreja *</label>
                <select
                  value={orgId}
                  onChange={e => setOrgId(Number(e.target.value))}
                  disabled={user?.role === 'unit_admin'}
                  className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden focus:border-ring"
                  required
                >
                  {orgsList.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Escriba Titular *</label>
                  <select
                    value={scribeId}
                    onChange={e => setScribeId(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden focus:border-ring"
                    required
                  >
                    <option value="">Selecione...</option>
                    {usersList.filter(u => u.role === 'scribe').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Suplente (Opcional)</label>
                  <select
                    value={substituteId}
                    onChange={e => setSubstituteId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden focus:border-ring"
                  >
                    <option value="">Nenhum</option>
                    {usersList.filter(u => u.role === 'scribe').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Data do Culto *</label>
                  <Input
                    type="date"
                    value={serviceDate}
                    onChange={e => setServiceDate(e.target.value)}
                    className="text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Turno *</label>
                  <select
                    value={shift}
                    onChange={e => setShift(e.target.value as any)}
                    className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden"
                  >
                    <option value="manha">Manhã</option>
                    <option value="noite">Noite</option>
                    <option value="integral">Integral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Prazo de Entrega do Resumo *</label>
                <Input
                  type="datetime-local"
                  value={deadlineAt}
                  onChange={e => setDeadlineAt(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Observações do Plantão</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex.: Culto especial da família com ceia do Senhor..."
                  className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="bg-primary text-white text-xs font-semibold"
                >
                  {creating ? 'Salvando...' : 'Criar Escala'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
