import React from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { Badge, Button } from '@sysgov/ui';

interface ReturnedNoticeProps {
  reviewerName?: string | null;
  reason?: string | null;
  /** Limite de caracteres já formatado (ex.: "3.400"). */
  limitText: string;
  submitting: boolean;
  overLimit: boolean;
  onResubmit: () => void;
}

/**
 * Painel com os apontamentos do revisor quando o resumo foi devolvido para ajustes.
 */
export const ReturnedNotice: React.FC<ReturnedNoticeProps> = ({
  reviewerName,
  reason,
  limitText,
  submitting,
  overLimit,
  onResubmit,
}) => (
  <div className="bg-critical-surface border-2 border-critical-border rounded-xl p-5 shadow-xs space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 rounded-full bg-critical text-white items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h3 className="font-bold text-sm text-critical-strong">Resumo Devolvido para Ajustes pelo Revisor</h3>
          <p className="text-xs text-muted-foreground">
            {reviewerName ? `Revisor: ${reviewerName} · ` : ''}
            Verifique as correções solicitadas abaixo, atualize o texto e clique em "Reenviar após Ajustes".
          </p>
        </div>
      </div>
      <Badge
        variant="outline"
        className="border-critical-border bg-card text-critical-strong font-mono font-bold text-xs uppercase"
      >
        Ajustes Necessários
      </Badge>
    </div>

    <div className="bg-card rounded-lg p-3.5 border border-critical-border/60 text-xs text-foreground font-sans leading-relaxed whitespace-pre-wrap select-text">
      {reason || 'Por favor, revise o texto e atente-se às orientações e regras de enquadramento da folha única A4.'}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
      <span className="text-[11px] text-muted-foreground">
        Dica: O contador de caracteres abaixo indica o limite estrito de {limitText} caracteres da página única A4.
      </span>
      <Button
        size="sm"
        variant="default"
        onClick={onResubmit}
        disabled={submitting || overLimit}
        className="gap-1.5 font-bold h-8 bg-primary hover:bg-primary/90 text-white shadow-xs"
      >
        <Send className="size-3.5" />
        <span>Reenviar após Ajustes</span>
      </Button>
    </div>
  </div>
);
