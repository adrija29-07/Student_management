import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../../services/api';
import { Users, Plus, Trash2, Tag, X, AlertCircle, Loader2 } from 'lucide-react';

interface Student { id: string; name: string; email: string; department: string | null; interestedFields: string[]; }
interface TeamMember { id: string; role: string; user: Student; }
interface Team { id: string; name: string; description?: string; tags: string[]; status: string; createdAt: string; members: TeamMember[]; leader: { name: string; email: string }; }

const STATUS_COLORS: Record<string, string> = {
  FORMING: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  ACTIVE: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  SUBMITTED: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  COMPLETED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export const HackathonTeamBuilder: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([mentorAPI.getHackathonTeams(), mentorAPI.getStudents()])
      .then(([teamsRes, studentsRes]) => {
        setTeams(teamsRes.data);
        setStudents(studentsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter(s =>
    !searchStudent || s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(searchStudent.toLowerCase())
  );

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      setTags(prev => [...new Set([...prev, tagInput.trim()])]);
      setTagInput('');
    }
  };

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const { data } = await mentorAPI.createHackathonTeam({ name: teamName, description, tags, memberIds: selectedIds });
      setTeams(prev => [data, ...prev]);
      setShowCreate(false);
      setTeamName(''); setDescription(''); setSelectedIds([]); setTags([]);
    } catch { /* ignore */ }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await mentorAPI.deleteHackathonTeam(id);
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">Hackathon Team Builder</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Create and manage student hackathon teams</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Team
        </button>
      </div>

      {/* Create Team Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Create Hackathon Team</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Team Name *</label>
                <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Team Phoenix" className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this team focused on?" rows={2} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Tags (press Enter to add)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-lg text-xs font-medium">
                      {t} <button onClick={() => setTags(prev => prev.filter(x => x !== t))}><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                </div>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="AI, Web Dev, ML..." className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Add Members</label>
                <input value={searchStudent} onChange={e => setSearchStudent(e.target.value)} placeholder="Search by name or department..." className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500 mb-2" />
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {filteredStudents.map(s => (
                    <button key={s.id} onClick={() => toggleStudent(s.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selectedIds.includes(s.id) ? 'bg-brand-50 dark:bg-brand-950/20 border-l-2 border-brand-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.department}</p>
                      </div>
                      {selectedIds.includes(s.id) && <div className="h-4 w-4 bg-brand-600 rounded-full flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white rounded-full" /></div>}
                    </button>
                  ))}
                </div>
                {selectedIds.length > 0 && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-semibold">{selectedIds.length} member(s) selected</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !teamName.trim()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl transition-colors">
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No teams created yet. Create your first hackathon team!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">{team.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[team.status] || STATUS_COLORS.FORMING}`}>
                      {team.status}
                    </span>
                  </div>
                  {team.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{team.description}</p>}
                  {team.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {team.tags.map(t => (
                        <span key={t} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                          <Tag className="h-2.5 w-2.5" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {team.members.map(m => (
                      <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                          {m.user.name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">{m.user.name}</span>
                      </div>
                    ))}
                    {team.members.length === 0 && <p className="text-xs text-slate-400">No members yet</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(team.id)}
                  disabled={deleting === team.id}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex-shrink-0"
                >
                  {deleting === team.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-3">Created {new Date(team.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
