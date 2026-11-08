import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SermonData,
  SAMPLE_SERMON,
  LIMITE_RESUMO,
  countVisibleChars,
} from '../lib/sermonUtils';
import { checkSpelling, applySuggestion, SpellError } from '../lib/spellchecker';
import { copySermonToClipboard } from '../lib/whatsappFormatter';
import { SheetPreview } from './SheetPreview';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { cn } from '@sysgov/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { A4PreviewModal } from './A4PreviewModal';
import { ReviewWorkflowStepper } from './ReviewWorkflowStepper';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignJustify,
  Eraser,
  SpellCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Share2,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  History,
  Eye,
  Upload,
  Image,
} from 'lucide-react';

interface SermonEditorProps {
  initialSermon?: SermonData | null;
  onSaved?: (sermon: SermonData) => void;
  readOnly?: boolean;
}

export const SermonEditor: React.FC<SermonEditorProps> = ({
  initialSermon,
  onSaved,
  readOnly = false,
}) => {
  const { user } = useAuth();
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [sermon, setSermon] = useState<SermonData>(() => {
    if (initialSermon) return initialSermon;
    return {
      status: 'draft',
      title_theme: '',
      preacher_title: 'pela',
      preacher_name: '',
      service_date: new Date().toISOString().split('T')[0],
      location: user?.organization?.name || 'Casa de Israel - Catedral',
      cell_aim: '',
      leader_guidelines: '',
      scripture_reference: '',
      summary_text: '',
      questions: [{ question_text: '' }],
      agenda: [{ day_label: '', event_description: '' }],
      organization_id: user?.organization?.id || null,
      organization: user?.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        type: user.organization.type,
        city: user.organization.city,
        banner_url: user.organization.banner_url,
        qr_code_pix_url: user.organization.qr_code_pix_url,
      } : undefined,
    };
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isA4ModalOpen, setIsA4ModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Spellchecker state
  const [spellErrors, setSpellErrors] = useState<SpellError[]>([]);
  const [showSpellPanel, setShowSpellPanel] = useState(false);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Character calculation
  const charCount = countVisibleChars(sermon.summary_text);
  const charPercent = Math.min(100, (charCount / LIMITE_RESUMO) * 100);
  const isOverLimit = charCount > LIMITE_RESUMO;
  const isWarning = charCount >= LIMITE_RESUMO * 0.9 && !isOverLimit;

  // Run spellcheck when requested or text changes (debounced)
  useEffect(() => {
    if (showSpellPanel) {
      const errs = checkSpelling(sermon.summary_text);
      setSpellErrors(errs);
    }
  }, [sermon.summary_text, showSpellPanel]);

  // Handle formatting shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        wrapFormat('**');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        wrapFormat('*');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        wrapFormat('__');
      }
    }
  };

  const wrapFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = summaryTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = sermon.summary_text;
    const selected = text.substring(start, end);

    let replacement: string;
    let newCursorPos: number;

    if (selected.length > 0) {
      replacement = `${prefix}${selected}${suffix}`;
      newCursorPos = start + replacement.length;
    } else {
      replacement = `${prefix}${suffix}`;
      newCursorPos = start + prefix.length;
    }

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    setSermon(prev => ({ ...prev, summary_text: updatedText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = summaryTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = sermon.summary_text;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const actualEnd = lineEnd === -1 ? text.length : lineEnd;

    const targetSection = text.substring(lineStart, actualEnd);
    const lines = targetSection.split('\n');

    const formattedLines = lines.map((line, idx) => {
      const clean = line.replace(/^(\d+\.\s*|•\s*|-\s*|>\s*)/, '');
      if (prefix === '1. ') {
        return `${idx + 1}. ${clean}`;
      }
      return `${prefix}${clean}`;
    });

    const replaced = formattedLines.join('\n');
    const updatedText = text.substring(0, lineStart) + replaced + text.substring(actualEnd);

    setSermon(prev => ({ ...prev, summary_text: updatedText }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + replaced.length);
    }, 0);
  };

  const clearFormattingFromSelection = () => {
    const textarea = summaryTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = sermon.summary_text;
    if (start === end) return;

    const selected = text.substring(start, end);
    const cleaned = selected
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/~~/g, '')
      .replace(/\*/g, '')
      .replace(/^(\d+\.\s*|•\s*|-\s*|>\s*)/gm, '');

    const updatedText = text.substring(0, start) + cleaned + text.substring(end);
    setSermon(prev => ({ ...prev, summary_text: updatedText }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + cleaned.length);
    }, 0);
  };

  const handleApplySpellSuggestion = (err: SpellError) => {
    const updated = applySuggestion(sermon.summary_text, err);
    setSermon(prev => ({ ...prev, summary_text: updated }));
    // Re-check
    const nextErrors = checkSpelling(updated);
    setSpellErrors(nextErrors);
    showToast(`Substituído "${err.word}" por "${err.suggestion}"`, 'success');
  };

  // Questions manipulation
  const handleAddQuestion = () => {
    setSermon(prev => ({
      ...prev,
      questions: [...prev.questions, { question_text: '' }],
    }));
  };

  const handleQuestionChange = (index: number, text: string) => {
    setSermon(prev => {
      const updated = [...prev.questions];
      updated[index] = { ...updated[index], question_text: text };
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setSermon(prev => {
      const updated = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions: updated.length ? updated : [{ question_text: '' }] };
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    setSermon(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.questions.length) return prev;
      const updated = [...prev.questions];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, questions: updated };
    });
  };

  // Agenda manipulation
  const handleAddAgendaItem = () => {
    setSermon(prev => ({
      ...prev,
      agenda: [...prev.agenda, { day_label: '', event_description: '' }],
    }));
  };

  const handleAgendaChange = (
    index: number,
    field: 'day_label' | 'event_description',
    val: string
  ) => {
    setSermon(prev => {
      const updated = [...prev.agenda];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, agenda: updated };
    });
  };

  const handleRemoveAgendaItem = (index: number) => {
    setSermon(prev => {
      const updated = prev.agenda.filter((_, i) => i !== index);
      return {
        ...prev,
        agenda: updated.length ? updated : [{ day_label: '', event_description: '' }],
      };
    });
  };

  const handleMoveAgendaItem = (index: number, direction: 'up' | 'down') => {
    setSermon(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.agenda.length) return prev;
      const updated = [...prev.agenda];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, agenda: updated };
    });
  };

  // Helper to build payload ensuring compatibility with backend schema
  const buildPayload = (statusOverride: 'draft' | 'submitted' = 'draft') => {
    return {
      duty_schedule_id: sermon.duty_schedule_id || null,
      organization_id: sermon.organization_id || user?.organization_id || user?.organization?.id,
      theme: sermon.title_theme?.trim() || (statusOverride === 'draft' ? 'Rascunho' : ''),
      title_theme: sermon.title_theme || '',
      minister_title: sermon.preacher_title || 'pela',
      preacher_title: sermon.preacher_title || 'pela',
      minister_name: sermon.preacher_name?.trim() || (statusOverride === 'draft' ? 'A definir' : ''),
      preacher_name: sermon.preacher_name || '',
      service_date: sermon.service_date || new Date().toISOString().split('T')[0],
      location_name: sermon.location || sermon.organization?.name || '',
      location: sermon.location || sermon.organization?.name || '',
      cell_direction: sermon.cell_aim || '',
      cell_aim: sermon.cell_aim || '',
      leader_guidelines: sermon.leader_guidelines || '',
      scripture_text: sermon.scripture_reference || '',
      scripture_reference: sermon.scripture_reference || '',
      summary_text: sermon.summary_text || '',
      qr_code_url: sermon.qr_code_url || '',
      qr_pix_path: sermon.qr_code_url || '',
      character_count: charCount,
      status: statusOverride,
      sharing_questions: sermon.questions
        ?.map(q => q.question_text?.trim())
        .filter(Boolean) || [],
      questions: sermon.questions,
      weekly_agenda: sermon.agenda
        ?.map(a => ({ dia: a.day_label?.trim() || '', aviso: a.event_description?.trim() || '' }))
        .filter(a => a.dia || a.aviso) || [],
      agenda: sermon.agenda,
    };
  };

  const updateSermonFromResponse = (res: any) => {
    if (!res) return;
    setSermon(prev => ({
      ...prev,
      ...res,
      id: res.id || prev.id,
      title_theme: res.title_theme || res.theme || prev.title_theme,
      preacher_name: res.preacher_name || res.minister_name || prev.preacher_name,
      preacher_title: res.preacher_title || res.minister_title || prev.preacher_title,
      cell_aim: res.cell_aim || res.cell_direction || prev.cell_aim,
      leader_guidelines: res.leader_guidelines !== undefined ? res.leader_guidelines : prev.leader_guidelines,
      scripture_reference: res.scripture_reference || res.scripture_text || prev.scripture_reference,
      summary_text: res.summary_text !== undefined ? res.summary_text : prev.summary_text,
      location: res.location || res.location_name || prev.location,
      qr_code_url: res.qr_code_url || res.qr_pix_path || prev.qr_code_url,
      questions: (res.questions && res.questions.length > 0)
        ? res.questions
        : (res.sharing_questions && res.sharing_questions.length > 0)
          ? res.sharing_questions.map((q: any) => typeof q === 'string' ? { question_text: q } : q)
          : prev.questions,
      agenda: (res.agenda && res.agenda.length > 0)
        ? res.agenda
        : (res.weekly_agenda_items && res.weekly_agenda_items.length > 0)
          ? res.weekly_agenda_items.map((a: any) => ({ day_label: a.day_time_text, event_description: a.description_text }))
          : prev.agenda,
    }));
  };

  // Funções de Gerenciamento da Imagem do PIX
  const handlePixImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setSermon(prev => ({
        ...prev,
        qr_code_url: base64Url,
      }));
      showToast('Imagem do PIX atualizada no documento!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleResetPixToDefault = () => {
    setSermon(prev => ({
      ...prev,
      qr_code_url: '/pix_card_default.png',
    }));
    showToast('Imagem do PIX restaurada para o padrão oficial da Casa de Israel.', 'info');
  };

  const handleSavePixAsOrgDefault = async () => {
    const orgId = sermon.organization_id || sermon.organization?.id || user?.organization_id || user?.organization?.id;
    if (!orgId) {
      showToast('Nenhuma unidade/igreja selecionada para salvar o padrão.', 'error');
      return;
    }
    try {
      await api.put(`/api/organizations/${orgId}`, {
        qr_code_pix_url: sermon.qr_code_url || '/pix_card_default.png',
      });
      showToast('Imagem do PIX salva como padrão oficial da igreja para todos!', 'success');
    } catch {
      showToast('PIX salvo para este resumo.', 'info');
    }
  };

  // Actions
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = buildPayload('draft');

      let res: any;
      if (sermon.id) {
        res = await api.put<SermonData>(`/api/sermons/${sermon.id}`, payload);
      } else {
        res = await api.post<SermonData>('/api/sermons', payload);
      }

      updateSermonFromResponse(res);
      if (onSaved) onSaved(res);
      showToast('Rascunho salvo com sucesso!', 'success');
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      const firstErr = error.errors ? Object.values(error.errors)[0]?.[0] : null;
      showToast(firstErr || error.message || 'Erro ao salvar rascunho.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (isOverLimit) {
      showToast(
        `O resumo excedeu o limite máximo de ${LIMITE_RESUMO} caracteres. Reduza o texto antes de submeter.`,
        'error'
      );
      return;
    }

    if (!sermon.title_theme.trim()) {
      showToast('Informe o tema da mensagem.', 'error');
      return;
    }

    if (!sermon.preacher_name.trim()) {
      showToast('Informe quem ministrou a palavra.', 'error');
      return;
    }

    if (!sermon.scripture_reference.trim()) {
      showToast('Informe o texto lido.', 'error');
      return;
    }

    if (!sermon.summary_text.trim()) {
      showToast('O resumo da ministração é obrigatório.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let currentId = sermon.id;
      const payload = buildPayload('submitted');

      if (!currentId) {
        const saved = await api.post<SermonData>('/api/sermons', payload);
        currentId = saved.id;
      } else {
        await api.put<SermonData>(`/api/sermons/${currentId}`, payload);
      }

      const res = await api.post<SermonData>(`/api/sermons/${currentId}/submit`, {});
      updateSermonFromResponse(res);
      if (onSaved) onSaved(res);
      showToast('Resumo submetido para revisão com sucesso!', 'success');
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      const firstErr = error.errors ? Object.values(error.errors)[0]?.[0] : null;
      showToast(firstErr || error.message || 'Erro ao submeter para revisão.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadRecurrentHistory = async () => {
    setLoadingHistory(true);
    try {
      const orgId = sermon.organization_id || user?.organization?.id;
      const url = orgId ? `/api/sermons/last-approved?organization_id=${orgId}` : '/api/sermons/last-approved';
      const res = await api.get<any>(url);
      const data = res?.data || res;

      if (!data || (!data.cell_direction && !data.leader_guidelines)) {
        showToast('Nenhum histórico aprovado anterior encontrado para esta unidade.', 'info');
        return;
      }

      setSermon(prev => ({
        ...prev,
        cell_aim: data.cell_direction || prev.cell_aim,
        leader_guidelines: data.leader_guidelines || prev.leader_guidelines,
        agenda: data.weekly_agenda_items && data.weekly_agenda_items.length > 0
          ? data.weekly_agenda_items.map((it: any) => ({
            day_label: it.day_time_text,
            event_description: it.description_text,
          }))
          : prev.agenda,
      }));

      showToast('Direcionamento, Orientações e Avisos recarregados do último aprovado!', 'success');
    } catch {
      showToast('Erro ao buscar histórico da unidade.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClear = () => {
    setSermon({
      status: 'draft',
      title_theme: '',
      preacher_title: 'pela',
      preacher_name: '',
      service_date: new Date().toISOString().split('T')[0],
      location: user?.organization?.name || 'Casa de Israel - Catedral',
      cell_aim: '',
      leader_guidelines: '',
      scripture_reference: '',
      summary_text: '',
      questions: [{ question_text: '' }],
      agenda: [{ day_label: '', event_description: '' }],
    });
    showToast('Campos limpos para nova mensagem.', 'info');
  };

  const handleCopyWhatsApp = async () => {
    const success = await copySermonToClipboard(sermon);
    if (success) {
      showToast('Roteiro formatado copiado para a área de transferência!', 'success');
    } else {
      showToast('Não foi possível copiar automaticamente.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sermon-editor flex flex-col w-full min-h-screen bg-muted">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl transition-all duration-300 flex items-center gap-2 ${toastType === 'success'
              ? 'bg-success text-white'
              : toastType === 'error'
                ? 'bg-destructive text-white'
                : 'bg-primary text-white'
            }`}
        >
          {toastType === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {toastType === 'error' && <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar - Estilo Limpo SYSGOV (teste_transporte) */}
      <div className="no-print bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Editor da Palavra</span>
            <span className="text-xs font-normal text-muted-foreground">· Células</span>
          </h1>

          {/* Status Badge */}
          {sermon.status === 'draft' && (
            <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground font-mono text-xs">
              Rascunho
            </Badge>
          )}
          {sermon.status === 'submitted' && (
            <Badge variant="outline" className="border-info-border bg-info-surface text-info-strong font-mono text-xs font-bold">
              Submetido
            </Badge>
          )}
          {sermon.status === 'in_review' && (
            <Badge variant="outline" className="border-warning-border bg-warning-surface text-warning-strong font-mono text-xs font-bold">
              Em Revisão
            </Badge>
          )}
          {sermon.status === 'rejected' && (
            <Badge variant="outline" className="border-critical-border bg-critical-surface text-critical-strong font-mono text-xs font-bold animate-pulse">
              Devolvido com Ajustes
            </Badge>
          )}
          {sermon.status === 'approved' && (
            <Badge variant="outline" className="border-success-border bg-success-surface text-success-strong font-mono text-xs font-bold">
              Aprovado
            </Badge>
          )}
        </div>

        {/* Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {!readOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs h-8"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Novo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadRecurrentHistory}
                disabled={loadingHistory}
                className="text-xs h-8"
                title="Carregar Direcionamento, Orientações e Avisos da última mensagem aprovada"
              >
                <History className="w-3.5 h-3.5 mr-1 text-gov-accent-gold" />
                {loadingHistory ? 'Buscando...' : 'Carregar Histórico Recorrente'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={saving}
                className="text-xs h-8"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsA4ModalOpen(true)}
            className="border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs h-8 font-semibold shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1 text-gov-accent-gold" />
            Pré-visualizar Folha A4
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWhatsApp}
            className="border-success-border bg-success-surface text-success-strong hover:bg-success hover:text-white text-xs h-8 font-semibold"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Imprimir / PDF
          </Button>

          {!readOnly && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSubmitForReview}
              disabled={submitting || isOverLimit}
              className="text-xs font-bold shadow-xs gap-1.5 h-8 cursor-pointer bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="w-3.5 h-3.5" />
              {sermon.status === 'rejected'
                ? (submitting ? 'Reenviando...' : 'Reenviar após Ajustes')
                : (submitting ? 'Submetendo...' : 'Submeter para Revisão')}
            </Button>
          )}
        </div>
      </div>

      {/* Container Principal - Exclusivo para o Formulário em Largura Total */}
      <div className="space-y-6 no-print sermon-editor-form">
        {/* Stepper de Ciclo de Vida do Resumo */}
        <ReviewWorkflowStepper
          currentStatus={sermon.status}
          rejectionReason={sermon.rejection_reason}
          reviewerName={sermon.reviewer?.name}
          approvedAt={sermon.approved_at}
        />

        {/* Painel de Apontamentos do Revisor (quando DEVOLVIDO/REJEITADO) */}
        {sermon.status === 'rejected' && (
          <div className="bg-critical-surface border-2 border-critical-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 rounded-full bg-critical text-white items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-critical-strong">
                    Resumo Devolvido para Ajustes pelo Revisor
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {sermon.reviewer?.name ? `Revisor: ${sermon.reviewer.name} · ` : ''}
                    Verifique as correções solicitadas abaixo, atualize o texto e clique em "Reenviar após Ajustes".
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-critical-border bg-card text-critical-strong font-mono font-bold text-xs uppercase">
                Ajustes Necessários
              </Badge>
            </div>

            <div className="bg-card rounded-lg p-3.5 border border-critical-border/60 text-xs text-foreground font-sans leading-relaxed whitespace-pre-wrap select-text">
              {sermon.rejection_reason || 'Por favor, revise o texto e atente-se às orientações e regras de enquadramento da folha única A4.'}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <span className="text-[11px] text-muted-foreground">
                Dica: O contador de caracteres abaixo indica o limite estrito de 3.400 caracteres da página única A4.
              </span>
              <Button
                size="sm"
                variant="default"
                onClick={handleSubmitForReview}
                disabled={submitting || isOverLimit}
                className="gap-1.5 font-bold h-8 bg-primary hover:bg-primary/90 text-white shadow-xs"
              >
                <Send className="size-3.5" />
                <span>Reenviar após Ajustes</span>
              </Button>
            </div>
          </div>
        )}

        {/* Banner de Homologação Concluída (quando APROVADO) */}
        {sermon.status === 'approved' && (
          <div className="bg-success-surface border border-success-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 rounded-full bg-success text-white items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="size-6" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-success-strong">
                  Ministração Homologada e Aprovada para as Células!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Esta mensagem foi validada e está liberada para distribuição aos líderes de célula e impressão em folha única A4.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyWhatsApp}
                className="border-success-border bg-card text-success-strong hover:bg-success hover:text-white text-xs font-semibold gap-1.5 h-8"
              >
                <Share2 className="size-3.5" />
                <span>WhatsApp das Células</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsA4ModalOpen(true)}
                className="border-primary/30 bg-card text-primary hover:bg-primary hover:text-white text-xs font-semibold gap-1.5 h-8"
              >
                <Eye className="size-3.5 text-gov-accent-gold" />
                <span>Visualizar Folha A4</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="border-border bg-card text-foreground hover:bg-muted text-xs font-semibold gap-1.5 h-8"
              >
                <Printer className="size-3.5" />
                <span>Imprimir A4</span>
              </Button>
            </div>
          </div>
        )}

        {/* Card Superior de Status & Botão de Pré-visualização A4 */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-wider text-foreground">
              Formulário da Palavra
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${isOverLimit
                    ? 'bg-critical-surface text-critical-strong border border-critical-border'
                    : 'bg-success-surface text-success-strong border border-success-border'
                  }`}
              >
                {charCount.toLocaleString('pt-BR')} / 3.400 caracteres
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {isOverLimit ? '⚠️ Excede limite de 1 folha A4' : '✓ Enquadrado em folha única A4'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsA4ModalOpen(true)}
              className="border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5 h-8"
            >
              <Eye className="size-3.5 text-gov-accent-gold" />
              <span>Pré-visualizar Folha A4</span>
            </Button>
          </div>
        </div>

        {/* Formulário Principal Estruturado em Cards com Bordas Laterais Semânticas */}
        <section className="no-print space-y-6">
          {/* Section 1: Identificação */}
          <div className="bg-card rounded-xl border border-border !border-l-[5px] !border-l-primary p-5 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-foreground flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-mono font-bold">
                1
              </span>
              Identificação
            </h2>

            <div>
              <label htmlFor="tema" className="block text-xs font-semibold text-foreground mb-1">
                Tema da Palavra <span className="text-critical">*</span>
              </label>
              <Input
                id="tema"
                value={sermon.title_theme}
                onChange={e => setSermon(prev => ({ ...prev, title_theme: e.target.value }))}
                placeholder="Tema da ministração"
                maxLength={200}
                disabled={readOnly}
                className="text-sm font-semibold text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="tratamento" className="block text-xs font-semibold text-foreground mb-1">
                  Artigo
                </label>
                <select
                  id="tratamento"
                  value={sermon.preacher_title}
                  onChange={e =>
                    setSermon(prev => ({
                      ...prev,
                      preacher_title: e.target.value as 'pelo' | 'pela',
                    }))
                  }
                  disabled={readOnly}
                  className="w-full h-9 rounded-md border border-input bg-card px-2 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="pela">pela</option>
                  <option value="pelo">pelo</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="ministrante" className="block text-xs font-semibold text-foreground mb-1">
                  Quem ministrou <span className="text-critical">*</span>
                </label>
                <Input
                  id="ministrante"
                  value={sermon.preacher_name}
                  onChange={e => setSermon(prev => ({ ...prev, preacher_name: e.target.value }))}
                  placeholder="Nome do(a) ministrante"
                  maxLength={120}
                  disabled={readOnly}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="data" className="block text-xs font-semibold text-foreground mb-1">
                  Data da ministração <span className="text-critical">*</span>
                </label>
                <Input
                  id="data"
                  type="date"
                  value={sermon.service_date}
                  onChange={e => setSermon(prev => ({ ...prev, service_date: e.target.value }))}
                  disabled={readOnly}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="local" className="block text-xs font-semibold text-foreground mb-1">
                  Local / Igreja
                </label>
                <Input
                  id="local"
                  value={sermon.location}
                  onChange={e => setSermon(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Casa de Israel - Catedral"
                  maxLength={120}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Configuração Visual do Topo A4 e Imagem do PIX Padrão */}
            <div className="pt-3 border-t border-border/70 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Nome do Núcleo / Igreja para o Topo */}
              <div className="lg:col-span-6 space-y-1">
                <label htmlFor="top_church_name" className="block text-xs font-semibold text-foreground">
                  Nome do Núcleo ou Igreja <span className="text-primary font-bold">(Destaque no Topo da Folha A4)</span>
                </label>
                <Input
                  id="top_church_name"
                  value={sermon.location}
                  onChange={e => setSermon(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Casa de Israel - Catedral ou Núcleo Sul"
                  maxLength={120}
                  disabled={readOnly}
                  className="text-xs font-semibold"
                />
                <span className="text-[11px] text-muted-foreground block">
                  Exibido em letras douradas/brancas no banner superior e no rodapé da folha de impressão A4.
                </span>
              </div>

              {/* Imagem do QR Code do PIX Padrão para Todos */}
              <div className="lg:col-span-6 bg-muted/40 p-3 rounded-lg border border-border/80">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Image className="size-3.5 text-primary" />
                    <span>Imagem do PIX <span className="text-muted-foreground font-normal">(Padrão para Todos)</span></span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPixToDefault}
                    className="h-6 text-[11px] text-primary hover:underline px-1.5 cursor-pointer font-medium"
                    title="Restaurar para a imagem oficial da igreja com chave pixcelulasci@gmail.com"
                  >
                    Usar Padrão Oficial
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-12 rounded border border-border bg-card flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src={sermon.qr_code_url || sermon.organization?.qr_code_pix_url || '/pix_card_default.png'}
                      alt="PIX Atual"
                      className="size-11 object-contain"
                    />
                  </div>

                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary hover:text-white transition-colors cursor-pointer shadow-2xs">
                      <Upload className="size-3.5" />
                      <span>Alterar Imagem do PIX</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePixImageUpload}
                        disabled={readOnly}
                        className="hidden"
                      />
                    </label>

                    {(user?.role === 'admin' || user?.role === 'unit_admin' || user?.role === 'reviewer') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSavePixAsOrgDefault}
                        className="text-[11px] h-7 border-border font-medium text-foreground hover:bg-muted"
                        title="Tornar este PIX o padrão para todos os resumos desta igreja"
                      >
                        Salvar como Padrão da Igreja
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Direcionamento e Orientações (Grid 2 colunas para ganho de tela) */}
          <div className="bg-card rounded-xl border border-border !border-l-[5px] !border-l-info p-5 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-foreground flex items-center gap-2">
              <span className="size-5 rounded-full bg-info text-white flex items-center justify-center text-[11px] font-mono font-bold">
                2
              </span>
              Direcionamento e Orientações
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="direcionamento" className="block text-xs font-semibold text-foreground mb-1">
                  Direcionamento para a célula <span className="text-critical">*</span>
                </label>
                <Textarea
                  id="direcionamento"
                  rows={4}
                  value={sermon.cell_aim}
                  onChange={e => setSermon(prev => ({ ...prev, cell_aim: e.target.value }))}
                  placeholder="Roteiro de direcionamento para a reunião da célula"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label htmlFor="orientacoes" className="block text-xs font-semibold text-foreground mb-1">
                  Orientações para os líderes <span className="text-critical">*</span>
                  <span className="text-[11px] font-normal text-critical ml-2">(sai em destaque no modelo A4)</span>
                </label>
                <Textarea
                  id="orientacoes"
                  rows={4}
                  value={sermon.leader_guidelines}
                  onChange={e => setSermon(prev => ({ ...prev, leader_guidelines: e.target.value }))}
                  placeholder="Instruções e avisos específicos para a liderança"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Palavra & Resumo (Strict 3,400 Limit) */}
          <div className="bg-card rounded-xl border border-border !border-l-[5px] !border-l-gov-primary-hover p-5 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-foreground flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-mono font-bold">
                3
              </span>
              Palavra & Resumo da Mensagem
            </h2>

            <div>
              <label htmlFor="texto_lido" className="block text-xs font-semibold text-foreground mb-1">
                Texto lido <span className="text-critical">*</span>
              </label>
              <Input
                id="texto_lido"
                value={sermon.scripture_reference}
                onChange={e =>
                  setSermon(prev => ({ ...prev, scripture_reference: e.target.value }))
                }
                placeholder="Livro, capítulo e versículos bíblicos"
                maxLength={120}
                disabled={readOnly}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <label htmlFor="resumo" className="text-xs font-semibold text-foreground">
                    Resumo da Ministração <span className="text-critical">*</span>
                  </label>
                  <span className="text-[11px] font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                    Tamanho 12pt · Texto Justificado
                  </span>
                </div>

                {/* Character Counter (Inter, tabular numbers) */}
                <div
                  className={`counter font-mono text-xs font-semibold flex items-center gap-1 ${isOverLimit
                      ? 'text-critical'
                      : isWarning
                        ? 'text-warning-strong'
                        : 'text-muted-foreground'
                    }`}
                >
                  <span>{charCount.toLocaleString('pt-BR')}</span>
                  <span>/</span>
                  <span>{LIMITE_RESUMO.toLocaleString('pt-BR')}</span>
                  {isOverLimit && (
                    <span className="text-critical font-bold">
                      (+{(charCount - LIMITE_RESUMO).toLocaleString('pt-BR')})
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Ferramentas de Edição Completa */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 p-1.5 bg-muted/60 border border-border/70 rounded-lg text-xs">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => wrapFormat('**')}
                    disabled={readOnly}
                    title="Negrito (Ctrl+B)"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Bold className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapFormat('*')}
                    disabled={readOnly}
                    title="Itálico (Ctrl+I)"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <Italic className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapFormat('__')}
                    disabled={readOnly}
                    title="Sublinhado (Ctrl+U)"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <Underline className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapFormat('~~')}
                    disabled={readOnly}
                    title="Tachado"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <Strikethrough className="size-3.5" />
                  </button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => insertLinePrefix('• ')}
                    disabled={readOnly}
                    title="Lista com Marcadores"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <List className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertLinePrefix('1. ')}
                    disabled={readOnly}
                    title="Lista Numerada"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <ListOrdered className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertLinePrefix('> ')}
                    disabled={readOnly}
                    title="Citação / Destaque"
                    className="p-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <Quote className="size-3.5" />
                  </button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <span
                    title="Texto Justificado Ativo (Padrão Oficial)"
                    className="px-2 py-1 rounded-md bg-primary/10 border border-primary/30 text-foreground text-[11px] font-bold flex items-center gap-1 select-none"
                  >
                    <AlignJustify className="size-3.5" />
                    <span className="hidden sm:inline">Justificado (12pt)</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearFormattingFromSelection}
                    disabled={readOnly}
                    title="Limpar formatação da seleção"
                    className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <Eraser className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSpellPanel(prev => !prev)}
                    className={cn(
                      "px-2.5 py-1 rounded-md border text-xs flex items-center gap-1.5 font-semibold transition-colors cursor-pointer",
                      spellErrors.length > 0
                        ? "bg-warning-surface border-warning-border text-warning-strong"
                        : "bg-card border-border text-foreground hover:bg-accent"
                    )}
                  >
                    <SpellCheck className="size-3.5" />
                    <span>Corretor pt-BR</span>
                    {spellErrors.length > 0 && (
                      <span className="bg-warning text-foreground rounded-full px-1.5 text-[10px] font-mono font-bold">
                        {spellErrors.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Textarea com Tamanho 12pt e Alinhamento Justificado */}
              <Textarea
                ref={summaryTextareaRef}
                id="resumo"
                rows={15}
                value={sermon.summary_text}
                onChange={e => setSermon(prev => ({ ...prev, summary_text: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Resumo estruturado da ministração..."
                disabled={readOnly}
                style={{ textAlign: 'justify' }}
                className={cn(
                  "font-sans text-[12px] leading-relaxed text-justify p-3.5 bg-card tracking-normal",
                  isOverLimit ? "border-critical focus-visible:ring-critical" : "border-border"
                )}
              />

              {/* Barra de Progresso do Limite de 3.400 caracteres */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1.5">
                <div
                  className={cn(
                    "h-full transition-all duration-200",
                    isOverLimit ? "bg-critical" : isWarning ? "bg-warning" : "bg-success"
                  )}
                  style={{ width: `${charPercent}%` }}
                />
              </div>

              {/* Alerta de Excesso de Caracteres */}
              {isOverLimit && (
                <p className="text-xs text-critical font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  Limite de 3.400 caracteres excedido. O resumo não caberá em 1 folha A4.
                </p>
              )}

              {/* Spellcheck Suggestions Drawer */}
              {showSpellPanel && (
                <div className="mt-3 p-3 bg-warning-surface/60 border border-warning-border rounded-md text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-warning-strong">
                    <span className="flex items-center gap-1">
                      <SpellCheck className="w-4 h-4" />
                      Sugestões de Correção Ortográfica (pt-BR)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSpellPanel(false)}
                      className="text-muted-foreground hover:text-black text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {spellErrors.length === 0 ? (
                    <p className="text-xs text-success-strong flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Nenhum erro ortográfico ou acentuação pendente detectado no resumo.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {spellErrors.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-card rounded border border-input gap-2"
                        >
                          <div>
                            <span className="text-critical-strong line-through font-mono">
                              {err.word}
                            </span>
                            <span className="mx-1.5 text-muted-foreground/60">➔</span>
                            <span className="text-success-strong font-semibold font-mono">
                              {err.suggestion}
                            </span>
                          </div>
                          {!readOnly && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplySpellSuggestion(err)}
                              className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10"
                            >
                              Aplicar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção Dupla em Grid: Compartilhamento & Agenda da Semana */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 4: Compartilhamento (Dynamic Questions) */}
            <div className="bg-card rounded-xl border border-border !border-l-[5px] !border-l-gov-accent-gold p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase font-bold tracking-wider text-foreground flex items-center gap-2">
                  <span className="size-5 rounded-full bg-gov-accent-gold text-foreground flex items-center justify-center text-[11px] font-mono font-bold">
                    4
                  </span>
                  Compartilhamento (Aplicação Prática)
                </h2>
                {!readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddQuestion}
                    className="text-xs text-primary hover:bg-primary/10 h-7 px-2.5 border-border font-semibold"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Adicionar Pergunta
                  </Button>
                )}
              </div>

              <div className="space-y-2.5">
                {sermon.questions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-xs font-bold text-foreground pt-2.5 w-5 text-right shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <Input
                        value={q.question_text}
                        onChange={e => handleQuestionChange(idx, e.target.value)}
                        placeholder={`Pergunta ${idx + 1}`}
                        disabled={readOnly}
                        className="text-xs bg-card"
                      />
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-0.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground cursor-pointer"
                          title="Subir"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === sermon.questions.length - 1}
                          className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground cursor-pointer"
                          title="Descer"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1 rounded hover:bg-critical-surface text-muted-foreground hover:text-critical cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Agenda — Avisos da Semana */}
            <div className="bg-card rounded-xl border border-border !border-l-[5px] !border-l-success p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase font-bold tracking-wider text-foreground flex items-center gap-2">
                  <span className="size-5 rounded-full bg-success text-white flex items-center justify-center text-[11px] font-mono font-bold">
                    5
                  </span>
                  Agenda — Avisos da Semana
                </h2>
                {!readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddAgendaItem}
                    className="text-xs text-primary hover:bg-primary/10 h-7 px-2.5 border-border font-semibold"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Adicionar Aviso
                  </Button>
                )}
              </div>

              <div className="space-y-2.5">
                {sermon.agenda.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-[130px] shrink-0">
                      <Input
                        value={item.day_label}
                        onChange={e => handleAgendaChange(idx, 'day_label', e.target.value)}
                        placeholder="Dia / Horário"
                        disabled={readOnly}
                        className="text-xs font-semibold bg-card"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={item.event_description}
                        onChange={e => handleAgendaChange(idx, 'event_description', e.target.value)}
                        placeholder="Evento / Aviso da semana"
                        disabled={readOnly}
                        className="text-xs bg-card"
                      />
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-0.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleMoveAgendaItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground cursor-pointer"
                          title="Subir"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAgendaItem(idx, 'down')}
                          disabled={idx === sermon.agenda.length - 1}
                          className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground cursor-pointer"
                          title="Descer"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAgendaItem(idx)}
                          className="p-1 rounded hover:bg-critical-surface text-muted-foreground hover:text-critical cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Barra Inferior de Ações em Card com Lateral Azul */}
          <div className="bg-card rounded-xl border border-border !border-l-[5px] !border-l-gov-primary-hover p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Contador de caracteres:</span>
              <span className={cn("font-mono font-bold", isOverLimit ? "text-critical" : "text-success-strong")}>
                {charCount.toLocaleString('pt-BR')} / 3.400
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="text-xs h-9 font-semibold"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {saving ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsA4ModalOpen(true)}
                className="border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5 h-9"
              >
                <Eye className="w-4 h-4 text-gov-accent-gold" />
                <span>Pré-visualizar Folha A4</span>
              </Button>

              {!readOnly && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleSubmitForReview}
                  disabled={submitting || isOverLimit}
                  className="text-xs font-bold shadow-xs bg-primary hover:bg-primary/90 text-white h-9 px-4"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {submitting ? 'Submetendo...' : 'Submeter para Revisão'}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Renderização oculta da folha para impressão direta nativa (Ctrl+P / Imprimir) */}
      <div className="hidden print:block">
        <SheetPreview sermon={sermon} />
      </div>

      {/* Modal de Pré-visualização da Folha A4 em Escala Real */}
      <A4PreviewModal
        isOpen={isA4ModalOpen}
        onClose={() => setIsA4ModalOpen(false)}
        sermon={sermon}
      />
    </div>
  );
};
