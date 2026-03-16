import { NextRequest, NextResponse } from 'next/server';
import { allOrders, allProducts, filterOrders } from '../../../utils/dataHelpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const channel = searchParams.get('channel') || 'all';
  const category = searchParams.get('category') || 'all';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  const orders = filterOrders(allOrders, { period, channel, category });

  // Aggregate by product
  const productMap = new Map<
    string,
    { productId: string; productName: string; category: string; revenue: number; units: number; orders: number }
  >();

  for (const order of orders) {
    const existing = productMap.get(order.productId);
    if (existing) {
      existing.revenue += order.total;
      existing.units += order.quantity;
      existing.orders += 1;
    } else {
      productMap.set(order.productId, {
        productId: order.productId,
        productName: order.productName,
        category: order.category,
        revenue: order.total,
        units: order.quantity,
        orders: 1,
      });
    }
  }

  const ranked = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p, idx) => ({
      ...p,
      rank: idx + 1,
      product: allProducts.find((prod) => prod.id === p.productId),
    }));

  return NextResponse.json({ products: ranked });
}
