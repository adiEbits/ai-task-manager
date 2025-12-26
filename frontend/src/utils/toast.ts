/**
 * Toast Utility
 * Centralized toast notifications with dark mode support
 * 
 * @module utils/toast
 */

import toast, { type ToastOptions } from 'react-hot-toast';
import { createLogger } from './logger';

const logger = createLogger('Toast');

// ============================================
// Types
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastConfig {
  style: React.CSSProperties;
  darkStyle: React.CSSProperties;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
  darkIconTheme?: {
    primary: string;
    secondary: string;
  };
  duration?: number;
  icon?: string;
}

// ============================================
// Helpers
// ============================================

/**
 * Check if dark mode is active
 */
const isDarkMode = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

/**
 * Get styles based on current theme
 */
const getThemedStyles = (config: ToastConfig): Partial<ToastOptions> => {
  const dark = isDarkMode();
  
  return {
    style: dark ? { ...baseStyle, ...config.darkStyle } : { ...baseStyle, ...config.style },
    iconTheme: dark ? config.darkIconTheme : config.iconTheme,
    duration: config.duration,
  };
};

// ============================================
// Base Styles
// ============================================

const baseStyle: React.CSSProperties = {
  padding: '14px 20px',
  borderRadius: '12px',
  fontWeight: 500,
  fontSize: '14px',
  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
  maxWidth: '400px',
};

// ============================================
// Toast Configurations
// ============================================

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
    },
    darkStyle: {
      background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
      color: '#ecfdf5',
      border: '1px solid #10b981',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
    darkIconTheme: {
      primary: '#ecfdf5',
      secondary: '#10b981',
    },
    duration: 4000,
  },
  error: {
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
    },
    darkStyle: {
      background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
      color: '#fef2f2',
      border: '1px solid #ef4444',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
    darkIconTheme: {
      primary: '#fef2f2',
      secondary: '#ef4444',
    },
    duration: 5000,
  },
  warning: {
    style: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#fff',
    },
    darkStyle: {
      background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
      color: '#fffbeb',
      border: '1px solid #f59e0b',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#f59e0b',
    },
    darkIconTheme: {
      primary: '#fffbeb',
      secondary: '#f59e0b',
    },
    duration: 4000,
  },
  info: {
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
    },
    darkStyle: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
      color: '#eff6ff',
      border: '1px solid #3b82f6',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3b82f6',
    },
    darkIconTheme: {
      primary: '#eff6ff',
      secondary: '#3b82f6',
    },
    duration: 4000,
  },
  loading: {
    style: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#fff',
    },
    darkStyle: {
      background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)',
      color: '#f5f3ff',
      border: '1px solid #8b5cf6',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#8b5cf6',
    },
    darkIconTheme: {
      primary: '#f5f3ff',
      secondary: '#8b5cf6',
    },
  },
};

// ============================================
// Toast Functions
// ============================================

/**
 * Show success toast
 */
export const showSuccess = (message: string, options?: ToastOptions): string => {
  logger.info('Toast shown', { type: 'success', message });
  return toast.success(message, {
    ...getThemedStyles(toastConfigs.success),
    ...options,
  });
};

/**
 * Show error toast
 */
export const showError = (message: string, options?: ToastOptions): string => {
  logger.error('Toast shown', undefined, { type: 'error', message });
  return toast.error(message, {
    ...getThemedStyles(toastConfigs.error),
    ...options,
  });
};

/**
 * Show warning toast
 */
export const showWarning = (message: string, options?: ToastOptions): string => {
  logger.warn('Toast shown', { type: 'warning', message });
  return toast(message, {
    icon: '⚠️',
    ...getThemedStyles(toastConfigs.warning),
    ...options,
  });
};

/**
 * Show info toast
 */
export const showInfo = (message: string, options?: ToastOptions): string => {
  logger.info('Toast shown', { type: 'info', message });
  return toast(message, {
    icon: 'ℹ️',
    ...getThemedStyles(toastConfigs.info),
    ...options,
  });
};

/**
 * Show loading toast (returns ID to dismiss later)
 */
export const showLoading = (message: string): string => {
  logger.debug('Loading toast shown', { message });
  return toast.loading(message, getThemedStyles(toastConfigs.loading));
};

/**
 * Update existing toast
 */
export const updateToast = (
  toastId: string, 
  message: string, 
  type: 'success' | 'error'
): void => {
  logger.debug('Toast updated', { toastId, type, message });
  
  const config = type === 'success' ? toastConfigs.success : toastConfigs.error;
  
  if (type === 'success') {
    toast.success(message, {
      id: toastId,
      ...getThemedStyles(config),
    });
  } else {
    toast.error(message, {
      id: toastId,
      ...getThemedStyles(config),
    });
  }
};

/**
 * Dismiss toast(s)
 */
export const dismissToast = (toastId?: string): void => {
  logger.debug('Toast dismissed', { toastId: toastId ?? 'all' });
  
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Promise toast - shows loading, success, or error based on promise result
 */
export const showPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: Error) => string);
  }
): Promise<T> => {
  logger.info('Promise toast started', { loadingMessage: messages.loading });
  
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      loading: getThemedStyles(toastConfigs.loading),
      success: getThemedStyles(toastConfigs.success),
      error: getThemedStyles(toastConfigs.error),
    }
  );
};

/**
 * Custom toast with full control
 */
export const showCustom = (
  message: string | React.ReactNode,
  options?: ToastOptions
): string => {
  logger.debug('Custom toast shown');
  return toast(message, {
    style: baseStyle,
    ...options,
  });
};

// ============================================
// Toast Service Object
// ============================================

/**
 * Centralized toast service for easy imports
 * 
 * @example
 * import { toastService } from '@/utils/toast';
 * 
 * toastService.success('Task created!');
 * toastService.error('Something went wrong');
 * 
 * const loadingId = toastService.loading('Saving...');
 * toastService.dismiss(loadingId);
 * 
 * await toastService.promise(saveTask(), {
 *   loading: 'Saving task...',
 *   success: 'Task saved!',
 *   error: 'Failed to save task',
 * });
 */
export const toastService = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  update: updateToast,
  dismiss: dismissToast,
  promise: showPromise,
  custom: showCustom,
} as const;

export default toastService;