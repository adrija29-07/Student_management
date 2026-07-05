import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../../services/api';
import { TrendingUp, Award, Users, BookOpen, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface StudentRank {
  id: string;
  name: string;
  department: string | null;
  totalCredits: number;
  activityCount: number;
}

interface Insights {
  totalStudents: number;
  avgCredits: number;
  topStudents: StudentRank[];
  bottomStudents: StudentRank[];
  typeBreakdown: Record<string, number>;
  interestBreakdown: Record<string, number>;
  studentRankings: StudentRank[];
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];

export const DepartmentInsights: React.FC = () => {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    mentorAPI.getDepartmentInsights()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
    </div>
  );

  if (!data) return (
    <div className="text-center py-16">
      <AlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-3" />
      <p className="text-slate-500">Could not load insights.</p>
    </div>
  );

  const typeEntries = Object.entries(data.typeBreakdown).sort((a, b) => b[1] - a[1]);
  const interestEntries = Object.entries(data.interestBreakdown).sort((a, b) => b[1] - a[1]);
  const maxType = typeEntries.length ? Math.max(...typeEntries.map(([, c]) => c)) : 1;
  const maxInterest = interestEntries.length ? Math.max(...interestEntries.map(([, c]) => c)) : 1;

  const sorted = [...data.studentRankings].sort((a, b) =>
    sortDir === 'desc' ? b.totalCredits - a.totalCredits : a.totalCredits - b.totalCredits
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Department Insights</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Analytics for your assigned students</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { title: 'Total Students', value: data.totalStudents, icon: <Users className="h-5 w-5 text-violet-500" />, color: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800' },
          { title: 'Avg Credits (Approved)', value: data.avgCredits, icon: <Award className="h-5 w-5 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' },
          { title: 'Activity Categories', value: typeEntries.length, icon: <BookOpen className="h-5 w-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' },
        ].map(card => (
          <div key={card.title} className={`rounded-2xl p-5 border ${card.color}`}>
            <div className="flex items-center gap-2 mb-1">{card.icon}<p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{card.title}</p></div>
            <p className="text-3xl font-outfit font-bold text-slate-800 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Types */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-500" /> Activity Types Distribution
          </h3>
          {typeEntries.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No approved activities yet</p>
          ) : (
            <div className="space-y-3">
              {typeEntries.map(([type, count], i) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 w-28 truncate">{type}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxType) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-5">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interest Fields */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" /> Student Interest Fields
          </h3>
          {interestEntries.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No interest data</p>
          ) : (
            <div className="space-y-3">
              {interestEntries.slice(0, 7).map(([field, count], i) => (
                <div key={field} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: COLORS[(i + 2) % COLORS.length] }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 w-28 truncate">{field}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxInterest) * 100}%`, background: COLORS[(i + 2) % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-5">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student Rankings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Rankings by Credits</h3>
          <button
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            {sortDir === 'desc' ? <><ChevronDown className="h-3.5 w-3.5" /> Highest First</> : <><ChevronUp className="h-3.5 w-3.5" /> Lowest First</>}
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sorted.map((student, idx) => (
            <div key={student.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className={`text-xs font-bold w-6 text-center rounded-full py-0.5 ${idx === 0 ? 'text-amber-600 dark:text-amber-400' : idx === 1 ? 'text-slate-500 dark:text-slate-400' : idx === 2 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-600'}`}>
                #{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{student.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{student.department || 'No dept.'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{student.totalCredits} cr</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{student.activityCount} activities</p>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No student data available</div>
          )}
        </div>
      </div>
    </div>
  );
};
