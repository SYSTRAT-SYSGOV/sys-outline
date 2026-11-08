import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FilterX,
  Layers,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchFilter?: (row: T, term: string) => boolean;
  filters?: DataTableFilter[];
  onClearFilters?: () => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  rowKey?: (row: T, index: number) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Pesquisar...',
  searchFilter,
  filters,
  onClearFilters,
  actions,
  emptyMessage = 'Nenhum registro encontrado.',
  isLoading = false,
  rowKey,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtragem de busca
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    if (searchFilter) {
      return data.filter(row => searchFilter(row, term));
    }

    // Busca genérica em todas as propriedades primitivas
    return data.filter(row => {
      return Object.values(row as Record<string, any>).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFilter]);

  // Ordenação
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginação
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm || (filters && filters.some(f => f.value !== '' && f.value !== 'all'))
  );

  const handleClear = () => {
    setSearchTerm('');
    if (onClearFilters) onClearFilters();
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-card rounded-xl shadow-xs border border-border overflow-hidden">
      {/* Barra de Ferramentas / Filtros */}
      <div className="p-4 border-b border-border bg-muted/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Campo de Pesquisa */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <Input
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9 bg-card text-xs sm:text-sm border-input focus:border-ring"
          />
        </div>

        {/* Filtros em linha e Ações Customizadas */}
        <div className="flex flex-wrap items-center gap-2">
          {filters && filters.map(filter => (
            <div key={filter.key} className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">{filter.label}:</span>
              <select
                value={filter.value}
                onChange={e => {
                  filter.onChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-card border border-input rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-ring text-foreground font-medium"
              >
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {hasActiveFilters && (
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="text-xs text-muted-foreground hover:text-critical border-input flex items-center gap-1"
              title="Limpar todos os filtros"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </Button>
          )}

          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/80 border-b border-border text-[11px] font-semibold text-foreground uppercase tracking-wider font-mono">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`p-3.5 ${col.sortable ? 'cursor-pointer select-none hover:bg-muted transition-colors' : ''} ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-muted-foreground/70">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 hover:text-muted-foreground" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs sm:text-sm text-foreground">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted-foreground font-mono text-xs">
                  Carregando registros...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClear}
                        className="text-xs text-gov-accent-gold hover:underline font-medium"
                      >
                        Limpar filtros ativos para ver mais resultados
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const key = rowKey ? rowKey(row, idx) : (row as any).id ?? idx;
                return (
                  <tr
                    key={key}
                    className="hover:bg-muted/60 transition-colors group"
                  >
                    {columns.map(col => (
                      <td key={col.key} className={`p-3.5 align-middle ${col.className || ''}`}>
                        {col.render ? col.render(row, idx) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Rodapé / Paginação */}
      <div className="p-3.5 bg-muted/40 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        {/* Contadores em Inter com números tabulares */}
        <div className="font-mono text-xs text-muted-foreground">
          Exibindo{' '}
          <span className="font-semibold text-foreground">
            {totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}-
            {Math.min(validCurrentPage * pageSize, totalItems)}
          </span>{' '}
          de <span className="font-semibold text-foreground">{totalItems}</span> registros
        </div>

        {/* Controles de Página */}
        <div className="flex items-center gap-3">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-card border border-input rounded-md px-2 py-1 text-xs focus:outline-hidden font-mono"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Navegação Prev / Next */}
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              variant="outline"
              size="sm"
              className="p-1.5 h-8 w-8 border-input disabled:opacity-40"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="font-mono text-xs px-2 text-foreground select-none">
              {validCurrentPage} / {totalPages}
            </span>

            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              variant="outline"
              size="sm"
              className="p-1.5 h-8 w-8 border-input disabled:opacity-40"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

