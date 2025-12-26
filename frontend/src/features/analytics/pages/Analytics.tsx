/**
 * Analytics Page
 * Dashboard showing task statistics and charts
 * Uses skeleton loaders for better UX
 * 
 * @module features/analytics/pages/Analytics
 */

import { useMemo, useState, useEffect, type JSX } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { 
  PageHeader, 
  EmptyState, 
  StatCardSkeleton,
  Skeleton 
} from '@/components/common';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  TrendingUp, TrendingDown, CheckCircle, Clock, 
  AlertCircle, Target, Zap, BarChart3 
} from 'lucide-react';

// ============================================
// Constants
// ============================================

const COLORS = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  todo: '#8b5cf6',
  overdue: '#ef4444',
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981',
} as const;

// ============================================
// Types
// ============================================

interface StatCardProps {
  title: string;
  value: number;
  icon: JSX.Element;
  iconBg: string;
  trend?: {
    value: string;
    icon: JSX.Element;
    color: string;
  };
}

// ============================================
// Chart Skeleton Component
// ============================================

function ChartSkeleton(): JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <Skeleton variant="text" height={24} width={150} className="mb-4" />
      <div className="flex items-center justify-center" style={{ height: 200 }}>
        <Skeleton variant="rounded" width="100%" height={180} />
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({ title, value, icon, iconBg, trend }: StatCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.icon}
              <span className={`text-sm font-medium ${trend.color}`}>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function Analytics(): JSX.Element {
  const tasks = useTaskStore((state) => state.tasks);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const overdue = tasks.filter((t) => {
      if (t.due_date && t.status !== 'completed') {
        return new Date(t.due_date) < now;
      }
      return false;
    }).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
    };
  }, [tasks]);

  // Status data for pie chart
  const statusData = useMemo(() => [
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'In Progress', value: stats.inProgress, color: COLORS.inProgress },
    { name: 'To Do', value: stats.todo, color: COLORS.todo },
    { name: 'Overdue', value: stats.overdue, color: COLORS.overdue },
  ], [stats]);

  // Priority data for bar chart
  const priorityData = useMemo(() => {
    const urgent = tasks.filter((t) => t.priority === 'urgent').length;
    const high = tasks.filter((t) => t.priority === 'high').length;
    const medium = tasks.filter((t) => t.priority === 'medium').length;
    const low = tasks.filter((t) => t.priority === 'low').length;

    return [
      { name: 'Urgent', value: urgent, color: COLORS.urgent },
      { name: 'High', value: high, color: COLORS.high },
      { name: 'Medium', value: medium, color: COLORS.medium },
      { name: 'Low', value: low, color: COLORS.low },
    ];
  }, [tasks]);

  // Weekly data (deterministic)
  const weeklyData = useMemo(() => {
    const seed = 12345;
    let current = seed;

    function random(): number {
      current = (current * 16807) % 2147483647;
      return (current - 1) / 2147483646;
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return days.map((day, index) => ({
      name: day,
      value: Math.floor(random() * 10) + 1 + index,
    }));
  }, []);

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <PageHeader
          icon={<BarChart3 className="w-8 h-8" />}
          title="Analytics Dashboard"
          description="Loading your insights..."
        />
        
        {/* Stats Skeleton */}
        <StatCardSkeleton count={4} />
        
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        
        {/* Weekly Chart Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <Skeleton variant="text" height={24} width={150} className="mb-4" />
          <Skeleton variant="rounded" height={300} className="w-full" />
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader
          icon={<BarChart3 className="w-8 h-8" />}
          title="Analytics Dashboard"
          description="Track your productivity and insights"
        />
        <div className="mt-8">
          <EmptyState
            icon={<BarChart3 className="w-16 h-16" />}
            title="No data yet"
            description="Create some tasks to see your analytics and productivity insights"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <PageHeader
        icon={<BarChart3 className="w-8 h-8" />}
        title="Analytics Dashboard"
        description="Track your productivity and insights"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />}
          iconBg="bg-purple-100"
          trend={{
            value: '+12%',
            icon: <TrendingUp className="w-4 h-4 text-green-600" />,
            color: 'text-green-600',
          }}
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
          iconBg="bg-green-100"
          trend={{
            value: '+8%',
            icon: <TrendingUp className="w-4 h-4 text-green-600" />,
            color: 'text-green-600',
          }}
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
          iconBg="bg-blue-100"
          trend={{
            value: 'Active',
            icon: <Clock className="w-4 h-4 text-blue-600" />,
            color: 'text-blue-600',
          }}
        />

        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
          iconBg="bg-red-100"
          trend={{
            value: 'Needs attention',
            icon: <TrendingDown className="w-4 h-4 text-red-600" />,
            color: 'text-red-600',
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Completion Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate</h3>
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <div style={{ width: 150, height: 150 }}>
              <CircularProgressbar
                value={stats.completionRate}
                text={`${Math.round(stats.completionRate)}%`}
                styles={buildStyles({
                  textSize: '16px',
                  pathColor: '#8b5cf6',
                  textColor: '#1f2937',
                  trailColor: '#e5e7eb',
                })}
              />
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm mt-4">
            {stats.completionRate >= 50 ? 'Great progress! Keep it up!' : 'Keep pushing forward!'}
          </p>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-status-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Levels</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              name="Tasks Completed"
              dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}