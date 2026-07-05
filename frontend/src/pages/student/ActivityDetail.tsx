import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activityAPI } from '../../services/api';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText, Download, RotateCcw,
  Trash2, User, Calendar, Tag, Award, MessageSquare, ExternalLink, AlertCircle
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  uploadDate: string;
  credits: number;
  filePath: string | null;
  githubLink?: string | null;
  linkedinLink?: string | null;
  approvals: Array<{
    id: string;
    decision: string;
    feedback: string | null;
    reviewDate: string;
    mentor: { name: string; email: string };
  }>;
}

const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode; bg: string }> = {
  APPROVED:     { label: 'Approved',     classes: 'text-emerald-600 dark:text-emerald-400', icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-emerald-500/10 border-emerald-500/20' },
  REJECTED:     { label: 'Rejected',     classes: 'text-rose-600 dark:text-rose-400',       icon: <XCircle className="h-5 w-5" />,     bg: 'bg-rose-500/10 border-rose-500/20' },
  UNDER_REVIEW: { label: 'Under Review', classes: 'text-indigo-600 dark:text-indigo-400',   icon: <Clock className="h-5 w-5" />,       bg: 'bg-indigo-500/10 border-indigo-500/20' },
  SUBMITTED:    { label: 'Submitted',    classes: 'text-amber-600 dark:text-amber-400',     icon: <FileText className="h-5 w-5" />,    bg: 'bg-amber-500/10 border-amber-500/20' },
};

export const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await activityAPI.getActivityById(id!);
        setActivity(data);
      } catch {
        setError('Activity not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  const handleDelete = async () => {
    if (!activity) return;
    try {
      await activityAPI.deleteActivity(activity.id);
      navigate('/student/activities');
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
    </div>
  );

  if (error || !activity) return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <AlertCircle className="mx-auto h-12 w-12 text-rose-400 mb-4" />
      <p className="text-slate-500 dark:text-slate-400 mb-4">{error || 'Activity not found.'}</p>
      <button onClick={() => navigate('/student/activities')} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold">
        Back to Activities
      </button>
    </div>
  );

  const cfg = statusConfig[activity.status] || statusConfig.SUBMITTED;
  const latestApproval = activity.approvals?.[activity.approvals.length - 1];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back + Title */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/student/activities')}
          className="mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border ${cfg.classes} ${cfg.bg} mb-2`}>
            {cfg.icon} {cfg.label}
          </div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white leading-tight">
            {activity.title}
          </h2>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2.5">
            <Tag className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Type</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activity.type}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Award className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Credits</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activity.credits} cr</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Submitted</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {new Date(activity.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Description</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
          {activity.description}
        </p>
      </div>

      {/* External References Links */}
      {(activity.githubLink || activity.linkedinLink) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">External Links</h3>
          <div className="flex flex-wrap gap-3">
            {activity.githubLink && (
              <a
                href={activity.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub Repository
              </a>
            )}
            {activity.linkedinLink && (
              <a
                href={activity.linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                LinkedIn Reference
              </a>
            )}
          </div>
        </div>
      )}

      {/* File */}
      {activity.filePath && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Uploaded File</h3>
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                {activity.filePath.startsWith('http')
                  ? decodeURIComponent(activity.filePath.split('/').pop()?.replace(/^\d+-/, '') || 'Uploaded File')
                  : activity.filePath.replace(/^\d+-/, '')}
              </p>
              <p className="text-xs text-slate-400">Uploaded document</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a
                href={activity.filePath.startsWith('http') ? activity.filePath : `http://localhost:5000/uploads/${activity.filePath}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Preview
              </a>
              <a
                href={activity.filePath.startsWith('http') ? activity.filePath : `http://localhost:5000/uploads/${activity.filePath}`}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Approval History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Approval History
        </h3>
        {activity.approvals && activity.approvals.length > 0 ? (
          <div className="space-y-4">
            {activity.approvals.map((app, i) => (
              <div key={app.id} className="relative pl-6">
                {i < activity.approvals.length - 1 && (
                  <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                )}
                <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  app.decision === 'APPROVED' ? 'bg-emerald-500 border-emerald-500' :
                  app.decision === 'REJECTED' ? 'bg-rose-500 border-rose-500' :
                  'bg-amber-500 border-amber-500'
                }`}>
                  {app.decision === 'APPROVED' ? <CheckCircle className="h-2.5 w-2.5 text-white" /> :
                   app.decision === 'REJECTED' ? <XCircle className="h-2.5 w-2.5 text-white" /> :
                   <Clock className="h-2.5 w-2.5 text-white" />}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Prof. {app.mentor.name}
                      </span>
                      <span className={`ml-2 text-xs font-bold ${
                        app.decision === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' :
                        'text-rose-600 dark:text-rose-400'
                      }`}>
                        {app.decision}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(app.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    "{app.feedback || 'No feedback provided.'}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-sm">Awaiting mentor review</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {activity.status === 'REJECTED' && (
          <button
            onClick={() => navigate('/student/upload', { state: { resubmit: activity } })}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-amber-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            Resubmit Activity
          </button>
        )}
        {activity.filePath && (
          <a
            href={`http://localhost:5000/uploads/${activity.filePath}`}
            download
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand-300 font-semibold rounded-xl text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Download File
          </a>
        )}
        {(activity.status === 'SUBMITTED' || activity.status === 'REJECTED') && (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold rounded-xl text-sm transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-outfit font-bold text-slate-800 dark:text-white text-center mb-2">Delete Activity?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
