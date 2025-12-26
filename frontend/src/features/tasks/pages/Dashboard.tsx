/**
 * Dashboard Layout
 * Main layout wrapper with sidebar, header, command palette, and dark mode
 * 
 * @module features/tasks/pages/Dashboard
 */

import { useState, useRef, useEffect, useCallback, type JSX } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import Sidebar from '@/components/layout/Sidebar';
import { ThemeToggle } from '@/components/common';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  LogOut, 
  Bell, 
  Search,
  Sparkles,
  ChevronDown,
  Settings,
  User,
  Menu,
  X,
  Command
} from 'lucide-react';

export default function Dashboard(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const tasks = useTaskStore((state) => state.tasks);
  
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: useCallback(() => setShowCommandPalette(true), []),
    enabled: !showCommandPalette,
  });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (showMobileSidebar || showCommandPalette) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileSidebar, showCommandPalette]);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const handleSearchClick = (): void => {
    setShowCommandPalette(true);
  };

  const pendingTasks = safeTasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = safeTasks.filter((t) => t.status === 'in_progress').length;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors duration-300">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
            showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="relative">
            <Sidebar />
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
          {/* Header */}
          <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] sticky top-0 z-30 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex justify-between items-center gap-4">
                {/* Left side - Mobile menu + Search */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>

                  {/* Search - Opens Command Palette */}
                  <button
                    onClick={handleSearchClick}
                    className="relative flex-1 max-w-xl hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#252525] border border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 transition-all duration-200 text-left"
                  >
                    <Search className="w-5 h-5" />
                    <span className="flex-1">Search tasks...</span>
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700">
                      <Command className="w-3 h-3" />
                      <span>K</span>
                    </kbd>
                  </button>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {/* Quick Stats - Desktop only */}
                  <div className="hidden xl:flex items-center gap-3 mr-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{pendingTasks} pending</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{inProgressTasks} in progress</span>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <ThemeToggle size="md" />

                  {/* AI Quick Action */}
                  <button 
                    onClick={() => navigate('/ai-assistant')}
                    className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-500 dark:to-purple-500 text-white hover:from-violet-700 hover:to-purple-700 dark:hover:from-violet-600 dark:hover:to-purple-600 transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium text-sm hidden md:inline">AI Assistant</span>
                  </button>

                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 sm:p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      <Bell className="w-5 h-5" />
                      {pendingTasks > 0 && (
                        <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-[#2a2a2a] py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-[#2a2a2a]">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {pendingTasks > 0 ? (
                            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer transition-colors">
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                You have <span className="font-semibold">{pendingTasks} pending tasks</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Just now</p>
                            </div>
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 sm:pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {user?.full_name ? getInitials(user.full_name) : 'U'}
                        </span>
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[120px]">
                          {user?.full_name ?? 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user?.email}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-[#2a2a2a] py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user?.email}</p>
                        </div>
                        
                        <div className="py-1">
                          <button 
                            onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] flex items-center gap-3 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            Profile
                          </button>
                          <button 
                            onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] flex items-center gap-3 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            Settings
                          </button>
                          <button 
                            onClick={() => setShowCommandPalette(true)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-3">
                              <Command className="w-4 h-4 text-gray-400" />
                              Command Palette
                            </span>
                            <kbd className="text-xs text-gray-400">⌘K</kbd>
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-100 dark:border-[#2a2a2a] pt-1">
                          <button 
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Search - Opens Command Palette */}
              <div className="mt-3 sm:hidden">
                <button
                  onClick={handleSearchClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#252525] text-gray-500 dark:text-gray-400 text-left"
                >
                  <Search className="w-5 h-5" />
                  <span>Search tasks...</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
    </>
  );
}