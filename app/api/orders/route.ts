import { NextRequest, NextResponse } from 'next/server';
import { allOrders, filterOrders } from '../../../utils/dataHelpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'date';
  const sortDir = searchParams.get('sortDir') || 'desc';

  let orders = filterOrders(allOrders, { period, channel, category });

  if (search) {
    const s = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.productName.toLowerCase().includes(s) ||
        o.customer.toLowerCase().includes(s) ||
        o.id.toLowerCase().includes(s)
    );
  }

  // Sort
  orders.sort((a, b) => {
    let aVal: string | number = a[sortBy as keyof typeof a] as string | number;
    let bVal: string | number = b[sortBy as keyof typeof b] as string | number;
    if (sortBy === 'date') {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const total = orders.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = orders.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ orders: paginated, total, totalPages, page, limit });
}
