import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateGrowthPercent } from '../../../../utils/calculateGrowth';

function getPeriodDates(period: string): { startDate: Date; compareStartDate: Date; compareEndDate: Date } {
  const endDate = new Date();
  const startDate = new Date(endDate);

  const daysBack = period === '7d' ? 7 : period === '12m' ? 365 : 30;
  startDate.setDate(startDate.getDate() - daysBack);

  const compareEndDate = new Date(startDate);
  compareEndDate.setDate(compareEndDate.getDate() - 1);

  const compareStartDate = new Date(compareEndDate);
  compareStartDate.setDate(compareStartDate.getDate() - daysBack);

  return { startDate, compareStartDate, compareEndDate };
}

function computeKPIs(orders: { total: number }[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const estimatedVisits = Math.max(Math.round(totalOrders * 8.5), 1);
  const conversionRate = (totalOrders / estimatedVisits) * 100;

  return { totalRevenue, totalOrders, avgTicket, conversionRate };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';

  const { startDate, compareStartDate, compareEndDate } = getPeriodDates(period);

  const [currentOrders, previousOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        date: { gte: startDate, lte: new Date() },
        ...(channel !== 'all' ? { salesChannel: channel } : {}),
        ...(category !== 'all' ? { product: { category } } : {}),
      },
      include: { product: true },
    }),
    prisma.order.findMany({
      where: {
        date: { gte: compareStartDate, lte: compareEndDate },
        ...(channel !== 'all' ? { salesChannel: channel } : {}),
        ...(category !== 'all' ? { product: { category } } : {}),
      },
    }),
  ]);

  const currentKPIs = computeKPIs(currentOrders);
  const previousKPIs = computeKPIs(previousOrders);

  let timeSeries: { date: string; revenue: number; orders: number }[] = [];

  if (period === '12m') {
    const monthMap = new Map<string, { revenue: number; orders: number }>();
    for (const order of currentOrders) {
      const key = `${order.date.getFullYear()}-${String(order.date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthMap.get(key) ?? { revenue: 0, orders: 0 };
      current.revenue += order.total;
      current.orders += 1;
      monthMap.set(key, current);
    }

    timeSeries = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, ...value }));
  } else {
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    const cursor = new Date(startDate);

    while (cursor <= new Date()) {
      const key = cursor.toISOString().split('T')[0];
      dayMap.set(key, { revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const order of currentOrders) {
      const key = order.date.toISOString().split('T')[0];
      const current = dayMap.get(key);
      if (current) {
        current.revenue += order.total;
        current.orders += 1;
      }
    }

    timeSeries = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, ...value }));
  }

  const channelMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of currentOrders) {
    const current = channelMap.get(order.salesChannel) ?? { revenue: 0, orders: 0 };
    current.revenue += order.total;
    current.orders += 1;
    channelMap.set(order.salesChannel, current);
  }

  const channelBreakdown = Array.from(channelMap.entries()).map(([channelName, value]) => ({
    channel: channelName,
    ...value,
  }));

  return NextResponse.json({
    kpis: {
      totalRevenue: currentKPIs.totalRevenue,
      totalOrders: currentKPIs.totalOrders,
      avgTicket: currentKPIs.avgTicket,
      conversionRate: currentKPIs.conversionRate,
      revenueChange: calculateGrowthPercent(currentKPIs.totalRevenue, previousKPIs.totalRevenue),
      ordersChange: calculateGrowthPercent(currentKPIs.totalOrders, previousKPIs.totalOrders),
      avgTicketChange: calculateGrowthPercent(currentKPIs.avgTicket, previousKPIs.avgTicket),
      conversionChange: calculateGrowthPercent(currentKPIs.conversionRate, previousKPIs.conversionRate),
    },
    timeSeries,
    channelBreakdown,
  });
}
