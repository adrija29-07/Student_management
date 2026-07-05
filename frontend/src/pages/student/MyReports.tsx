import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activityAPI } from '../../services/api';
import {
  FileText, Download, Trash2, Plus, Calendar, BarChart3,
  CheckCircle, Clock, XCircle, RefreshCw, Loader2
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  generatedAt: string;
  totalActivities: number;
  approved: number;
  pending: number;
  rejected: number;
  credits: number;
}

export const MyReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('student_reports');
    if (stored) setReports(JSON.parse(stored));
    activityAPI.getMyActivities().then(({ data }) => setActivities(data));
  }, []);

  const saveReports = (r: Report[]) => {
    setReports(r);
    localStorage.setItem('student_reports', JSON.stringify(r));
  };

  const generateReport = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200));

    const approved = activities.filter(a => a.status === 'APPROVED');
    const pending = activities.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW');
    const rejected = activities.filter(a => a.status === 'REJECTED');
    const credits = approved.reduce((s: number, a: any) => s + a.credits, 0);

    const report: Report = {
      id: Date.now().toString(),
      title: `Progress Report — ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
      generatedAt: new Date().toISOString(),
      totalActivities: activities.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      credits,
    };

    saveReports([report, ...reports]);
    setGenerating(false);
  };

  const deleteReport = (id: string) => {
    saveReports(reports.filter(r => r.id !== id));
  };

  const downloadReport = (report: Report) => {
    const lines = [
      `=== EDUTRACK PROGRESS REPORT ===`,
      `Student: ${user?.name}`,
      `Email: ${user?.email}`,
      `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      ``,
      `--- SUMMARY ---`,
      `Total Activities: ${report.totalActivities}`,
      `Approved: ${report.approved} | Pending: ${report.pending} | Rejected: ${report.rejected}`,
      `Total Credits Earned: ${report.credits}`,
      `Approval Rate: ${report.totalActivities > 0 ? Math.round((report.approved / report.totalActivities) * 100) : 0}%`,
      ``,
      `=== DETAILED ACTIVITY LOG ===`,
      ...activities.map(a =>
        `[${a.status}] ${a.title} | ${a.type} | ${a.credits} credits | ${new Date(a.uploadDate).toLocaleDateString()}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user?.name?.replace(/\s+/g, '_')}_Report_${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">My Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{reports.length} report{reports.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating || activities.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-500/20"
        >
          {generating
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            : <><Plus className="h-4 w-4" /> Generate Report</>
          }
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <BarChart3 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold">No reports yet</p>
          <p className="text-sm text-slate-400 mb-6">Click "Generate Report" to create your first progress report.</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Generate Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => {
            const approvalRate = report.totalActivities > 0
              ? Math.round((report.approved / report.totalActivities) * 100)
              : 0;
            return (
              <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-outfit font-bold text-slate-800 dark:text-white">{report.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Generated {new Date(report.generatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                    <p className="text-xs text-slate-400 mb-1">Total</p>
                    <p className="text-xl font-outfit font-bold text-slate-700 dark:text-slate-300">{report.totalActivities}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Approved</p>
                    <p className="text-xl font-outfit font-bold text-emerald-700 dark:text-emerald-300">{report.approved}</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-center">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Pending</p>
                    <p className="text-xl font-outfit font-bold text-amber-700 dark:text-amber-300">{report.pending}</p>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-center">
                    <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Rejected</p>
                    <p className="text-xl font-outfit font-bold text-rose-700 dark:text-rose-300">{report.rejected}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full transition-all"
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">{approvalRate}% approved</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadReport(report)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
