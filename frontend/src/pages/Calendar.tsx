import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Schedule and manage your tasks</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <CalendarIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Calendar Coming Soon
        </h3>
        <p className="text-gray-600">
          AI-powered calendar integration is under development
        </p>
      </div>
    </div>
  );
}