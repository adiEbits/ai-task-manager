/**
 * TaskFilters Component
 * Filter and sort controls for task list
 */

import { type JSX } from 'react';
import { Filter, SortAsc, X } from 'lucide-react';
import Button from '@/features/ai/components/Button';
import { Card } from '@/features/ai/components/Card';
import { 
  TASK_STATUS, 
  TASK_PRIORITY, 
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  SORT_OPTIONS,
  type TaskStatus,
  type TaskPriority,
} from '@/constants';

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
}: TaskFiltersProps): JSX.Element {
  const hasActiveFilters = statusFilter || priorityFilter;

  const clearFilters = (): void => {
    onStatusChange('');
    onPriorityChange('');
  };

  return (
    <Card variant="default" className="mb-6">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leftIcon={<X className="w-4 h-4" />}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all"
            >
              <option value="">All Status</option>
            {Object.entries(TASK_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {TASK_STATUS_CONFIG[value as TaskStatus].label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all"
            >
              <option value="">All Priorities</option>
              {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                <option key={value} value={value}>
                  {TASK_PRIORITY_CONFIG[value as TaskPriority].label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <SortAsc className="w-4 h-4" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 transition-all"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500 mr-2">Quick:</span>
          
          <button
            onClick={() => {
              onStatusChange('todo');
              onPriorityChange('');
            }}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              statusFilter === 'todo' && !priorityFilter
                ? 'bg-violet-100 text-violet-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            To Do
          </button>

          <button
            onClick={() => {
              onStatusChange('');
              onPriorityChange('urgent');
            }}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              priorityFilter === 'urgent' && !statusFilter
                ? 'bg-red-100 text-red-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Urgent
          </button>

          <button
            onClick={() => {
              onStatusChange('in_progress');
              onPriorityChange('');
            }}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              statusFilter === 'in_progress' && !priorityFilter
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => {
              onStatusChange('completed');
              onPriorityChange('');
            }}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              statusFilter === 'completed' && !priorityFilter
                ? 'bg-emerald-100 text-emerald-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
    </Card>
  );
}