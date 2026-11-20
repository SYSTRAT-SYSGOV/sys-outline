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
  kind: 'number' | 'text' | 'textarea' | 'password' | 'boolean' | 'select';
  inputType?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  maxLength?: number;
  /** Só existe no nível do sistema (administrador geral); a unidade não vê nem sobrescreve. */
  globalOnly?: boolean;
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

const MAIL_FIELDS: FieldDef[] = [
  {
    key: 'mail_enabled',
    label: 'Enviar e-mails pelo servidor SMTP',
    help: 'Desligado, as mensagens (lembretes de prazo e escalas recebidas) só são registradas no log do servidor.',
    kind: 'boolean',
    globalOnly: true,
  },
  {
    key: 'mail_host',
    label: 'Servidor SMTP',
    help: 'Ex.: smtp.seudominio.com',
    kind: 'text',
    maxLength: 190,
    globalOnly: true,
  },
  {
    key: 'mail_port',
    label: 'Porta',
    help: 'Normalmente 587 (STARTTLS) ou 465 (SSL/TLS).',
    kind: 'number',
    min: 1,
    max: 65535,
    globalOnly: true,
  },
  {
    key: 'mail_encryption',
    label: 'Segurança da conexão',
    help: 'Use STARTTLS com a porta 587 e SSL/TLS com a porta 465.',
    kind: 'select',
    options: [
      { value: 'tls', label: 'STARTTLS' },
      { value: 'ssl', label: 'SSL/TLS' },
    ],
    globalOnly: true,
  },
  {
    key: 'mail_username',
    label: 'Usuário',
    help: 'Login do servidor SMTP.',
    kind: 'text',
    maxLength: 190,
    globalOnly: true,
  },
  {
    key: 'mail_password',
    label: 'Senha',
    help: 'Guardada criptografada e nunca exibida. Deixe em branco para manter a senha atual.',
    kind: 'password',
    maxLength: 190,
    globalOnly: true,
  },
  {
    key: 'mail_from_address',
    label: 'E-mail do remetente',
    help: 'Endereço que aparece como remetente das mensagens.',
    kind: 'text',
    inputType: 'email',
    maxLength: 190,
    globalOnly: true,
  },
  {
    key: 'mail_from_name',
    label: 'Nome do remetente',
    help: 'Ex.: Escriba da Palavra',
    kind: 'text',
    maxLength: 100,
    globalOnly: true,
  },
];

const SOURCE_LABEL: Record<SettingSource, string> = {
  unit: 'Definido na unidade',
  global: 'Herdado do global',
  default: 'Padrão do sistema',
};

type Scope = { type: 'global' } | { type: 'unit'; organizationId: number };

function initialDraft(field: FieldDef, entry: EffectiveSettings[SettingKey]): string {
  if (field.kind === 'password') return '';
  return String(entry?.value ?? '');
}

