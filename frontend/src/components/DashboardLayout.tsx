import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  GraduationCap,
  FileText,
  Upload,
  TrendingUp,
  Bell,
  ClipboardList,
  UserCheck,
  Shield,
  FileCog,
  History,
  ChevronRight,
  CheckCircle,
  XCircle,
  PieChart,
  Rocket,
  Music,
  Calendar,
} from 'lucide-react';
import { notificationAPI } from '../services/api';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const notifs = notificationAPI.getNotifications();
    setUnreadCount(notifs.filter((n: any) => !n.read).length);
    const interval = setInterval(() => {
      const n = notificationAPI.getNotifications();
      setUnreadCount(n.filter((x: any) => !x.read).length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigationItems: SidebarItem[] = [
    // STUDENT
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'My Activities', path: '/student/activities', icon: <FileText className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Upload Activity', path: '/student/upload', icon: <Upload className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Progress', path: '/student/progress', icon: <TrendingUp className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Reports', path: '/student/reports', icon: <BarChart3 className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Notifications', path: '/student/notifications', icon: <Bell className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Settings', path: '/student/settings', icon: <Settings className="h-4 w-4" />, roles: ['STUDENT'] },
    // FACULTY
    { name: 'Dashboard', path: '/faculty/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['FACULTY'] },
    // MENTOR
    { name: 'Dashboard', path: '/mentor/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['MENTOR'] },
    { name: 'Review Queue', path: '/mentor/review-queue', icon: <ClipboardList className="h-4 w-4" />, roles: ['MENTOR'] },
    { name: 'My Students', path: '/mentor/my-students', icon: <UserCheck className="h-4 w-4" />, roles: ['MENTOR'] },
    { name: 'Reports', path: '/mentor/reports', icon: <BarChart3 className="h-4 w-4" />, roles: ['MENTOR'] },
    { name: 'Notifications', path: '/mentor/notifications', icon: <Bell className="h-4 w-4" />, roles: ['MENTOR'] },
    { name: 'Settings', path: '/mentor/settings', icon: <Settings className="h-4 w-4" />, roles: ['MENTOR'] },
    // ADMIN
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['ADMIN'] },
    { name: 'User Management', path: '/admin/users', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart3 className="h-4 w-4" />, roles: ['ADMIN'] },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: <History className="h-4 w-4" />, roles: ['ADMIN'] },
    { name: 'System Settings', path: '/admin/settings', icon: <FileCog className="h-4 w-4" />, roles: ['ADMIN'] },
  ];

  const pageTitles: Record<string, string> = {
    '/student/dashboard': 'Student Dashboard',
    '/student/activities': 'My Activities',
    '/student/upload': 'Upload Activity',
    '/student/progress': 'Progress Tracking',
    '/student/reports': 'My Reports',
    '/student/notifications': 'Notifications',
    '/student/settings': 'Settings',
    '/faculty/dashboard': 'Faculty Dashboard',
    '/mentor/dashboard': 'Mentor Dashboard',
    '/mentor/review-queue': 'Review Queue',
    '/mentor/review': 'Review Activity',
    '/mentor/my-students': 'My Students',
    // Removed: Activity Verification, Club & Teams, Department Insights, Events
    '/mentor/notifications': 'Notifications',
    '/mentor/reports': 'Reports',
    '/mentor/settings': 'Settings',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'User Management',
    '/admin/reports': 'Reports',
    '/admin/audit-logs': 'Audit Logs',
    '/admin/settings': 'System Settings',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeItems = navigationItems.filter(item => item.roles.includes(user?.role || ''));
  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Dashboard';

  const SidebarContent = () => (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="p-3 space-y-0.5">
          {activeItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/student/dashboard' && item.path !== '/mentor/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            const isNotif = item.path === '/student/notifications';
            return (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
                {isNotif && unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isActive && <ChevronRight className="h-3 w-3 opacity-60 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 uppercase">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate uppercase font-semibold">
              {user?.role}{user?.department ? ` - ${user.department}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 md:w-56 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-slate-200 dark:border-slate-800">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-tight text-slate-800 dark:text-white">EduTrack</span>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex flex-col w-full max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-outfit font-bold text-lg text-slate-800 dark:text-white">EduTrack</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-outfit font-semibold text-base text-slate-800 dark:text-slate-100">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell (student only) */}
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => navigate('/student/notifications')}
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.name}
                </span>
                {user?.department && (
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 -mt-0.5">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
