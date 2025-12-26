/**
 * Theme Store
 * Manages dark/light/system theme preference
 * 
 * @module stores/themeStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getResolvedTheme: () => 'light' | 'dark';
  initializeTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply theme to document
const applyThemeToDOM = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Also set color-scheme for native elements
  root.style.colorScheme = resolvedTheme;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme: Theme): void => {
        applyThemeToDOM(theme);
        set({ theme });
      },

      toggleTheme: (): void => {
        const currentResolved = get().getResolvedTheme();
        const newTheme: Theme = currentResolved === 'dark' ? 'light' : 'dark';
        applyThemeToDOM(newTheme);
        set({ theme: newTheme });
      },

      getResolvedTheme: (): 'light' | 'dark' => {
        const { theme } = get();
        return theme === 'system' ? getSystemTheme() : theme;
      },

      initializeTheme: (): void => {
        const { theme } = get();
        applyThemeToDOM(theme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration from localStorage
        if (state) {
          setTimeout(() => {
            applyThemeToDOM(state.theme);
          }, 0);
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  mediaQuery.addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      applyThemeToDOM('system');
    }
  });

  // Initialize theme immediately
  const initTheme = (): void => {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        applyThemeToDOM(parsed.state?.theme ?? 'system');
      } catch {
        applyThemeToDOM('system');
      }
    } else {
      applyThemeToDOM('system');
    }
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}