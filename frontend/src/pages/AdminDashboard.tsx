import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, 
  BarChart3, 
  Settings as SettingsIcon, 
  FileSpreadsheet, 
  ShieldAlert,
  UserPlus,
  Upload,
  RefreshCw,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Building,
  UserCheck
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from 'recharts';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department: string | null;
  isActive: boolean;
  mentor?: { id: number; name: string };
  students?: Array<{ id: number; name: string }>;
}

interface AuditLog {
  id: number;
  action: string;
  details: string;
  timestamp: string;
  user: { name: string; email: string; role: string };
}

export const AdminDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'users' | 'reports' | 'config' | 'audit'>('metrics');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<any>(null);
  
  // Custom reports states
  const [reportPeriod, setReportPeriod] = useState('Monthly');
  const [reportDept, setReportDept] = useState('ALL');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // User Management action states
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Welcome@123');
  const [newUserRole, setNewUserRole] = useState('STUDENT');
  const [newUserDept, setNewUserDept] = useState('CSE');

  // Bulk User import states
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');

  // Editing configuration states
  const [newActivityType, setNewActivityType] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [activeSubTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'metrics') {
        const { data } = await adminAPI.getDashboardStats();
        setStats(data);
      } else if (activeSubTab === 'users') {
        const { data } = await adminAPI.getUsers();
        setUsers(data);
      } else if (activeSubTab === 'config') {
        const { data } = await adminAPI.getConfig();
        setConfig(data);
      } else if (activeSubTab === 'audit') {
        const { data } = await adminAPI.getAuditLogs();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to load admin context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        department: newUserDept,
      });
      setIsNewUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('Welcome@123');
      loadInitialData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsed)) {
        alert('JSON must be an array of user objects.');
        return;
      }
      const { data } = await adminAPI.bulkImportUsers(parsed);
      alert(data.message);
      setIsBulkOpen(false);
      setBulkJsonText('');
      loadInitialData();
    } catch (err: any) {
      alert(err.message || 'Bulk import failed. Validate JSON syntax.');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await adminAPI.updateUser(user.id, { isActive: !user.isActive });
      setUsers(prev => 
        prev.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u)
      );
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleChangeRole = async (userId: number, role: string) => {
    try {
      await adminAPI.updateUser(userId, { role });
      alert('User role updated successfully');
      loadInitialData();
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  const handleAssignMentor = async (studentId: number, mentorIdStr: string) => {
    const mentorId = mentorIdStr === 'null' ? null : parseInt(mentorIdStr);
    try {
      await adminAPI.assignMentor(studentId, mentorId);
      alert('Mentor reassigned successfully.');
      loadInitialData();
    } catch (err) {
      alert('Failed to reassign mentor.');
    }
  };

  // Configuration changes
  const handleAddActivityType = async () => {
    if (!newActivityType.trim() || !config) return;
    const updatedTypes = [...config.allowedActivityTypes, newActivityType.trim()];
    const newConfig = { ...config, allowedActivityTypes: updatedTypes };
    try {
      const { data } = await adminAPI.saveConfig(newConfig);
      setConfig(data);
      setNewActivityType('');
    } catch (err) {
      alert('Failed to update types config.');
    }
  };

  const handleRemoveActivityType = async (typeToRemove: string) => {
    if (!config) return;
    const updatedTypes = config.allowedActivityTypes.filter((t: string) => t !== typeToRemove);
    const newConfig = { ...config, allowedActivityTypes: updatedTypes };
    try {
      const { data } = await adminAPI.saveConfig(newConfig);
      setConfig(data);
    } catch (err) {
      alert('Failed to remove type config.');
    }
  };

  const handleToggleEmailTriggers = async (field: string) => {
    if (!config) return;
    const newConfig = {
      ...config,
      emailTriggers: {
        ...config.emailTriggers,
        [field]: !config.emailTriggers[field]
      }
    };
    try {
      const { data } = await adminAPI.saveConfig(newConfig);
      setConfig(data);
    } catch (err) {
      alert('Failed to update notification settings.');
    }
  };

  // Generate Reports
  const handleGenerateReport = async () => {
    try {
      const { data } = await adminAPI.getReports(reportPeriod, reportDept);
      setGeneratedReport(data);
    } catch (err) {
      alert('Failed to generate report.');
    }
  };

  // Export report to CSV
  const handleExportCSV = () => {
    if (!generatedReport || !generatedReport.details) return;

    const headers = ['ID', 'Title', 'Type', 'Student', 'Department', 'Status', 'Upload Date', 'Mentor', 'Feedback'];
    const rows = generatedReport.details.map((d: any) => [
      d.id,
      `"${d.title.replace(/"/g, '""')}"`,
      d.type,
      d.student,
      d.department || 'N/A',
      d.status,
      d.date,
      d.mentor,
      `"${d.feedback.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `EduTrack_Report_${reportPeriod}_${reportDept}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie chart colors
  const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444'];

  const mentorsList = users.filter((u) => u.role === 'MENTOR');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'metrics'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-4.5 w-4.5" />
            System Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'users'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            Manage Users
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'reports'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            Generate Reports
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'config'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className="h-4.5 w-4.5" />
            System Config
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="h-4.5 w-4.5" />
            Audit Logs
          </button>
        </div>
        <button
          onClick={loadInitialData}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 rounded-xl"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Loading workspace metrics...</div>
      ) : (
        <>
          {/* TAB 1: METRICS */}
          {activeSubTab === 'metrics' && stats && (
            <div className="space-y-8">
              {/* Metric stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-outfit font-extrabold text-slate-800 dark:text-white mt-1">{stats.summary.totalUsers}</p>
                  <p className="text-2xs text-slate-400 mt-1">{stats.summary.totalStudents} Students • {stats.summary.totalMentors} Mentors</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted Activities</p>
                  <p className="text-3xl font-outfit font-extrabold text-slate-800 dark:text-white mt-1">{stats.summary.totalActivities}</p>
                  <p className="text-2xs text-amber-500 mt-1">{stats.summary.pendingReview} Awaiting Mentor review</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Rate</p>
                  <p className="text-3xl font-outfit font-extrabold text-slate-800 dark:text-white mt-1">{stats.summary.approvalRate}%</p>
                  <p className="text-2xs text-slate-400 mt-1">Based on approved vs rejected approvals</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Queue</p>
                  <p className="text-3xl font-outfit font-extrabold text-slate-800 dark:text-white mt-1">{stats.summary.pendingReview}</p>
                  <p className="text-2xs text-indigo-500 mt-1">Needs faculty action</p>
                </div>
              </div>

              {/* Analytics graphics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pie Chart of Statuses */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                  <h3 className="font-outfit font-bold text-slate-800 dark:text-slate-200 mb-6 text-sm">Activities by Status</h3>
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.statusDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mentor Workload comparison */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-outfit font-bold text-slate-800 dark:text-slate-200 mb-6 text-sm font-semibold">Faculty Workload Distribution</h3>
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.mentorWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Legend iconSize={8} />
                        <Bar name="Students Assigned" dataKey="studentsCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar name="Reviews Conducted" dataKey="reviewsCount" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department performance chart */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-outfit font-bold text-slate-800 dark:text-slate-200 mb-6 text-sm">Department Performance (Approvals Rate)</h3>
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.deptPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                        <Tooltip />
                        <Bar name="Approval Rate (%)" dataKey="ratio" fill="#818cf8" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE USERS */}
          {activeSubTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <h3 className="font-outfit font-bold text-slate-800 dark:text-white">Registered System Accounts</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsBulkOpen(true)}
                    className="bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="h-4.5 w-4.5" />
                    Bulk Import JSON
                  </button>
                  <button
                    onClick={() => setIsNewUserOpen(true)}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/10"
                  >
                    <UserPlus className="h-4.5 w-4.5" />
                    Add Account
                  </button>
                </div>
              </div>

              {/* User management grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-4">User</th>
                      <th className="py-4">Role</th>
                      <th className="py-4">Dept</th>
                      <th className="py-4">Assigned Mentor</th>
                      <th className="py-4">Status</th>
                      <th className="py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25">
                        <td className="py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{usr.name}</p>
                          <p className="text-xs text-slate-400">{usr.email}</p>
                        </td>
                        <td className="py-4">
                          <select
                            value={usr.role}
                            onChange={(e) => handleChangeRole(usr.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="MENTOR">MENTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-400 font-semibold">{usr.department || '—'}</td>
                        <td className="py-4">
                          {usr.role === 'STUDENT' ? (
                            <select
                              value={usr.mentor?.id || 'null'}
                              onChange={(e) => handleAssignMentor(usr.id, e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs text-slate-750 dark:text-slate-355"
                            >
                              <option value="null">Unassigned</option>
                              {mentorsList.map((m) => (
                                <option key={m.id} value={m.id}>
                                  Prof. {m.name} ({m.department})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-slate-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleStatus(usr)}
                            className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full transition-all ${
                              usr.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-rose-500/10 hover:text-rose-600'
                                : 'bg-rose-500/10 text-rose-600 hover:bg-emerald-500/10 hover:text-emerald-600'
                            }`}
                            title={usr.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {usr.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <span className="text-xs text-slate-400">ID: {usr.id}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM REPORTS */}
          {activeSubTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="font-outfit font-bold text-slate-800 dark:text-white">Curriculum Activity Reporting Engine</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Time Period</label>
                    <select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="Weekly">Weekly (Last 7 Days)</option>
                      <option value="Monthly">Monthly (Last 30 Days)</option>
                      <option value="Semester">Semester (Last 6 Months)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                    <select
                      value={reportDept}
                      onChange={(e) => setReportDept(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="ALL">All Departments</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleGenerateReport}
                      className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl shadow-md transition-colors"
                    >
                      Compile Custom Report
                    </button>
                  </div>
                </div>
              </div>

              {generatedReport && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div>
                      <h4 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Report Summary</h4>
                      <p className="text-xs text-slate-400">Generated on {new Date(generatedReport.generatedOn).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <FileSpreadsheet className="h-4.5 w-4.5" />
                      Export Excel (CSV)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Total Activities</span>
                      <strong className="text-2xl font-outfit text-slate-800 dark:text-white">{generatedReport.totalActivities}</strong>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Approved</span>
                      <strong className="text-2xl font-outfit text-emerald-500">{generatedReport.approved}</strong>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Rejected</span>
                      <strong className="text-2xl font-outfit text-rose-500">{generatedReport.rejected}</strong>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Approval Rate</span>
                      <strong className="text-2xl font-outfit text-indigo-500">{generatedReport.approvalRate}%</strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto pt-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3">Activity</th>
                          <th className="py-3">Student</th>
                          <th className="py-3">Dept</th>
                          <th className="py-3">Date</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Faculty Reviewer</th>
                          <th className="py-3">Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
                        {generatedReport.details.map((d: any) => (
                          <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{d.title} ({d.type})</td>
                            <td className="py-3">{d.student}</td>
                            <td className="py-3 font-semibold">{d.department || 'CSE'}</td>
                            <td className="py-3">{d.date}</td>
                            <td className="py-3">
                              <span className={`inline-block font-bold px-2 py-0.5 rounded ${
                                d.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                                d.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                                'bg-amber-500/10 text-amber-600'
                              }`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="py-3">{d.mentor}</td>
                            <td className="py-3 max-w-xs truncate italic">"{d.feedback || '—'}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM CONFIG */}
          {activeSubTab === 'config' && config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Allowed activity types */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="font-outfit font-bold text-slate-800 dark:text-white">Curriculum Categories</h3>
                <p className="text-xs text-slate-400">Add or remove activity categories allowed in the student submission drop-down.</p>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                    placeholder="e.g. Hackathons, Online Courses..."
                  />
                  <button
                    onClick={handleAddActivityType}
                    className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Add Type
                  </button>
                </div>

                <div className="space-y-2.5 pt-2">
                  {config.allowedActivityTypes.map((type: string) => (
                    <div key={type} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800/40">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{type}</span>
                      <button
                        onClick={() => handleRemoveActivityType(type)}
                        className="text-xs font-bold text-rose-500 hover:underline px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Email Notification toggles */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="font-outfit font-bold text-slate-800 dark:text-white">Email Notification settings</h3>
                <p className="text-xs text-slate-400">Configure triggers for automated mailing notifications (uses local nodemailer transport).</p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notify Mentors on Submission</p>
                      <p className="text-xs text-slate-400 mt-0.5">Sends email to student's assigned mentor when activity is uploaded.</p>
                    </div>
                    <button
                      onClick={() => handleToggleEmailTriggers('onSubmission')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        config.emailTriggers.onSubmission
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {config.emailTriggers.onSubmission ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notify Students on Review Decision</p>
                      <p className="text-xs text-slate-400 mt-0.5">Sends email to student showing Approval or Rejection status.</p>
                    </div>
                    <button
                      onClick={() => handleToggleEmailTriggers('onDecision')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        config.emailTriggers.onDecision
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {config.emailTriggers.onDecision ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeSubTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-outfit font-bold text-slate-800 dark:text-white">Security & Configuration Audit Log</h3>
                <span className="text-xs text-slate-400 font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Latest 100 entries</span>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3">Timestamp</th>
                    <th className="py-3">Admin</th>
                    <th className="py-3">Action</th>
                    <th className="py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-3 text-slate-400 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{log.user.name} ({log.user.email})</td>
                      <td className="py-3">
                        <span className="bg-brand-500/10 text-brand-600 font-extrabold px-2.5 py-0.5 rounded text-2xs uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 font-medium">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CREATE SINGLE USER MODAL */}
      {isNewUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white">Add System Account</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Arjun Mehta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="arjun@tracker.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">System Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK USER IMPORT JSON MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white">Bulk Account Import (JSON)</h3>
            <p className="text-xs text-slate-500">Paste a JSON array containing user profiles matching the structure below:</p>
            
            <pre className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-3xs font-mono overflow-x-auto text-slate-650 dark:text-slate-400">
{`[
  { "email": "usr1@test.com", "name": "Arjun", "role": "STUDENT", "department": "CSE" },
  { "email": "usr2@test.com", "name": "Prof Sharma", "role": "MENTOR", "department": "CSE" }
]`}
            </pre>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <textarea
                  required
                  rows={6}
                  value={bulkJsonText}
                  onChange={(e) => setBulkJsonText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none"
                  placeholder="Paste JSON array here..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                >
                  Import Users
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
