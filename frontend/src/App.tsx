import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import Calendar from './pages/Calendar';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SystemLogs from './pages/SystemLogs';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Tasks />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />

          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/logs"
            element={
              <ProtectedRoute adminOnly>
                <SystemLogs />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;