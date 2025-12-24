/**
 * API Service
 * Centralized API client with interceptors, error handling, and logging
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createLogger } from '../utils/logger';
import { STORAGE_KEYS, TIMING } from '../constants';

const logger = createLogger('ApiService');

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API Error Response Interface
 */
interface ApiErrorResponse {
  message?: string;
  detail?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Formatted API Error
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Create configured Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMING.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Ensure Content-Type is set for POST/PUT/PATCH requests
      if (['post', 'put', 'patch'].includes(config.method || '')) {
        config.headers['Content-Type'] = 'application/json';
      }

      logger.debug('API Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });

      return config;
    },
    (error: AxiosError) => {
      logger.error('Request interceptor error', error as Error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      logger.debug('API Response', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        logger.warn('Unauthorized request, clearing auth');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }

      // Handle network errors
      if (!error.response) {
        logger.error('Network error', error as Error);
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        };
        return Promise.reject(networkError);
      }

      // Log other errors
      logger.error('API Error', error as Error, {
        status: error.response.status,
        url: originalRequest?.url,
        data: error.response.data,
      });

      // Get error message from response
      const responseData = error.response.data;
      const errorMessage = 
        responseData?.message || 
        responseData?.detail || 
        error.message || 
        'An error occurred';

      // Format error response
      const apiError: ApiError = {
        message: errorMessage,
        code: responseData?.code || error.code,
        status: error.response.status,
        details: responseData?.details,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Export configured API client
export const api = createApiClient();

/**
 * Type-safe API request helpers
 */
export const apiHelpers = {
  /**
   * GET request with type safety
   */
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await api.get<T>(url, { params });
    return response.data;
  },

  /**
   * POST request with type safety
   */
  async post<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await api.post<T>(url, data);
    return response.data;
  },

  /**
   * PUT request with type safety
   */
  async put<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  /**
   * PATCH request with type safety
   */
  async patch<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await api.patch<T>(url, data);
    return response.data;
  },

  /**
   * DELETE request with type safety
   */
  async delete<T>(url: string): Promise<T> {
    const response = await api.delete<T>(url);
    return response.data;
  },
};

export default api;