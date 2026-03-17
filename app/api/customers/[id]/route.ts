import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { date: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  return NextResponse.json({ customer });
}
