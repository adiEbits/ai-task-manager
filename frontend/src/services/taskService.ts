import { api } from './api';
import type { Task, TaskCreateData, TaskUpdateData, TaskListResponse } from '../types';

export const taskService = {
  getTasks: async (): Promise<TaskListResponse> => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: TaskCreateData): Promise<Task> => {
    const response = await api.post('/api/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: TaskUpdateData): Promise<Task> => {
    const response = await api.patch(`/api/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },
};