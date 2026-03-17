import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUserFromRequest, comparePassword, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const authUser = await getCurrentUserFromRequest(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, currentPassword, newPassword } = parsed.data;

  const updates: { name?: string; password?: string } = {};
  if (name) updates.name = name;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user || !(await comparePassword(currentPassword, user.password))) {
      return NextResponse.json({ error: 'Current password is invalid' }, { status: 401 });
    }

    updates.password = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: authUser.id },
    data: updates,
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    },
  });
}
