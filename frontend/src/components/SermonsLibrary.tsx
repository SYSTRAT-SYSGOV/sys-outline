import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SermonData } from '../lib/sermonUtils';
import { DataTable, ColumnDef, DataTableFilter } from './DataTable';
import { A4PreviewModal } from './A4PreviewModal';
import { copySermonToClipboard } from '../lib/whatsappFormatter';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  BookOpen,
  Eye,
  Share2,
  Calendar,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SermonsLibraryProps {
  onSelectForEdit?: (sermon: SermonData) => void;
}

export const SermonsLibrary: React.FC<SermonsLibraryProps> = ({ onSelectForEdit }) => {
  const { user } = useAuth();
  const [sermons, setSermons] = useState<SermonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewSermon, setPreviewSermon] = useState<SermonData | null>(null);

  // Filtros
  const [orgFilter, setOrgFilter] = useState('all');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSermons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/sermons?status=approved');
      const list = Array.isArray(res) ? res : res?.data || [];
      setSermons(list);
    } catch {
      showToast('Erro ao carregar resumos da biblioteca.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSermons();
  }, [loadSermons]);

  const handleCopy = async (sermon: SermonData) => {
    const ok = await copySermonToClipboard(sermon);
    if (ok) {
      showToast('Roteiro da ministração copiado para o WhatsApp!');
    }
  };

  const filteredSermons = sermons.filter(s => {
    if (orgFilter !== 'all' && String(s.organization_id) !== orgFilter) return false;
    return true;
  });

  const orgOptions = [
    { label: 'Todas as Unidades', value: 'all' },
    ...Array.from(
      new Map(
        sermons
          .filter(s => s.organization)
          .map(s => [String(s.organization!.id), s.organization!.name])
      ).entries()
    ).map(([val, label]) => ({ label, value: val })),
  ];

  const columns: ColumnDef<SermonData>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      className: 'w-16 font-mono font-bold text-foreground',
      render: s => `#${s.id}`,
    },
    {
      key: 'title_theme',
      header: 'Tema da Palavra',
      sortable: true,
      className: 'min-w-[240px]',
      render: s => (
        <div>
          <div className="font-bold text-foreground line-clamp-1">{s.title_theme || s.theme}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{s.scripture_reference || s.scripture_text}</div>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Unidade / Núcleo',
      sortable: true,
      render: s => (
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-gov-accent-gold shrink-0" />
          <span className="truncate">{s.organization?.name || 'Catedral'}</span>
        </span>
      ),
    },
    {
      key: 'preacher',
      header: 'Ministrante',
      sortable: true,
      render: s => (
        <span className="text-foreground">
          {s.preacher_title || s.minister_title} {s.preacher_name || s.minister_name}
        </span>
      ),
    },
    {
      key: 'service_date',
      header: 'Data do Culto',
      sortable: true,
      className: 'font-mono text-xs whitespace-nowrap',
      render: s => s.service_date,
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right min-w-[200px]',
      render: s => {
        const publicUrl = `${window.location.origin}${window.location.pathname}?public=${s.id}`;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(publicUrl);
                showToast(`Link da mensagem #${s.id} copiado para a área de transferência!`);
              }}
              className="h-8 px-2 text-xs border-border hover:bg-muted"
              title="Copiar Link Público para líderes de célula"
            >
              <ExternalLink className="size-3.5 text-primary" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(s)}
              className="h-8 px-2 text-xs border-success-border bg-success-surface text-success-strong hover:bg-success hover:text-white"
              title="Copiar formatado para WhatsApp das Células"
            >
              <Share2 className="size-3.5" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewSermon(s)}
              className="h-8 px-2.5 text-xs border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold gap-1"
              title="Visualizar e Imprimir Folha A4"
            >
              <Eye className="size-3.5 text-gov-accent-gold" />
              <span>Folha A4</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl bg-primary text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gov-accent-gold" />
          <span>Biblioteca de Ministrações Aprovadas</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Acervo histórico de resumos dominicais homologados e formatados para leitura nas células.
        </p>
      </div>

      {/* DataTable */}
      <DataTable<SermonData>
        data={filteredSermons}
        columns={columns}
        searchPlaceholder="Buscar por tema, texto bíblico, ministrante ou unidade..."
        filters={[
          {
            key: 'organization',
            label: 'Unidade',
            value: orgFilter,
            onChange: setOrgFilter,
            options: orgOptions,
          },
        ]}
        onClearFilters={() => setOrgFilter('all')}
        isLoading={loading}
        emptyMessage="Nenhuma ministração aprovada encontrada."
        rowKey={s => s.id || 0}
      />

      {/* Modal A4 Preview */}
      <A4PreviewModal
        isOpen={Boolean(previewSermon)}
        onClose={() => setPreviewSermon(null)}
        sermon={previewSermon}
      />
    </div>
  );
};

