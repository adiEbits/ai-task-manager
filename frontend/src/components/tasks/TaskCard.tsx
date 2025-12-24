/**
 * TaskCard Component
 * Displays a task with actions and status indicators
 */

import { useState, type JSX } from 'react';
import { 
  Trash2, 
  Calendar, 
  Flag, 
  Edit2, 
  Mail,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/ai/Card';
import Badge from '../../components/ai/Badge';
import Button from '../../components/ai/Button';
import { createLogger } from '../../utils/logger';
import { toastService } from '../../utils/toast';
import { api } from '../../services/api';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '../../constants';
import { formatRelativeTime } from '../../utils';
import type { Task } from '../../types';
import EditTaskModal from './EditTaskModal';

const logger = createLogger('TaskCard');

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps): JSX.Element {
  const [showEdit, setShowEdit] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];

  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'completed';

  const sendEmailReminder = async (): Promise<void> => {
    logger.info('Sending email reminder', { taskId: task.id });
    setSendingEmail(true);

    try {
      await api.post('/api/notifications/send-reminder', { task_id: task.id });
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

  return (
    <>
      <Card 
        variant="default" 
        hover
        className="group relative overflow-hidden"
      >
        {/* Priority indicator bar */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${priorityConfig.dotColor}`} 
        />

        <div className="p-5 pl-6">
          <div className="flex justify-between items-start gap-4">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Title and status */}
              <div className="flex items-start gap-3 mb-2">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : isOverdue ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                
                <h3 
                  className={`text-base font-semibold leading-tight ${
                    task.status === 'completed' 
                      ? 'text-gray-400 line-through' 
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 ml-8">
                  {task.description}
                </p>
              )}

              {/* Tags and metadata */}
              <div className="flex flex-wrap items-center gap-2 ml-8">
                <Badge 
                  variant={
                    task.status === 'completed' ? 'success' :
                    task.status === 'in_progress' ? 'info' : 'default'
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

                {task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-violet-50 text-violet-600 rounded-md"
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
                <Mail className="w-4 h-4 text-emerald-600" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEdit(true)}
                title="Edit task"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                title="Delete task"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* AI generated indicator */}
        {task.ai_generated && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-xs bg-violet-100 text-violet-600 rounded-full">
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