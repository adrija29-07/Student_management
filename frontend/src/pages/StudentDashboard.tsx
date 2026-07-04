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
  
  // Resubmission states
  const [resubmittingActivity, setResubmittingActivity] = useState<Activity | null>(null);

  // Selected Activity details drawer
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetCredits = 10;

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
    setFile(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('Workshop');
    setCredits('1');
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

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#0f172a'); // slate-900
    grad.addColorStop(1, '#1e1b4b'); // indigo-950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#4f46e5'; // indigo-600
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 760, 560);

    // Inner gold border
    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 35, 730, 530);

    // Typography setup
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Header Title
    ctx.font = 'bold 36px Outfit';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('EDUTRACK ACADEMY', 400, 110);

    ctx.font = '20px Inter';
    ctx.fillStyle = '#a5b4fc';
    ctx.fillText('CURRICULUM COMPLETION CERTIFICATE', 400, 150);

    // Decorative line
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 175);
    ctx.lineTo(500, 175);
    ctx.stroke();

    // Body
    ctx.font = 'italic 18px Inter';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('This is proudly presented to', 400, 230);

    // Student Name
    ctx.font = 'bold 38px Outfit';
    ctx.fillStyle = '#fbbf24'; // amber-400
    ctx.fillText(user.name, 400, 290);

    ctx.font = '16px Inter';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`for successfully fulfilling the undergraduate tracking requirements`, 400, 340);
    ctx.fillText(`in the department of ${user.department || 'General Study'} with a total of`, 400, 365);

    ctx.font = 'bold 20px Outfit';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${approvedCredits} Activity Credits Approved`, 400, 410);

    // Footer signatures
    ctx.font = '14px Inter';
    ctx.fillStyle = '#94a3b8';
    
    // Mentor line
    ctx.fillText('Prof. Sharma', 200, 490);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 470);
    ctx.lineTo(280, 470);
    ctx.stroke();
    ctx.fillText('Academic Mentor', 200, 510);

    // Institute line
    ctx.fillText('Dr. Gupta', 600, 490);
    ctx.beginPath();
    ctx.moveTo(520, 470);
    ctx.lineTo(680, 470);
    ctx.stroke();
    ctx.fillText('System Coordinator', 600, 510);

    // Verified Seal
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px Inter';
    ctx.fillText('★ VERIFIED SECURE ★', 400, 550);

    // Trigger download
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${user.name.replace(/\s+/g, '_')}_Completion_Certificate.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Card & Target Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
              Student Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-outfit font-bold">
              Hello, {user?.name}!
            </h1>
            <p className="text-brand-100 max-w-md text-sm sm:text-base leading-relaxed">
              Track your activities, submit certificates, and watch your curriculum credit grow. Reach {targetCredits} credits to unlock your certification.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-white text-brand-600 hover:bg-slate-100 px-5 py-3 rounded-2xl font-semibold shadow-md flex items-center gap-2 transition-all"
            >
              <Plus className="h-5 w-5" />
              Upload Activity
            </button>
            {user?.mentor ? (
              <div className="text-xs text-brand-200">
                Assigned Mentor: <strong className="text-white">{user.mentor.name}</strong>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                No mentor assigned yet. Contact admin.
              </div>
            )}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="font-outfit font-bold text-slate-800 dark:text-slate-200 mb-4 text-base">Curriculum Progress</h3>
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-36 h-36">
              <circle
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="72"
                cy="72"
              />
              <circle
                className="text-brand-600 dark:text-brand-400 transition-all duration-500"
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
              <span className="text-3xl font-outfit font-extrabold text-slate-800 dark:text-white">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {approvedCredits} / {targetCredits} credits
              </span>
            </div>
          </div>
          
          {progressPercent >= 100 ? (
            <div className="mt-5 w-full">
              <button
                onClick={generateCertificate}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Award className="h-5 w-5" />
                Claim Certificate
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              Earn {targetCredits - approvedCredits} more credits to qualify for graduation certification.
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-1.5"><FileText className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submissions</p>
          <p className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">{totalSubmissions}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-amber-500 mb-1.5"><Clock className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-emerald-500 mb-1.5"><CheckCircle className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credits Approved</p>
          <p className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">{approvedCredits}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-rose-500 mb-1.5"><XCircle className="h-5 w-5" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">{rejectedCount}</p>
        </div>
      </div>

      {/* Main Grid: List of Submissions & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-outfit font-bold text-slate-800 dark:text-white">Activity Timeline</h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1.5 rounded-full font-medium">
              Sorted by date
            </span>
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
                      {selectedActivity.filePath.replace(/^\d+-/, '')}
                    </span>
                  </div>
                  <a
                    href={`http://localhost:5000/uploads/${selectedActivity.filePath}`}
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
