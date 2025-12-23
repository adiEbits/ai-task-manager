import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  Sparkles, 
  Settings, 
  HelpCircle,
  Calendar,
  FileText,
  Users,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useState, type JSX, type ReactNode } from 'react';

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Sidebar(): JSX.Element {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const userMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: FileText, label: 'Documents', path: '/documents' },
  ];

  const adminMenuItems: MenuItem[] = [
    { icon: Shield, label: 'Admin Dashboard', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Activity, label: 'System Logs', path: '/admin/logs' },
  ];

  const commonMenuItems: MenuItem[] = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const renderNavLink = (item: MenuItem): ReactNode => {
    const isActive = location.pathname === item.path;
    
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`
          group flex items-center gap-3 px-4 py-3 rounded-xl
          transition-all duration-200 relative
          ${isActive
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
        
        {!isCollapsed && (
          <>
            <span className="font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`
                ml-auto px-2 py-0.5 text-xs font-semibold rounded-full
                ${isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'}
              `}>
                {item.badge}
              </span>
            )}
          </>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full opacity-50" />
        )}
      </NavLink>
    );
  };

  const renderSection = (section: MenuSection): ReactNode => (
    <div key={section.title} className="mb-6">
      {!isCollapsed && (
        <div className="mb-2 px-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {section.title}
          </p>
        </div>
      )}
      <div className="space-y-1">
        {section.items.map(renderNavLink)}
      </div>
    </div>
  );

  const sections: MenuSection[] = [
    ...(isAdmin() ? [{ title: 'Admin', items: adminMenuItems }] : []),
    { title: isAdmin() ? 'User Features' : 'Main', items: userMenuItems },
    { title: 'Other', items: commonMenuItems },
  ];

  return (
    <aside 
      className={`
        ${isCollapsed ? 'w-20' : 'w-64'} 
        bg-white border-r border-gray-200 h-screen fixed left-0 top-0 
        flex flex-col transition-all duration-300 z-40
      `}
    >
      {/* Logo */}
      <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900">AI Tasks</h2>
              <p className="text-xs text-gray-500">Smart Manager</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Badge */}
      {isAdmin() && !isCollapsed && (
        <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-900">Admin Mode</span>
          </div>
        </div>
      )}

      {isAdmin() && isCollapsed && (
        <div className="mx-2 mt-4 p-2 bg-violet-100 rounded-lg flex justify-center">
          <Shield className="w-5 h-5 text-violet-600" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {sections.map(renderSection)}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            w-full flex items-center justify-center gap-2 px-4 py-2.5
            text-gray-600 hover:text-gray-900 hover:bg-gray-100
            rounded-xl transition-all duration-200
          "
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}