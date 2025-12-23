import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        console.log('Login called with user:', user); // DEBUG
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
        localStorage.setItem('access_token', token);
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem('access_token');
      },

      isAdmin: () => {
        const state = get();
        console.log('isAdmin check - user:', state.user); // DEBUG
        const isAdminUser = state.user?.role === 'admin' || state.user?.email === 'aditya@ealphabits.com';
        console.log('isAdmin result:', isAdminUser); // DEBUG
        return isAdminUser;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);