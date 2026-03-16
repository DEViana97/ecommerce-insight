import Papa from 'papaparse';
import { formatCurrency, formatPercent } from './formatCurrency';

export interface ExportRow {
  id: string;
  date: string;
  productName: string;
  customer: string;
  salesChannel: string;
  category: string;
  quantity: number;
  total: number;
}

export interface ExportKpis {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  avgTicket: number;
}

interface ExportCSVPayload {
  periodLabel: string;
  channelLabel: string;
  categoryLabel: string;
  kpis: ExportKpis;
  rows: ExportRow[];
}

export function exportCSV({ periodLabel, channelLabel, categoryLabel, kpis, rows }: ExportCSVPayload): void {
  const metadata = [
    { secao: 'Periodo', valor: periodLabel },
    { secao: 'Canal', valor: channelLabel },
    { secao: 'Categoria', valor: categoryLabel },
    { secao: 'Receita Total', valor: formatCurrency(kpis.totalRevenue) },
    { secao: 'Pedidos', valor: String(kpis.totalOrders) },
    { secao: 'Conversao', valor: formatPercent(kpis.conversionRate) },
    { secao: 'Ticket Medio', valor: formatCurrency(kpis.avgTicket) },
  ];

  const normalizedRows = rows.map((row) => ({
    pedido_id: row.id,
    data: row.date,
    produto: row.productName,
    cliente: row.customer,
    canal: row.salesChannel,
    categoria: row.category,
    quantidade: row.quantity,
    total: row.total.toFixed(2),
  }));

  const metadataCsv = Papa.unparse(metadata);
  const rowsCsv = Papa.unparse(normalizedRows);
  const csv = `${metadataCsv}\n\n${rowsCsv}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `ecommerce-report-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
