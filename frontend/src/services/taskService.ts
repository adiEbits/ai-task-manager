/**
 * Task Service
 * Handles all task-related API operations with proper typing and logging
 */

import { api } from './api';
import { createLogger } from '../utils/logger';
import { API_ENDPOINTS } from '../constants';
import type {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TaskListResponse,
} from '../types';

const logger = createLogger('TaskService');

export interface GetTasksParams {
  page?: number;
  page_size?: number;
  status?: string;
  priority?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

class TaskService {
  /**
   * Get all tasks with optional filters
   */
  async getTasks(params?: GetTasksParams): Promise<TaskListResponse> {
    logger.info('Fetching tasks', { params });
    
    try {
      const response = await api.get<TaskListResponse>(API_ENDPOINTS.TASKS.BASE, {
        params,
      });
      
      logger.info('Tasks fetched successfully', { count: response.data.tasks.length });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch tasks', error as Error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<Task> {
    logger.info('Fetching task', { id });
    
    try {
      const response = await api.get<Task>(API_ENDPOINTS.TASKS.BY_ID(id));
      logger.info('Task fetched successfully', { id });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch task', error as Error, { id });
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(data: TaskCreateInput): Promise<Task> {
    logger.info('Creating task', { title: data.title });
    
    try {
      const response = await api.post<Task>(API_ENDPOINTS.TASKS.BASE, data);
      logger.info('Task created successfully', { id: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create task', error as Error, { data });
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: TaskUpdateInput): Promise<Task> {
    logger.info('Updating task', { id, data });
    
    try {
      const response = await api.patch<Task>(API_ENDPOINTS.TASKS.BY_ID(id), data);
      logger.info('Task updated successfully', { id });
      return response.data;
    } catch (error) {
      logger.error('Failed to update task', error as Error, { id, data });
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    logger.info('Deleting task', { id });
    
    try {
      await api.delete(API_ENDPOINTS.TASKS.BY_ID(id));
      logger.info('Task deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete task', error as Error, { id });
      throw error;
    }
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdate(
    ids: string[],
    data: TaskUpdateInput
  ): Promise<Task[]> {
    logger.info('Bulk updating tasks', { count: ids.length });
    
    try {
      const response = await api.patch<Task[]>(API_ENDPOINTS.TASKS.BULK, {
        ids,
        ...data,
      });
      logger.info('Tasks bulk updated successfully', { count: ids.length });
      return response.data;
    } catch (error) {
      logger.error('Failed to bulk update tasks', error as Error, { ids });
      throw error;
    }
  }

  /**
   * Bulk delete tasks
   */
  async bulkDelete(ids: string[]): Promise<void> {
    logger.info('Bulk deleting tasks', { count: ids.length });
    
    try {
      await api.delete(API_ENDPOINTS.TASKS.BULK, { data: { ids } });
      logger.info('Tasks bulk deleted successfully', { count: ids.length });
    } catch (error) {
      logger.error('Failed to bulk delete tasks', error as Error, { ids });
      throw error;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();