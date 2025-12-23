import { useState } from 'react';
import type { Task } from '../../types';
import { Trash2, Calendar, Flag, Edit2, Mail } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const [showEdit, setShowEdit] = useState(false);

  const sendEmailReminder = async (taskId: string): Promise<void> => {
    try {
      await api.post('/api/notifications/send-reminder', { task_id: taskId });
      toast.success('Email reminder sent! 📧');
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('Failed to send email');
    }
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${priorityColors[task.priority]}`}>
                <Flag className="w-3 h-3" />
                {task.priority}
              </span>
              {task.due_date && (
                <span className="px-2 py-1 rounded text-xs text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => sendEmailReminder(task.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Send email reminder"
            >
              <Mail className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowEdit(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit task"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditTaskModal task={task} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}