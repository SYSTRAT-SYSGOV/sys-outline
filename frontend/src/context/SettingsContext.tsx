import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

export type SettingKey =
  | 'summary_char_limit'
  | 'default_deadline_hours'
  | 'a4_footer_text'
  | 'whatsapp_footer'
  | 'mail_enabled'
  | 'mail_host'
  | 'mail_port'
  | 'mail_encryption'
  | 'mail_username'
  | 'mail_password'
  | 'mail_from_address'
  | 'mail_from_name';

export type SettingSource = 'unit' | 'global' | 'default';

export interface AppSettings {
  summary_char_limit: number;
  default_deadline_hours: number;
  a4_footer_text: string;
  whatsapp_footer: string;
}

export type EffectiveSettings = Partial<Record<SettingKey, { value: any; source: SettingSource; is_set?: boolean }>>;

/** Padrões iguais aos do backend (SettingsRegistry), usados até a API responder. */
export const DEFAULT_SETTINGS: AppSettings = {
  summary_char_limit: 3400,
  default_deadline_hours: 72,
  a4_footer_text: '',
  whatsapp_footer: '',
};

interface SettingsContextType {
  settings: AppSettings;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [loaded, setLoaded] = useState<AppSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    const data = await api.get<EffectiveSettings>('/api/settings');
    const next = { ...DEFAULT_SETTINGS };
    (Object.keys(next) as SettingKey[]).forEach(key => {
      if (data?.[key]) (next as any)[key] = data[key].value;
    });
    setLoaded(next);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchSettings().catch(() => setLoaded(null));
  }, [userId, fetchSettings]);

  const value = useMemo<SettingsContextType>(
    () => ({ settings: userId && loaded ? loaded : DEFAULT_SETTINGS, reload: fetchSettings }),
    [userId, loaded, fetchSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  return ctx;
}