function SettingsForm({ scope, canEdit }: { scope: Scope; canEdit: boolean }) {
  const { reload } = useSettings();
  const isGlobal = scope.type === 'global';
  const fields = isGlobal ? [...FIELDS, ...MAIL_FIELDS] : FIELDS;
  const [loaded, setLoaded] = useState<EffectiveSettings | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const url = isGlobal ? '/api/settings?scope=global' : `/api/settings?organization_id=${scope.organizationId}`;
  const putUrl = isGlobal ? '/api/settings' : `/api/organizations/${scope.organizationId}/settings`;

  const load = useCallback(async () => {
    const data = await api.get<EffectiveSettings>(url);
    setLoaded(data);
    setDraft(Object.fromEntries([...FIELDS, ...MAIL_FIELDS].map(f => [f.key, initialDraft(f, data[f.key])])));
  }, [url]);

  useEffect(() => {
    load().catch(() => setMessage({ text: 'Erro ao carregar configurações.', error: true }));
  }, [load]);

  const toPayload = (field: FieldDef, raw: string) =>
    field.kind === 'number' ? Number(raw) : field.kind === 'boolean' ? raw === 'true' : raw;

  const isChanged = (field: FieldDef) => {
    if (!loaded) return false;
    if (field.kind === 'password') return draft[field.key] !== '';
    return draft[field.key] !== initialDraft(field, loaded[field.key]);
  };

  const errorText = (err: any, fallback: string) => {
    const first = err?.errors ? Object.values(err.errors).flat()[0] : null;
    return String(first || err?.message || fallback);
  };

  const persist = async (settings: Record<string, unknown>) => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put(putUrl, { settings });
      await load();
      await reload();
      setMessage({ text: 'Configurações salvas.', error: false });
    } catch (err: any) {
      setMessage({ text: errorText(err, 'Não foi possível salvar.'), error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    const changed = fields.filter(isChanged);
    if (changed.length === 0) return;
    persist(Object.fromEntries(changed.map(f => [f.key, toPayload(f, draft[f.key])])));
  };

  const sendTestMail = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const res = await api.post<{ message: string }>('/api/settings/mail/test');
      setMessage({ text: res?.message ?? 'E-mail de teste enviado.', error: false });
    } catch (err: any) {
      setMessage({ text: errorText(err, 'Não foi possível enviar o e-mail de teste.'), error: true });
    } finally {
      setTesting(false);
    }
  };

  if (!loaded) {
    return <p className="text-sm text-muted-foreground">{message?.text ?? 'Carregando configurações...'}</p>;
  }

  const disabled = !canEdit || saving;

  return (
    <div className="space-y-5">
      {fields.map((field, index) => {
        const entry = loaded[field.key];
        const source = entry?.source ?? 'default';
        const id = `setting-${field.key}`;
        const showMailHeading = field.globalOnly && !fields[index - 1]?.globalOnly;
        const setValue = (value: string) => setDraft(prev => ({ ...prev, [field.key]: value }));

        return (
          <React.Fragment key={field.key}>
            {showMailHeading && (
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-bold text-foreground">E-mail (SMTP)</h3>
                <p className="text-xs text-muted-foreground">
                  Servidor usado para os avisos por e-mail. Só o administrador geral vê e edita estes campos.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={id} className="text-sm font-semibold text-foreground">
                  {field.label}
                </label>
                {!field.globalOnly && (
                  <Badge variant="outline" className="text-[10px]">
                    {SOURCE_LABEL[source]}
                  </Badge>
                )}
                {field.kind === 'password' && (
                  <Badge variant="outline" className="text-[10px]">
                    {entry?.is_set ? 'Senha definida' : 'Sem senha'}
                  </Badge>
                )}
              </div>

              {field.kind === 'textarea' ? (
                <Textarea
                  id={id}
                  value={draft[field.key] ?? ''}
                  disabled={disabled}
                  onChange={e => setValue(e.target.value)}
                  maxLength={field.maxLength}
                  rows={3}
                  className="text-sm"
                />
              ) : field.kind === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    id={id}
                    type="checkbox"
                    checked={draft[field.key] === 'true'}
                    disabled={disabled}
                    onChange={e => setValue(e.target.checked ? 'true' : 'false')}
                    className="size-4"
                  />
                  Ativado
                </label>
              ) : field.kind === 'select' ? (
                <select
                  id={id}
                  value={draft[field.key] ?? ''}
                  disabled={disabled}
                  onChange={e => setValue(e.target.value)}
                  className="w-full max-w-sm rounded-lg border border-input p-2 text-sm"
                >
                  {field.options?.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={id}
                  value={draft[field.key] ?? ''}
                  disabled={disabled}
                  onChange={e => setValue(e.target.value)}
                  type={
                    field.kind === 'password' ? 'password' : (field.inputType ?? (field.kind === 'number' ? 'number' : 'text'))
                  }
                  autoComplete={field.kind === 'password' ? 'new-password' : undefined}
                  placeholder={field.kind === 'password' && entry?.is_set ? '••••••••' : undefined}
                  min={field.min}
                  max={field.max}
                  maxLength={field.maxLength}
                  className="max-w-sm text-sm tabular-nums"
                />
              )}

              <p className="text-xs text-muted-foreground">{field.help}</p>
              {canEdit && scope.type === 'unit' && source === 'unit' && !field.globalOnly && (
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
          </React.Fragment>
        );
      })}

      {canEdit && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
          {isGlobal && (
            <Button type="button" variant="outline" onClick={sendTestMail} disabled={testing || saving}>
              {testing ? 'Enviando...' : 'Enviar e-mail de teste'}
            </Button>
          )}
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
    api
      .get<OrgOption[]>('/api/organizations')
      .then(setOrgs)
      .catch(() => setOrgs([]));
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
