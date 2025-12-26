/**
 * TaskCard Component
 * Displays a task with optimistic updates and actions
 * 
 * @module features/tasks/components/TaskCard
 */

import { useState, type JSX } from 'react';
import { 
  Trash2, 
  Calendar, 
  Flag, 
  Edit2, 
  Mail,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card } from '@/features/ai/components/Card';
import Badge from '@/features/ai/components/Badge';
import Button from '@/features/ai/components/Button';
import { createLogger } from '@/utils/logger';
import { toastService } from '@/utils/toast';
import { taskService } from '@/features/tasks/services/taskService';
import { useTaskStore } from '@/stores/taskStore';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/constants';
import { formatRelativeTime } from '@/utils';
import type { Task, TaskStatus } from '@/types';
import EditTaskModal from './EditTaskModal';

const logger = createLogger('TaskCard');

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps): JSX.Element {
  const updateTask = useTaskStore((state) => state.updateTask);
  
  const [showEdit, setShowEdit] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<TaskStatus | null>(null);

  // Use optimistic status if available, otherwise use task status
  const displayStatus = optimisticStatus ?? task.status;
  
  const statusConfig = TASK_STATUS_CONFIG[displayStatus];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];

  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    displayStatus !== 'completed';

  // ============================================
  // Optimistic Status Toggle
  // ============================================

  const handleStatusToggle = async (): Promise<void> => {
    if (isUpdatingStatus) return;

    // Determine next status
    const nextStatus: TaskStatus = displayStatus === 'completed' 
      ? 'todo' 
      : displayStatus === 'todo' 
        ? 'in_progress' 
        : 'completed';

    logger.info('Status toggle initiated', { 
      taskId: task.id, 
      from: displayStatus, 
      to: nextStatus 
    });

    // Apply optimistic update immediately
    setOptimisticStatus(nextStatus);
    setIsUpdatingStatus(true);

    try {
      // Make API call
      const updatedTask = await taskService.updateTask(task.id, { status: nextStatus });
      
      // Update store with server response
      updateTask(task.id, updatedTask);
      
      // Clear optimistic state
      setOptimisticStatus(null);
      
      // Show success feedback
      const statusLabel = TASK_STATUS_CONFIG[nextStatus].label;
      toastService.success(`Task marked as ${statusLabel}`);
      
      logger.info('Status toggle successful', { taskId: task.id, newStatus: nextStatus });
    } catch (error) {
      // Rollback optimistic update
      setOptimisticStatus(null);
      
      logger.error('Status toggle failed', error as Error, { taskId: task.id });
      toastService.error('Failed to update task status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ============================================
  // Other Actions
  // ============================================

  const sendEmailReminder = async (): Promise<void> => {
    logger.info('Sending email reminder', { taskId: task.id });
    setSendingEmail(true);

    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toastService.success('Email reminder sent! 📧');
      logger.info('Email reminder sent successfully', { taskId: task.id });
    } catch (error) {
      logger.error('Failed to send email reminder', error as Error, { taskId: task.id });
      toastService.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = (): void => {
    logger.info('Delete requested', { taskId: task.id });
    onDelete(task.id);
  };

  // ============================================
  // Render Helpers
  // ============================================

  const renderStatusIcon = (): JSX.Element => {
    if (isUpdatingStatus) {
      return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
    }

    if (displayStatus === 'completed') {
      return (
        <CheckCircle2 
          className="w-5 h-5 text-emerald-500 cursor-pointer hover:text-emerald-600 transition-colors" 
        />
      );
    }

    if (isOverdue) {
      return (
        <AlertTriangle 
          className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-600 transition-colors" 
        />
      );
    }

    if (displayStatus === 'in_progress') {
      return (
        <Clock 
          className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors" 
        />
      );
    }

    return (
      <Circle 
        className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
      />
    );
  };

  // ============================================
  // Render
  // ============================================

  return (
    <>
      <Card 
        variant="default" 
        hover
        className={`group relative overflow-hidden transition-all duration-200 ${
          optimisticStatus ? 'ring-2 ring-purple-200 dark:ring-purple-800' : ''
        }`}
      >
        {/* Priority indicator bar */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${priorityConfig.dotColor}`} 
        />

        {/* Optimistic update indicator */}
        {optimisticStatus && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          </div>
        )}

        <div className="p-5 pl-6">
          <div className="flex justify-between items-start gap-4">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Title and status */}
              <div className="flex items-start gap-3 mb-2">
                {/* Clickable status icon */}
                <button
                  onClick={handleStatusToggle}
                  disabled={isUpdatingStatus}
                  className="flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full disabled:cursor-not-allowed"
                  title={`Click to change status (${displayStatus})`}
                >
                  {renderStatusIcon()}
                </button>
                
                <h3 
                  className={`text-base font-semibold leading-tight transition-all duration-200 ${
                    displayStatus === 'completed' 
                      ? 'text-gray-400 dark:text-gray-500 line-through' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p className={`text-sm mb-3 line-clamp-2 ml-8 transition-colors duration-200 ${
                  displayStatus === 'completed' 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {task.description}
                </p>
              )}

              {/* Tags and metadata */}
              <div className="flex flex-wrap items-center gap-2 ml-8">
                <Badge 
                  variant={
                    displayStatus === 'completed' ? 'success' :
                    displayStatus === 'in_progress' ? 'info' : 'default'
                  }
                  size="sm"
                >
                  {statusConfig.label}
                </Badge>

                <Badge 
                  variant={
                    task.priority === 'urgent' ? 'danger' :
                    task.priority === 'high' ? 'warning' :
                    task.priority === 'medium' ? 'info' : 'secondary'
                  }
                  size="sm"
                  icon={<Flag className="w-3 h-3" />}
                >
                  {priorityConfig.label}
                </Badge>

                {task.due_date && (
                  <Badge 
                    variant={isOverdue ? 'danger' : 'default'}
                    size="sm"
                    icon={<Calendar className="w-3 h-3" />}
                  >
                    {formatRelativeTime(task.due_date)}
                  </Badge>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={sendEmailReminder}
                loading={sendingEmail}
                title="Send email reminder"
              >
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEdit(true)}
                title="Edit task"
              >
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                title="Delete task"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </div>

        {/* AI generated indicator */}
        {task.ai_generated && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full">
              AI
            </span>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {showEdit && (
        <EditTaskModal task={task} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}