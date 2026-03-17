import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

const createProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.number().positive(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'list';

  if (mode === 'ranking') {
    const period = searchParams.get('period') || '30d';
    const channel = searchParams.get('channel') || 'all';
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const startDate = getPeriodStart(period);

    const orders = await prisma.order.findMany({
      where: {
        date: { gte: startDate },
        ...(channel !== 'all' ? { salesChannel: channel } : {}),
        ...(category !== 'all' ? { product: { category } } : {}),
      },
      include: {
        product: true,
      },
    });

    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        category: string;
        revenue: number;
        units: number;
        orders: number;
      }
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
          productName: order.product.name,
          category: order.product.category,
          revenue: order.total,
          units: order.quantity,
          orders: 1,
        });
      }
    }

    const ranked = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    return NextResponse.json({ products: ranked });
  }

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { category: { contains: search } },
        ],
      }
    : undefined;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json({ product }, { status: 201 });
}
