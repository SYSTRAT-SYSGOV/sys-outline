import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SermonData } from '../lib/sermonUtils';
import { SheetPreview } from '../components/SheetPreview';
import { copySermonToClipboard } from '../lib/whatsappFormatter';
import { Button } from '../components/ui/button';
import { Printer, Share2, CheckCircle2, ArrowLeft } from 'lucide-react';

interface PublicSermonProps {
  sermonId: number;
  onBack?: () => void;
}

export const PublicSermon: React.FC<PublicSermonProps> = ({ sermonId, onBack }) => {
  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<SermonData>(`/api/sermons/public/${sermonId}`);
        setSermon(res);
      } catch {
        setError('Mensagem não encontrada ou ainda não aprovada para distribuição pública.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sermonId]);

  const handleCopy = async () => {
    if (!sermon) return;
    const ok = await copySermonToClipboard(sermon);
    if (ok) {
      setToastMessage('Roteiro copiado com formatação para WhatsApp!');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-sm text-muted-foreground">
        Carregando mensagem da célula...
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-card rounded-xl border border-border shadow-sm max-w-md">
          <h2 className="text-base font-bold text-critical-strong mb-2">Mensagem Indisponível</h2>
          <p className="text-xs text-muted-foreground">{error}</p>
          {onBack && (
            <Button size="sm" variant="outline" onClick={onBack} className="mt-4 text-xs">
              Voltar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-12 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-success text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar (Screen Only) - SYSGOV Header Style */}
      <header className="no-print w-full bg-card border-b border-border/80 px-6 py-3 flex items-center justify-between shadow-xs mb-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-xs font-medium border-border hover:bg-muted"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Voltar ao Sistema
            </Button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground tracking-tight">
                  Mensagem para as Células
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-success-surface text-success-strong border border-success-border">
                  Folha Oficial A4
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {sermon.organization?.name} · Culto de <span className="font-mono">{sermon.service_date}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs font-medium border-success-border text-success-strong hover:bg-success-surface"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Copiar para WhatsApp
          </Button>
          <Button
            variant="coral"
            size="sm"
            onClick={() => window.print()}
            className="text-xs font-bold shadow-xs px-4"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </header>

      {/* Sheet Presentation */}
      <main className="w-full flex justify-center px-4 sheet-transform-wrapper">
        <SheetPreview sermon={sermon} scale={1} />
      </main>
    </div>
  );
};

