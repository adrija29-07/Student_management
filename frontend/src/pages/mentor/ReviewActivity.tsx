import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activityAPI } from '../../services/api';
import { CheckCircle, XCircle, FileText, User, Calendar, Loader2, AlertTriangle } from 'lucide-react';

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

export const ReviewActivity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REVISION'>('APPROVED');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const activityId = Number(id);
    activityAPI.getActivityById(activityId)
      .then(({ data }) => {
        setActivity(data);
        setLoading(false);
        // Automatically transition to UNDER_REVIEW if currently SUBMITTED
        if (data.status === 'SUBMITTED') {
          activityAPI.reviewActivity(activityId)
            .then(() => {
              setActivity(prev => prev ? { ...prev, status: 'UNDER_REVIEW' } : null);
            })
            .catch(err => console.error('Failed to transition to review status:', err));
        }
      })
      .catch(() => { setError('Failed to load activity'); setLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    setSubmitting(true);
    try {
      if (decision === 'APPROVED') {
        await activityAPI.approveActivity(activity.id, feedback);
      } else if (decision === 'REJECTED') {
        await activityAPI.rejectActivity(activity.id, feedback);
      } else if (decision === 'REVISION') {
        await activityAPI.requestRevision(activity.id, feedback);
      }
      navigate('/mentor/review-queue');
    } catch {
      setError('Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        {error}
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Review Activity</h2>
      <section className="border-b pb-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Student Information</h3>
        <div className="flex items-center gap-3 mt-2">
          <User className="h-5 w-5 text-slate-500" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{activity.student.name}</span>
          <span className="text-slate-500">· {activity.student.department || 'No department'}</span>
          <span className="text-slate-500">· {activity.student.email}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          Submitted on {new Date(activity.uploadDate).toLocaleDateString()}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Activity Details</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400"><strong>{activity.title}</strong> ({activity.type})</p>
        <p className="mt-2 text-slate-600 dark:text-slate-400 whitespace-pre-line">{activity.description}</p>
        {activity.filePath && (
          <a
            href={`http://localhost:5000/uploads/${activity.filePath}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center mt-3 text-brand-600 hover:underline"
          >
            <FileText className="h-4 w-4 mr-1" />
            View Attached File
          </a>
        )}
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mentor Feedback (public)</label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Enter feedback visible to the student..."
            required
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Decision</span>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="decision"
                value="APPROVED"
                checked={decision === 'APPROVED'}
                onChange={() => setDecision('APPROVED')}
                className="h-4 w-4 text-brand-600 border-slate-300"
              />
              <span className="text-slate-700 dark:text-slate-300">Approve</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="decision"
                value="REJECTED"
                checked={decision === 'REJECTED'}
                onChange={() => setDecision('REJECTED')}
                className="h-4 w-4 text-brand-600 border-slate-300"
              />
              <span className="text-slate-700 dark:text-slate-300">Reject</span>
              <XCircle className="h-5 w-5 text-rose-500" />
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="decision"
                value="REVISION"
                checked={decision === 'REVISION'}
                onChange={() => setDecision('REVISION')}
                className="h-4 w-4 text-brand-600 border-slate-300"
              />
              <span className="text-slate-700 dark:text-slate-300">Request Revision</span>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Submit Decision
        </button>
      </form>
    </div>
  );
};
