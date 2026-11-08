import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SermonData } from '../lib/sermonUtils';
import { SermonEditor } from './SermonEditor';
import { DataTable, ColumnDef, DataTableFilter } from './DataTable';
import { A4PreviewModal } from './A4PreviewModal';
import { ReturnReviewModal } from './ReturnReviewModal';
import { ApprovalSuccessModal } from './ApprovalSuccessModal';
import { ReviewWorkflowStepper } from './ReviewWorkflowStepper';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@sysgov/ui';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  User,
  History,
  Building,
  AlertCircle,
  Eye,
  CheckCircle2,
  ArrowLeft,
  FileText,
  Share2,
  CheckSquare,
  Square,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const { user } = useAuth();
  const [sermons, setSermons] = useState<SermonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSermon, setSelectedSermon] = useState<SermonData | null>(null);

  // Modais de Ação
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [approvedSermonForCelebration, setApprovedSermonForCelebration] = useState<SermonData | null>(null);

  // Checklist de Homologação do Revisor
  const [checklist, setChecklist] = useState({
    spelling: true,
    coherence: true,
    agenda: true,
    a4Fit: true,
  });

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const markAllConforming = () => {
    setChecklist({ spelling: true, coherence: true, agenda: true, a4Fit: true });
  };

  const allConforming = Object.values(checklist).every(Boolean);

  // Modal de Pré-visualização A4
  const [previewSermon, setPreviewSermon] = useState<SermonData | null>(null);

  // Filtros de Tabela
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/review-queue');
      const list = Array.isArray(res) ? res : res?.data || [];
      setSermons(list);
    } catch {
      showToast('Erro ao carregar fila de revisão.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleStartReview = async (sermon: SermonData) => {
    setActionLoading(true);
    try {
      const updated = await api.post<any>(`/api/sermons/${sermon.id}/start-review`, {});
      const data = updated?.data || updated;
      setSelectedSermon(data);
      showToast(`Você assumiu a revisão da ministração #${data.id}`, 'info');
      loadQueue();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || 'Erro ao assumir revisão.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSermon) return;
    setActionLoading(true);
    try {
      const res = await api.post<any>(`/api/sermons/${selectedSermon.id}/approve`, {
        notes: approveNotes,
      });
      const data = res?.data || res;
      showToast(`Mensagem #${data.id} homologada com sucesso!`, 'success');
      setShowApproveModal(false);
      setApproveNotes('');
      setApprovedSermonForCelebration(data);
      setSelectedSermon(null);
      loadQueue();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || 'Erro ao aprovar resumo.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (notes: string) => {
    if (!selectedSermon) return;
    setActionLoading(true);
    try {
      await api.post<any>(`/api/sermons/${selectedSermon.id}/reject`, {
        notes,
        rejection_reason: notes,
      });
      showToast(`Mensagem devolvida para ajustes do voluntário com sucesso!`, 'info');
      setShowRejectModal(false);
      setSelectedSermon(null);
      loadQueue();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || 'Erro ao devolver resumo.', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Filtragem dos dados para a DataTable
  const filteredSermons = sermons.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (orgFilter !== 'all' && String(s.organization_id) !== orgFilter) return false;
    return true;
  });

  // Lista de organizações únicas para o filtro
  const orgOptions = [
    { label: 'Todas as Unidades', value: 'all' },
    ...Array.from(
      new Map(
        sermons
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
        { label: 'Submetido', value: 'submitted' },
        { label: 'Em Revisão', value: 'in_review' },
        { label: 'Devolvido', value: 'rejected' },
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

  // Definição das Colunas da DataTable
  const columns: ColumnDef<SermonData>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      className: 'w-16 font-mono font-bold text-foreground',
      render: s => `#${s.id}`,
    },
    {
      key: 'title_theme',
      header: 'Tema da Ministração',
      sortable: true,
      className: 'min-w-[220px]',
      render: s => (
        <div>
          <div className="font-bold text-foreground line-clamp-1">{s.title_theme || s.theme || '(Sem tema)'}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{s.scripture_reference || s.scripture_text}</div>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Unidade / Núcleo',
      sortable: true,
      className: 'min-w-[160px]',
      render: s => (
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <Building className="size-3.5 text-gov-accent-gold shrink-0" />
          <span className="truncate">{s.organization?.name || 'Catedral'}</span>
        </span>
      ),
    },
    {
      key: 'preacher',
      header: 'Ministrante',
      sortable: true,
      render: s => (
        <span className="text-foreground">
          {s.preacher_title || s.minister_title} {s.preacher_name || s.minister_name}
        </span>
      ),
    },
    {
      key: 'service_date',
      header: 'Data Culto',
      sortable: true,
      className: 'font-mono text-xs whitespace-nowrap',
      render: s => s.service_date,
    },
    {
      key: 'chars',
      header: 'Caracteres A4',
      sortable: true,
      className: 'font-mono text-xs text-right whitespace-nowrap',
      render: s => {
        const chars = s.summary_text?.length || 0;
        const isExceeded = chars > 3400;
        return (
          <span className={`font-semibold ${isExceeded ? 'text-critical' : 'text-success-strong'}`}>
            {chars.toLocaleString('pt-BR')} / 3.400
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'text-center',
      render: s => {
        if (s.status === 'in_review') {
          return (
            <Badge variant="outline" className="border-warning-border bg-warning-surface text-warning-strong font-mono text-[11px] font-bold">
              EM REVISÃO
            </Badge>
          );
        }
        if (s.status === 'rejected') {
          return (
            <Badge variant="outline" className="border-critical-border bg-critical-surface text-critical-strong font-mono text-[11px] font-bold">
              DEVOLVIDO
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="border-info-border bg-info-surface text-info-strong font-mono text-[11px] font-bold">
            SUBMETIDO
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ação de Homologação',
      className: 'text-right min-w-[190px]',
      render: s => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewSermon(s)}
            className="h-8 px-2 text-xs text-foreground border-border hover:bg-muted"
            title="Pré-visualizar folha A4"
          >
            <Eye className="size-3.5 text-gov-accent-gold" />
          </Button>

          {s.status === 'submitted' ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleStartReview(s)}
              disabled={actionLoading}
              className="h-8 px-3 text-xs font-semibold gap-1"
            >
              <span>Assumir Revisão</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSermon(s)}
              className="h-8 px-3 text-xs border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold gap-1"
            >
              <span>Continuar Revisão</span>
              <ArrowRight className="size-3.5" />
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
          {toastType === 'error' && <AlertCircle className="size-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedSermon ? (
        /* Modo de Revisão Ativa */
        <div className="space-y-4">
          {/* Barra Superior de Ações do Revisor */}
          <div className="card-modern flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/95 p-4 shadow-xs backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSermon(null)}
                className="text-xs text-foreground"
              >
                <ArrowLeft className="size-4 mr-1" />
                Voltar à Fila
              </Button>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">
                  Revisando Resumo #{selectedSermon.id}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-md">
                  {selectedSermon.title_theme || selectedSermon.theme}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowWhatsAppModal(true)}
                className="text-xs border-success-border bg-success-surface text-success-strong hover:bg-success hover:text-white font-medium gap-1.5"
              >
                <Share2 className="size-3.5" />
                <span>WhatsApp das Células</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewSermon(selectedSermon)}
                className="text-xs border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium gap-1.5"
              >
                <Eye className="size-3.5 text-gov-accent-gold" />
                <span>Folha A4</span>
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="text-xs font-semibold shadow-2xs gap-1.5"
              >
                <XCircle className="size-3.5" />
                <span>Devolver para Ajustes</span>
              </Button>

              <Button
                size="sm"
                variant="success"
                onClick={() => setShowApproveModal(true)}
                disabled={actionLoading}
                className="text-xs font-bold shadow-2xs gap-1.5"
              >
                <CheckCircle className="size-3.5" />
                <span>Aprovar para Células</span>
              </Button>
            </div>
          </div>

          {/* Stepper de Ciclo de Vida */}
          <ReviewWorkflowStepper
            currentStatus={selectedSermon.status}
            rejectionReason={selectedSermon.rejection_reason}
            reviewerName={selectedSermon.reviewer?.name || user?.name}
          />

          {/* Card de Auditoria & Checklist de Homologação do Revisor */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-gov-accent-gold" />
                <h3 className="font-bold text-sm text-foreground">Checklist de Homologação do Revisor</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                  allConforming ? 'bg-success-surface text-success-strong border border-success-border' : 'bg-warning-surface text-warning-strong border border-warning-border'
                }`}>
                  {Object.values(checklist).filter(Boolean).length} / 4 Critérios Verificados
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllConforming}
                  className="text-xs text-primary hover:bg-primary/10 h-7 px-2 cursor-pointer gap-1"
                >
                  <Sparkles className="size-3.5" />
                  <span>Marcar Todos Conformes</span>
                </Button>
              </div>
            </div>

            {/* Grid dos 4 critérios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => toggleChecklist('spelling')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  checklist.spelling ? 'bg-success-surface/70 border-success-border text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {checklist.spelling ? <CheckSquare className="size-4 text-success shrink-0 mt-0.5" /> : <Square className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div>
                  <div className="font-semibold text-foreground">1. Ortografia pt-BR</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Sem erros léxicos e concordância revista</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleChecklist('coherence')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  checklist.coherence ? 'bg-success-surface/70 border-success-border text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {checklist.coherence ? <CheckSquare className="size-4 text-success shrink-0 mt-0.5" /> : <Square className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div>
                  <div className="font-semibold text-foreground">2. Coerência da Palavra</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Mensagem clara e fiel à ministração</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleChecklist('agenda')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  checklist.agenda ? 'bg-success-surface/70 border-success-border text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {checklist.agenda ? <CheckSquare className="size-4 text-success shrink-0 mt-0.5" /> : <Square className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div>
                  <div className="font-semibold text-foreground">3. Agenda & Avisos</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Cultos da semana e datas atualizados</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleChecklist('a4Fit')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  checklist.a4Fit ? 'bg-success-surface/70 border-success-border text-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {checklist.a4Fit ? <CheckSquare className="size-4 text-success shrink-0 mt-0.5" /> : <Square className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div>
                  <div className="font-semibold text-foreground">4. Enquadramento A4</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Dentro do limite de folha única (≤ 3.400)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Editor com os dados do Resumo */}
          <SermonEditor
            initialSermon={selectedSermon}
            onSaved={updated => setSelectedSermon(updated)}
            readOnly={false}
          />
        </div>
      ) : (
        /* Modo Lista / Fila de Revisão */
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <CheckSquare className="size-5 text-gov-accent-gold" />
              <span>Fila de Homologação & Revisão</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Resumos enviados pelos voluntários aguardando conferência ortográfica e liberação para as células.
            </p>
          </div>

          {/* DataTable */}
          <DataTable<SermonData>
            data={filteredSermons}
            columns={columns}
            searchPlaceholder="Buscar por tema, texto bíblico, ministrante ou unidade..."
            filters={tableFilters}
            onClearFilters={() => {
              setStatusFilter('all');
              setOrgFilter('all');
            }}
            isLoading={loading}
            emptyMessage="Nenhum resumo pendente de revisão encontrado."
            rowKey={s => s.id || 0}
          />
        </div>
      )}

      {/* Modal de Devolução Inteligente */}
      <ReturnReviewModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        sermonId={selectedSermon?.id}
        sermonTheme={selectedSermon?.title_theme || selectedSermon?.theme}
      />

      {/* Modal de Aprovação / Parecer */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-success-surface text-success border border-success-border flex items-center justify-center shrink-0">
                <CheckCircle className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Homologar Resumo da Palavra</h3>
                <p className="text-xs text-muted-foreground">
                  Esta mensagem ficará disponível na biblioteca e liberada para leitura nas células.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Parecer do Revisor (Opcional):
              </label>
              <textarea
                rows={3}
                value={approveNotes}
                onChange={e => setApproveNotes(e.target.value)}
                placeholder="Ex: Ortografia conferida, enquadramento A4 perfeito e texto aprovado para leitura no meio da semana..."
                className="w-full text-xs p-2.5 border border-input rounded-lg focus:ring-2 focus:ring-success focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleApprove}
                disabled={actionLoading}
                className="font-bold gap-1.5"
              >
                <CheckCircle className="size-4" />
                <span>{actionLoading ? 'Homologando...' : 'Confirmar Aprovação'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Celebração e Distribuição Imediata */}
      <ApprovalSuccessModal
        isOpen={Boolean(approvedSermonForCelebration)}
        onClose={() => setApprovedSermonForCelebration(null)}
        sermon={approvedSermonForCelebration}
        onOpenWhatsApp={() => {
          setSelectedSermon(approvedSermonForCelebration);
          setShowWhatsAppModal(true);
        }}
        onOpenA4Preview={() => {
          setPreviewSermon(approvedSermonForCelebration);
        }}
      />

      {/* Modal de Distribuição WhatsApp */}
      <WhatsAppShareModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        sermon={selectedSermon || approvedSermonForCelebration}
      />

      {/* Modal de Pré-visualização A4 */}
      <A4PreviewModal
        isOpen={Boolean(previewSermon)}
        onClose={() => setPreviewSermon(null)}
        sermon={previewSermon}
      />
    </div>
  );
};
