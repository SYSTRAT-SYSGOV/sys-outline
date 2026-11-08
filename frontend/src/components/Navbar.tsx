import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Building2,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const roleLabel = {
    admin: 'Administrador geral',
    unit_admin: 'Administrador da unidade',
    reviewer: 'Revisor',
    scribe: 'Escriba',
  }[user?.role || 'scribe'];

  return (
    <nav className="no-print bg-primary text-white border-b border-white/10 px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Brand & Church Scope */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('editor')}>
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
            E
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white leading-tight">
              Sistema Escriba
            </div>
            <div className="text-[10px] text-white/60 tracking-wider uppercase font-mono">
              Resumos Dominicais
            </div>
          </div>
        </div>

        {/* Church / Nucleo Scope Pill */}
        {user?.organization && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white/90 text-xs border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-info" />
            <span className="font-medium">{user.organization.name}</span>
            <span className="text-[10px] uppercase font-mono text-white/60">
              ({user.organization.type})
            </span>
          </div>
        )}
      </div>

      {/* Nav Navigation Links */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onTabChange('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'editor'
              ? 'bg-primary text-white shadow-xs'
              : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Editor de Resumo</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('schedules')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentTab === 'schedules'
              ? 'bg-primary text-white shadow-xs'
              : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Escalas Dominicais</span>
        </button>

        {(user?.role === 'reviewer' || user?.role === 'admin' || user?.role === 'unit_admin') && (
          <button
            type="button"
            onClick={() => onTabChange('review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentTab === 'review'
                ? 'bg-primary text-white shadow-xs'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Fila de Revisão</span>
          </button>
        )}

        {(user?.role === 'admin' || user?.role === 'unit_admin') && (
          <button
            type="button"
            onClick={() => onTabChange('organizations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentTab === 'organizations'
                ? 'bg-primary text-white shadow-xs'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Igrejas & Núcleos</span>
          </button>
        )}
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end text-xs">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <UserIcon className="w-3 h-3 text-info" />
            <span>{user?.name}</span>
          </div>
          <div className="text-[11px] font-mono text-primary-foreground/70">
            {roleLabel}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="border-white/20 text-white/90 hover:bg-white/10 hover:text-primary-foreground h-7 px-2 text-xs"
          title="Sair do sistema"
        >
          <LogOut className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </nav>
  );
};
