import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../../services/api';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle, Loader2, InboxIcon } from 'lucide-react';

interface Notif { id: string; title: string; message: string; type: string; link?: string; isRead: boolean; createdAt: string; }

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  INFO:    { icon: <Info className="h-4 w-4" />,          color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/20' },
  SUCCESS: { icon: <CheckCircle className="h-4 w-4" />,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  WARNING: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
  ERROR:   { icon: <XCircle className="h-4 w-4" />,       color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-950/20' },
};

export const MentorNotifications: React.FC = () => {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await mentorAPI.getMentorNotifications();
      setNotifs(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    try {
      await mentorAPI.markNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await mentorAPI.markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
    finally { setMarking(false); }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{notifs.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="flex items-center gap-2 px-3 py-2 text-sm text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors font-semibold"
          >
            {marking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            Mark All Read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <InboxIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${n.isRead ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70' : 'bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800 shadow-sm cursor-pointer hover:shadow-md'}`}
              >
                <div className={`h-9 w-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</p>
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
