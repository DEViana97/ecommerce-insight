import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const compare = searchParams.get('compare') || 'current';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = searchParams.get('limit') || '10';
  const limit = limitParam === 'all' ? Number.MAX_SAFE_INTEGER : parseInt(limitParam, 10);
  const sortBy = searchParams.get('sortBy') || 'date';
  const sortDir = searchParams.get('sortDir') || 'desc';

  const { startDate, compareStartDate, compareEndDate } = getPeriodDates(period);

  const dateWhere =
    compare === 'previous'
      ? { gte: compareStartDate, lte: compareEndDate }
      : { gte: startDate, lte: new Date() };

  const rawOrders = await prisma.order.findMany({
    where: {
      date: dateWhere,
      ...(channel !== 'all' ? { salesChannel: channel } : {}),
      ...(category !== 'all' ? { product: { category } } : {}),
      ...(search
        ? {
          OR: [
            { id: { contains: search } },
            { product: { name: { contains: search } } },
            { customer: { name: { contains: search } } },
          ],
        }
        : {}),
    },
    include: {
      product: true,
      customer: true,
    },
  });

  const orders = rawOrders.map((order) => ({
    id: order.id,
    productId: order.productId,
    productName: order.product.name,
    customer: order.customer.name,
    total: order.total,
    salesChannel: order.salesChannel,
    date: order.date.toISOString().split('T')[0],
    category: order.product.category,
    quantity: order.quantity,
  }));

  orders.sort((a, b) => {
    const getVal = (item: (typeof orders)[number]): string | number => {
      if (sortBy === 'date') return new Date(item.date).getTime();
      if (sortBy === 'total') return item.total;
      if (sortBy === 'productName') return item.productName.toLowerCase();
      if (sortBy === 'customer') return item.customer.toLowerCase();
      return item.date;
    };

    const aVal = getVal(a);
    const bVal = getVal(b);

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const total = orders.length;
  const totalPages = limit === Number.MAX_SAFE_INTEGER ? 1 : Math.ceil(total / limit);
  const paginated = limit === Number.MAX_SAFE_INTEGER ? orders : orders.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    orders: paginated,
    total,
    totalPages,
    page,
    limit: limitParam,
  });
}
