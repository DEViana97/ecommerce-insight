import { NextRequest, NextResponse } from 'next/server';
import { allOrders, filterOrders, computeKPIs } from '../../../../utils/dataHelpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';

  const orders = filterOrders(allOrders, { period, channel, category });
  const { totalOrders, estimatedVisits } = computeKPIs(orders);

  // Build funnel steps
  const cartAbandonment = 0.65; // 65% add to cart, 35% buy
  const cartAdds = Math.round(totalOrders / (1 - cartAbandonment));
  const checkoutStarts = Math.round(cartAdds * 0.72);

  const funnel = [
    { stage: 'Visitas', value: estimatedVisits, rate: 100 },
    { stage: 'Página de Produto', value: Math.round(estimatedVisits * 0.52), rate: 52 },
    { stage: 'Adicionou ao Carrinho', value: cartAdds, rate: parseFloat(((cartAdds / estimatedVisits) * 100).toFixed(1)) },
    { stage: 'Iniciou Checkout', value: checkoutStarts, rate: parseFloat(((checkoutStarts / estimatedVisits) * 100).toFixed(1)) },
    { stage: 'Compras', value: totalOrders, rate: parseFloat(((totalOrders / estimatedVisits) * 100).toFixed(1)) },
  ];

  // Category breakdown
  const categoryMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const existing = categoryMap.get(order.category);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      categoryMap.set(order.category, { revenue: order.total, orders: 1 });
    }
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({ funnel, categoryBreakdown });
}
