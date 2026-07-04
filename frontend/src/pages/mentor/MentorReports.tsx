import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReportData {
  month: string;
  approved: number;
  rejected: number;
}

export const MentorReports: React.FC = () => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocked report data; replace with real API when available
    const mock: ReportData[] = [
      { month: 'Jan', approved: 12, rejected: 3 },
      { month: 'Feb', approved: 9, rejected: 5 },
      { month: 'Mar', approved: 15, rejected: 2 },
      { month: 'Apr', approved: 8, rejected: 4 },
      { month: 'May', approved: 11, rejected: 1 },
    ];
    setData(mock);
    setLoading(false);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Mentor Reports</h2>
      <p className="text-slate-600 dark:text-slate-300">Overview of your activity approvals and rejections over time.</p>
      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="approved" fill="#10b981" name="Approved" />
            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow">
          <h3 className="font-outfit font-semibold text-slate-700 dark:text-slate-300 mb-2">Total Approved</h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {data.reduce((sum, d) => sum + d.approved, 0)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow">
          <h3 className="font-outfit font-semibold text-slate-700 dark:text-slate-300 mb-2">Total Rejected</h3>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {data.reduce((sum, d) => sum + d.rejected, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};
