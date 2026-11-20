import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { diffWords } from '../lib/textDiff';

interface Snapshot {
  theme: string;
  minister_name: string;
  scripture_text: string;
  cell_direction: string;
  leader_guidelines: string;
  summary_text: string;
}

interface Changes {
  current: Snapshot | null;
  previous: Snapshot | null;
  previous_submitted_at: string | null;
}

const FIELD_LABELS: Array<[keyof Snapshot, string]> = [
  ['theme', 'Tema'],
  ['minister_name', 'Ministrante'],
  ['scripture_text', 'Texto lido'],
  ['cell_direction', 'Direcionamento para a célula'],
  ['leader_guidelines', 'Orientações para os líderes'],
];

/**
 * Mostra ao revisor o que mudou desde o envio anterior do mesmo resumo.
 * Não aparece no primeiro envio, quando não há versão anterior para comparar.
 */
export const SubmissionChanges: React.FC<{ sermonId: number }> = ({ sermonId }) => {
  const [loaded, setLoaded] = useState<{ id: number; changes: Changes } | null>(null);

  useEffect(() => {
    api
      .get<Changes>(`/api/sermons/${sermonId}/changes`)
      .then(changes => setLoaded({ id: sermonId, changes }))
      .catch(() => setLoaded(null));
  }, [sermonId]);

  const changes = loaded?.id === sermonId ? loaded.changes : null;
  if (!changes?.current || !changes.previous) return null;

  const { current, previous } = changes;
  const changedFields = FIELD_LABELS.filter(([key]) => current[key] !== previous[key]).map(([, label]) => label);
  const textChanged = current.summary_text !== previous.summary_text;

  if (changedFields.length === 0 && !textChanged) {
    return <p className="text-xs text-muted-foreground">Nenhuma alteração desde o envio anterior.</p>;
  }

  return (
    <details className="rounded-lg border border-border bg-card p-3 text-sm" open>
      <summary className="cursor-pointer font-semibold text-foreground">
        Alterações desde o envio anterior
        {changes.previous_submitted_at && (
          <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
            ({new Date(changes.previous_submitted_at).toLocaleDateString('pt-BR')})
          </span>
        )}
      </summary>
      {changedFields.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Campos alterados: {changedFields.join(', ')}.</p>
      )}
      {textChanged && (
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">
          {diffWords(previous.summary_text, current.summary_text).map((part, index) =>
            part.type === 'add' ? (
              <ins key={index} className="rounded-sm bg-success-surface text-success-strong no-underline">
                {part.text}
              </ins>
            ) : part.type === 'remove' ? (
              <del key={index} className="rounded-sm bg-critical-surface text-critical-strong">
                {part.text}
              </del>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </p>
      )}
    </details>
  );
};
