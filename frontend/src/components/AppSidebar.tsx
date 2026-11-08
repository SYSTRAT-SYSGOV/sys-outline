import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Calendar,
  CheckSquare,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Church,
  BookOpen,
} from 'lucide-react';
import { api } from '../lib/api';

export type TabKey = 'editor' | 'schedules' | 'review' | 'sermons' | 'organizations' | 'users';

interface AppSidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);

  // Carregar contagem de revisões pendentes periodicamente
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'reviewer') {
      const fetchQueue = async () => {
        try {
          const res = await api.get<any>('/api/review-queue');
          const list = Array.isArray(res) ? res : res?.data || [];
          setPendingReviewsCount(list.length);
        } catch {
          // silencioso
        }
      };
      fetchQueue();
      const interval = setInterval(fetchQueue, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navItems = [
    {
      key: 'editor' as TabKey,
      label: 'Editor de Ministração',
      icon: FileText,
      roles: ['admin', 'reviewer', 'scribe'],
      badge: null,
    },
    {
      key: 'schedules' as TabKey,
      label: user?.role === 'scribe' ? 'Minhas Escalas' : 'Escalas Dominicais',
      icon: Calendar,
      roles: ['admin', 'reviewer', 'scribe'],
      badge: null,
    },
    {
      key: 'review' as TabKey,
      label: 'Fila de Revisão',
      icon: CheckSquare,
      roles: ['admin', 'reviewer'],
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
      badgeColor: 'bg-gov-accent-gold text-white',
    },
    {
      key: 'sermons' as TabKey,
      label: 'Biblioteca de Resumos',
      icon: BookOpen,
      roles: ['admin', 'reviewer', 'scribe'],
      badge: null,
    },
    {
      key: 'organizations' as TabKey,
      label: 'Igrejas & Núcleos',
      icon: Building2,
      roles: ['admin'],
      badge: null,
    },
    {
      key: 'users' as TabKey,
      label: 'Voluntários & Equipe',
      icon: Users,
      roles: ['admin'],
      badge: null,
    },
  ];

  const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    reviewer: 'Revisor',
    scribe: 'Escriba',
  };

  const handleNavClick = (key: TabKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 bg-primary text-white flex flex-col transition-all duration-300 ease-in-out border-r border-border shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-md">
              <Church className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight text-white truncate">
                  Sistema Escriba
                </span>
                <span className="text-[10px] text-gov-accent-gold font-mono tracking-wider uppercase truncate">
                  Gestão de Células
                </span>
              </div>
            )}
          </div>

          {/* Botão de Colapso (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Informações da Igreja / Unidade Ativa */}
        {!collapsed && user?.organization && (
          <div className="px-4 py-3 mx-3 my-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-gov-accent-gold shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Unidade Ativa</div>
              <div className="text-xs font-semibold text-white/90 truncate">{user.organization.name}</div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {allowedNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gov-accent-gold text-white font-semibold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-white/20 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip ao estar recolhido */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-primary/90 text-white text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className="p-3 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-primary/90 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-gov-accent-gold shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ES'}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-white/50 font-mono truncate">
                  {user?.role ? roleLabels[user.role] : ''}
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-white/70 hover:text-red-300 transition-colors shrink-0"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
