import { useState, type FormEvent, type JSX } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { taskService } from '@/features/tasks/services/taskService';
import { useTaskStore } from '@/stores/taskStore';
import { LoadingSpinner } from '@/components/common';
import { 
  TASK_STATUS, 
  TASK_PRIORITY,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from '@/constants';
import type { 
  Task, 
  TaskUpdateInput, 
  ApiErrorResponse 
} from '@/types';
import toast from 'react-hot-toast';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function EditTaskModal({ task, onClose }: EditTaskModalProps): JSX.Element {
  const updateTask = useTaskStore((state) => state.updateTask);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formData, setFormData] = useState<TaskUpdateInput>({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    status: task.status,
    due_date: task.due_date ?? '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData: TaskUpdateInput = {
        title: formData.title?.trim(),
        description: formData.description?.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || undefined,
      };
      
      const updatedTask = await taskService.updateTask(task.id, updateData);
      updateTask(task.id, updatedTask);
      
      toast.success('Task updated successfully!');
      onClose();
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail 
        ?? apiError.message 
        ?? 'Failed to update task';
      
      console.error('Failed to update task:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof TaskUpdateInput, 
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <h3 
            id="edit-task-title"
            className="text-lg sm:text-xl font-bold text-gray-900"
          >
            Edit Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Title Field */}
          <div>
            <label 
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              required
              value={formData.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all ${
                errors.title 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-white'
              }`}
              placeholder="Task title"
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label 
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              value={formData.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all resize-none ${
                errors.description 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-white'
              }`}
              placeholder="Add more details (optional)"
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label 
                htmlFor="edit-priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority
              </label>
              <select
                id="edit-priority"
                value={formData.priority ?? TASK_PRIORITY.MEDIUM}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all"
              >
                {Object.values(TASK_PRIORITY).map((value) => (
                  <option key={value} value={value}>
                    {TASK_PRIORITY_CONFIG[value].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label 
                htmlFor="edit-status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="edit-status"
                value={formData.status ?? TASK_STATUS.TODO}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all"
              >
                {Object.values(TASK_STATUS).map((value) => (
                  <option key={value} value={value}>
                    {TASK_STATUS_CONFIG[value].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label 
              htmlFor="edit-due-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date
            </label>
            <input
              id="edit-due-date"
              type="datetime-local"
              value={formData.due_date ?? ''}
              onChange={(e) => handleChange('due_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-violet-200"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}