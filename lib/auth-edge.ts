import { jwtVerify } from 'jose';
import type { AuthTokenPayload } from '../types/auth';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

function isAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  if (!payload || typeof payload !== 'object') return false;

  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.name === 'string' &&
    (candidate.role === 'ADMIN' || candidate.role === 'USER')
  );
}

export async function verifyTokenEdge(token: string): Promise<AuthTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret);

    if (!isAuthTokenPayload(verified.payload)) {
      return null;
    }

    return verified.payload;
  } catch (error) {
    console.error(`[auth-edge] Token verification failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}
