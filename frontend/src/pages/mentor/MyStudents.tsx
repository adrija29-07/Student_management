import React from 'react';
import { UserCheck } from 'lucide-react';

export const MyStudents: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">My Students</h2>
      <p className="text-slate-600 dark:text-slate-300">Here you will see a list of students assigned to you. This page is a placeholder for future implementation.</p>
      {/* Placeholder card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4">
        <UserCheck className="h-6 w-6 text-brand-600" />
        <div>
          <h3 className="font-outfit font-semibold text-slate-800 dark:text-slate-200">Student Name</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Department • Year • Email</p>
        </div>
      </div>
      {/* Add grid or table of students later */}
    </div>
  );
};

