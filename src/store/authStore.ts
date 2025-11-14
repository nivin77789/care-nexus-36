import { create } from 'zustand';

export type UserRole = 'caretaker' | 'admin' | 'manager' | 'superadmin' | 'client';

interface AuthState {
  user: any | null;
  role: UserRole | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  logout: () => {
    set({ user: null, role: null });
    localStorage.removeItem('auth-user');
  },
}));
