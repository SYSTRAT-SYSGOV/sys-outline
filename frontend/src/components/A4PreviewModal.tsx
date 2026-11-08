import React, { useState } from 'react';
import { SermonData, formatAuthHash, generateClientAuthHash } from '../lib/sermonUtils';
import { SheetPreview } from './SheetPreview';
import { Button } from './ui/button';
import { Printer, X, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface A4PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonData | null;
}

export const A4PreviewModal: React.FC<A4PreviewModalProps> = ({
  isOpen,
  onClose,
  sermon,
}) => {
  const [scale, setScale] = useState<number>(0.9);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [currentHeight, setCurrentHeight] = useState<number>(0);

  if (!isOpen || !sermon) return null;

  const handlePrint = () => {
    window.print();
  };

  const charCount = sermon.summary_text?.length || 0;
  const authHash = formatAuthHash(sermon.auth_hash || generateClientAuthHash(sermon));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto no-print">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl bg-[#1E293B] rounded-xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-700">
        {/* Modal Toolbar Header */}
        <div className="px-5 py-3.5 bg-[#0F172A] border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
              <span>Pré-visualização da Folha A4</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-gov-accent-gold border border-gov-accent-gold/40 font-mono">
                210mm x 297mm
              </span>
            </h3>

            {/* Overflow status pill */}
            {isOverflowing ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Excede 1 folha A4</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enquadrado em 1 folha A4</span>
              </span>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Diminuir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono text-slate-300 select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(s => Math.min(1.4, s + 0.1))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale(0.9)}
                className="p-1.5 text-muted-foreground/70 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Ajuste padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Botão de Impressão / PDF */}
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 font-semibold text-xs cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </Button>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sheet Canvas Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-[#090D16]">
          <div className="inline-block transition-transform duration-150">
            <SheetPreview
              sermon={sermon}
              scale={scale}
              onOverflowChange={(overflow, height) => {
                setIsOverflowing(overflow);
                setCurrentHeight(height);
              }}
            />
          </div>
        </div>

        {/* Modal Footer Info com Hash de Autenticação */}
        <div className="px-5 py-2.5 bg-[#0F172A] border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground/70 shrink-0 font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              Caracteres no Resumo:{' '}
              <span
                className={`font-bold ${charCount > 3400 ? 'text-red-400' : 'text-emerald-400'
                  }`}
              >
                {charCount.toLocaleString('pt-BR')} / 3.400
              </span>
            </div>
            <div>
              Altura do conteúdo:{' '}
              <span className="font-bold text-slate-300">
                {Math.round(currentHeight)}px
              </span>
            </div>
          </div>

          {/* Hash de Autenticação no Rodapé do Modal */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FDE047]" />
            <span className="text-muted-foreground/70">Autenticação:</span>
            <span className="font-mono text-[#FDE047] font-semibold tracking-wider select-all">
              {authHash}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

