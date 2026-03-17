import { NextResponse } from 'next/server';
import { authCookieName } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName(), '', { maxAge: 0, path: '/' });
  return response;
}
