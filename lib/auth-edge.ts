import { jwtVerify } from 'jose';
import type { AuthTokenPayload } from '../types/auth';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function verifyTokenEdge(token: string): Promise<AuthTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret);
    return verified.payload as AuthTokenPayload;
  } catch (error) {
    console.error(`[auth-edge] Token verification failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}
