import { NextRequest, NextResponse } from 'next/server';
import { allOrders, filterOrders, getPeriodDates, computeKPIs } from '../../../../utils/dataHelpers';
import { calculateGrowthPercent } from '../../../../utils/calculateGrowth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';

  const endDate = new Date('2025-03-16');
  const { startDate, compareStartDate, compareEndDate } = getPeriodDates(period);

  const currentOrders = filterOrders(allOrders, { period, channel, category });
  const previousOrders = filterOrders(allOrders, {
    startDate: compareStartDate,
    endDate: compareEndDate,
    channel,
    category,
  });

  const currentKPIs = computeKPIs(currentOrders);
  const previousKPIs = computeKPIs(previousOrders);

  // Build time series data
  let timeSeries: { date: string; revenue: number; orders: number }[] = [];

  if (period === '12m') {
    // Monthly aggregation
    const monthMap = new Map<string, { revenue: number; orders: number }>();
    for (const order of currentOrders) {
      const d = new Date(order.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(key);
      if (existing) {
        existing.revenue += order.total;
        existing.orders += 1;
      } else {
        monthMap.set(key, { revenue: order.total, orders: 1 });
      }
    }
    timeSeries = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ date, ...data }));
  } else {
    // Daily aggregation
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    const current = new Date(startDate);
    while (current <= endDate) {
      const key = current.toISOString().split('T')[0];
      dayMap.set(key, { revenue: 0, orders: 0 });
      current.setDate(current.getDate() + 1);
    }
    for (const order of currentOrders) {
      const key = order.date;
      const existing = dayMap.get(key);
      if (existing) {
        existing.revenue += order.total;
        existing.orders += 1;
      }
    }
    timeSeries = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ date, ...data }));
  }

  // Channel breakdown
  const channelMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of currentOrders) {
    const existing = channelMap.get(order.salesChannel);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      channelMap.set(order.salesChannel, { revenue: order.total, orders: 1 });
    }
  }
  const channelBreakdown = Array.from(channelMap.entries()).map(([channel, data]) => ({
    channel,
    ...data,
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
