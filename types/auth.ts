export type AuthRole = 'ADMIN' | 'USER';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: AuthRole;
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}
