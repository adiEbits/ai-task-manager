/**
 * Command Palette Component
 * VS Code-style command palette with keyboard shortcuts
 * 
 * @module components/common/CommandPalette
 */

import { useState, useEffect, useRef, useMemo, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Sparkles,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Users,
  Shield,
  FileCode,
  Plus,
  Moon,
  Sun,
  LogOut,
  Command,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

// ============================================
// Types
// ============================================

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: JSX.Element;
  shortcut?: string[];
  action: () => void;
  category: 'navigation' | 'action' | 'settings';
  adminOnly?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// Component
// ============================================

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps): JSX.Element | null {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { toggleTheme, getResolvedTheme } = useThemeStore();
  
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const resolvedTheme = getResolvedTheme();

  // ============================================
  // Commands
  // ============================================

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View your task overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      shortcut: ['G', 'D'],
      action: () => { navigate('/dashboard'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-tasks',
      label: 'Go to Tasks',
      description: 'Manage your tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      shortcut: ['G', 'T'],
      action: () => { navigate('/tasks'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      description: 'View productivity insights',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: ['G', 'A'],
      action: () => { navigate('/analytics'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-ai',
      label: 'Go to AI Assistant',
      description: 'Get AI-powered help',
      icon: <Sparkles className="w-4 h-4" />,
      shortcut: ['G', 'I'],
      action: () => { navigate('/ai-assistant'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'View your schedule',
      icon: <Calendar className="w-4 h-4" />,
      shortcut: ['G', 'C'],
      action: () => { navigate('/calendar'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-documents',
      label: 'Go to Documents',
      description: 'Manage your files',
      icon: <FileText className="w-4 h-4" />,
      action: () => { navigate('/documents'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Configure your preferences',
      icon: <Settings className="w-4 h-4" />,
      shortcut: ['G', 'S'],
      action: () => { navigate('/settings'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-help',
      label: 'Go to Help',
      description: 'Get help and support',
      icon: <HelpCircle className="w-4 h-4" />,
      shortcut: ['?'],
      action: () => { navigate('/help'); onClose(); },
      category: 'navigation',
    },
    // Admin Navigation
    {
      id: 'nav-admin',
      label: 'Go to Admin Dashboard',
      description: 'Admin overview',
      icon: <Shield className="w-4 h-4" />,
      action: () => { navigate('/admin'); onClose(); },
      category: 'navigation',
      adminOnly: true,
    },
    {
      id: 'nav-users',
      label: 'Go to User Management',
      description: 'Manage users',
      icon: <Users className="w-4 h-4" />,
      action: () => { navigate('/admin/users'); onClose(); },
      category: 'navigation',
      adminOnly: true,
    },
    {
      id: 'nav-logs',
      label: 'Go to System Logs',
      description: 'View system logs',
      icon: <FileCode className="w-4 h-4" />,
      action: () => { navigate('/admin/logs'); onClose(); },
      category: 'navigation',
      adminOnly: true,
    },
    // Actions
    {
      id: 'action-new-task',
      label: 'Create New Task',
      description: 'Add a new task',
      icon: <Plus className="w-4 h-4" />,
      shortcut: ['Ctrl', 'N'],
      action: () => { navigate('/tasks?new=true'); onClose(); },
      category: 'action',
    },
    // Settings
    {
      id: 'settings-theme',
      label: resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle theme',
      icon: resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      shortcut: ['Ctrl', 'Shift', 'L'],
      action: () => { toggleTheme(); onClose(); },
      category: 'settings',
    },
    {
      id: 'action-logout',
      label: 'Sign Out',
      description: 'Log out of your account',
      icon: <LogOut className="w-4 h-4" />,
      action: () => { logout(); navigate('/login'); onClose(); },
      category: 'action',
    },
  ], [navigate, onClose, logout, toggleTheme, resolvedTheme]);

  // Filter commands based on query and admin status
  const filteredCommands = useMemo(() => {
    return commands.filter((cmd) => {
      // Filter admin-only commands
      if (cmd.adminOnly && !isAdmin()) return false;
      
      // Filter by query
      if (!query) return true;
      
      const searchQuery = query.toLowerCase();
      return (
        cmd.label.toLowerCase().includes(searchQuery) ||
        cmd.description?.toLowerCase().includes(searchQuery)
      );
    });
  }, [commands, query, isAdmin]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      settings: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // ============================================
  // Effects
  // ============================================

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // ============================================
  // Render
  // ============================================

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    action: 'Actions',
    settings: 'Settings',
  };

  let flatIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed inset-x-4 top-[20%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-50">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-base"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
              ESC
            </kbd>
          </div>

          {/* Command List */}
          <div 
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto py-2"
          >
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No commands found for "{query}"
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => {
                if (items.length === 0) return null;

                return (
                  <div key={category} className="mb-2">
                    {/* Category Label */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {categoryLabels[category]}
                    </div>

                    {/* Items */}
                    {items.map((cmd) => {
                      flatIndex++;
                      const currentIndex = flatIndex;
                      const isSelected = selectedIndex === currentIndex;

                      return (
                        <button
                          key={cmd.id}
                          data-index={currentIndex}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          {/* Icon */}
                          <div className={`flex-shrink-0 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                            {cmd.icon}
                          </div>

                          {/* Label & Description */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{cmd.label}</div>
                            {cmd.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {cmd.description}
                              </div>
                            )}
                          </div>

                          {/* Shortcut */}
                          {cmd.shortcut && (
                            <div className="hidden sm:flex items-center gap-1">
                              {cmd.shortcut.map((key, i) => (
                                <kbd
                                  key={i}
                                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-400 font-mono"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}

                          {/* Arrow indicator for selected */}
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#151515]">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>Command Palette</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}