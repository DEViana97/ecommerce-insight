import jsPDF from 'jspdf';
import { formatCurrency, formatPercent } from './formatCurrency';

export interface PdfOrderRow {
  date: string;
  productName: string;
  salesChannel: string;
  total: number;
}

export interface PdfKpis {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  avgTicket: number;
}

interface ExportPDFPayload {
  periodLabel: string;
  channelLabel: string;
  categoryLabel: string;
  kpis: PdfKpis;
  rows: PdfOrderRow[];
}

export function exportPDF({ periodLabel, channelLabel, categoryLabel, kpis, rows }: ExportPDFPayload): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  doc.setFontSize(18);
  doc.text('E-commerce Insight Report', 40, 50);

  doc.setFontSize(11);
  doc.text(`Periodo analisado: ${periodLabel}`, 40, 78);
  doc.text(`Canal: ${channelLabel}`, 40, 95);
  doc.text(`Categoria: ${categoryLabel}`, 40, 112);

  doc.setFontSize(13);
  doc.text('KPIs', 40, 145);
  doc.setFontSize(11);
  doc.text(`Receita: ${formatCurrency(kpis.totalRevenue)}`, 40, 165);
  doc.text(`Pedidos: ${kpis.totalOrders}`, 40, 182);
  doc.text(`Conversao: ${formatPercent(kpis.conversionRate)}`, 40, 199);
  doc.text(`Ticket medio: ${formatCurrency(kpis.avgTicket)}`, 40, 216);

  doc.setFontSize(13);
  doc.text('Tabela resumida de vendas', 40, 250);

  let y = 272;
  doc.setFontSize(10);
  doc.text('Data', 40, y);
  doc.text('Produto', 110, y);
  doc.text('Canal', 340, y);
  doc.text('Valor', 460, y);

  y += 14;
  doc.setLineWidth(0.7);
  doc.line(40, y, 555, y);
  y += 14;

  for (const row of rows.slice(0, 18)) {
    if (y > 780) {
      doc.addPage();
      y = 50;
    }

    doc.text(row.date, 40, y);
    doc.text(row.productName.slice(0, 36), 110, y);
    doc.text(row.salesChannel, 340, y);
    doc.text(formatCurrency(row.total), 460, y);
    y += 16;
  }

  doc.save(`ecommerce-report-${Date.now()}.pdf`);
}
