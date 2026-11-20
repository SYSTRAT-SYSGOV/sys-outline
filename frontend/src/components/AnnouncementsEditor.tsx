import React, { useState } from 'react';
import { AnnouncementItem, MAX_ANNOUNCEMENTS, formatShortDate } from '../lib/sermonUtils';
import { Button, Badge } from '@sysgov/ui';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface AnnouncementsEditorProps {
  value: AnnouncementItem[];
  onChange: (next: AnnouncementItem[]) => void;
  readOnly?: boolean;
  inheritedFrom?: string | null;
  unchangedFromInheritance?: boolean;
  maxItems?: number;
}

const newId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `aviso-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const AnnouncementsEditor: React.FC<AnnouncementsEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  inheritedFrom,
  unchangedFromInheritance = false,
  maxItems = MAX_ANNOUNCEMENTS,
}) => {
  const [limitWarning, setLimitWarning] = useState(false);
  const items = value ?? [];

  const updateItem = (index: number, patch: Partial<AnnouncementItem>) => {
    const next = items.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const addItem = () => {
    if (items.length >= maxItems) {
      setLimitWarning(true);
      return;
    }

    setLimitWarning(false);
    onChange([
      ...items,
      {
        id: newId(),
        title: '',
        description: '',
        expires_at: null,
        is_new: true,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setLimitWarning(false);
    onChange(items.filter((_, idx) => idx !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    const current = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = current;
    onChange(next);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="size-4 text-gov-accent-gold" />
            <span>Agenda — Avisos da Semana</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Item, descrição e validade opcional. A ordem aqui é a ordem impressa na folha A4.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              items.length >= maxItems
                ? 'bg-warning-surface text-warning-strong border-warning-border'
                : 'bg-muted text-foreground border-border'
            }`}
          >
            {items.length}/{maxItems}
          </span>

          {inheritedFrom && (
            <Badge
              variant="outline"
              className="border-info-border bg-info-surface text-info-strong font-mono text-[11px]"
            >
              herdado do domingo {formatShortDate(inheritedFrom)}
            </Badge>
          )}

          {!readOnly && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              className="text-xs h-8 gap-1"
            >
              <Plus className="size-3.5" />
              <span>Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {unchangedFromInheritance && (
        <div className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-surface px-3 py-2 text-xs text-warning-strong">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Avisos idênticos à semana passada — confirme se ainda valem antes de enviar para revisão.
          </span>
        </div>
      )}

      {limitWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-critical-border bg-critical-surface px-3 py-2 text-xs text-critical-strong">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Limite de {maxItems} avisos para garantir o enquadramento em página única A4.
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
          Nenhum aviso cadastrado. Inclua ao menos um aviso antes de distribuir o documento dominical.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-lg border border-border bg-background p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                  {item.is_new && (
                    <Badge className="bg-gov-accent-gold text-gov-primary-hover font-mono text-[10px] font-bold border-0">
                      NOVO
                    </Badge>
                  )}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Mover para cima"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-md border border-critical-border text-critical hover:bg-critical-surface cursor-pointer"
                      title="Remover aviso"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Item / Dia <span className="text-critical">*</span>
                  </label>
                  <Input
                    value={item.title}
                    onChange={event => updateItem(index, { title: event.target.value })}
                    disabled={readOnly}
                    maxLength={120}
                    placeholder="Ex: Terça (20h)"
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Descrição <span className="text-critical">*</span>
                  </label>
                  <Textarea
                    value={item.description}
                    onChange={event => updateItem(index, { description: event.target.value })}
                    disabled={readOnly}
                    maxLength={300}
                    rows={1}
                    placeholder="Ex: Culto de Ensino Bíblico"
                    className="text-xs min-h-8"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Validade (opcional)
                  </label>
                  <Input
                    type="date"
                    value={item.expires_at || ''}
                    onChange={event => updateItem(index, { expires_at: event.target.value || null })}
                    disabled={readOnly}
                    className="h-8 text-xs font-mono w-40"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(item.is_new)}
                    onChange={event => updateItem(index, { is_new: event.target.checked })}
                    disabled={readOnly}
                    className="size-3.5 accent-[#1351b4]"
                  />
                  <Sparkles className="size-3.5 text-gov-accent-gold" />
                  <span>Destacar como NOVO na folha A4</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {readOnly && (
        <p className="text-[11px] text-muted-foreground">
          Avisos em somente leitura. Reabra o resumo para revisão para alterar este bloco.
        </p>
      )}
    </div>
  );
};
