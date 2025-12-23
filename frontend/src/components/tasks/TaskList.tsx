import { useState, useEffect, useMemo, useCallback, type JSX } from 'react';
import { taskService } from '../../services/taskService';
import { useTaskStore } from '../../stores/taskStore';
import TaskCard from './TaskCard';
import CreateTaskForm from './CreateTaskForm';
import TaskFilters from './TaskFilters';
import VoiceTaskCreator from '../ai/VoiceTaskCreator';
import NaturalLanguageTaskCreator from '../ai/NaturalLanguageTaskCreator';
import AIInsightsPanel from '../ai/AIInsightsPanel';
import AIChatWidget from '../ai/AIChatWidget';
import { 
  Plus, 
  Loader2, 
  Sparkles,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task } from '../../types';

interface TaskListProps {
  searchQuery?: string;
}

type SortOption = 'created_at' | 'priority' | 'title' | 'status' | 'due_date';

export default function TaskList({ searchQuery = '' }: TaskListProps): JSX.Element {
  const { tasks, setTasks, removeTask } = useTaskStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [showAITools, setShowAITools] = useState<boolean>(false);

  const loadTasks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
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

  const filteredTasks = useMemo((): Task[] => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Sorting
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
  }, [tasks, statusFilter, priorityFilter, sortBy, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
  }), [tasks]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
            <p className="text-gray-500 mt-1">
              {filteredTasks.length} of {tasks.length} tasks
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAITools(!showAITools)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium
                transition-all duration-200
                ${showAITools 
                  ? 'bg-violet-100 text-violet-700 border border-violet-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                }
              `}
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">AI Tools</span>
            </button>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white
                bg-gradient-to-r from-violet-600 to-purple-600
                hover:from-violet-700 hover:to-purple-700
                transition-all duration-200 shadow-lg shadow-violet-500/25
                hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5
              "
            >
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </button>
          </div>
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
                <p className="text-sm text-gray-500">Total Tasks</p>
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
                <p className="text-sm text-gray-500">Completed</p>
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

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="animate-fade-in-up">
            <CreateTaskForm onClose={() => setShowCreateForm(false)} />
          </div>
        )}

        {/* AI Tools Section */}
        {showAITools && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VoiceTaskCreator />
              <NaturalLanguageTaskCreator />
            </div>
            <AIInsightsPanel />
          </div>
        )}

        {/* Filters */}
        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortBy={sortBy}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSortChange={(value) => setSortBy(value as SortOption)}
        />

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {tasks.length === 0
                ? 'Create your first task to get started with AI-powered task management'
                : 'Try adjusting your filters or search query'}
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="
                  mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  font-semibold text-white
                  bg-gradient-to-r from-violet-600 to-purple-600
                  hover:from-violet-700 hover:to-purple-700
                  transition-all duration-200
                "
              >
                <Plus className="w-5 h-5" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskCard task={task} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </>
  );
}