import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { Button, Textarea } from '@sysgov/ui';
import { api } from '../lib/api';

interface ReviewComment {
  id: number;
  quote: string | null;
  body: string;
  resolved_at: string | null;
  created_at: string;
  user?: { name: string; role: string };
}

interface ReviewCommentsProps {
  sermonId: number;
  /** Revisores e coordenadores podem comentar enquanto o resumo está em revisão. */
  canComment?: boolean;
}

/**
 * Comentários do revisor sobre trechos do resumo. O escriba vê e marca como resolvido.
 */
export const ReviewComments: React.FC<ReviewCommentsProps> = ({ sermonId, canComment = false }) => {
  const [loaded, setLoaded] = useState<{ id: number; items: ReviewComment[] } | null>(null);
  const [quote, setQuote] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const items = await api.get<ReviewComment[]>(`/api/sermons/${sermonId}/comments`);
    setLoaded({ id: sermonId, items });
  }, [sermonId]);

  useEffect(() => {
    load().catch(() => setLoaded(null));
  }, [load]);

  const comments = loaded?.id === sermonId ? loaded.items : [];

  const fillFromSelection = () => {
    const selected = window.getSelection()?.toString().trim() ?? '';
    if (selected) setQuote(selected.slice(0, 500));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.post(`/api/sermons/${sermonId}/comments`, { quote: quote.trim() || null, body: body.trim() });
      setQuote('');
      setBody('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível salvar o comentário.');
    } finally {
      setSaving(false);
    }
  };

  const toggleResolved = async (id: number) => {
    try {
      await api.put(`/api/review-comments/${id}/resolve`);
      await load();
    } catch {
      setError('Não foi possível atualizar o comentário.');
    }
  };

  if (comments.length === 0 && !canComment) return null;

  return (
    <section aria-labelledby="review-comments" className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 id="review-comments" className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquareText className="size-4" />
        Comentários da revisão
        {comments.length > 0 && (
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            ({comments.filter(c => !c.resolved_at).length} abertos)
          </span>
        )}
      </h3>

      <ul className="space-y-2">
        {comments.map(c => (
          <li key={c.id} className={`rounded-lg border border-border p-3 text-sm ${c.resolved_at ? 'opacity-60' : ''}`}>
            {c.quote && (
              <blockquote className="mb-1 border-l-2 border-gov-accent-gold pl-2 text-xs italic text-muted-foreground">
                {c.quote}
              </blockquote>
            )}
            <p className="whitespace-pre-wrap">{c.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{c.user?.name}</span>
              <span className="tabular-nums">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto h-6 text-[11px]"
                onClick={() => toggleResolved(c.id)}
              >
                {c.resolved_at ? 'Reabrir' : 'Marcar como resolvido'}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {canComment && (
        <form onSubmit={submit} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              aria-label="Trecho comentado"
              value={quote}
              onChange={e => setQuote(e.target.value)}
              maxLength={500}
              placeholder="Trecho comentado (opcional)"
              className="min-w-0 flex-1 rounded-lg border border-input p-2 text-xs"
            />
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={fillFromSelection}>
              Usar texto selecionado
            </Button>
          </div>
          <Textarea
            aria-label="Comentário"
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="Escreva o comentário para o escriba"
            className="text-sm"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={saving || !body.trim()}>
              {saving ? 'Salvando...' : 'Adicionar comentário'}
            </Button>
            {error && (
              <span role="alert" className="text-xs text-destructive">
                {error}
              </span>
            )}
          </div>
        </form>
      )}
    </section>
  );
};
