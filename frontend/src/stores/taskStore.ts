/**
 * Task Store
 * Centralized task state management
 */

import { create } from 'zustand';
import { createLogger } from '../utils/logger';
import type { Task, TaskFilters } from '../types';
// import { TASK_PRIORITY_CONFIG } from '../constants';

const logger = createLogger('TaskStore');

interface TaskState {
  tasks: Task[];
  selectedTasks: string[];
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
}

interface TaskActions {
  // Task CRUD
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  // Bulk operations
  addTasks: (tasks: Task[]) => void;
  removeTasks: (ids: string[]) => void;
  
  // Selection
  selectTask: (id: string) => void;
  deselectTask: (id: string) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  
  // Filters
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getTaskById: (id: string) => Task | undefined;
  getFilteredTasks: () => Task[];
  getTaskStats: () => TaskStats;
}

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  urgent: number;
  overdue: number;
}

type TaskStore = TaskState & TaskActions;

const initialState: TaskState = {
  tasks: [],
  selectedTasks: [],
  filters: {},
  isLoading: false,
  error: null,
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  ...initialState,

  // Task CRUD
  setTasks: (tasks: Task[]): void => {
    logger.info('Setting tasks', { count: tasks.length });
    set({ tasks, isLoading: false, error: null });
  },

  addTask: (task: Task): void => {
    logger.info('Adding task', { id: task.id, title: task.title });
    set((state) => ({
      tasks: [task, ...state.tasks],
    }));
  },

  updateTask: (id: string, updates: Partial<Task>): void => {
    logger.info('Updating task', { id, updates });
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      ),
    }));
  },

  removeTask: (id: string): void => {
    logger.info('Removing task', { id });
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      selectedTasks: state.selectedTasks.filter((taskId) => taskId !== id),
    }));
  },

  // Bulk operations
  addTasks: (tasks: Task[]): void => {
    logger.info('Adding multiple tasks', { count: tasks.length });
    set((state) => ({
      tasks: [...tasks, ...state.tasks],
    }));
  },

  removeTasks: (ids: string[]): void => {
    logger.info('Removing multiple tasks', { count: ids.length });
    set((state) => ({
      tasks: state.tasks.filter((task) => !ids.includes(task.id)),
      selectedTasks: state.selectedTasks.filter((id) => !ids.includes(id)),
    }));
  },

  // Selection
  selectTask: (id: string): void => {
    set((state) => ({
      selectedTasks: [...state.selectedTasks, id],
    }));
  },

  deselectTask: (id: string): void => {
    set((state) => ({
      selectedTasks: state.selectedTasks.filter((taskId) => taskId !== id),
    }));
  },

  toggleTaskSelection: (id: string): void => {
    const { selectedTasks } = get();
    if (selectedTasks.includes(id)) {
      get().deselectTask(id);
    } else {
      get().selectTask(id);
    }
  },

  selectAllTasks: (): void => {
    const { tasks } = get();
    set({ selectedTasks: tasks.map((task) => task.id) });
  },

  clearSelection: (): void => {
    set({ selectedTasks: [] });
  },

  // Filters
  setFilters: (filters: TaskFilters): void => {
    logger.debug('Setting filters', { filters });
    set({ filters });
  },

  clearFilters: (): void => {
    logger.debug('Clearing filters');
    set({ filters: {} });
  },

  // Loading state
  setLoading: (isLoading: boolean): void => {
    set({ isLoading });
  },

  setError: (error: string | null): void => {
    set({ error, isLoading: false });
  },

  // Computed
  getTaskById: (id: string): Task | undefined => {
    return get().tasks.find((task) => task.id === id);
  },

  getFilteredTasks: (): Task[] => {
    const { tasks, filters } = get();
    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    if (filters.category) {
      filtered = filtered.filter((task) => task.category === filters.category);
    }

    return filtered;
  },

  getTaskStats: (): TaskStats => {
    const { tasks } = get();
    const now = new Date();

    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
      overdue: tasks.filter((t) => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < now;
      }).length,
    };
  },
}));

// Selectors for optimized re-renders
export const selectTasks = (state: TaskStore): Task[] => state.tasks;
export const selectSelectedTasks = (state: TaskStore): string[] => state.selectedTasks;
export const selectFilters = (state: TaskStore): TaskFilters => state.filters;
export const selectIsLoading = (state: TaskStore): boolean => state.isLoading;
export const selectError = (state: TaskStore): string | null => state.error;