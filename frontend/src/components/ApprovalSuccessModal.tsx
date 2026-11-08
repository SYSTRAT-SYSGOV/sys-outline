import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from '@sysgov/ui';
import { CheckCircle2, Share2, Eye, Copy, Check, ExternalLink, Calendar, Building, Sparkles } from 'lucide-react';
import { SermonData } from '../lib/sermonUtils';

interface ApprovalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonData | null;
  onOpenWhatsApp: () => void;
  onOpenA4Preview: () => void;
}

export const ApprovalSuccessModal: React.FC<ApprovalSuccessModalProps> = ({
  isOpen,
  onClose,
  sermon,
  onOpenWhatsApp,
  onOpenA4Preview,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!sermon) return null;

  const publicUrl = `${window.location.origin}${window.location.pathname}?public=${sermon.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = publicUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="size-16 rounded-full bg-success-surface text-success-strong border-2 border-success-border flex items-center justify-center mb-2 shadow-sm animate-bounce">
            <CheckCircle2 className="size-8" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Ministração Homologada com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 max-w-sm">
            O resumo dominical foi conferido, aprovado e liberado para distribuição nas células e impressão A4.
          </DialogDescription>
        </DialogHeader>

        {/* Card Resumo */}
        <div className="bg-background rounded-lg p-4 border border-border text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-foreground">
              #{sermon.id}
            </span>
            <Badge variant="outline" className="border-success-border bg-success-surface text-success-strong font-mono font-bold">
              APROVADO
            </Badge>
          </div>

          <div className="font-bold text-sm text-foreground">
            {sermon.title_theme || sermon.theme}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1 border-t border-border/60">
            <span className="flex items-center gap-1">
              <Building className="size-3.5 text-gov-accent-gold" />
              <span>{sermon.organization?.name || 'Catedral'}</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>{sermon.service_date}</span>
            </span>
          </div>
        </div>

        {/* Ações Rápidas de Distribuição */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onOpenWhatsApp();
            }}
            className="w-full border-success-border bg-success-surface text-success-strong hover:bg-success hover:text-white font-semibold text-xs gap-1.5 h-10 shadow-2xs"
          >
            <Share2 className="size-4" />
            <span>WhatsApp das Células</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onOpenA4Preview();
            }}
            className="w-full border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-xs gap-1.5 h-10 shadow-2xs"
          >
            <Eye className="size-4 text-gov-accent-gold" />
            <span>Visualizar Folha A4</span>
          </Button>
        </div>

        {/* Link Compartilhável */}
        <div className="pt-2">
          <div className="flex items-center gap-2 bg-card border border-input rounded-md p-1.5">
            <span className="text-[11px] font-mono text-muted-foreground truncate flex-1 px-2">
              {publicUrl}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCopyLink}
              className="text-xs h-7 gap-1 font-medium shrink-0"
            >
              {copiedLink ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Concluir & Voltar à Fila
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

