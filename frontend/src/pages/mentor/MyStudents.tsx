import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../../services/api';
import {
  Search, User, Award, Clock, ChevronRight, RefreshCw,
  BookOpen, Building2, Star, AlertCircle
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  department: string | null;
  interestedFields: string[];
  totalCredits: number;
  pendingCount: number;
  totalActivities: number;
  recentActivity: { type: string; status: string; uploadDate: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
  SUBMITTED: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  UNDER_REVIEW: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400',
};

export const MyStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await mentorAPI.getStudents();
      setStudents(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const departments = ['All', ...Array.from(new Set(students.map(s => s.department).filter(Boolean))) as string[]];

  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const getAvatarColor = (name: string) => {
    const colors = ['from-violet-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-blue-500 to-cyan-600',
      'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">My Students</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} of {students.length} students</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2">
          <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border-0 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
        >
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Student Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No students found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(student => (
            <div
              key={student.id}
              onClick={() => navigate(`/mentor/students/${student.id}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getAvatarColor(student.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {getInitials(student.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{student.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors mt-1 flex-shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {student.department && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Building2 className="h-3.5 w-3.5" /> {student.department}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <BookOpen className="h-3.5 w-3.5" /> {student.totalActivities} activities
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Award className="h-3.5 w-3.5" /> {student.totalCredits} credits
                    </div>
                    {student.pendingCount > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> {student.pendingCount} pending
                      </div>
                    )}
                  </div>

                  {/* Interest tags */}
                  {student.interestedFields.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {student.interestedFields.slice(0, 4).map(f => (
                        <span key={f} className="px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-lg">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recent activity */}
                  {student.recentActivity && (
                    <div className="mt-2 flex items-center gap-2">
                      <Star className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Latest: {student.recentActivity.type}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[student.recentActivity.status] || STATUS_COLORS.SUBMITTED}`}>
                        {student.recentActivity.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
