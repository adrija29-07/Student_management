import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activityAPI } from '../../services/api';
import {
  User, Mail, BookOpen, Award, TrendingUp, Download, CheckCircle,
  XCircle, Clock, FileText, Target, Edit3, Save, X, Loader2
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  type: string;
  status: string;
  credits: number;
  uploadDate: string;
}

const TYPE_COLORS: Record<string, string> = {
  Workshop: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Internship: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  Project: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'Volunteer Work': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Sports: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  Certifications: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  Other: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export const ProgressTracking: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editDept, setEditDept] = useState(user?.department || '');
  const [saving, setSaving] = useState(false);

  const TARGET_CREDITS = 100;

  useEffect(() => {
    activityAPI.getMyActivities().then(({ data }) => {
      setActivities(data);
      setLoading(false);
    });
  }, []);

  const approved = activities.filter(a => a.status === 'APPROVED');
  const totalCredits = approved.reduce((s, a) => s + a.credits, 0);
  const progress = Math.min(Math.round((totalCredits / TARGET_CREDITS) * 100), 100);

  // Group by type
  const typeStats = activities.reduce<Record<string, { approved: number; total: number; credits: number }>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = { approved: 0, total: 0, credits: 0 };
    acc[a.type].total++;
    if (a.status === 'APPROVED') { acc[a.type].approved++; acc[a.type].credits += a.credits; }
    return acc;
  }, {});

  // Timeline (last 10 activities sorted by date)
  const timeline = [...activities]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 10);

  const handleDownloadReport = () => {
    const lines = [
      `EduTrack Progress Report`,
      `Student: ${user?.name}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `Overall: ${totalCredits}/${TARGET_CREDITS} credits (${progress}%)`,
      `Total Submissions: ${activities.length}`,
      `Approved: ${approved.length}`,
      `Pending: ${activities.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length}`,
      `Rejected: ${activities.filter(a => a.status === 'REJECTED').length}`,
      ``,
      `Activity Log:`,
      ...activities.map(a => `  - ${a.title} | ${a.type} | ${a.status} | ${a.credits} cr | ${new Date(a.uploadDate).toLocaleDateString()}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${user?.name}_Progress_Report.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Progress Tracking</h2>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm hover:border-brand-300 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile</h3>
            <button
              onClick={() => { setEditMode(!editMode); setEditName(user?.name || ''); setEditDept(user?.department || ''); }}
              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
            >
              {editMode ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex flex-col items-center mb-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg shadow-brand-500/20">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            {editMode ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="text-center font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            ) : (
              <p className="font-bold text-slate-800 dark:text-white text-center">{user?.name}</p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
              {editMode ? (
                <input
                  value={editDept}
                  onChange={e => setEditDept(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              ) : (
                <span className="text-slate-600 dark:text-slate-400">{user?.department || 'No department set'}</span>
              )}
            </div>
            {user?.mentor && (
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">Mentor: {user.mentor.name}</span>
              </div>
            )}
          </div>

          {editMode && (
            <button
              disabled={saving}
              className="mt-4 w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              onClick={async () => {
                setSaving(true);
                await new Promise(r => setTimeout(r, 800));
                setSaving(false);
                setEditMode(false);
              }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          )}
        </div>

        {/* Overall Progress */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progress Circle + Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">Overall Progress</h3>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <svg className="w-24 h-24">
                  <circle className="text-slate-100 dark:text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="48" cy="48" />
                  <circle
                    className="text-brand-600 dark:text-brand-400 transition-all duration-700"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progress) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="48"
                    cy="48"
                    transform="rotate(-90 48 48)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-outfit font-extrabold text-slate-800 dark:text-white">{progress}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Activities', value: activities.length, icon: <FileText className="h-4 w-4" />, color: 'text-slate-500' },
                    { label: 'Approved Credits', value: `${totalCredits} cr`, icon: <Award className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Target', value: `${TARGET_CREDITS} cr`, icon: <Target className="h-4 w-4" />, color: 'text-brand-600 dark:text-brand-400' },
                    { label: 'Remaining', value: `${Math.max(0, TARGET_CREDITS - totalCredits)} cr`, icon: <TrendingUp className="h-4 w-4" />, color: 'text-amber-600 dark:text-amber-400' },
                  ].map(s => (
                    <div key={s.label} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className={`mb-1 ${s.color}`}>{s.icon}</div>
                      <p className="text-xs text-slate-400">{s.label}</p>
                      <p className={`text-lg font-bold font-outfit ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* By Type */}
          {Object.keys(typeStats).length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Progress by Activity Type</h3>
              <div className="space-y-3">
                {Object.entries(typeStats).map(([type, stats]) => {
                  const pct = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[type] || TYPE_COLORS.Other}`}>
                            {type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{stats.approved}/{stats.total} approved • {stats.credits} cr</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Timeline</h3>
          <button onClick={() => navigate('/student/activities')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
            View All →
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No activities yet. Upload your first activity!</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-4">
              {timeline.map(act => (
                <div key={act.id} className="relative pl-10 flex items-start gap-3">
                  <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${
                    act.status === 'APPROVED' ? 'bg-emerald-500 border-emerald-500' :
                    act.status === 'REJECTED' ? 'bg-rose-500 border-rose-500' :
                    act.status === 'UNDER_REVIEW' ? 'bg-indigo-500 border-indigo-500' :
                    'bg-amber-500 border-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/student/activities/${act.id}`)}
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate block text-left"
                    >
                      {act.title}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{new Date(act.uploadDate).toLocaleDateString()}</span>
                      <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                      <span className={`text-xs font-semibold ${
                        act.status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' :
                        act.status === 'REJECTED' ? 'text-rose-600 dark:text-rose-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>{act.status}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{act.credits} cr</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
