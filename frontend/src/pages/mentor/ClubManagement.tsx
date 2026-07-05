import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../../services/api';
import { Plus, Trash2, UserPlus, UserMinus, AlertCircle, Loader2, X, Music, Code, Dumbbell, BookOpen } from 'lucide-react';

interface ClubMember { id: string; role: string; joinedAt: string; user: { id: string; name: string; email: string; department: string | null }; }
interface Club { id: string; name: string; description?: string; category: string; createdAt: string; members: ClubMember[]; }
interface Student { id: string; name: string; email: string; department: string | null; }

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Technical: <Code className="h-4 w-4" />,
  Cultural: <Music className="h-4 w-4" />,
  Sports: <Dumbbell className="h-4 w-4" />,
  Academic: <BookOpen className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Technical: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  Cultural: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
  Sports: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  Academic: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
};

export const ClubManagement: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedClub, setExpandedClub] = useState<string | null>(null);
  const [addMemberState, setAddMemberState] = useState<{ clubId: string; userId: string } | null>(null);

  // Form
  const [clubName, setClubName] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [clubCategory, setClubCategory] = useState('Technical');

  useEffect(() => {
    Promise.all([mentorAPI.getClubs(), mentorAPI.getStudents()])
      .then(([clubsRes, studentsRes]) => {
        setClubs(clubsRes.data);
        setStudents(studentsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    mentorAPI.getClubs().then(({ data }) => setClubs(data));
  };

  const handleCreate = async () => {
    if (!clubName.trim()) return;
    setCreating(true);
    try {
      await mentorAPI.createClub({ name: clubName, description: clubDesc, category: clubCategory });
      setShowCreate(false);
      setClubName(''); setClubDesc(''); setClubCategory('Technical');
      reload();
    } catch { /* ignore */ }
    finally { setCreating(false); }
  };

  const handleAddMember = async (clubId: string, userId: string) => {
    try {
      await mentorAPI.addClubMember(clubId, userId);
      reload();
      setAddMemberState(null);
    } catch { /* ignore */ }
  };

  const handleRemoveMember = async (clubId: string, userId: string) => {
    try {
      await mentorAPI.removeClubMember(clubId, userId);
      reload();
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Club Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage student clubs and their members</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Club
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Create Club</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Club Name *</label>
                <input value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. Coding Club" className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <textarea value={clubDesc} onChange={e => setClubDesc(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Category</label>
                <select value={clubCategory} onChange={e => setClubCategory(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none">
                  {['Technical', 'Cultural', 'Sports', 'Academic'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !clubName.trim()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl">
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create
              </button>
            </div>
          </div>
        </div>
      )}

      {clubs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No clubs yet. Create your first club!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clubs.map(club => {
            const isExpanded = expandedClub === club.id;
            const memberIds = club.members.map(m => m.user.id);
            const eligibleToAdd = students.filter(s => !memberIds.includes(s.id));
            const catColor = CATEGORY_COLORS[club.category] || CATEGORY_COLORS.Technical;
            return (
              <div key={club.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedClub(isExpanded ? null : club.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${catColor}`}>
                    {CATEGORY_ICONS[club.category] || <BookOpen className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{club.name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${catColor}`}>{club.category}</span>
                    </div>
                    {club.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{club.description}</p>}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{club.members.length} members</span>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5">
                    {/* Members list */}
                    <div className="mt-4 space-y-2">
                      {club.members.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {m.user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{m.user.name}</p>
                            <p className="text-xs text-slate-500">{m.user.department || 'No dept.'}</p>
                          </div>
                          <span className="text-xs text-slate-400">{m.role}</span>
                          <button onClick={() => handleRemoveMember(club.id, m.user.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {club.members.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No members yet</p>}
                    </div>

                    {/* Add member dropdown */}
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={addMemberState?.clubId === club.id ? addMemberState.userId : ''}
                        onChange={e => setAddMemberState({ clubId: club.id, userId: e.target.value })}
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="">Add student to club...</option>
                        {eligibleToAdd.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                      </select>
                      <button
                        onClick={() => addMemberState?.clubId === club.id && addMemberState.userId && handleAddMember(club.id, addMemberState.userId)}
                        disabled={!addMemberState?.userId || addMemberState?.clubId !== club.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
