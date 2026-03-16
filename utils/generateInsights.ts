import { calculateGrowthPercent } from './calculateGrowth';

export interface InsightOrder {
  productId: string;
  productName: string;
  total: number;
  salesChannel: string;
  date: string;
}

export interface InsightFilters {
  period: '7d' | '30d' | '12m';
  channel: string;
  category: string;
}

export interface InsightOrdersInput {
  current: InsightOrder[];
  previous: InsightOrder[];
}

function labelByPeriod(period: InsightFilters['period']): string {
  switch (period) {
    case '7d':
      return 'nos ultimos 7 dias';
    case '12m':
      return 'nos ultimos 12 meses';
    case '30d':
    default:
      return 'nos ultimos 30 dias';
  }
}

function pct(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

export function generateInsights(orders: InsightOrdersInput, filters: InsightFilters): string[] {
  const insights: string[] = [];
  const sortedCurrentOrders = [...orders.current].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const currentRevenue = sortedCurrentOrders.reduce((sum, order) => sum + order.total, 0);
  const previousRevenue = orders.previous.reduce((sum, order) => sum + order.total, 0);

  const revenueGrowth = calculateGrowthPercent(currentRevenue, previousRevenue);
  if (Math.abs(revenueGrowth) >= 1) {
    insights.push(
      revenueGrowth >= 0
        ? `As vendas aumentaram ${pct(revenueGrowth)} ${labelByPeriod(filters.period)}.`
        : `As vendas cairam ${pct(revenueGrowth)} ${labelByPeriod(filters.period)}.`
    );
  }

  const channelRevenue = new Map<string, number>();
  for (const order of sortedCurrentOrders) {
    channelRevenue.set(order.salesChannel, (channelRevenue.get(order.salesChannel) ?? 0) + order.total);
  }

  const dominantChannel = Array.from(channelRevenue.entries()).sort((a, b) => b[1] - a[1])[0];
  if (dominantChannel && currentRevenue > 0) {
    const dominantShare = (dominantChannel[1] / currentRevenue) * 100;
    insights.push(`O canal "${dominantChannel[0]}" gerou ${dominantShare.toFixed(1)}% da receita total.`);
  }

  const currentProductRevenue = new Map<string, { name: string; revenue: number }>();
  const previousProductRevenue = new Map<string, number>();

  for (const order of sortedCurrentOrders) {
    const current = currentProductRevenue.get(order.productId);
    if (current) {
      current.revenue += order.total;
    } else {
      currentProductRevenue.set(order.productId, { name: order.productName, revenue: order.total });
    }
  }

  for (const order of orders.previous) {
    previousProductRevenue.set(order.productId, (previousProductRevenue.get(order.productId) ?? 0) + order.total);
  }

  const productGrowth = Array.from(currentProductRevenue.entries())
    .map(([productId, product]) => {
      const previous = previousProductRevenue.get(productId) ?? 0;
      return {
        name: product.name,
        growth: calculateGrowthPercent(product.revenue, previous),
      };
    })
    .sort((a, b) => b.growth - a.growth)[0];

  if (productGrowth && productGrowth.growth > 0) {
    insights.push(`O produto "${productGrowth.name}" teve crescimento de ${pct(productGrowth.growth)}.`);
  }

  const conversionCurrent = currentRevenue > 0 ? (sortedCurrentOrders.length / currentRevenue) * 10000 : 0;
  const conversionPrevious = previousRevenue > 0 ? (orders.previous.length / previousRevenue) * 10000 : 0;
  const conversionDelta = conversionCurrent - conversionPrevious;

  if (conversionDelta < 0) {
    insights.push(`A taxa de conversao caiu ${pct(conversionDelta)} no periodo recente.`);
  } else if (conversionDelta > 0.1) {
    insights.push(`A taxa de conversao melhorou ${pct(conversionDelta)} no periodo recente.`);
  }

  if (sortedCurrentOrders.length > 1) {
    const recentSlice = sortedCurrentOrders.slice(-Math.min(5, sortedCurrentOrders.length));
    const olderSlice = sortedCurrentOrders.slice(0, Math.min(5, sortedCurrentOrders.length));
    const recentRevenue = recentSlice.reduce((sum, order) => sum + order.total, 0);
    const olderRevenue = olderSlice.reduce((sum, order) => sum + order.total, 0);
    const recentTrend = calculateGrowthPercent(recentRevenue, olderRevenue);

    if (Math.abs(recentTrend) >= 2) {
      insights.push(
        recentTrend >= 0
          ? `A tendencia recente mostra aceleracao de ${pct(recentTrend)} na receita.`
          : `A tendencia recente aponta desaceleracao de ${pct(recentTrend)} na receita.`
      );
    }
  }

  return insights.slice(0, 5);
}
