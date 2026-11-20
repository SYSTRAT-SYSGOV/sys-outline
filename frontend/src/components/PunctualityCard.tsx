import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ScribeRow {
  scribe_id: number;
  scribe_name: string | null;
  total: number;
  on_time: number;
  late: number;
  rate: number;
}

interface Report {
  days: number;
  scribes: ScribeRow[];
}

/**
 * Pontualidade dos escribas nas entregas já vencidas (para administradores).
 */
export const PunctualityCard: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api
      .get<Report>('/api/dashboard/punctuality')
      .then(setReport)
      .catch(() => setReport(null));
  }, []);

  if (!report) return null;

  return (
    <section aria-labelledby="punctuality-title" className="rounded-xl border border-border bg-card p-4">
      <h3 id="punctuality-title" className="text-sm font-semibold text-foreground">
        Pontualidade dos escribas
        <span className="ml-2 text-xs font-normal text-muted-foreground">últimos {report.days} dias</span>
      </h3>
      {report.scribes.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nenhuma entrega vencida no período.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-1 font-semibold">Escriba</th>
              <th className="pb-1 text-right font-semibold">Escalas</th>
              <th className="pb-1 text-right font-semibold">No prazo</th>
              <th className="pb-1 text-right font-semibold">Atrasadas</th>
              <th className="pb-1 text-right font-semibold">Pontualidade</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {report.scribes.map(row => (
              <tr key={row.scribe_id} className="border-t border-border">
                <td className="py-1.5">{row.scribe_name}</td>
                <td className="py-1.5 text-right">{row.total}</td>
                <td className="py-1.5 text-right">{row.on_time}</td>
                <td className="py-1.5 text-right">{row.late}</td>
                <td
                  className={`py-1.5 text-right font-semibold ${
                    row.rate >= 80 ? 'text-success-strong' : row.rate >= 50 ? 'text-warning-strong' : 'text-critical-strong'
                  }`}
                >
                  {row.rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
