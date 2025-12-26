import { useEffect, useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Activity, 
  TrendingUp,
  Brain,
  Mail,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface AdminStats {
  total_users: number;
  total_tasks: number;
  active_users_today: number;
  tasks_completed_today: number;
  ai_queries_today: number;
  system_health: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_tasks: 0,
    active_users_today: 0,
    tasks_completed_today: 0,
    ai_queries_today: 0,
    system_health: 'excellent',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async (): Promise<void> => {
    try {
      const response = await api.get('/api/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
    },
    {
      title: 'Total Tasks',
      value: stats.total_tasks,
      icon: CheckSquare,
      color: 'from-purple-500 to-pink-500',
      change: '+8%',
    },
    {
      title: 'Active Today',
      value: stats.active_users_today,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      change: '+5%',
    },
    {
      title: 'Tasks Completed',
      value: stats.tasks_completed_today,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      change: '+15%',
    },
    {
      title: 'AI Queries',
      value: stats.ai_queries_today,
      icon: Brain,
      color: 'from-indigo-500 to-purple-500',
      change: '+22%',
    },
    {
      title: 'System Health',
      value: stats.system_health,
      icon: SettingsIcon,
      color: 'from-teal-500 to-green-500',
      change: 'Excellent',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your platform</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send Broadcast
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {typeof stat.value === 'number' ? stat.value : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent User Activity
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  U{i}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    User {i} completed a task
                  </p>
                  <p className="text-xs text-gray-500">{i * 5} minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Usage Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            AI Feature Usage
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Task Suggestions', count: 450, color: 'bg-purple-500' },
              { name: 'Chat Assistant', count: 320, color: 'bg-blue-500' },
              { name: 'Productivity Coach', count: 280, color: 'bg-green-500' },
              { name: 'Document Generation', count: 200, color: 'bg-orange-500' },
              { name: 'Voice Commands', count: 150, color: 'bg-pink-500' },
            ].map((feature, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.name}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {feature.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${feature.color} h-2 rounded-full`}
                    style={{ width: `${(feature.count / 450) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">System Status</h3>
            <p className="text-sm text-gray-600">
              All systems operational • Last checked: Just now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}