import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DataTable, ColumnDef, DataTableFilter } from './DataTable';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Building2, Plus, QrCode, Image as ImageIcon, MapPin, Phone, Edit, CheckCircle2, AlertCircle } from 'lucide-react';

interface Organization {
  id: number;
  name: string;
  type: 'catedral' | 'nucleo';
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  pix_key?: string;
  banner_url?: string | null;
  qr_code_pix_url?: string | null;
  users_count?: number;
  sermons_count?: number;
}

export const OrganizationsManager: React.FC = () => {
  const { user } = useAuth();
  const isGeneralAdmin = user?.role === 'admin';
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState<'catedral' | 'nucleo'>('nucleo');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Organization[]>('/api/organizations');
      setOrgs(res);
    } catch {
      showToast('Erro ao carregar organizações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setName('');
    setType('nucleo');
    setCity('');
    setState('SP');
    setAddress('');
    setPhone('');
    setPixKey('');
    setBannerUrl('');
    setQrCodeUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setName(org.name);
    setType(org.type);
    setCity(org.city || '');
    setState(org.state || 'SP');
    setAddress(org.address || '');
    setPhone(org.phone || '');
    setPixKey(org.pix_key || '');
    setBannerUrl(org.banner_url || '');
    setQrCodeUrl(org.qr_code_pix_url || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nome é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        city,
        state,
        address,
        phone,
        pix_key: pixKey,
        banner_url: bannerUrl || null,
        qr_code_pix_url: qrCodeUrl || null,
      };
      if (isGeneralAdmin) Object.assign(payload, { type });

      if (editingOrg) {
        await api.put(`/api/organizations/${editingOrg.id}`, payload);
        showToast('Igreja atualizada com sucesso!');
      } else {
        await api.post('/api/organizations', payload);
        showToast('Igreja cadastrada com sucesso!');
      }

      setShowModal(false);
      loadOrgs();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || 'Erro ao salvar igreja.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Building2 className="size-5 text-gov-accent-gold" />
            <span>Igrejas e Núcleos Regionais</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestão da Catedral e dos Núcleos com personalização de cabeçalhos e QR Code Pix
          </p>
        </div>

        {isGeneralAdmin && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs font-semibold shadow-xs gap-1.5"
          >
            <Plus className="size-4" />
            <span>Nova Unidade</span>
          </Button>
        )}
      </div>

      {/* Orgs DataTable */}
      <div>
        <DataTable<Organization>
          data={orgs}
          columns={[
            {
              key: 'id',
              header: 'ID',
              sortable: true,
              className: 'w-16 font-mono font-bold text-foreground',
              render: o => `#${o.id}`,
            },
            {
              key: 'name',
              header: 'Nome da Unidade',
              sortable: true,
              className: 'min-w-[200px]',
              render: o => (
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-gov-accent-gold shrink-0" />
                  <span className="font-bold text-foreground">{o.name}</span>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Tipo',
              sortable: true,
              className: 'text-center',
              render: o => (
                <Badge
                  variant="outline"
                  className={
                    o.type === 'catedral'
                      ? 'border-primary bg-primary/10 text-foreground text-[11px] font-mono font-bold'
                      : 'border-border bg-muted text-foreground text-[11px] font-mono'
                  }
                >
                  {o.type.toUpperCase()}
                </Badge>
              ),
            },
            {
              key: 'city',
              header: 'Localização',
              sortable: true,
              render: o => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span>
                    {o.city || '—'} {o.state ? `(${o.state})` : ''}
                  </span>
                </div>
              ),
            },
            {
              key: 'pix_key',
              header: 'Chave Pix',
              sortable: true,
              className: 'font-mono text-xs',
              render: o => (
                <div className="flex items-center gap-1.5">
                  <QrCode className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[180px]">{o.pix_key || '—'}</span>
                </div>
              ),
            },
            {
              key: 'actions',
              header: 'Ações',
              className: 'text-right',
              render: o => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(o)}
                  className="h-8 px-2.5 text-xs"
                >
                  <Edit className="size-3.5 mr-1" />
                  Editar
                </Button>
              ),
            },
          ]}
          searchPlaceholder="Buscar por unidade, cidade ou chave pix..."
          isLoading={loading}
          emptyMessage="Nenhuma igreja ou núcleo encontrado."
          rowKey={o => o.id}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {editingOrg ? 'Editar Igreja / Núcleo' : 'Cadastrar Nova Igreja / Núcleo'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Nome da Unidade <span className="text-critical-strong">*</span>
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Núcleo Leste"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as 'catedral' | 'nucleo')}
                    className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs"
                    disabled={!isGeneralAdmin}
                  >
                    <option value="catedral">Catedral</option>
                    <option value="nucleo">Núcleo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Cidade / UF</label>
                  <div className="flex gap-2">
                    <Input
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Cidade"
                    />
                    <Input
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="UF"
                      className="w-16"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Endereço</label>
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Telefone</label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Chave Pix</label>
                  <Input
                    value={pixKey}
                    onChange={e => setPixKey(e.target.value)}
                    placeholder="pix@igreja.com.br"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  URL da Faixa / Banner de Cabeçalho (ou base64)
                </label>
                <Input
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="https://... ou data:image/png;base64,..."
                />
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Deixe vazio para utilizar a faixa padrão institucional da Catedral
                </span>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  URL da Imagem QR Code Pix (ou base64)
                </label>
                <Input
                  value={qrCodeUrl}
                  onChange={e => setQrCodeUrl(e.target.value)}
                  placeholder="https://... ou data:image/png;base64,..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-primary text-white hover:bg-primary/90 text-xs font-semibold"
                >
                  {saving ? 'Salvando...' : 'Salvar Unidade'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
