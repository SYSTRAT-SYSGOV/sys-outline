import React, { useEffect, useState } from 'react';
import { Button } from '@sysgov/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { api } from '../lib/api';

interface Colleague {
  id: number;
  name: string;
}

interface SwapScheduleDialogProps {
  scheduleId: number | null;
  onClose: () => void;
  onSwapped: () => void;
}

/**
 * Passa a escala para um colega da mesma unidade. Vale na hora, sem aprovação.
 */
export const SwapScheduleDialog: React.FC<SwapScheduleDialogProps> = ({ scheduleId, onClose, onSwapped }) => {
  const [candidates, setCandidates] = useState<{ scheduleId: number; items: Colleague[] } | null>(null);
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleId === null) return;
    api
      .get<Colleague[]>(`/api/schedules/${scheduleId}/swap-candidates`)
      .then(items => setCandidates({ scheduleId, items }))
      .catch((err: any) => setError(err?.message || 'Não foi possível carregar os colegas.'));
  }, [scheduleId]);

  const items = candidates?.scheduleId === scheduleId ? candidates.items : null;

  const close = () => {
    setSelected('');
    setError(null);
    setCandidates(null);
    onClose();
  };

  const confirm = async () => {
    if (!selected || scheduleId === null) return;
    setSaving(true);
    setError(null);
    try {
      await api.post(`/api/schedules/${scheduleId}/swap`, { scribe_user_id: Number(selected) });
      onSwapped();
      close();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível passar a escala.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={scheduleId !== null} onOpenChange={open => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passar escala para um colega</DialogTitle>
          <DialogDescription>
            O colega escolhido assume a escala e o resumo em andamento. A troca vale na hora e a coordenação é avisada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-4">
        {items === null ? (
          <p className="text-sm text-muted-foreground">{error ?? 'Carregando colegas...'}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum colega disponível neste dia e horário.</p>
        ) : (
          <div className="space-y-1">
            <label htmlFor="swap-colleague" className="text-sm font-semibold text-foreground">
              Colega
            </label>
            <select
              id="swap-colleague"
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full rounded-lg border border-input p-2 text-sm"
            >
              <option value="">Selecione...</option>
              {items.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && items !== null && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancelar
          </Button>
          <Button type="button" onClick={confirm} disabled={!selected || saving}>
            {saving ? 'Passando...' : 'Passar escala'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
