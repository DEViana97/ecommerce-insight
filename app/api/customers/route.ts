import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';

  const where = search
    ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    }
    : undefined;

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        orders: {
          select: { id: true, total: true, date: true },
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    }),
  ]);

  return NextResponse.json({
    customers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
