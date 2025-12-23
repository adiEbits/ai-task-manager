import { Activity, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  user?: string;
}

export default function SystemLogs() {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-12-23 10:30:15',
      type: 'success',
      message: 'User login successful',
      user: 'john@example.com',
    },
    {
      id: '2',
      timestamp: '2025-12-23 10:28:42',
      type: 'info',
      message: 'AI task suggestion generated',
      user: 'jane@example.com',
    },
    {
      id: '3',
      timestamp: '2025-12-23 10:25:18',
      type: 'warning',
      message: 'High API usage detected',
    },
    {
      id: '4',
      timestamp: '2025-12-23 10:20:05',
      type: 'error',
      message: 'Email notification failed',
      user: 'test@example.com',
    },
    {
      id: '5',
      timestamp: '2025-12-23 10:15:33',
      type: 'success',
      message: 'Database backup completed',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 mt-1">Monitor system activity and events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          All Logs
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
          Errors Only
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
          Today
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
          Export
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="space-y-0">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-4 border-b border-gray-200 last:border-b-0 ${getBgColor(
                log.type
              )} border-l-4`}
            >
              <div className="flex items-start gap-3">
                {getIcon(log.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {log.message}
                    </span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  {log.user && (
                    <p className="text-sm text-gray-600">User: {log.user}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}