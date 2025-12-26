/**
 * App.tsx
 * Main application component with routing and error boundaries
 * 
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { ErrorBoundary, PageErrorBoundary } from '@/components/common';

// Auth Feature
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';

// Tasks Feature
import Dashboard from '@/features/tasks/pages/Dashboard';
import Tasks from '@/features/tasks/pages/Tasks';

// AI Feature
import AIAssistant from '@/features/ai/pages/AIAssistant';

// Analytics Feature
import Analytics from '@/features/analytics/pages/Analytics';

// Admin Feature
import AdminDashboard from '@/features/admin/pages/Dashboard';

// Users Feature
import UserManagement from '@/features/users/pages/UserList';

// System Logs Feature
import SystemLogs from '@/features/system-logs/pages/LogList';

// Settings Feature
import Settings from '@/features/settings/pages/Settings';

// Calendar Feature
import Calendar from '@/features/calendar/pages/Calendar';

// Documents Feature
import Documents from '@/features/documents/pages/Documents';

// Help Feature
import Help from '@/features/help/pages/Help';
import type { JSX } from 'react';

// ============================================
// Types
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// ============================================
// Protected Route Component
// ============================================

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps): JSX.Element {
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

// ============================================
// App Component
// ============================================

function App(): JSX.Element {
  const isDev = import.meta.env.DEV;

  return (
    <ErrorBoundary showDetails={isDev}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="dashboard"
              element={
                <PageErrorBoundary pageName="Tasks">
                  <Tasks />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="tasks"
              element={
                <PageErrorBoundary pageName="Tasks">
                  <Tasks />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="analytics"
              element={
                <PageErrorBoundary pageName="Analytics">
                  <Analytics />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="ai-assistant"
              element={
                <PageErrorBoundary pageName="AI Assistant">
                  <AIAssistant />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="calendar"
              element={
                <PageErrorBoundary pageName="Calendar">
                  <Calendar />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="documents"
              element={
                <PageErrorBoundary pageName="Documents">
                  <Documents />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="settings"
              element={
                <PageErrorBoundary pageName="Settings">
                  <Settings />
                </PageErrorBoundary>
              }
            />
            
            <Route
              path="help"
              element={
                <PageErrorBoundary pageName="Help">
                  <Help />
                </PageErrorBoundary>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <PageErrorBoundary pageName="Admin Dashboard">
                    <AdminDashboard />
                  </PageErrorBoundary>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <PageErrorBoundary pageName="User Management">
                    <UserManagement />
                  </PageErrorBoundary>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="admin/logs"
              element={
                <ProtectedRoute adminOnly>
                  <PageErrorBoundary pageName="System Logs">
                    <SystemLogs />
                  </PageErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;