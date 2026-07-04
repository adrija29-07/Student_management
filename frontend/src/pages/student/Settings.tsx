import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, BookOpen, Lock, Shield, Bell, Database,
  Eye, EyeOff, Save, AlertTriangle, CheckCircle, Loader2, Trash2
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  // Account
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(user?.department || '');
  const [program, setProgram] = useState('B.Tech CSE');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    emailApproved: true,
    emailRejected: true,
    emailReminders: true,
    emailWeeklySummary: false,
    smsNotifications: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    allowMentorComments: true,
  });

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const pwdScore = passwordStrength(newPwd);
  const pwdStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdScore];
  const pwdStrengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'][pwdScore];

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await new Promise(r => setTimeout(r, 800));
    setSaveSuccess(true);
    setSavingProfile(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPwd.length < 8) { setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return; }
    setSavingPwd(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingPwd(false);
    setPwdMsg({ type: 'success', text: 'Password changed successfully.' });
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => setPwdMsg(null), 3000);
  };

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
        <h3 className="font-outfit font-semibold text-sm text-slate-700 dark:text-slate-300">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const Toggle: React.FC<{ label: string; desc?: string; checked: boolean; onChange: () => void }> = ({ label, desc, checked, onChange }) => (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-2">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </div>
    </label>
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Settings</h2>

      {/* Account Settings */}
      <Section title="Account Information" icon={<User className="h-4 w-4" />}>
        <div className="space-y-4">
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Profile updated successfully.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Program</label>
            <input
              type="text"
              value={program}
              onChange={e => setProgram(e.target.value)}
              placeholder="B.Tech CSE, MBA, etc."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-brand-500/20"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={<Lock className="h-4 w-4" />}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdMsg && (
            <div className={`flex items-center gap-2 p-3 border text-sm rounded-xl ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
            }`}>
              {pwdMsg.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
              {pwdMsg.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPwd && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < pwdScore ? pwdStrengthColor : 'bg-slate-200 dark:bg-slate-700'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-400">Strength: <span className="font-semibold">{pwdStrengthLabel}</span></p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={savingPwd}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Update Password
          </button>
        </form>
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Permissions" icon={<Shield className="h-4 w-4" />}>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle label="Public Profile" desc="Allow others to find your profile" checked={privacy.publicProfile} onChange={() => setPrivacy(p => ({ ...p, publicProfile: !p.publicProfile }))} />
          <Toggle label="Allow Mentor Comments" desc="Mentors can add feedback on your activities" checked={privacy.allowMentorComments} onChange={() => setPrivacy(p => ({ ...p, allowMentorComments: !p.allowMentorComments }))} />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences" icon={<Bell className="h-4 w-4" />}>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle label="Activity Approved" desc="Email when mentor approves your activity" checked={notifSettings.emailApproved} onChange={() => setNotifSettings(p => ({ ...p, emailApproved: !p.emailApproved }))} />
          <Toggle label="Activity Rejected" desc="Email when mentor rejects your activity" checked={notifSettings.emailRejected} onChange={() => setNotifSettings(p => ({ ...p, emailRejected: !p.emailRejected }))} />
          <Toggle label="Pending Reminders" desc="Email reminders for pending activities" checked={notifSettings.emailReminders} onChange={() => setNotifSettings(p => ({ ...p, emailReminders: !p.emailReminders }))} />
          <Toggle label="Weekly Summary" desc="Weekly digest of your activity progress" checked={notifSettings.emailWeeklySummary} onChange={() => setNotifSettings(p => ({ ...p, emailWeeklySummary: !p.emailWeeklySummary }))} />
          <Toggle label="SMS Notifications" desc="Get SMS alerts (carrier charges may apply)" checked={notifSettings.smsNotifications} onChange={() => setNotifSettings(p => ({ ...p, smsNotifications: !p.smsNotifications }))} />
        </div>
      </Section>

      {/* Data & Danger Zone */}
      <Section title="Data & Account" icon={<Database className="h-4 w-4" />}>
        <div className="space-y-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm transition-colors">
            <Database className="h-4 w-4" />
            Download My Data
          </button>
          <div className="border border-rose-200 dark:border-rose-900 rounded-xl p-4">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </p>
            <p className="text-xs text-slate-400 mb-3">Once you delete your account, all your data will be permanently removed and cannot be recovered.</p>
            <button
              onClick={() => { if (confirm('Are you sure you want to delete your account? This cannot be undone.')) logout(); }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
};
