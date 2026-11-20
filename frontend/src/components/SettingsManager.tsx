import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Textarea, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@sysgov/ui';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSettings, EffectiveSettings, SettingKey, SettingSource } from '../context/SettingsContext';

interface OrgOption {
  id: number;
  name: string;
}

interface FieldDef {
  key: SettingKey;
  label: string;
  help: string;
  kind: 'number' | 'text' | 'textarea';
  min?: number;
  max?: number;
  maxLength?: number;
}

const FIELDS: FieldDef[] = [
  {
    key: 'summary_char_limit',
    label: 'Limite de caracteres do resumo',
    help: 'Teto para caber em uma folha A4. A unidade só pode reduzir o limite global (máximo 3.400).',
    kind: 'number',
    min: 500,
    max: 3400,
  },
  {
    key: 'default_deadline_hours',
    label: 'Prazo padrão de entrega (horas após o culto)',
    help: 'Sugerido ao criar uma escala.',
    kind: 'number',
    min: 1,
    max: 336,
  },
  {
    key: 'a4_footer_text',
    label: 'Rodapé da folha A4',
    help: 'Texto opcional impresso no rodapé da folha.',
    kind: 'text',
    maxLength: 200,
  },
  {
    key: 'whatsapp_footer',
    label: 'Rodapé da mensagem de WhatsApp',
    help: 'Texto opcional acrescentado ao fim da mensagem compartilhada.',
    kind: 'textarea',
    maxLength: 300,
  },
];

const SOURCE_LABEL: Record<SettingSource, string> = {
  unit: 'Definido na unidade',
  global: 'Herdado do global',
  default: 'Padrão do sistema',
};

type Scope = { type: 'global' } | { type: 'unit'; organizationId: number };

function SettingsForm({ scope, canEdit }: { scope: Scope; canEdit: boolean }) {
  const { reload } = useSettings();
  const [loaded, setLoaded] = useState<EffectiveSettings | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const url =
    scope.type === 'global' ? '/api/settings?scope=global' : `/api/settings?organization_id=${scope.organizationId}`;
  const putUrl = scope.type === 'global' ? '/api/settings' : `/api/organizations/${scope.organizationId}/settings`;

  const load = useCallback(async () => {
    const data = await api.get<EffectiveSettings>(url);
    setLoaded(data);
    setDraft(Object.fromEntries(FIELDS.map(f => [f.key, String(data[f.key].value ?? '')])));
  }, [url]);

  useEffect(() => {
    load().catch(() => setMessage({ text: 'Erro ao carregar configurações.', error: true }));
  }, [load]);

  const toPayload = (field: FieldDef, raw: string) => (field.kind === 'number' ? Number(raw) : raw);

  const persist = async (settings: Record<string, unknown>) => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put(putUrl, { settings });
      await load();
      await reload();
      setMessage({ text: 'Configurações salvas.', error: false });
    } catch (err: any) {
      const first = err?.errors ? Object.values(err.errors).flat()[0] : null;
      setMessage({ text: String(first || err?.message || 'Não foi possível salvar.'), error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!loaded) return;
    const changed = FIELDS.filter(f => draft[f.key] !== String(loaded[f.key].value ?? ''));
    if (changed.length === 0) return;
    persist(Object.fromEntries(changed.map(f => [f.key, toPayload(f, draft[f.key])])));
  };

  if (!loaded) {
    return <p className="text-sm text-muted-foreground">{message?.text ?? 'Carregando configurações...'}</p>;
  }

  return (
    <div className="space-y-5">
      {FIELDS.map(field => {
        const source = loaded[field.key].source;
        const common = {
          id: `setting-${field.key}`,
          value: draft[field.key] ?? '',
          disabled: !canEdit || saving,
          onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            setDraft(prev => ({ ...prev, [field.key]: e.target.value })),
        };
        return (
          <div key={field.key} className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={common.id} className="text-sm font-semibold text-foreground">
                {field.label}
              </label>
              <Badge variant="outline" className="text-[10px]">
                {SOURCE_LABEL[source]}
              </Badge>
            </div>
            {field.kind === 'textarea' ? (
              <Textarea {...common} maxLength={field.maxLength} rows={3} className="text-sm" />
            ) : (
              <Input
                {...common}
                type={field.kind === 'text' ? 'text' : field.kind}
                min={field.min}
                max={field.max}
                maxLength={field.maxLength}
                className="max-w-sm text-sm tabular-nums"
              />
            )}
            <p className="text-xs text-muted-foreground">{field.help}</p>
            {canEdit && scope.type === 'unit' && source === 'unit' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => persist({ [field.key]: null })}
                className="h-7 text-xs"
              >
                Voltar a herdar do global
              </Button>
            )}
          </div>
        );
      })}

      {canEdit && (
        <div className="flex items-center gap-3 pt-2">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
          {message && (
            <span role="status" className={`text-sm ${message.error ? 'text-destructive' : 'text-success'}`}>
              {message.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const SettingsManager: React.FC = () => {
  const { user } = useAuth();
  const isGeneralAdmin = user?.role === 'admin';
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [orgId, setOrgId] = useState<number | null>(user?.organization_id ?? null);
  const selectedOrgId = orgId ?? orgs[0]?.id ?? null;

  useEffect(() => {
    if (!isGeneralAdmin) return;
    api.get<OrgOption[]>('/api/organizations').then(setOrgs).catch(() => setOrgs([]));
  }, [isGeneralAdmin]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Tabs defaultValue="unit">
        <TabsList>
          <TabsTrigger value="unit">Unidade</TabsTrigger>
          {isGeneralAdmin && <TabsTrigger value="global">Sistema</TabsTrigger>}
        </TabsList>

        <TabsContent value="unit" className="mt-4 space-y-4">
          {isGeneralAdmin && (
            <div className="space-y-1">
              <label htmlFor="settings-org" className="text-sm font-semibold text-foreground">
                Unidade
              </label>
              <select
                id="settings-org"
                value={selectedOrgId ?? ''}
                onChange={e => setOrgId(Number(e.target.value))}
                className="w-full max-w-sm rounded-lg border border-input p-2 text-sm"
              >
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedOrgId ? (
            <SettingsForm key={selectedOrgId} scope={{ type: 'unit', organizationId: selectedOrgId }} canEdit />
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma unidade.</p>
          )}
        </TabsContent>

        {isGeneralAdmin && (
          <TabsContent value="global" className="mt-4">
            <p className="mb-4 text-sm text-muted-foreground">
              Padrões válidos para todas as unidades que não definirem um valor próprio.
            </p>
            <SettingsForm scope={{ type: 'global' }} canEdit />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
