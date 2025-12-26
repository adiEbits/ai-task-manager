/**
 * Sidebar Component
 * Navigation sidebar with dark mode support
 * 
 * @module components/layout/Sidebar
 */

import { type JSX } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Sparkles,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Shield,
  Users,
  FileCode,
  Zap,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { path: '/ai-assistant', label: 'AI Assistant', icon: <Sparkles className="w-5 h-5" /> },
  { path: '/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
  { path: '/documents', label: 'Documents', icon: <FileText className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'Admin Dashboard', icon: <Shield className="w-5 h-5" />, adminOnly: true },
  { path: '/admin/users', label: 'User Management', icon: <Users className="w-5 h-5" />, adminOnly: true },
  { path: '/admin/logs', label: 'System Logs', icon: <FileCode className="w-5 h-5" />, adminOnly: true },
];

const bottomNavItems: NavItem[] = [
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { path: '/help', label: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
];

export default function Sidebar(): JSX.Element {
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const isActiveRoute = (path: string): boolean => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const NavLinkItem = ({ item }: { item: NavItem }): JSX.Element => (
    <NavLink
      to={item.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActiveRoute(item.path)
          ? 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/30'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <span className={isActiveRoute(item.path) ? 'text-violet-600 dark:text-violet-400' : ''}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col z-40 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Tasks</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage smarter</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Main Menu
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLinkItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin() && (
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Admin
            </p>
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLinkItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Features
          </p>
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLinkItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a]">
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Powered</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Smart task management</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}