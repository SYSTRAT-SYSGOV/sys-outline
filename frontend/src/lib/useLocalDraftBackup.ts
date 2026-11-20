import { useCallback, useEffect, useState } from 'react';

interface StoredBackup<T> {
  savedAt: number;
  value: T;
}

function readBackup<T>(key: string): StoredBackup<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredBackup<T>) : null;
  } catch {
    return null;
  }
}

/**
 * Cópia local do texto em edição: guarda no navegador enquanto há alterações não salvas,
 * oferece restaurar ao reabrir e avisa ao sair da página com alterações pendentes.
 */
export function useLocalDraftBackup<T>(key: string, value: T, enabled: boolean) {
  const [baseline, setBaseline] = useState(() => JSON.stringify(value));
  const [pendingReset, setPendingReset] = useState(false);
  const [stored, setStored] = useState<StoredBackup<T> | null>(() => readBackup<T>(key));

  const current = JSON.stringify(value);
  const dirty = enabled && current !== baseline;

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
      } catch {
        // armazenamento cheio ou indisponível: a cópia local é só um reforço
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [dirty, current, key, value]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (pendingReset) {
      setBaseline(current);
      setPendingReset(false);
    }
  }, [pendingReset, current]);

  /** Chame após salvar ou enviar: a versão atual passa a ser a de referência e a cópia local sai. */
  const markSaved = useCallback(() => {
    localStorage.removeItem(key);
    setStored(null);
    setPendingReset(true);
  }, [key]);

  const discard = useCallback(() => {
    localStorage.removeItem(key);
    setStored(null);
  }, [key]);

  const available = stored && JSON.stringify(stored.value) !== baseline ? stored : null;

  return { backup: available, dirty, markSaved, discard };
}
