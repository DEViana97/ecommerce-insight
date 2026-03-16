import ordersRaw from '../data/orders.json';
import productsRaw from '../data/products.json';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
  customer: string;
  salesChannel: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  stock: number;
  rating: number;
  reviews: number;
}

export const allOrders: Order[] = ordersRaw as Order[];
export const allProducts: Product[] = productsRaw as Product[];

export function getPeriodDates(period: string): { startDate: Date; compareStartDate: Date; compareEndDate: Date } {
  const endDate = new Date('2025-03-16');
  let daysBack: number;

  switch (period) {
    case '7d':
      daysBack = 7;
      break;
    case '12m':
      daysBack = 365;
      break;
    case '30d':
    default:
      daysBack = 30;
      break;
  }

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);

  const compareEndDate = new Date(startDate);
  compareEndDate.setDate(compareEndDate.getDate() - 1);
  const compareStartDate = new Date(compareEndDate);
  compareStartDate.setDate(compareStartDate.getDate() - daysBack);

  return { startDate, compareStartDate, compareEndDate };
}

export function filterOrders(
  orders: Order[],
  params: {
    period?: string;
    channel?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Order[] {
  let filtered = [...orders];
  const endRef = new Date('2025-03-16');

  if (params.startDate && params.endDate) {
    filtered = filtered.filter((o) => {
      const d = new Date(o.date);
      return d >= params.startDate! && d <= params.endDate!;
    });
  } else if (params.period) {
    const { startDate } = getPeriodDates(params.period);
    filtered = filtered.filter((o) => new Date(o.date) >= startDate && new Date(o.date) <= endRef);
  }

  if (params.channel && params.channel !== 'all') {
    filtered = filtered.filter((o) => o.salesChannel === params.channel);
  }

  if (params.category && params.category !== 'all') {
    filtered = filtered.filter((o) => o.category === params.category);
  }

  return filtered;
}

export function computeKPIs(orders: Order[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Simulate conversion: assume 8000 visits per 1000 orders for base conversion
  const estimatedVisits = Math.round(totalOrders * 8.5);
  const conversionRate = estimatedVisits > 0 ? (totalOrders / estimatedVisits) * 100 : 0;

  return { totalRevenue, totalOrders, avgTicket, conversionRate, estimatedVisits };
}
