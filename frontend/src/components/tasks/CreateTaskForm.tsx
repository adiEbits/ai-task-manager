import toast from 'react-hot-toast';
import { useState } from 'react';
import { taskService } from '../../services/taskService';
import { useTaskStore } from '../../stores/taskStore';
import { X } from 'lucide-react';

interface CreateTaskFormProps {
    onClose: () => void;
}

export default function CreateTaskForm({ onClose }: CreateTaskFormProps) {
    const addTask = useTaskStore((state) => state.addTask);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newTask = await taskService.createTask(formData);
            addTask(newTask);
            toast.success('Task created successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to create task:', error);
            toast.error('Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create New Task</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter task title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter task description (optional)"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.due_date || ''}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}