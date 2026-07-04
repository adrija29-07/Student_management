import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityAPI } from '../../services/api';
import {
  Search, SortAsc, Clock, CheckCircle, XCircle, FileText,
  User, Calendar, ArrowRight, Filter, AlertCircle, ChevronRight
} from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  uploadDate: string;
  filePath: string | null;
  student: { id: number; name: string; email: string; department: string | null };
}

const getPriority = (uploadDate: string) => {
  const days = Math.floor((Date.now() - new Date(uploadDate).getTime()) / 86400000);
  if (days >= 5) return { label: 'High Priority', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' };
  if (days >= 2) return { label: 'Medium Priority', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' };
  return { label: 'Low Priority', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' };
};

const timeWaiting = (uploadDate: string) => {
  const diff = Date.now() - new Date(uploadDate).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

export const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');

  useEffect(() => {
    activityAPI.getAllActivities({ status: 'SUBMITTED', filterAssigned: true })
      .then(({ data }) => { setActivities(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activities
    .filter(a => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.student.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || a.type === typeFilter;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      const da = new Date(a.uploadDate).getTime();
      const db = new Date(b.uploadDate).getTime();
      return sortOrder === 'oldest' ? da - db : db - da;
    });

  const types = ['All', ...Array.from(new Set(activities.map(a => a.type)))];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Review Queue</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {activities.length} activities awaiting your review
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student or activity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
        </select>
        <button
          onClick={() => setSortOrder(s => s === 'oldest' ? 'newest' : 'oldest')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm transition-colors"
        >
          <SortAsc className="h-4 w-4" />
          {sortOrder === 'oldest' ? 'Oldest First' : 'Newest First'}
        </button>
      </div>

      {/* Activity Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-300 dark:text-emerald-800 mb-4" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">All caught up!</p>
          <p className="text-sm text-slate-400 mt-1">No pending activities in your review queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(act => {
            const priority = getPriority(act.uploadDate);
            const waiting = timeWaiting(act.uploadDate);
            return (
              <div
                key={act.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${priority.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full">{act.type}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Waiting: {waiting}
                      </span>
                    </div>

                    <h3 className="font-outfit font-bold text-slate-800 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {act.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-slate-600 dark:text-slate-400">{act.student.name}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>{act.student.department || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(act.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/mentor/review/${act.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-brand-500/20 whitespace-nowrap"
                    >
                      Review Now
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {act.filePath && (
                      <a
                        href={`http://localhost:5000/uploads/${act.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        File
                      </a>
                    )}
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
