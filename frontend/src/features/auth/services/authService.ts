/**
 * Auth Service
 * Handles all authentication-related API operations
 */

import { api } from '@/services/api';
import { createLogger } from '@/utils/logger';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
} from '@/types';

const logger = createLogger('AuthService');

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    logger.info('Attempting login', { email: credentials.email });
    
    try {
      const response = await api.post<{
        user: User;
        access_token: string;
        refresh_token: string;
      }>(API_ENDPOINTS.AUTH.LOGIN, credentials);

      const loginResponse: LoginResponse = {
        user: response.data.user,
        session: {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        },
      };

      logger.info('Login successful', { userId: loginResponse.user.id });
      return loginResponse;
    } catch (error) {
      logger.error('Login failed', error as Error, { email: credentials.email });
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    logger.info('Attempting registration', { email: credentials.email });
    
    try {
      const response = await api.post<{
        user: User;
        access_token: string;
        refresh_token: string;
      }>(API_ENDPOINTS.AUTH.REGISTER, {
        email: credentials.email,
        password: credentials.password,
        full_name: credentials.full_name,
      });

      const loginResponse: LoginResponse = {
        user: response.data.user,
        session: {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        },
      };

      logger.info('Registration successful', { userId: loginResponse.user.id });
      return loginResponse;
    } catch (error) {
      logger.error('Registration failed', error as Error, { email: credentials.email });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    logger.info('Logging out user');
    
    try {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Logout error', error as Error);
      // Still clear storage even if API call fails
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    logger.info('Fetching current user');
    
    try {
      const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
      logger.info('Current user fetched', { userId: response.data.id });
      return response.data;
    } catch (error) {
      logger.warn('Failed to fetch current user', { error });
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
}

// Export singleton instance
export const authService = new AuthService();