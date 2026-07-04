import React, { useEffect, useState } from 'react';
import { activityAPI } from '../services/api';
import { 
  CheckSquare, 
  History, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  User as UserIcon,
  Download,
  Check,
  AlertCircle,
  FolderMinus,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Activity {
  id: number;
  studentId: number;
  title: string;
  description: string;
  type: string;
  uploadDate: string;
  status: string;
  filePath: string | null;
  credits: number;
  student: {
    name: string;
    email: string;
    department: string;
  };
  approvals: Array<{
    id: number;
    decision: string;
    feedback: string | null;
    reviewDate: string;
  }>;
}

export const MentorDashboard: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [filterAssigned, setFilterAssigned] = useState(true);

  // Review Modal states
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [feedback, setFeedback] = useState('');
  const [modalType, setModalType] = useState<'APPROVE' | 'REJECT' | null>(null);

  // Selection states for Bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [filterAssigned]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data } = await activityAPI.getAllActivities({ filterAssigned });
      setActivities(data);
    } catch (err) {
      setError('Failed to load student submissions.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle review state to UNDER_REVIEW when mentor opens the activity card
  const handleOpenReview = async (act: Activity) => {
    setSelectedActivity(act);
    setFeedback('');
    if (act.status === 'SUBMITTED') {
      try {
        await activityAPI.reviewActivity(act.id);
        // Refresh local items
        setActivities(prev => 
          prev.map(a => a.id === act.id ? { ...a, status: 'UNDER_REVIEW' } : a)
        );
      } catch (err) {
        console.error('Failed to update status to under review:', err);
      }
    }
  };

  const handleDecisionSubmit = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedActivity) return;
    
    if (decision === 'REJECT' && !feedback.trim()) {
      alert('Feedback is required to reject an activity.');
      return;
    }

    try {
      if (decision === 'APPROVE') {
        await activityAPI.approveActivity(selectedActivity.id, feedback);
      } else {
        await activityAPI.rejectActivity(selectedActivity.id, feedback);
      }
      setSelectedActivity(null);
      setModalType(null);
      loadActivities();
    } catch (err) {
      alert('Failed to submit review decision.');
    }
  };

  // Bulk Actions
  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = (items: Activity[]) => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(x => x.id));
    }
  };

  const handleBulkApproveSubmit = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBulkApproving(true);
    try {
      await activityAPI.bulkApprove(selectedIds, bulkFeedback);
      setSelectedIds([]);
      setBulkFeedback('');
      loadActivities();
      alert('Selected activities approved successfully!');
    } catch (err) {
      alert('Bulk approval operation failed.');
    } finally {
      setIsBulkApproving(false);
    }
  };

  // Filtering lists
  const pendingItems = activities.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW'
  );
  
  const historyItems = activities.filter(
    (a) => a.status === 'APPROVED' || a.status === 'REJECTED'
  );

  const activeItems = activeTab === 'pending' ? pendingItems : historyItems;

  // Chart data calculations
  const totalApproved = historyItems.filter((a) => a.status === 'APPROVED').length;
  const totalRejected = historyItems.filter((a) => a.status === 'REJECTED').length;
  const totalPending = pendingItems.length;

  const chartData = [
    { name: 'Submitted (New)', count: pendingItems.filter(x => x.status === 'SUBMITTED').length, fill: '#f59e0b' },
    { name: 'Under Review', count: pendingItems.filter(x => x.status === 'UNDER_REVIEW').length, fill: '#6366f1' },
    { name: 'Approved', count: totalApproved, fill: '#10b981' },
    { name: 'Rejected', count: totalRejected, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Upper Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric banner */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
          <div className="space-y-3">
            <span className="bg-white/10 text-brand-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Faculty Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold">Faculty Dashboard</h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Assigned reviews load automatically based on student assignments. Review, approve, and send immediate feedback.
            </p>
          </div>
          
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="filterAssigned"
                checked={filterAssigned}
                onChange={(e) => setFilterAssigned(e.target.checked)}
                className="h-4.5 w-4.5 text-brand-600 rounded focus:ring-brand-500 bg-slate-800 border-slate-700"
              />
              <label htmlFor="filterAssigned" className="text-xs font-medium text-slate-200 cursor-pointer">
                Show only my assigned students
              </label>
            </div>
            <button 
              onClick={loadActivities}
              className="text-xs bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-xl font-bold transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Chart representation */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-44 text-sm">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Pending</span>
              <strong className="text-lg font-outfit text-amber-500">{totalPending}</strong>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Approved</span>
              <strong className="text-lg font-outfit text-emerald-500">{totalApproved}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div className="flex gap-2 bg-slate-50 dark:bg-slate-850 p-1.5 rounded-2xl">
            <button
              onClick={() => { setActiveTab('pending'); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <CheckSquare className="h-4.5 w-4.5" />
              Pending Review ({pendingItems.length})
            </button>
            <button
              onClick={() => { setActiveTab('history'); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <History className="h-4.5 w-4.5" />
              Review History ({historyItems.length})
            </button>
          </div>
        </div>

        {/* BULK ACTIONS HEADER (Only on Pending tab if elements selected) */}
        {activeTab === 'pending' && selectedIds.length > 0 && (
          <div className="mb-6 p-4 bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between transition-all">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected <strong>{selectedIds.length}</strong> activities for bulk approval
              </span>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Bulk feedback comments (optional)"
                value={bulkFeedback}
                onChange={(e) => setBulkFeedback(e.target.value)}
                className="flex-1 md:w-64 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
              />
              <button
                onClick={handleBulkApproveSubmit}
                disabled={isBulkApproving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1 flex-shrink-0"
              >
                <Check className="h-4 w-4" />
                Approve Checked
              </button>
            </div>
          </div>
        )}

        {/* Table representation */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading submissions...</div>
        ) : activeItems.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FolderMinus className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No submissions in this list.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {activeTab === 'pending' && (
                    <th className="py-4 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === activeItems.length && activeItems.length > 0}
                        onChange={() => handleSelectAllToggle(activeItems)}
                        className="h-4 w-4 text-brand-600 rounded bg-slate-100 border-slate-300 dark:bg-slate-850 dark:border-slate-700"
                      />
                    </th>
                  )}
                  <th className="py-4">Student</th>
                  <th className="py-4">Activity details</th>
                  <th className="py-4">Type</th>
                  <th className="py-4">Credits</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {activeItems.map((act) => (
                  <tr 
                    key={act.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    onClick={() => handleOpenReview(act)}
                  >
                    {activeTab === 'pending' && (
                      <td className="py-4.5 pl-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(act.id)}
                          onChange={() => handleSelectToggle(act.id)}
                          className="h-4 w-4 text-brand-600 rounded bg-slate-100 border-slate-300 dark:bg-slate-850 dark:border-slate-700"
                        />
                      </td>
                    )}
                    <td className="py-4.5 pr-2">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {act.student.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dept: {act.student.department}
                      </p>
                    </td>
                    <td className="py-4.5 pr-4">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {act.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                        {act.description}
                      </p>
                    </td>
                    <td className="py-4.5">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg">
                        {act.type}
                      </span>
                    </td>
                    <td className="py-4.5 font-medium text-sm text-slate-700 dark:text-slate-300">
                      {act.credits} cr
                    </td>
                    <td className="py-4.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        act.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        act.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        act.status === 'UNDER_REVIEW' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-4.5 text-right pr-4">
                      <button
                        className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        {activeTab === 'pending' ? 'Review' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INDIVIDUAL REVIEW DRAWER / MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
          <div 
            className="absolute inset-0"
            onClick={() => setSelectedActivity(null)}
          />
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold">
                    {selectedActivity.type}
                  </span>
                  <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mt-3">
                    {selectedActivity.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              {/* Student info card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/50">
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedActivity.student.name}</p>
                  <p className="text-xs text-slate-400">{selectedActivity.student.email} • Dept: {selectedActivity.student.department}</p>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {selectedActivity.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Proposed Credits</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-350 font-bold">
                    {selectedActivity.credits} Credits
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Upload Date</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-350 font-semibold">
                    {new Date(selectedActivity.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Attached file download bar */}
              {selectedActivity.filePath ? (
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate max-w-xs text-slate-700 dark:text-slate-300">
                        {selectedActivity.filePath.replace(/^\d+-/, '')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:5000/uploads/${selectedActivity.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-brand-600 dark:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 text-xs font-bold"
                  >
                    <Download className="h-4 w-4" />
                    Open File
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center gap-2 text-xs text-slate-400 italic">
                  <AlertCircle className="h-4 w-4 text-slate-300" />
                  No documents attached for this activity.
                </div>
              )}

              {/* Review History / Approvals if tab history */}
              {activeTab === 'history' && selectedActivity.approvals && selectedActivity.approvals.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800/50 pt-5 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Past Review Decision</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/35 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${
                        selectedActivity.approvals[0].decision === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {selectedActivity.approvals[0].decision}
                      </span>
                      <span className="text-slate-450">
                        {new Date(selectedActivity.approvals[0].reviewDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      "{selectedActivity.approvals[0].feedback || 'No comments left'}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Decision panel (Only if pending review) */}
            {activeTab === 'pending' && (
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Reviewer Comments & Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Provide constructive feedback, notes on improvement, or guidelines..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleDecisionSubmit('REJECT')}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="h-4.5 w-4.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecisionSubmit('APPROVE')}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
