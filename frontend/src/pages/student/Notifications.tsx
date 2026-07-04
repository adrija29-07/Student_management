import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../services/api';
import {
  Bell, CheckCircle, XCircle, Clock, Trash2, Eye, BellOff,
  Filter, Search, CheckCheck, Info, AlertTriangle
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const NOTIF_ICONS: Record<string, { icon: React.ReactNode; classes: string }> = {
  approved: { icon: <CheckCircle className="h-5 w-5" />, classes: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' },
  rejected:  { icon: <XCircle className="h-5 w-5" />,   classes: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30' },
  review:    { icon: <Clock className="h-5 w-5" />,      classes: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30' },
  info:      { icon: <Info className="h-5 w-5" />,       classes: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  warning:   { icon: <AlertTriangle className="h-5 w-5" />, classes: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' },
};

// Seed some sample notifications for demo
const seedNotifications = () => {
  const existing = localStorage.getItem('notifications');
  if (!existing) {
    const samples = [
      { id: '1', title: 'Activity Approved! 🎉', message: 'Your "Internship at TCS" activity has been APPROVED by Prof. Sharma.', type: 'approved', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), link: '/student/activities' },
      { id: '2', title: 'Activity Rejected', message: 'Your "Project Work" activity has been REJECTED. Feedback: Need more documentation.', type: 'rejected', read: false, createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), link: '/student/activities' },
      { id: '3', title: 'Review Started', message: 'Prof. Sharma has started reviewing your "Leadership Workshop" activity.', type: 'review', read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
      { id: '4', title: 'Reminder: Pending Activities', message: 'You have 2 activities pending review. The mentor will review them soon.', type: 'info', read: true, createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
    ];
    localStorage.setItem('notifications', JSON.stringify(samples));
  }
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');

  const loadNotifs = () => {
    seedNotifications();
    setNotifications(notificationAPI.getNotifications());
  };

  useEffect(() => { loadNotifs(); }, []);

  const markRead = (id: string) => {
    notificationAPI.markRead(id);
    loadNotifs();
  };

  const markAllRead = () => {
    notificationAPI.markAllRead();
    loadNotifs();
  };

  const deleteNotif = (id: string) => {
    notificationAPI.deleteNotification(id);
    loadNotifs();
  };

  const filtered = notifications
    .filter(n => filter === 'all' || !n.read)
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
    );

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{notifications.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm hover:border-brand-300 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <BellOff className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </p>
          <p className="text-sm text-slate-400">
            {filter === 'unread' ? 'No unread notifications.' : 'Notifications about your activities will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const cfg = NOTIF_ICONS[notif.type] || NOTIF_ICONS.info;
            return (
              <div
                key={notif.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all group ${
                  !notif.read
                    ? 'border-brand-200 dark:border-brand-800/50 shadow-sm shadow-brand-500/5'
                    : 'border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.classes}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {notif.link && (
                        <button
                          onClick={() => { markRead(notif.id); navigate(notif.link!); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View Activity
                        </button>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
