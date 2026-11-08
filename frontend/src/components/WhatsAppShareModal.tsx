import React, { useState } from 'react';
import { SermonData } from '../lib/sermonUtils';
import { formatSermonForWhatsApp } from '../lib/whatsappFormatter';
import { Button } from './ui/button';
import { Share2, Copy, Check, X, ExternalLink } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonData | null;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  sermon,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sermon) return null;

  const text = formatSermonForWhatsApp(sermon);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Distribuição para WhatsApp das Células</h3>
              <p className="text-xs text-primary-foreground/70">Mensagem estruturada pronta para cópia ou envio aos líderes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-4 flex-1 overflow-y-auto bg-muted/50">
          <pre className="p-3 bg-card rounded-lg border border-border text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed select-all">
            {text}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-card border-t border-border flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {text.length} caracteres formatados
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenWhatsApp}
              className="text-xs text-success-strong border-success-border hover:bg-success-surface"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Abrir WhatsApp Web
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleCopy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Copiado com Sucesso!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copiar Mensagem
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

