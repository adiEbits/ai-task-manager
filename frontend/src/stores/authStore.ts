/**
 * Auth Store
 * Centralized authentication state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createLogger } from '../utils/logger';
import { STORAGE_KEYS, USER_ROLE } from '../constants';
import type { User, UserRole } from '../types';

const logger = createLogger('AuthStore');

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user: User, token: string): void => {
        logger.info('User logging in', { userId: user.id, email: user.email });
        
        // Clear any previous state first
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        logger.info('Login successful', { userId: user.id });
      },

      logout: (): void => {
        const userId = get().user?.id;
        logger.info('User logging out', { userId });
        
        set(initialState);
        
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        
        logger.info('Logout successful');
      },

      updateUser: (updates: Partial<User>): void => {
        const currentUser = get().user;
        
        if (!currentUser) {
          logger.warn('Cannot update user - no user logged in');
          return;
        }

        logger.info('Updating user', { userId: currentUser.id, updates });
        
        set({
          user: { ...currentUser, ...updates },
        });
      },

      isAdmin: (): boolean => {
        const user = get().user;
        return user?.role === USER_ROLE.ADMIN;
      },

      hasRole: (role: UserRole): boolean => {
        const user = get().user;
        return user?.role === role;
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const selectUser = (state: AuthStore): User | null => state.user;
export const selectIsAuthenticated = (state: AuthStore): boolean => state.isAuthenticated;
export const selectIsAdmin = (state: AuthStore): boolean => state.isAdmin();