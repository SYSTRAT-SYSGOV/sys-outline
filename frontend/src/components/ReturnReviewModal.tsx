import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  Badge,
} from '@sysgov/ui';
import { AlertTriangle, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface ReturnReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  sermonTheme?: string;
  sermonId?: number;
}

export const ReturnReviewModal: React.FC<ReturnReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sermonTheme,
  sermonId,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickCategories = [
    { label: 'Ortografia / Concordância pt-BR', note: 'Ajustar ortografia, pontuação e concordância verbal no texto da pregação.' },
    { label: 'Enquadramento A4 (>3.400 chars)', note: 'O resumo ultrapassou o teto de 3.400 caracteres. Reduza o texto para caber em folha única A4.' },
    { label: 'Agenda & Avisos da Semana', note: 'Atualizar os dias, horários e eventos da agenda dominical da igreja.' },
    { label: 'Direcionamento & Orientações', note: 'Completar o direcionamento para as células e as orientações aos líderes.' },
    { label: 'Perguntas de Compartilhamento', note: 'Formular ou refinar as perguntas práticas para o momento da célula.' },
  ];

  const handleAddCategory = (note: string) => {
    setReason(prev => (prev ? `${prev}\n• ${note}` : `• ${note}`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Por favor, informe detalhadamente os pontos a serem ajustados pelo escriba.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao registrar devolução.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-critical-surface text-critical border border-critical-border">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-foreground">
                Devolver Resumo para Ajustes
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {sermonId ? `Resumo #${sermonId} · ` : ''}{sermonTheme || 'Ministração Dominical'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Categorias Rápidas */}
          <div>
            <label className="block text-[11px] font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="size-3 text-gov-accent-gold" />
              <span>Inserir Apontamentos Frequentes:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddCategory(cat.note)}
                  className="text-[11px] font-medium bg-muted/40 hover:bg-primary/10 hover:border-primary/30 text-foreground px-2.5 py-1 rounded-md border border-border transition-colors cursor-pointer"
                >
                  + {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Texto */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Observações e Orientações para o Voluntário Escriba <span className="text-destructive">*</span>
            </label>
            <Textarea
              rows={5}
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Descreva claramente as correções necessárias para que o escriba possa revisar e reenviar..."
              className="w-full text-xs sm:text-sm font-sans"
              required
            />
            {error && (
              <p className="text-xs text-destructive mt-1 font-medium">{error}</p>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Esta orientação aparecerá em destaque vermelho no topo do editor do escriba com indicação de que o resumo foi devolvido.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={submitting}
              className="gap-1.5 font-bold"
            >
              <AlertTriangle className="size-3.5" />
              <span>{submitting ? 'Devolvendo...' : 'Confirmar Devolução'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
