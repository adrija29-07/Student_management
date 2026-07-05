import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mentorAPI } from '../../services/api';

interface ReportData {
  month: string;
  approved: number;
  rejected: number;
}

export const MentorReports: React.FC = () => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorAPI.getReports()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalApproved = data.reduce((sum, record) => sum + record.approved, 0);
  const totalRejected = data.reduce((sum, record) => sum + record.rejected, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Mentor Reports</h2>
      <p className="text-slate-600 dark:text-slate-300">Overview of your approvals and rejections over the last 6 months.</p>
      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
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
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalApproved}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow">
          <h3 className="font-outfit font-semibold text-slate-700 dark:text-slate-300 mb-2">Total Rejected</h3>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalRejected}</p>
        </div>
      </div>
    </div>
  );
};
