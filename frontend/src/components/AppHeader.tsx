import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Eye, Shield, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface AppHeaderProps {
  currentTab: string;
  onOpenMobile: () => void;
  onOpenA4Preview?: () => void;
  hasSermonToPreview?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onOpenMobile,
  onOpenA4Preview,
  hasSermonToPreview,
}) => {
  const { user } = useAuth();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    editor: {
      title: 'Editor de Ministração',
      subtitle: 'Redação estruturada e validação léxica em Português (Brasil)',
    },
    schedules: {
      title: 'Escalas Dominicais',
      subtitle: 'Planejamento de plantões dominicais e acompanhamento de prazos',
    },
    review: {
      title: 'Fila de Revisão',
      subtitle: 'Homologação e ajustes de resumos antes da leitura nas células',
    },
    sermons: {
      title: 'Biblioteca de Resumos',
      subtitle: 'Histórico completo de ministrações aprovadas para as células',
    },
    organizations: {
      title: 'Igrejas & Núcleos',
      subtitle: 'Gestão da Catedral e núcleos regionais cadastrados',
    },
    users: {
      title: 'Voluntários & Equipe',
      subtitle: 'Gestão de escribas, revisores e administradores',
    },
  };

  const current = tabTitles[currentTab] || {
    title: 'Sistema Escriba',
    subtitle: 'Gestão da Palavra Dominical',
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Lado Esquerdo: Mobile Menu Toggle + Breadcrumbs/Títulos */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base lg:text-lg font-bold text-foreground tracking-tight leading-tight">
            {current.title}
          </h1>
          <span className="hidden sm:inline-block text-xs text-muted-foreground">
            {current.subtitle}
          </span>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas + Unidade + Perfil */}
      <div className="flex items-center gap-3">
        {/* Botão de Pré-visualização A4 (quando aplicável) */}
        {hasSermonToPreview && onOpenA4Preview && (
          <Button
            onClick={onOpenA4Preview}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-xs text-xs font-medium cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gov-accent-gold" />
            <span className="hidden md:inline">Pré-visualizar Folha A4</span>
            <span className="md:hidden">A4</span>
          </Button>
        )}

        {/* Badge da Unidade Ativa */}
        {user?.organization && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-muted border border-border rounded-full text-xs font-mono font-medium text-foreground">
            <Shield className="w-3.5 h-3.5 text-gov-accent-gold" />
            <span className="truncate max-w-[160px]">{user.organization.name}</span>
          </div>
        )}

        {/* Badge de Papel */}
        {user && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-gov-accent-gold/15 text-warning-strong border border-gov-accent-gold/30">
            {user.role}
          </span>
        )}
      </div>
    </header>
  );
};

