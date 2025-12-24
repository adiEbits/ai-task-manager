/**
 * Toast Utility
 * Centralized toast notifications with consistent styling
 */

import toast, { type ToastOptions } from 'react-hot-toast';
import { createLogger } from './logger';

const logger = createLogger('Toast');

// Base styles
const baseStyle: React.CSSProperties = {
  padding: '14px 20px',
  borderRadius: '12px',
  fontWeight: 500,
  fontSize: '14px',
  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
};

// Toast configuration
const toastConfig = {
  success: {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
    duration: 4000,
  },
  error: {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
    duration: 5000,
  },
  warning: {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#fff',
    },
    duration: 4000,
  },
  info: {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
    },
    duration: 4000,
  },
  loading: {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#fff',
    },
  },
};

/**
 * Show success toast
 */
export const showSuccess = (message: string, options?: ToastOptions): string => {
  logger.debug('Showing success toast', { message });
  return toast.success(message, {
    ...toastConfig.success,
    ...options,
  });
};

/**
 * Show error toast
 */
export const showError = (message: string, options?: ToastOptions): string => {
  logger.debug('Showing error toast', { message });
  return toast.error(message, {
    ...toastConfig.error,
    ...options,
  });
};

/**
 * Show warning toast
 */
export const showWarning = (message: string, options?: ToastOptions): string => {
  logger.debug('Showing warning toast', { message });
  return toast(message, {
    icon: '⚠️',
    ...toastConfig.warning,
    ...options,
  });
};

/**
 * Show info toast
 */
export const showInfo = (message: string, options?: ToastOptions): string => {
  logger.debug('Showing info toast', { message });
  return toast(message, {
    icon: 'ℹ️',
    ...toastConfig.info,
    ...options,
  });
};

/**
 * Show loading toast
 */
export const showLoading = (message: string): string => {
  logger.debug('Showing loading toast', { message });
  return toast.loading(message, toastConfig.loading);
};

/**
 * Dismiss toast
 */
export const dismissToast = (toastId?: string): void => {
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
  logger.debug('Showing promise toast', { loadingMessage: messages.loading });
  
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      loading: toastConfig.loading,
      success: toastConfig.success,
      error: toastConfig.error,
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
  return toast(message, {
    style: baseStyle,
    ...options,
  });
};

// Export all toast functions as an object for convenience
export const toastService = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  promise: showPromise,
  custom: showCustom,
};

export default toastService;