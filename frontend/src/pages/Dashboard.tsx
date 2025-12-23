import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';  // ADD THIS
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const tasks = useTaskStore((state) => state.tasks);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };
  
  return (
 <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                {/* <p className="text-sm text-gray-600">Tasks: {tasks.length}</p>  */}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">{user?.full_name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}