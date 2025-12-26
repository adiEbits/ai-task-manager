/**
 * User Service
 * Handles all user-related API operations
 * 
 * @module features/users/services/userService
 */

import { api } from '@/services/api';
import { createLogger } from '@/utils/logger';
import type { User } from '@/types';

const logger = createLogger('UserService');

export interface UserCreateInput {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'user';
}

export interface UserUpdateInput {
  email?: string;
  full_name?: string;
  role?: 'admin' | 'user';
  password?: string;
}

export interface UserFilters {
  search?: string;
  role?: 'admin' | 'user';
  page?: number;
  page_size?: number;
}

class UserService {
  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    logger.info('Fetching users', { filters });
    
    try {
      const response = await api.get<User[]>('/api/admin/users', {
        params: filters,
      });
      
      logger.info('Users fetched successfully', { count: response.data.length });
      return response.data;
    } catch (error: unknown) {
      logger.error('Failed to fetch users', error as Error);
      throw error;
    }
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<User> {
    logger.info('Fetching user', { id });
    
    try {
      const response = await api.get<User>(`/api/admin/users/${id}`);
      logger.info('User fetched successfully', { id });
      return response.data;
    } catch (error: unknown) {
      logger.error('Failed to fetch user', error as Error, { id });
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: UserCreateInput): Promise<User> {
    logger.info('Creating user', { email: data.email });
    
    try {
      const response = await api.post<User>('/api/admin/users', data);
      logger.info('User created successfully', { id: response.data.id });
      return response.data;
    } catch (error: unknown) {
      logger.error('Failed to create user', error as Error, { email: data.email });
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, data: UserUpdateInput): Promise<User> {
    logger.info('Updating user', { id });
    
    try {
      const response = await api.put<User>(`/api/admin/users/${id}`, data);
      logger.info('User updated successfully', { id });
      return response.data;
    } catch (error: unknown) {
      logger.error('Failed to update user', error as Error, { id });
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    logger.info('Deleting user', { id });
    
    try {
      await api.delete(`/api/admin/users/${id}`);
      logger.info('User deleted successfully', { id });
    } catch (error: unknown) {
      logger.error('Failed to delete user', error as Error, { id });
      throw error;
    }
  }

  /**
   * Toggle user role
   */
  async toggleRole(id: string, currentRole: 'admin' | 'user'): Promise<User> {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    logger.info('Toggling user role', { id, from: currentRole, to: newRole });
    
    return this.updateUser(id, { role: newRole });
  }
}

// Export singleton instance
export const userService = new UserService();