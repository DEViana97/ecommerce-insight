import { create } from 'zustand';

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

interface AuthState {
  user: LoggedUser | null;
  loading: boolean;
  setUser: (user: LoggedUser | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  fetchMe: async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        set({ user: null, loading: false });
        return;
      }

      const data = (await response.json()) as { user: LoggedUser };
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },
}));
