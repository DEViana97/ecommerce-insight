import { create } from 'zustand';

export type Period = '7d' | '30d' | '12m';
export type SalesChannel = 'all' | 'organic' | 'ads' | 'social' | 'email';
export type Category = 'all' | 'Electronics' | 'Clothing' | 'Home' | 'Sports' | 'Books' | 'Beauty';

interface FiltersState {
  period: Period;
  channel: SalesChannel;
  category: Category;
  searchQuery: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  setPeriod: (period: Period) => void;
  setChannel: (channel: SalesChannel) => void;
  setCategory: (category: Category) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  period: '30d',
  channel: 'all',
  category: 'all',
  searchQuery: '',
  sidebarCollapsed: false,
  theme: 'dark',
  setPeriod: (period) => set({ period }),
  setChannel: (channel) => set({ channel }),
  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));
