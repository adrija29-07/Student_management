import React from 'react';

export const MentorSettings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Mentor Settings</h2>
      <p className="text-slate-600 dark:text-slate-300">Update your profile and notification preferences.</p>
      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-outfit font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Name</label>
            <input type="text" defaultValue="Mentor Name" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Email</label>
            <input type="email" defaultValue="mentor@example.com" disabled className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
          </div>
        </div>
      </section>
      {/* Notification Preferences */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-outfit font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">Notification Preferences</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="h-4 w-4 text-brand-600" />
            <span className="text-sm text-slate-800 dark:text-slate-200">Email when student activity is submitted</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="h-4 w-4 text-brand-600" />
            <span className="text-sm text-slate-800 dark:text-slate-200">Email when activity is approved/rejected</span>
          </label>
        </div>
      </section>
    </div>
  );
};
