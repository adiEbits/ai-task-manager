/**
 * TaskList Component
 * Displays list of tasks with filters and sorting
 * 
 * @module features/tasks/components/TaskList
 */

import toast from 'react-hot-toast';
import { useState, useEffect, useMemo, useCallback, type JSX } from 'react';
import { taskService } from '@/features/tasks/services/taskService';
import { useTaskStore } from '@/stores/taskStore';
import { TaskCardSkeleton } from '@/components/common';
import TaskCard from './TaskCard';
import CreateTaskForm from './CreateTaskForm';
import TaskFilters from './TaskFilters';
import { Plus, CheckCircle2, ListTodo, Clock, AlertCircle } from 'lucide-react';
import AIChatWidget from '@/features/ai/components/AIChatWidget';
import type { Task } from '@/types';

type SortOption = 'created_at' | 'priority' | 'title' | 'status' | 'due_date';

export default function TaskList(): JSX.Element {
  const { tasks, setTasks, removeTask } = useTaskStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');

  const loadTasks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      
      // Safely extract tasks array from response
      // Handle: { tasks: [...] } or { tasks: undefined } or direct array
      let taskData: Task[] = [];
      
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          // Response is directly an array
          taskData = response;
        } else if (Array.isArray(response.tasks)) {
          // Response has tasks property
          taskData = response.tasks;
        }
      }
      
      setTasks(taskData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
      // Ensure tasks is always an array even on error
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(id);
      removeTask(id);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Task deleted successfully</span>
        </div>
      );
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Safe tasks array - ALWAYS ensure it's an array
  const safeTasks = useMemo(() => {
    if (!tasks) return [];
    if (!Array.isArray(tasks)) return [];
    return tasks;
  }, [tasks]);

  const filteredTasks = useMemo((): Task[] => {
    let filtered = [...safeTasks];

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'due_date': {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [safeTasks, statusFilter, priorityFilter, sortBy]);

  const stats = useMemo(() => ({
    total: safeTasks.length,
    todo: safeTasks.filter((t) => t.status === 'todo').length,
    completed: safeTasks.filter((t) => t.status === 'completed').length,
    urgent: safeTasks.filter((t) => t.priority === 'urgent').length,
  }), [safeTasks]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-11 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div>
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded mt-1 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Task Cards Skeleton */}
        <TaskCardSkeleton count={5} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
            <p className="text-gray-500 mt-1">{filteredTasks.length} of {safeTasks.length} tasks</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-violet-200"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
                <p className="text-sm text-gray-500">To Do</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-500">Done</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
                <p className="text-sm text-gray-500">Urgent</p>
              </div>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <CreateTaskForm onClose={() => setShowCreateForm(false)} />
        )}

        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortBy={sortBy}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSortChange={(value) => setSortBy(value as SortOption)}
        />

        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {safeTasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {safeTasks.length === 0
                ? 'Create your first task to get started'
                : 'Try adjusting your filters'}
            </p>
            {safeTasks.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <AIChatWidget />
    </>
  );
}