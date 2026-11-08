import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DataTable, ColumnDef, DataTableFilter } from './DataTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Users,
  UserPlus,
  Building,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Edit,
} from 'lucide-react';

interface UserItem {
  id: number;
  organization_id: number;
  name: string;
  email: string;
  role: 'admin' | 'unit_admin' | 'reviewer' | 'scribe';
  phone?: string | null;
  active: boolean;
  organization?: { id: number; name: string };
  schedules_count?: number;
  sermons_count?: number;
}

export const UsersManager: React.FC = () => {
  const { user } = useAuth();
  const isGeneralAdmin = user?.role === 'admin';
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'unit_admin' | 'reviewer' | 'scribe'>('scribe');
  const [organizationId, setOrganizationId] = useState<number>(user?.organization?.id ?? 1);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/users');
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsers(list);
    } catch {
      showToast('Erro ao carregar voluntários.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrgs = useCallback(async () => {
    try {
      const res = await api.get<any>('/api/organizations');
      setOrgs(Array.isArray(res) ? res : res?.data || []);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadOrgs();
  }, [loadUsers, loadOrgs]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('scribe');
    setOrganizationId(user?.organization?.id ?? orgs[0]?.id ?? 1);
    setPhone('');
    setShowModal(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setOrganizationId(u.organization_id);
    setPhone(u.phone || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name,
        email,
        role,
        organization_id: role === 'admin' ? null : organizationId,
        phone,
      };
      if (password) payload.password = password;

      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, payload);
        showToast('Voluntário atualizado com sucesso!');
      } else {
        await api.post('/api/users', payload);
        showToast('Voluntário cadastrado com sucesso!');
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Erro ao salvar voluntário.');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      if (u.active !== isActive) return false;
    }
    return true;
  });

  const columns: ColumnDef<UserItem>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      className: 'w-16 font-mono font-bold text-foreground',
      render: u => `#${u.id}`,
    },
    {
      key: 'name',
      header: 'Nome do Voluntário',
      sortable: true,
      className: 'min-w-[180px]',
      render: u => (
        <div>
          <div className="font-bold text-foreground">{u.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Papel',
      sortable: true,
      className: 'text-center',
      render: u => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase ${
            u.role === 'admin' || u.role === 'unit_admin'
              ? 'bg-primary text-white'
              : u.role === 'reviewer'
              ? 'bg-gov-accent-gold text-foreground'
              : 'bg-muted text-foreground border border-input'
          }`}
        >
          {u.role === 'admin'
            ? 'Administrador geral'
            : u.role === 'unit_admin'
            ? 'Administrador da unidade'
            : u.role === 'reviewer'
            ? 'Revisor'
            : 'Escriba'}
        </span>
      ),
    },
    {
      key: 'organization',
      header: 'Unidade / Igreja',
      sortable: true,
      render: u => (
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-gov-accent-gold shrink-0" />
          <span className="truncate">{u.organization?.name || 'Catedral'}</span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefone / WhatsApp',
      sortable: true,
      className: 'font-mono text-xs',
      render: u => u.phone || '—',
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      className: 'text-center',
      render: u => (
        <Badge
          className={
            u.active
              ? 'bg-success-surface text-success-strong border-none text-[11px]'
              : 'bg-critical-surface text-critical-strong border-none text-[11px]'
          }
        >
          {u.active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: u => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenEdit(u)}
          className="h-8 px-2.5 text-xs text-foreground border-input hover:bg-muted"
        >
          <Edit className="w-3.5 h-3.5 mr-1" />
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl bg-primary text-white flex items-center gap-2">
          <CheckCircle2 className="size-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="size-5 text-gov-accent-gold" />
            <span>Voluntários e Equipe</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controle de acessos, papéis de voluntários (escribas e revisores) e alocação por unidade.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="text-xs font-semibold shadow-xs self-start sm:self-auto gap-1.5"
        >
          <UserPlus className="size-4" />
          <span>Novo Voluntário</span>
        </Button>
      </div>

      {/* DataTable */}
      <DataTable<UserItem>
        data={filteredUsers}
        columns={columns}
        searchPlaceholder="Buscar por nome, e-mail, telefone ou unidade..."
        filters={[
          {
            key: 'role',
            label: 'Papel',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { label: 'Todos os Papéis', value: 'all' },
              { label: 'Administrador geral', value: 'admin' },
              { label: 'Administrador da unidade', value: 'unit_admin' },
              { label: 'Revisor', value: 'reviewer' },
              { label: 'Escriba', value: 'scribe' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Todos', value: 'all' },
              { label: 'Ativos', value: 'active' },
              { label: 'Inativos', value: 'inactive' },
            ],
          },
        ]}
        onClearFilters={() => {
          setRoleFilter('all');
          setStatusFilter('all');
        }}
        isLoading={loading}
        emptyMessage="Nenhum voluntário encontrado."
        rowKey={u => u.id}
      />

      {/* Modal de Criação / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-border space-y-4">
            <h3 className="font-bold text-base text-foreground border-b pb-2">
              {editingUser ? 'Editar Voluntário' : 'Cadastrar Novo Voluntário'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nome Completo *</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-xs"
                  placeholder="Ex: João da Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">E-mail *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="text-xs font-mono"
                  placeholder="exemplo@escriba.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha de Acesso *'}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="text-xs font-mono"
                  placeholder="••••••••"
                  required={!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Papel no Sistema *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden"
                  >
                    <option value="scribe">Escriba</option>
                    <option value="reviewer">Revisor</option>
                    {isGeneralAdmin && <option value="admin">Administrador geral</option>}
                    {isGeneralAdmin && <option value="unit_admin">Administrador da unidade</option>}
                  </select>
                </div>

                {role !== 'admin' ? (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Unidade / Igreja *</label>
                  <select
                    value={organizationId}
                    onChange={e => setOrganizationId(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-input rounded-lg focus:outline-hidden"
                    disabled={!isGeneralAdmin}
                  >
                    {orgs.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                ) : (
                  <div className="flex items-center text-xs text-muted-foreground">
                    Este perfil terá acesso geral a todas as unidades.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Telefone / WhatsApp</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="text-xs font-mono"
                  placeholder="(11) 99999-0000"
                />
              </div>

              <div className="pt-2 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-primary text-white text-xs font-semibold"
                >
                  {saving ? 'Salvando...' : 'Salvar Voluntário'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
