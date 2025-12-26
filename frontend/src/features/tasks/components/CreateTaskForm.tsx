/**
 * CreateTaskForm Component
 * Form for creating new tasks with validation
 */

import { useState, type FormEvent, type JSX } from 'react';
import { X, Sparkles, Calendar, Flag, FileText } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/features/ai/components/Card';
import Button from '@/features/ai/components/Button';
import Input from '@/features/ai/components/Input';
import { taskService } from '@/features/tasks/services/taskService';
import { useTaskStore } from '@/stores/taskStore';
import { createLogger } from '@/utils/logger';
import { toastService } from '@/utils/toast';
import { 
  TASK_STATUS, 
  TASK_PRIORITY,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  type TaskStatus,
  type TaskPriority,
} from '@/constants';
import type { TaskCreateInput } from '@/types';

const logger = createLogger('CreateTaskForm');

interface CreateTaskFormProps {
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  priority: TASK_PRIORITY.MEDIUM,
  status: TASK_STATUS.TODO,
  due_date: '',
};

export default function CreateTaskForm({ onClose }: CreateTaskFormProps): JSX.Element {
  const addTask = useTaskStore((state) => state.addTask);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
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

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      logger.warn('Form validation failed', { errors });
      return;
    }

    setLoading(true);
    logger.info('Creating task', { title: formData.title });

    try {
      const taskData: TaskCreateInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || undefined,
      };

      const newTask = await taskService.createTask(taskData);
      addTask(newTask);
      
      toastService.success('Task created successfully! ✨');
      logger.info('Task created', { id: newTask.id });
      
      onClose();
    } catch (error) {
      logger.error('Failed to create task', error as Error);
      toastService.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card variant="elevated" className="mb-6">
      <CardHeader action={
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      }>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span>Create New Task</span>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          {/* Title */}
          <Input
            label="Title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="What needs to be done?"
            error={errors.title}
            leftIcon={<FileText className="w-5 h-5" />}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all resize-none"
              placeholder="Add more details (optional)"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Priority, Status, Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all"
              >
                {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                  <option key={value} value={value}>
                    {TASK_PRIORITY_CONFIG[value].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all"
              >
                {Object.entries(TASK_STATUS).map(([key, value]) => (
                  <option key={value} value={value}>
                    {TASK_STATUS_CONFIG[value as TaskStatus].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all"
              />
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Create Task
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}