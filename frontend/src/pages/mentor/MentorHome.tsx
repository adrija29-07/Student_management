import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../../services/api';
import {
  Users, Clock, CheckCircle, XCircle, Award, Upload,
  TrendingUp, ArrowRight, RefreshCw, Activity
} from 'lucide-react';

interface Stats {
  assignedStudentsCount: number;
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  totalCreditsApproved: number;
  recentUploads: number;
  activityByType: Record<string, number>;
  monthlyTrend: { month: string; count: number }[];
}

const StatCard: React.FC<{
  title: string; value: number | string; icon: React.ReactNode;
  gradient: string; sub?: string; onClick?: () => void;
}> = ({ title, value, icon, gradient, sub, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-3xl font-outfit font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
      </div>
      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
    <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/5" />
  </div>
);

export const MentorHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorAPI.getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
      </div>
    </div>
  );

  const activityTypes = stats ? Object.entries(stats.activityByType).sort((a, b) => b[1] - a[1]) : [];
  const maxCount = activityTypes.length ? Math.max(...activityTypes.map(([, c]) => c)) : 1;
  const maxTrend = stats?.monthlyTrend ? Math.max(...stats.monthlyTrend.map(m => m.count), 1) : 1;

  const typeColors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-indigo-500', 'bg-teal-500',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Mentor Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of your students and activities
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); mentorAPI.getDashboardStats().then(({ data }) => setStats(data)).finally(() => setLoading(false)); }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Students" value={stats?.assignedStudentsCount ?? 0}
          icon={<Users className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-violet-600 to-indigo-700"
          sub="Active students"
          onClick={() => navigate('/mentor/my-students')}
        />
        <StatCard
          title="Pending Verification" value={stats?.pendingCount ?? 0}
          icon={<Clock className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          sub="Awaiting your review"
          onClick={() => navigate('/mentor/review-queue')}
        />
        <StatCard
          title="Approved Today" value={stats?.approvedToday ?? 0}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          sub="Today's approvals"
        />
        <StatCard
          title="Rejected Today" value={stats?.rejectedToday ?? 0}
          icon={<XCircle className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          sub="Today's rejections"
        />
        <StatCard
          title="Total Credits Approved" value={stats?.totalCreditsApproved ?? 0}
          icon={<Award className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          sub="Across all students"
        />
        <StatCard
          title="Recent Uploads (7d)" value={stats?.recentUploads ?? 0}
          icon={<Upload className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
          sub="Last 7 days"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Activity Submissions</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {(stats?.monthlyTrend || []).map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {m.count > 0 ? m.count : ''}
                </span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-indigo-500 transition-all duration-500 min-h-[4px]"
                  style={{ height: `${Math.max((m.count / maxTrend) * 100, 4)}%` }}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Type Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Activity Category Breakdown</h3>
          </div>
          {activityTypes.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No activities yet</div>
          ) : (
            <div className="space-y-3">
              {activityTypes.slice(0, 5).map(([type, count], idx) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-24 truncate">{type}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${typeColors[idx % typeColors.length]} rounded-full transition-all duration-700`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Review Queue', path: '/mentor/review-queue', color: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
            { label: 'My Students', path: '/mentor/my-students', color: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400' },
            { label: 'Dept. Insights', path: '/mentor/insights', color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
            { label: 'Hackathon Teams', path: '/mentor/hackathon', color: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' },
            { label: 'Club Management', path: '/mentor/clubs', color: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-colors hover:opacity-80 ${action.color}`}
            >
              {action.label}
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
