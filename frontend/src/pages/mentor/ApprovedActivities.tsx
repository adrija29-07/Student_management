import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../../services/api';
import { CheckCircle, User, Award, AlertCircle, Loader2, Calendar, Eye } from 'lucide-react';

interface Approval {
  id: string;
  reviewDate: string;
  feedback: string | null;
  activity: {
    id: string;
    title: string;
    type: string;
    credits: number;
    filePath: string | null;
    student: { name: string; email: string; department: string | null };
  };
}

export const ApprovedActivities: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorAPI.getApprovedActivities()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-emerald-500" /> Approved Activities
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{data.length} activities approved by you</p>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No approved activities yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data.map(a => (
            <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{a.activity.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.activity.type}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      <Award className="h-3.5 w-3.5" /> {a.activity.credits} cr
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3 w-3" /> {a.activity.student.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" /> {new Date(a.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {a.feedback && <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1">"{a.feedback}"</p>}
                </div>
                <button
                  onClick={() => navigate(`/mentor/review/${a.activity.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
