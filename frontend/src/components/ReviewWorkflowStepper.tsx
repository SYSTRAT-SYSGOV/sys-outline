import React from 'react';
import { CheckCircle2, Clock, Edit3, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@sysgov/ui';

export type SermonWorkflowStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';

interface ReviewWorkflowStepperProps {
  currentStatus: SermonWorkflowStatus;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  reviewerName?: string | null;
  className?: string;
}

export const ReviewWorkflowStepper: React.FC<ReviewWorkflowStepperProps> = ({
  currentStatus,
  rejectionReason,
  approvedAt,
  reviewerName,
  className = '',
}) => {
  const steps = [
    {
      key: 'draft',
      label: 'Rascunho',
      desc: 'Redação pelo voluntário escriba',
      icon: Edit3,
    },
    {
      key: 'submitted',
      label: 'Submetido',
      desc: 'Enviado para a fila de revisão',
      icon: Clock,
    },
    {
      key: 'in_review',
      label: 'Em Revisão',
      desc: 'Revisor conferindo ortografia e limites A4',
      icon: FileCheck,
    },
    {
      key: currentStatus === 'rejected' ? 'rejected' : 'approved',
      label: currentStatus === 'rejected' ? 'Devolvido com Apontamentos' : 'Aprovado para Células',
      desc:
        currentStatus === 'rejected'
          ? 'Necessita de correções pelo voluntário'
          : 'Homologado para distribuição e leitura',
      icon: currentStatus === 'rejected' ? AlertCircle : CheckCircle2,
    },
  ];

  const getStepIndex = (status: SermonWorkflowStatus): number => {
    switch (status) {
      case 'draft':
        return 0;
      case 'submitted':
        return 1;
      case 'in_review':
        return 2;
      case 'approved':
      case 'rejected':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className={`w-full bg-card rounded-xl border border-border p-4 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Ciclo de Vida do Resumo
          </span>
          <div className="text-sm font-bold text-foreground flex items-center gap-2 mt-0.5">
            <span>Status Atual:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider ${
                currentStatus === 'approved'
                  ? 'bg-success-surface text-success-strong border border-success-border'
                  : currentStatus === 'rejected'
                  ? 'bg-critical-surface text-critical-strong border border-critical-border'
                  : currentStatus === 'in_review'
                  ? 'bg-warning-surface text-warning-strong border border-warning-border'
                  : currentStatus === 'submitted'
                  ? 'bg-info-surface text-info-strong border border-info-border'
                  : 'bg-muted text-foreground border border-border'
              }`}
            >
              {currentStatus === 'draft' && 'Rascunho'}
              {currentStatus === 'submitted' && 'Submetido'}
              {currentStatus === 'in_review' && 'Em Revisão'}
              {currentStatus === 'approved' && 'Aprovado'}
              {currentStatus === 'rejected' && 'Devolvido'}
            </span>
          </div>
        </div>

        {reviewerName && (
          <div className="text-xs text-muted-foreground font-mono">
            Revisor Responsável: <span className="font-semibold text-foreground">{reviewerName}</span>
          </div>
        )}
      </div>

      {/* Stepper Grid / Horizontal Trail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isRejectedStep = step.key === 'rejected';

          return (
            <div
              key={step.key}
              className={`relative p-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                isCurrent
                  ? isRejectedStep
                    ? 'bg-critical-surface border-critical-border shadow-xs ring-1 ring-critical/30'
                    : 'bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/25'
                  : isDone
                  ? 'bg-success-surface/50 border-success-border text-foreground'
                  : 'bg-muted/40 border-border text-muted-foreground opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`size-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    isCurrent
                      ? isRejectedStep
                        ? 'bg-critical text-white'
                        : 'bg-primary text-white'
                      : isDone
                      ? 'bg-success text-white'
                      : 'bg-border text-muted-foreground'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </span>

                <Icon
                  className={`size-4 ${
                    isCurrent
                      ? isRejectedStep
                        ? 'text-critical'
                        : 'text-primary'
                      : isDone
                      ? 'text-success'
                      : 'text-muted-foreground'
                  }`}
                />
              </div>

              <div>
                <div
                  className={`text-xs font-bold leading-tight ${
                    isCurrent
                      ? isRejectedStep
                        ? 'text-critical-strong'
                        : 'text-foreground'
                      : isDone
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerta de Devolução quando rejeitado */}
      {currentStatus === 'rejected' && rejectionReason && (
        <div className="mt-3 p-3 bg-critical-surface border border-critical-border rounded-lg text-xs text-critical-strong flex items-start gap-2.5">
          <AlertCircle className="size-4 text-critical shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Observações do Revisor para Correção:</span>
            <p className="mt-0.5 whitespace-pre-line text-critical-strong font-sans">{rejectionReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};
