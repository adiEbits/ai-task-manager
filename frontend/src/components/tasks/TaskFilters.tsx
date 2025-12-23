import { Filter, SortAsc } from 'lucide-react';

interface TaskFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onSortChange: (sort: string) => void;
}

export default function TaskFilters({
  statusFilter,
  priorityFilter,
  sortBy,
  onStatusChange,
  onPriorityChange,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="w-full">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
            <SortAsc className="w-4 h-4" />
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="created_at">Date Created</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
    </div>
  );
}