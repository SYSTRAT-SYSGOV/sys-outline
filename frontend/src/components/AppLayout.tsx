import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  CheckSquare,
  BookOpen,
  Building2,
  Users,
  Menu,
  Church,
  CalendarDays,
  LogOut,
  ChevronDown,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  ThemeToggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@sysgov/ui';

export type TabKey = 'editor' | 'schedules' | 'review' | 'sermons' | 'organizations' | 'users';

interface NavItem {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  roles?: string[];
  badge?: number | null;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface AppLayoutProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  children: React.ReactNode;
  onOpenA4Preview?: () => void;
  hasSermonToPreview?: boolean;
}

function initials(name?: string) {
  if (!name) return 'ES';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  onOpenA4Preview,
  hasSermonToPreview = false,
}) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sys-outline-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [pendingReviews, setPendingReviews] = useState<number>(0);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sys-outline-sidebar-collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Consulta fila de revisão periodicamente
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'unit_admin' || user?.role === 'reviewer') {
      const fetchQueue = async () => {
        try {
          const res = await api.get<any>('/api/review-queue');
          const list = Array.isArray(res) ? res : res?.data || [];
          setPendingReviews(list.length);
        } catch {
          // silencioso
        }
      };
      fetchQueue();
      const interval = setInterval(fetchQueue, 25000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const groups: NavGroup[] = [
    {
      title: 'Operação',
      items: [
        {
          key: 'editor',
          label: 'Editor da Mensagem',
          icon: FileText,
          shortcut: 'E',
          roles: ['admin', 'unit_admin', 'reviewer', 'scribe'],
        },
        {
          key: 'schedules',
          label: user?.role === 'scribe' ? 'Minhas Escalas' : 'Escalas Dominicais',
          icon: Calendar,
          shortcut: 'S',
          roles: ['admin', 'unit_admin', 'reviewer', 'scribe'],
        },
        {
          key: 'review',
          label: 'Fila de Revisão',
          icon: CheckSquare,
          shortcut: 'R',
          roles: ['admin', 'unit_admin', 'reviewer'],
          badge: pendingReviews > 0 ? pendingReviews : null,
        },
      ],
    },
    {
      title: 'Acervo & Células',
      items: [
        {
          key: 'sermons',
          label: 'Biblioteca de Resumos',
          icon: BookOpen,
          shortcut: 'B',
          roles: ['admin', 'unit_admin', 'reviewer', 'scribe'],
        },
      ],
    },
    {
      title: 'Administração',
      items: [
        {
          key: 'organizations',
          label: 'Igrejas & Núcleos',
          icon: Building2,
          shortcut: 'I',
          roles: ['admin', 'unit_admin'],
        },
        {
          key: 'users',
          label: 'Voluntários & Equipe',
          icon: Users,
          shortcut: 'U',
          roles: ['admin', 'unit_admin'],
        },
      ],
    },
  ];

  // Atalho Ctrl/Cmd + B para recolher/expandir a barra lateral
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Atalhos de teclado Alt + Letra
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const key = e.key.toLowerCase();
      const map: Record<string, TabKey> = {
        e: 'editor',
        s: 'schedules',
        r: 'review',
        b: 'sermons',
        i: 'organizations',
        u: 'users',
      };

      if (map[key]) {
        // Validação de papel
        const tab = map[key];
        if (tab === 'review' && !['admin', 'unit_admin', 'reviewer'].includes(user?.role ?? '')) return;
        if (tab === 'organizations' && !['admin', 'unit_admin'].includes(user?.role ?? '')) return;
        if (tab === 'users' && !['admin', 'unit_admin'].includes(user?.role ?? '')) return;

        e.preventDefault();
        setMobileOpen(false);
        onSelectTab(tab);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, onSelectTab]);

  const tabLabels: Record<TabKey, { title: string; subtitle: string }> = {
    editor: {
      title: 'Editor da Palavra Dominical',
      subtitle: 'Redação estruturada e validação ortográfica pt-BR para folha única A4',
    },
    schedules: {
      title: 'Escalas Dominicais',
      subtitle: 'Planejamento dos voluntários escribas por turno e culto',
    },
    review: {
      title: 'Fila de Homologação & Revisão',
      subtitle: 'Workflow auditado de aprovação ortográfica e textual para as células',
    },
    sermons: {
      title: 'Biblioteca de Resumos',
      subtitle: 'Acervo histórico de ministrações aprovadas para as células',
    },
    organizations: {
      title: 'Igrejas & Núcleos Regionais',
      subtitle: 'Gestão da Catedral e núcleos com personalização de cabeçalhos e QR Pix',
    },
    users: {
      title: 'Voluntários & Equipe',
      subtitle: 'Controle de voluntários escribas, revisores e administradores',
    },
  };

  const currentInfo = tabLabels[currentTab] || {
    title: 'SYS-OUTLINE',
    subtitle: 'Escriba da Palavra',
  };

  const SidebarContent = ({
    onNavigate,
    isCollapsed = false,
  }: {
    onNavigate?: () => void;
    isCollapsed?: boolean;
  }) => (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border/80 bg-sidebar/60 backdrop-blur-xs",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleCollapsed()}
                className="size-10 text-primary hover:bg-sidebar-accent"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Church className="size-4" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Expandir menu (SYS-OUTLINE)
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs shadow-primary/25">
                <Church className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase leading-none">
                  <span className="text-primary font-black">SYS</span>
                  <span className="text-success font-black">TRAT</span>
                </p>
                <p className="truncate text-xs font-black text-foreground/90 mt-0.5 tracking-wide">
                  SYS-OUTLINE
                </p>
                <p className="truncate text-[10px] text-muted-foreground font-medium">
                  Escriba da Palavra
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              className="hidden lg:flex text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              onClick={() => toggleCollapsed()}
              title="Recolher menu lateral"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Menu principal" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {groups.map(group => {
          const items = group.items.filter(item => {
            if (!item.roles) return true;
            return user?.role && item.roles.includes(user.role);
          });

          if (items.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <p className="mb-1.5 flex items-center gap-1.5 border-b border-sidebar-border/60 px-2 pb-1.5 text-[10px] font-bold tracking-[0.14em] text-muted-foreground/80 uppercase">
                  <span className="size-1.5 rounded-full bg-primary/70" aria-hidden />
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {items.map(item => {
                  const isActive = currentTab === item.key;

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.key}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTab(item.key);
                              if (onNavigate) onNavigate();
                            }}
                            className={cn(
                              'relative flex size-10 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer mx-auto',
                              isActive
                                ? 'bg-primary/10 text-primary dark:text-blue-400 font-bold shadow-xs'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
                            )}
                          >
                            <item.icon className="size-4 shrink-0" aria-hidden />
                            {item.badge !== undefined && item.badge !== null && (
                              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-critical text-[9px] font-bold text-white font-mono animate-pulse">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <span className="font-semibold">{item.label}</span>
                          <span className="ml-1.5 text-[10px] font-mono opacity-80">(Alt+{item.shortcut})</span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.key);
                        if (onNavigate) onNavigate();
                      }}
                      title={`Alt+${item.shortcut}`}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-md border-l-[3px] px-3 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer text-left',
                        isActive
                          ? 'border-primary bg-primary/10 text-primary dark:text-blue-400 font-bold shadow-xs'
                          : 'border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-foreground'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'size-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-primary dark:text-blue-400'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                        aria-hidden
                      />
                      <span className="truncate flex-1">{item.label}</span>

                      {/* Badge de contagem para Fila de Revisão */}
                      {item.badge !== undefined && item.badge !== null && (
                        <span className="rounded-full bg-critical text-white font-mono text-[10px] px-2 py-0.2 font-bold animate-pulse">
                          {item.badge}
                        </span>
                      )}

                      <kbd
                        aria-hidden="true"
                        className={cn(
                          'ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none',
                          isActive
                            ? 'border-primary/30 bg-card text-primary'
                            : 'border-sidebar-border bg-muted/60 text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        {item.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="shrink-0 border-t border-sidebar-border/80 bg-sidebar/60 p-2.5 backdrop-blur-xs">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Avatar className="size-8 cursor-pointer ring-1 ring-border">
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    {initials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="font-bold text-xs">{user?.name}</div>
              <div className="text-[10px] font-mono uppercase text-gov-accent-gold">{user?.role}</div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border/70 bg-card/60 px-3 py-2 backdrop-blur-xs shadow-xs">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground/90">
                {user?.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground font-mono">
                {user?.email}
              </p>
              {user?.organization && (
                <p className="truncate text-[9.5px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                  <Church className="size-2.5 text-gov-accent-gold shrink-0" />
                  <span className="truncate">{user.organization.name}</span>
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              className="shrink-0 text-muted-foreground hover:bg-critical-surface hover:text-critical"
              onClick={logout}
              title="Encerrar sessão"
              aria-label="Encerrar sessão"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Sidebar Desktop Fixa (com suporte a Recolher/Expandir) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border/80 bg-sidebar/95 backdrop-blur-md shadow-[4px_0_16px_rgba(0,0,0,0.04)] transition-all duration-300 lg:block",
          collapsed ? "w-[72px]" : "w-[272px]"
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[290px] p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} isCollapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-w-0 flex-col transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[272px]"
        )}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-card/85 shadow-xs backdrop-blur-md h-16">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
            {/* Mobile Hamburger Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            {/* Desktop Collapse Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden lg:flex size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              onClick={toggleCollapsed}
              title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>

            {/* Breadcrumb / Title Oficial Solicitado: SYSTRAT / Sistema Outline / Escriba da Palavra */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black tracking-wider uppercase text-primary">
                    SYSTRAT
                  </span>
                  <span className="text-muted-foreground/50 text-xs hidden sm:inline">•</span>
                  <span className="text-xs font-black text-foreground tracking-wide">
                    SYS-OUTLINE
                  </span>
                  <span className="text-muted-foreground/50 text-xs hidden md:inline">—</span>
                  <span className="text-[11px] text-muted-foreground font-medium hidden md:inline">
                    Escriba da Palavra
                  </span>
                </div>
                <p className="truncate text-xs font-semibold text-muted-foreground leading-tight mt-0.5">
                  {currentInfo.title}
                </p>
              </div>
            </div>

            {/* Header Right Tools */}
            <div className="ml-auto flex items-center gap-2">
              {/* Alternador de tema claro / escuro */}
              <ThemeToggle className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" />

              {/* Badge da Unidade / Igreja */}
              {user?.organization && (
                <Badge
                  variant="outline"
                  className="hidden h-8 gap-1.5 border-border/80 bg-muted/50 px-2.5 text-muted-foreground sm:inline-flex"
                >
                  <Church className="size-3.5 text-gov-accent-gold" aria-hidden />
                  <span className="truncate max-w-[150px]">{user.organization.name}</span>
                </Badge>
              )}

              {/* Badge Exercício Corrente */}
              <Badge
                variant="outline"
                className="hidden h-8 gap-1.5 border-border/80 bg-muted/50 px-2.5 text-muted-foreground md:inline-flex font-mono"
              >
                <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
                <span>{new Date().getFullYear()}</span>
              </Badge>

              {/* Status Online */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="hidden items-center gap-1.5 rounded-full border border-success-border bg-success-surface px-2.5 py-1 text-[11px] font-semibold text-success-strong lg:inline-flex">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" aria-hidden />
                    Online
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Serviço e API conectados em tempo real
                </TooltipContent>
              </Tooltip>

              {/* Botão Global de Pré-visualização A4 */}
              {onOpenA4Preview && (
                <Button
                  onClick={onOpenA4Preview}
                  size="sm"
                  variant="outline"
                  className="border-primary/25 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-8 text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Eye className="size-3.5 text-gov-accent-gold" />
                  <span className="hidden sm:inline">Folha A4</span>
                  <span className="sm:hidden">A4</span>
                </Button>
              )}

              {/* Dropdown Menu do Usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 gap-2 px-1.5 cursor-pointer">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {initials(user?.name)}
                    </span>
                    <span className="hidden text-left md:block">
                      <span className="block max-w-[140px] truncate text-[13px] font-semibold text-foreground">
                        {user?.name}
                      </span>
                      <span className="block max-w-[140px] truncate text-[11px] font-mono font-medium text-muted-foreground uppercase">
                        {user?.role}
                      </span>
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-bold text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground font-normal truncate">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      onSelectTab('editor');
                    }}
                    className="cursor-pointer"
                  >
                    <FileText className="size-4 mr-2 text-primary" />
                    Editor da Palavra
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onSelectTab('schedules');
                    }}
                    className="cursor-pointer"
                  >
                    <Calendar className="size-4 mr-2 text-primary" />
                    Escalas Dominicais
                  </DropdownMenuItem>
                  {user?.role !== 'scribe' && (
                    <DropdownMenuItem
                      onClick={() => {
                        onSelectTab('review');
                      }}
                      className="cursor-pointer"
                    >
                      <CheckSquare className="size-4 mr-2 text-primary" />
                      Fila de Revisão
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-semibold"
                  >
                    <LogOut className="size-4 mr-2" />
                    Sair do Sistema
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content seguindo padrão institucional do teste_transporte */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-6 lg:px-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
