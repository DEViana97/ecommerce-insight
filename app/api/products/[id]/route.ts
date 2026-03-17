import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      orders: {
        select: {
          id: true,
          quantity: true,
          total: true,
          date: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}
