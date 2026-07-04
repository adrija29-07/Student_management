import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityAPI } from '../../services/api';
import {
  Search, Filter, SortAsc, SortDesc, FileText, CheckCircle, XCircle,
  Clock, RotateCcw, Eye, Trash2, ChevronLeft, ChevronRight, Plus,
  UploadCloud, AlertCircle, Edit3
} from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  uploadDate: string;
  credits: number;
  filePath: string | null;
  approvals: Array<{ decision: string; feedback: string | null; reviewDate: string; mentor: { name: string } }>;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  APPROVED:     { label: 'Approved',    classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', icon: <CheckCircle className="h-3 w-3" /> },
  REJECTED:     { label: 'Rejected',    classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',             icon: <XCircle className="h-3 w-3" /> },
  UNDER_REVIEW: { label: 'Under Review',classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',     icon: <Clock className="h-3 w-3" /> },
  SUBMITTED:    { label: 'Submitted',   classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',         icon: <FileText className="h-3 w-3" /> },
};

const ACTIVITY_TYPES = ['All', 'Workshop', 'Internship', 'Project', 'Volunteer Work', 'Sports', 'Certifications'];
const PAGE_SIZE = 6;

export const MyActivities: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'alpha'>('newest');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadActivities(); }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data } = await activityAPI.getMyActivities();
      setActivities(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await activityAPI.deleteActivity(id);
      setActivities(p => p.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch { /* ignore */ }
  };

  const filtered = activities
    .filter(a => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                          a.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchType = typeFilter === 'All' || a.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      if (sort === 'oldest') return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      return a.title.localeCompare(b.title);
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">My Activities</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {activities.length} total submissions
          </p>
        </div>
        <button
          onClick={() => navigate('/student/upload')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Upload Activity
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="All">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">A-Z</option>
        </select>
      </div>

      {/* Activity Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {search || statusFilter !== 'All' || typeFilter !== 'All'
              ? 'No activities match your filters.'
              : 'You haven\'t submitted any activities yet.'}
          </p>
          <button
            onClick={() => navigate('/student/upload')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Upload Your First Activity
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map(act => {
            const statusCfg = STATUS_CONFIG[act.status] || STATUS_CONFIG.SUBMITTED;
            const latestFeedback = act.approvals?.[act.approvals.length - 1];
            return (
              <div
                key={act.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full">
                        {act.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {act.credits} credit{act.credits !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                      {act.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {act.description}
                    </p>
                    {act.status === 'REJECTED' && latestFeedback?.feedback && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">Feedback: {latestFeedback.feedback}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Submitted {new Date(act.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/student/activities/${act.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-xl transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {act.status === 'REJECTED' && (
                      <button
                        onClick={() => navigate('/student/upload', { state: { resubmit: act } })}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 rounded-xl transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Resubmit
                      </button>
                    )}
                    {(act.status === 'SUBMITTED' || act.status === 'REJECTED') && (
                      <button
                        onClick={() => setDeleteConfirm(act.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
                  page === i + 1
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-outfit font-bold text-slate-800 dark:text-white text-center mb-2">Delete Activity?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This action cannot be undone. The activity and all its files will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
