import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getPeriodStart(period: string): Date {
  const now = new Date();
  const start = new Date(now);

  if (period === '7d') {
    start.setDate(now.getDate() - 7);
  } else if (period === '12m') {
    start.setFullYear(now.getFullYear() - 1);
  } else {
    start.setDate(now.getDate() - 30);
  }

  return start;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';

  const startDate = getPeriodStart(period);

  const orders = await prisma.order.findMany({
    where: {
      date: { gte: startDate, lte: new Date() },
      ...(channel !== 'all' ? { salesChannel: channel } : {}),
      ...(category !== 'all' ? { product: { category } } : {}),
    },
    include: {
      product: {
        select: {
          category: true,
        },
      },
    },
  });

  const totalOrders = orders.length;
  const estimatedVisits = Math.max(Math.round(totalOrders * 8.5), 1);

  const cartAbandonment = 0.65;
  const cartAdds = Math.round(totalOrders / (1 - cartAbandonment));
  const checkoutStarts = Math.round(cartAdds * 0.72);

  const funnel = [
    { stage: 'Visitas', value: estimatedVisits, rate: 100 },
    { stage: 'Pagina de Produto', value: Math.round(estimatedVisits * 0.52), rate: 52 },
    {
      stage: 'Adicionou ao Carrinho',
      value: cartAdds,
      rate: parseFloat(((cartAdds / estimatedVisits) * 100).toFixed(1)),
    },
    {
      stage: 'Iniciou Checkout',
      value: checkoutStarts,
      rate: parseFloat(((checkoutStarts / estimatedVisits) * 100).toFixed(1)),
    },
    {
      stage: 'Compras',
      value: totalOrders,
      rate: parseFloat(((totalOrders / estimatedVisits) * 100).toFixed(1)),
    },
  ];

  const categoryMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const key = order.product.category;
    const current = categoryMap.get(key) ?? { revenue: 0, orders: 0 };
    current.revenue += order.total;
    current.orders += 1;
    categoryMap.set(key, current);
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, data]) => ({ category: name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({ funnel, categoryBreakdown });
}
