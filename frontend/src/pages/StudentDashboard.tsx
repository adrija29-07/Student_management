import React, { useEffect, useState, useRef } from 'react';
import { activityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  Download, 
  Award,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  type: string;
  uploadDate: string;
  status: string;
  filePath: string | null;
  credits: number;
  approvals: Array<{
    id: number;
    decision: string;
    feedback: string | null;
    reviewDate: string;
    mentor: {
      name: string;
      email: string;
    };
  }>;
  githubLink?: string | null;
  linkedinLink?: string | null;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Upload Form states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Workshop');
  const [credits, setCredits] = useState('1');
  const [file, setFile] = useState<File | null>(null);
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  
  // Resubmission states
  const [resubmittingActivity, setResubmittingActivity] = useState<Activity | null>(null);

  // Selected Activity details drawer
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetCredits = 100;

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data } = await activityAPI.getMyActivities();
      setActivities(data);
    } catch (err) {
      setError('Failed to load your activities.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description || !type) {
      setError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('credits', credits);
    if (githubLink) formData.append('githubLink', githubLink);
    if (linkedinLink) formData.append('linkedinLink', linkedinLink);
    if (file) {
      formData.append('file', file);
    }

    try {
      await activityAPI.uploadActivity(formData);
      setIsUploadOpen(false);
      resetForm();
      loadActivities();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Ensure file format is valid.');
    }
  };

  const handleResubmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmittingActivity) return;

    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('credits', credits);
    if (githubLink) formData.append('githubLink', githubLink);
    if (linkedinLink) formData.append('linkedinLink', linkedinLink);
    if (file) {
      formData.append('file', file);
    }

    try {
      await activityAPI.resubmitActivity(resubmittingActivity.id, formData);
      setResubmittingActivity(null);
      resetForm();
      loadActivities();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Resubmission failed.');
    }
  };

  const startResubmit = (act: Activity) => {
    setResubmittingActivity(act);
    setTitle(act.title);
    setDescription(act.description);
    setType(act.type);
    setCredits(act.credits.toString());
    setGithubLink(act.githubLink || '');
    setLinkedinLink(act.linkedinLink || '');
    setFile(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('Workshop');
    setCredits('1');
    setGithubLink('');
    setLinkedinLink('');
    setFile(null);
  };

  // Stats Calculations
  const totalSubmissions = activities.length;
  const approvedCredits = activities
    .filter((a) => a.status === 'APPROVED')
    .reduce((sum, a) => sum + a.credits, 0);
  
  const pendingCount = activities.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW'
  ).length;

  const rejectedCount = activities.filter((a) => a.status === 'REJECTED').length;
  
  const progressPercent = Math.min(Math.round((approvedCredits / targetCredits) * 100), 100);

  // Generate Certificate on Canvas
  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !user) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Classic ivory background
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, 800, 600);

    // Elegant Outer Border (Navy)
    ctx.strokeStyle = '#1e3a8a'; // blue-900
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 760, 560);

    // Elegant Inner Border (Gold)
    ctx.strokeStyle = '#b45309'; // amber-700
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 728, 528);

    // Corner decorative squares
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(20, 20, 20, 20);
    ctx.fillRect(760, 20, 20, 20);
    ctx.fillRect(20, 560, 20, 20);
    ctx.fillRect(760, 560, 20, 20);

    // Typography setup
    ctx.textAlign = 'center';

    // Header Title
    ctx.font = 'bold 40px "Times New Roman", serif';
    ctx.fillStyle = '#1e3a8a'; // Navy
    ctx.fillText('EDUTRACK ACADEMY', 400, 120);

    ctx.font = '600 18px "Times New Roman", serif';
    ctx.fillStyle = '#b45309'; // Gold/Brown
    ctx.fillText('CURRICULUM COMPLETION CERTIFICATE', 400, 160);

    // Decorative line
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, 185);
    ctx.lineTo(550, 185);
    ctx.stroke();

    // Body
    ctx.font = 'italic 20px "Times New Roman", serif';
    ctx.fillStyle = '#334155'; // slate-700
    ctx.fillText('This is proudly presented to', 400, 240);

    // Student Name
    ctx.font = 'bold 44px "Times New Roman", serif';
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillText(user.name, 400, 300);

    ctx.font = '18px "Times New Roman", serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`for successfully fulfilling the undergraduate tracking requirements`, 400, 350);
    ctx.fillText(`in the department of ${user.department || 'General Study'} with a total of`, 400, 380);

    // Credits Highlight
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(`${approvedCredits} Activity Credits Approved`, 400, 430);

    // Footer signatures
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.fillStyle = '#0f172a';
    
    // Mentor line
    ctx.fillText('Prof. Sharma', 200, 500);
    ctx.strokeStyle = '#64748b'; // slate-500
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 480);
    ctx.lineTo(280, 480);
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Academic Mentor', 200, 520);

    // Institute line
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Dr. Gupta', 600, 500);
    ctx.beginPath();
    ctx.moveTo(520, 480);
    ctx.lineTo(680, 480);
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('System Coordinator', 600, 520);

    // Verified Seal
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('★ OFFICIAL RECORD ★', 400, 550);

    // Trigger download
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${user.name.replace(/\s+/g, '_')}_Completion_Certificate.png`;
    link.href = image;
    link.click();
  };

  const missingFields = (user?.interestedFields || []).filter(
    (field) => !activities.some((act) => 
      act.status === 'APPROVED' && 
      (act.title.toLowerCase().includes(field.toLowerCase()) || 
       act.description.toLowerCase().includes(field.toLowerCase()) ||
       act.type.toLowerCase().includes(field.toLowerCase()))
    )
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Missing Interested Fields Warning */}
      {missingFields.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Action Recommended</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              You haven't submitted any approved activities covering your interested fields: <strong>{missingFields.join(', ')}</strong>. Try to upload activities in these areas!
            </p>
          </div>
        </div>
      )}

      {/* Welcome Card & Target Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 section-hero text-slate-900 relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-full max-w-xl opacity-40 pointer-events-none">
            <div className="absolute top-10 right-[-70px] h-52 w-52 rounded-full bg-[#ffb830]/20 blur-3xl" />
            <div className="absolute bottom-8 right-16 h-40 w-40 rounded-full bg-[#f7d8a3]/25 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div className="space-y-4 max-w-2xl">
              <span className="badge-accent uppercase tracking-[0.3em] text-[10px] font-semibold">
                Student Dashboard
              </span>
              <h1 className="text-3xl sm:text-4xl font-outfit font-bold leading-tight">
                Hello, {user?.name}!
              </h1>
              <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-7">
                Welcome back! Track your activities, upload new credentials, and watch your approved credits grow toward graduation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="btn-brand shadow-lg shadow-[#ff9c0f]/20"
              >
                <Plus className="h-5 w-5" />
                Upload Activity
              </button>
              {user?.mentor ? (
                <div className="rounded-3xl bg-white/90 border border-brand-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Mentor</div>
                  <div className="mt-1 font-semibold text-slate-900">{user.mentor.name}</div>
                </div>
              ) : (
                <div className="rounded-3xl bg-[#fff3d2] border border-[#ffe6aa] px-4 py-3 text-sm text-[#6f3812] shadow-sm">
                  <div className="flex items-center gap-2 font-semibold">No mentor assigned yet</div>
                  <div className="text-xs text-slate-600 mt-1">Contact admin for assignment.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="section-card flex flex-col items-center justify-center text-center">
          <h3 className="font-outfit font-bold text-slate-900 mb-4 text-base">Curriculum Progress</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-36 h-36">
              <circle
                className="text-[#fff5e1]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="72"
                cy="72"
              />
              <circle
                className="text-brand-500 transition-all duration-500"
                strokeWidth="10"
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="72"
                cy="72"
                transform="rotate(-90 72 72)"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-outfit font-extrabold text-slate-900">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500">
                {approvedCredits} / {targetCredits} credits
              </span>
            </div>
          </div>
          {progressPercent >= 100 ? (
            <div className="mt-5 w-full">
              <button
                onClick={generateCertificate}
                className="w-full btn-brand text-sm flex items-center justify-center gap-2"
              >
                <Award className="h-5 w-5" />
                Claim Certificate
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              Earn <span className="font-semibold text-slate-900">{targetCredits - approvedCredits}</span> more credits to qualify for graduation certification.
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="section-card border border-[#fff0d6] p-5">
          <div className="text-[#ff9c0f] mb-1.5"><FileText className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submissions</p>
          <p className="text-2xl font-outfit font-bold text-slate-900">{totalSubmissions}</p>
        </div>
        <div className="section-card border border-[#fff0d6] p-5">
          <div className="text-[#f59e0b] mb-1.5"><Clock className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-outfit font-bold text-slate-900">{pendingCount}</p>
        </div>
        <div className="section-card border border-[#fff0d6] p-5">
          <div className="text-[#34d399] mb-1.5"><CheckCircle className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credits Approved</p>
          <p className="text-2xl font-outfit font-bold text-slate-900">{approvedCredits}</p>
        </div>
        <div className="section-card border border-[#fff0d6] p-5">
          <div className="text-[#fb7185] mb-1.5"><XCircle className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-outfit font-bold text-slate-900">{rejectedCount}</p>
        </div>
      </div>

      {/* Main Grid: List of Submissions & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table List */}
        <div className="lg:col-span-2 section-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-outfit font-bold text-slate-900">Activity Timeline</h2>
              <p className="text-sm text-slate-500 mt-1">Review your recent submissions and next steps.</p>
            </div>
            <span className="badge-accent">Sorted by date</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <UploadCloud className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
              <p className="text-slate-500 dark:text-slate-400">You haven't submitted any activities yet.</p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                Upload First Activity
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-4">Activity</th>
                    <th className="py-4">Type</th>
                    <th className="py-4">Credits</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {activities.map((act) => (
                    <tr 
                      key={act.id} 
                      onClick={() => setSelectedActivity(act)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group"
                    >
                      <td className="py-4.5 pr-2">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {act.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Submitted on {new Date(act.uploadDate).toLocaleDateString()}
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
                      <td className="py-4.5 text-right">
                        {act.status === 'REJECTED' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startResubmit(act);
                            }}
                            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline px-2.5 py-1.5 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg transition-all"
                          >
                            Resubmit
                          </button>
                        ) : (
                          <ChevronRight className="inline h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Drawer panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {selectedActivity ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-lg font-bold">
                    {selectedActivity.type}
                  </span>
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mt-2">
                    {selectedActivity.title}
                  </h3>
                </div>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                  selectedActivity.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  selectedActivity.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                  selectedActivity.status === 'UNDER_REVIEW' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {selectedActivity.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {selectedActivity.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submitted</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {new Date(selectedActivity.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Credits Assigned</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {selectedActivity.credits} cr
                  </p>
                </div>
              </div>

              {selectedActivity.filePath && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs">
                      {selectedActivity.filePath.startsWith('http')
                        ? decodeURIComponent(selectedActivity.filePath.split('/').pop()?.replace(/^\d+-/, '') || 'Uploaded File')
                        : selectedActivity.filePath.replace(/^\d+-/, '')}
                    </span>
                  </div>
                  <a
                    href={selectedActivity.filePath.startsWith('http') ? selectedActivity.filePath : `http://localhost:5000/uploads/${selectedActivity.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-brand-600 dark:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    title="Download document"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Approval History & Feedback */}
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-5 space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Mentor Feedback
                </h4>
                {selectedActivity.approvals && selectedActivity.approvals.length > 0 ? (
                  <div className="space-y-4">
                    {selectedActivity.approvals.map((app) => (
                      <div key={app.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 space-y-2 border border-slate-100 dark:border-slate-800/50">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Prof. {app.mentor.name}</span>
                          <span className="text-slate-400">{new Date(app.reviewDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          "{app.feedback || 'No comments provided.'}"
                        </p>
                        <span className={`inline-block text-2xs uppercase tracking-wider font-extrabold ${
                          app.decision === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {app.decision}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No feedback available. Awaiting review.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
              <FileCheck className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm">Select an activity from the timeline to view its feedback, history details, or download documents.</p>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD ACTIVITY MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white">Submit New Activity</h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Leadership Workshop, Python Project, E-Cell Event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Activity Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Project">Project</option>
                    <option value="Volunteer Work">Volunteer Work</option>
                    <option value="Sports">Sports</option>
                    <option value="Internship">Internship</option>
                    <option value="Certifications">Certification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Proposed Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Describe your role, what you built/learned, dates attended..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    GitHub Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    LinkedIn Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Supporting Document (PDF, Image)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 dark:file:bg-brand-950/40 dark:file:text-brand-400 hover:file:bg-brand-100"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                >
                  Submit Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUBMIT MODAL */}
      {resubmittingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white">Resubmit Activity</h3>
            
            {resubmittingActivity.approvals && resubmittingActivity.approvals.length > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                <strong>Rejection Feedback:</strong> "{resubmittingActivity.approvals[0].feedback}"
              </div>
            )}

            <form onSubmit={handleResubmitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Activity Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Project">Project</option>
                    <option value="Volunteer Work">Volunteer Work</option>
                    <option value="Sports">Sports</option>
                    <option value="Internship">Internship</option>
                    <option value="Certifications">Certification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Proposed Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    GitHub Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    LinkedIn Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Supporting Document (PDF, Image - optional if keeping original)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 dark:file:bg-brand-950/40 dark:file:text-brand-400 hover:file:bg-brand-100"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setResubmittingActivity(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                >
                  Resubmit Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
