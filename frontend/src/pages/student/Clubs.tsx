import React, { useEffect, useState } from 'react';
import { mentorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, UserPlus, UserMinus, AlertCircle, Loader2 } from 'lucide-react';

interface Club { id: string; name: string; description?: string; category: string; members: any[] }

export const StudentClubs: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await mentorAPI.getClubs();
      setClubs(res.data);
    } catch (err) {
      console.error('Failed to load clubs', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const join = async (id: string) => {
    setProcessing(id);
    try {
      await mentorAPI.joinClub(id);
      await load();
    } catch (err) { console.error(err); }
    setProcessing(null);
  };

  const leave = async (id: string) => {
    setProcessing(id);
    try {
      await mentorAPI.leaveClub(id);
      await load();
    } catch (err) { console.error(err); }
    setProcessing(null);
  };

  if (loading) return (<div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clubs & Hobby Groups</h2>
          <p className="text-sm text-slate-500">Join hobby groups to showcase your interests to mentors.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {clubs.map(c => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name} <span className="text-xs text-slate-400">{c.category}</span></div>
              {c.description && <div className="text-sm text-slate-500">{c.description}</div>}
            </div>
            <div className="flex items-center gap-2">
              {c.members && c.members.some((m: any) => m.user && m.user.id && m.user.id === user?.id) ? (
                <button disabled={processing === c.id} onClick={() => leave(c.id)} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600">Leave</button>
              ) : (
                <button disabled={processing === c.id} onClick={() => join(c.id)} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600">Join</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
