import React from 'react';
import { CheckCircle2, SpellCheck } from 'lucide-react';
import { Button } from './ui/button';
import type { SpellError } from '../lib/spellchecker';

interface SpellCheckPanelProps {
  errors: SpellError[];
  readOnly: boolean;
  onApply: (error: SpellError) => void;
  onClose: () => void;
}

/**
 * Gaveta com as sugestões de correção ortográfica pt-BR do resumo.
 */
export const SpellCheckPanel: React.FC<SpellCheckPanelProps> = ({ errors, readOnly, onApply, onClose }) => (
  <div className="mt-3 p-3 bg-warning-surface/60 border border-warning-border rounded-md text-xs space-y-2">
    <div className="flex items-center justify-between font-semibold text-warning-strong">
      <span className="flex items-center gap-1">
        <SpellCheck className="w-4 h-4" />
        Sugestões de Correção Ortográfica (pt-BR)
      </span>
      <button type="button" onClick={onClose} className="text-muted-foreground hover:text-black text-xs">
        ✕
      </button>
    </div>

    {errors.length === 0 ? (
      <p className="text-xs text-success-strong flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Nenhum erro ortográfico ou acentuação pendente detectado no resumo.
      </p>
    ) : (
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {errors.map((err, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-card rounded border border-input gap-2">
            <div>
              <span className="text-critical-strong line-through font-mono">{err.word}</span>
              <span className="mx-1.5 text-muted-foreground/60">➔</span>
              <span className="text-success-strong font-semibold font-mono">{err.suggestion}</span>
            </div>
            {!readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApply(err)}
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
);
