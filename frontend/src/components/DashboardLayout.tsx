import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  FileText,
  Upload,
  TrendingUp,
  Bell,
  ClipboardList,
  UserCheck,
  FileCog,
  History,
  ChevronRight,
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notifs = notificationAPI.getNotifications();
    setUnreadCount(notifs.filter((n: any) => !n.read).length);
    const interval = setInterval(() => {
      const n = notificationAPI.getNotifications();
      setUnreadCount(n.filter((x: any) => !x.read).length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems: SidebarItem[] = [
    // STUDENT
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'My Activities', path: '/student/activities', icon: <FileText className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Upload Activity', path: '/student/upload', icon: <Upload className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Progress', path: '/student/progress', icon: <TrendingUp className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Reports', path: '/student/reports', icon: <BarChart3 className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Notifications', path: '/student/notifications', icon: <Bell className="h-4 w-4" />, roles: ['STUDENT'] },
    { name: 'Settings', path: '/student/settings', icon: <Settings className="h-4 w-4" />, roles: ['STUDENT'] },
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
    '/mentor/dashboard': 'Mentor Dashboard',
    '/mentor/review-queue': 'Review Queue',
    '/mentor/review': 'Review Activity',
    '/mentor/my-students': 'My Students',
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

  const deptColor = user?.department === 'CSE' ? '#3b82f6'
    : user?.department === 'IT' ? '#8b5cf6'
    : user?.department === 'ECE' ? '#10b981'
    : user?.department === 'MECH' ? '#f59e0b'
    : user?.department === 'CIVIL' ? '#ef4444'
    : '#2563eb';

  const SidebarContent = () => (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="p-3 space-y-0.5 mt-2">
          {activeItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/student/dashboard' && item.path !== '/mentor/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            const isNotif = item.path === '/student/notifications' || item.path === '/mentor/notifications';
            return (
              <button
                key={item.name + item.path}
                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-300'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.name}</span>
                {isNotif && unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-300 rounded-full" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Card at bottom */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${deptColor}, #1e40af)` }}
          >
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-white uppercase">{user?.name}</p>
            <p className="text-xs text-blue-200 truncate font-semibold">
              {user?.role}{user?.department ? ` · ${user.department}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-300 rounded-xl hover:bg-white/10 hover:text-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4ff' }}>
      {/* Desktop Sidebar — Dark Navy */}
      <aside
        className="hidden md:flex md:flex-shrink-0 md:w-56 flex-col transition-colors duration-200"
        style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2748 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
          <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-tight text-white">EduTrack</span>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div
            className="relative flex flex-col w-full max-w-xs"
            style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2748 100%)' }}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-outfit font-bold text-lg text-white">EduTrack</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-blue-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-blue-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-outfit font-semibold text-base text-slate-800">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            {(user?.role === 'STUDENT' || user?.role === 'MENTOR') && (
              <button
                onClick={() => navigate(user?.role === 'STUDENT' ? '/student/notifications' : '/mentor/notifications')}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-blue-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 border-l border-blue-100 pl-3 ml-1">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${deptColor}, #1d4ed8)` }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
                {user?.department && (
                  <span className="text-[10px] uppercase font-bold text-blue-500 -mt-0.5">
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
