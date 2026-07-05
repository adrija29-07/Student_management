import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mentorAPI } from '../../services/api';
import { ArrowLeft, Award, BookOpen, Clock, Link as LinkIcon, ExternalLink, User, CheckCircle, XCircle } from 'lucide-react';

interface ActivityApproval {
  id: string;
  decision: string;
  feedback: string | null;
  reviewDate: string;
  mentor?: { name: string };
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  credits: number;
  uploadDate: string;
  filePath: string | null;
  githubLink?: string | null;
  linkedinLink?: string | null;
  approvals: ActivityApproval[];
}

interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  department?: string | null;
  interestedFields: string[];
  totalCredits: number;
  mentor?: { name: string; email: string } | null;
  studentActivities: Activity[];
}

export const StudentProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    mentorAPI.getStudentProfile(id)
      .then(({ data }) => setStudent(data))
      .catch((err) => {
        console.error(err);
        setError('Unable to load student details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-5xl mx-auto">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">{error || 'Student profile not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to students
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
          <div>
            <h2 className="text-2xl font-outfit font-bold text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{student.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{student.department || 'No department'}</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{student.interestedFields.length > 0 ? student.interestedFields.join(', ') : 'No fields selected'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm">
              <p className="text-slate-500 dark:text-slate-400">Total Credits</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{student.totalCredits}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm">
              <p className="text-slate-500 dark:text-slate-400">Activities</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{student.studentActivities.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Student Activities</h3>
            {student.studentActivities.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">No activities submitted yet.</p>
            ) : (
              <div className="space-y-4 mt-5">
                {student.studentActivities.map((activity) => (
                  <div key={activity.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{activity.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{activity.type}</span>
                          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{activity.status.replace('_', ' ')}</span>
                          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{activity.credits} cr</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                        <p>{new Date(activity.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        {activity.githubLink && (
                          <a target="_blank" rel="noreferrer" href={activity.githubLink} className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline mt-1">
                            <LinkIcon className="h-3.5 w-3.5" /> GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{activity.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3 items-center text-xs text-slate-500 dark:text-slate-400">
                      {activity.filePath && (
                        <a href={`http://localhost:5000/uploads/${activity.filePath}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> View File
                        </a>
                      )}
                      {activity.linkedinLink && (
                        <a href={activity.linkedinLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                        </a>
                      )}
                    </div>

                    {activity.approvals.length > 0 && (
                      <div className="mt-4 space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">Review history</p>
                        {activity.approvals.map((approval) => (
                          <div key={approval.id} className="rounded-2xl bg-slate-100 dark:bg-slate-950 p-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
                              <span>{approval.decision}</span>
                              <span>{new Date(approval.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            {approval.feedback && <p className="mt-2 text-xs italic">"{approval.feedback}"</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mentor</h3>
            <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{student.mentor?.name || 'Unassigned'}</p>
            {student.mentor?.email && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{student.mentor.email}</p>}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key metrics</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Total activities</span>
                <span>{student.studentActivities.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Approved credits</span>
                <span>{student.totalCredits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending reviews</span>
                <span>{student.studentActivities.filter((activity) => activity.status === 'SUBMITTED').length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
