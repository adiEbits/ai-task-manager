/**
 * ThemeToggle Component
 * Toggle button for dark/light mode
 * 
 * @module components/common/ThemeToggle
 */

import { useEffect, useState, type JSX } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ 
  showLabel = false, 
  size = 'md' 
}: ThemeToggleProps): JSX.Element {
  const { theme, setTheme, toggleTheme, getResolvedTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = getResolvedTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Show placeholder while mounting to prevent flash
  if (!mounted) {
    return (
      <button
        className={`${sizeClasses[size]} rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200`}
        aria-label="Toggle theme"
      >
        <Moon className={iconSizes[size]} />
      </button>
    );
  }

  // Simple toggle button
  if (!showLabel) {
    return (
      <button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className={`${iconSizes[size]} text-yellow-500`} />
        ) : (
          <Moon className={`${iconSizes[size]} text-gray-600`} />
        )}
      </button>
    );
  }

  // Full toggle with options
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
        <span>Light</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
        <span>Dark</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
        <span>System</span>
      </button>
    </div>
  );
}