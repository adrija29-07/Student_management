import React, { useState, useEffect } from 'react';
import { mentorAPI } from '../../services/api';
import { CheckCircle, XCircle, Clock, Download, Eye, AlertCircle, Loader2, FileText } from 'lucide-react';
import { ActivityPreview } from '../../components/ActivityPreview';

interface Activity {
  id: string;
  title: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  type?: {
    name: string;
  };
  status: 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'UNDER_REVIEW';
  credits: number;
  filePath?: string;
  uploadDate: string;
  approvalNotes?: string;
}

export const ActivityVerification: React.FC = () => {
  const [status, setStatus] = useState<'all' | 'approved' | 'rejected' | 'pending'>('pending');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [status]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let data: any[] = [];
      
      if (status === 'approved') {
        const res = await mentorAPI.getApprovedActivities();
        data = res.data;
      } else if (status === 'rejected') {
        const res = await mentorAPI.getRejectedActivities();
        data = res.data;
      } else if (status === 'pending') {
        // Get submitted and under review
        data = []; // TODO: Add pending endpoint if needed
      } else {
        // Get all
        data = [];
      }
      
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (file: string | undefined, title: string) => {
    if (file) {
      setPreviewFile(file);
      setPreviewTitle(title);
      setShowPreview(true);
    }
  };

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Activity Verification</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and manage verified activities</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'pending' as const, label: 'Pending', icon: <Clock className="h-4 w-4" /> },
          { value: 'approved' as const, label: 'Approved', icon: <CheckCircle className="h-4 w-4" /> },
          { value: 'rejected' as const, label: 'Rejected', icon: <XCircle className="h-4 w-4" /> },
          { value: 'all' as const, label: 'All', icon: <AlertCircle className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              status === tab.value
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by title or student name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((activity) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">{activity.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      activity.status === 'APPROVED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : activity.status === 'REJECTED'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    }`}>
                      {activity.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                      {activity.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                      {activity.status !== 'APPROVED' && activity.status !== 'REJECTED' && <Clock className="h-3 w-3" />}
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Submitted by <span className="font-semibold">{activity.student.name}</span> ({activity.student.email})
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {activity.type && (
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {activity.type.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      ⭐ {activity.credits} credits
                    </span>
                    <span className="inline-flex items-center gap-1">
                      📅 {new Date(activity.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  {activity.approvalNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                      "{activity.approvalNotes}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {activity.filePath && (
                    <button
                      onClick={() => openPreview(activity.filePath, activity.title)}
                      className="p-2 hover:bg-brand-100 dark:hover:bg-brand-950 rounded-lg transition-colors text-brand-600 dark:text-brand-400"
                      title="Preview file"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {activity.filePath && (
                    <a
                      href={`http://localhost:5000/uploads/${activity.filePath}`}
                      download
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-950 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No activities found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <ActivityPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        filePath={previewFile}
        title={previewTitle}
      />
    </div>
  );
};
