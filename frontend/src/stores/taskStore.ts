import { create } from 'zustand';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  
  setTasks: (tasks: Task[]) => set({ tasks }),
  
  addTask: (task: Task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (id: string, updates: Partial<Task>) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  
  removeTask: (id: string) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id)
  })),
}));