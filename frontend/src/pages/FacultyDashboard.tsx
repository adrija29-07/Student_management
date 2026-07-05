import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, BookOpen, Users, FileText } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-600/10 p-3 text-brand-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Faculty Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome, {user?.name || 'Faculty Member'}. Your faculty workspace is ready.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Department Oversight</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Monitor department progress and review student activity summaries.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Student Coordination</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Coordinate student support and track department-level engagement.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Reports</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Review submitted reports and plan follow-up support actions.
          </p>
        </div>
      </div>
    </div>
  );
};
