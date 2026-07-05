import React, { useState, useEffect } from 'react';
import { mentorAPI } from '../../services/api';
import {
  Users, Plus, Search, Trash2, UserPlus, Filter, Loader2,
  Code2, Music, Trophy, Heart, Clock, MapPin
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description?: string;
  category: string;
  memberCount: number;
  icon?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  category: string;
  activityType?: string;
  memberCount: number;
  createdAt: string;
}

interface Category {
  name: string;
  icon: string;
  color: string;
  clubs: Club[];
  teams: Team[];
}

export const ClubsAndTeams: React.FC = () => {
  const [tab, setTab] = useState<'clubs' | 'teams'>('clubs');
  const [selectedCategory, setSelectedCategory] = useState('Technical');
  const [searchQuery, setSearchQuery] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const categories: Category[] = [
    {
      name: 'Technical',
      icon: '💻',
      color: 'from-blue-500 to-blue-600',
      clubs: clubs.filter(c => c.category === 'Technical'),
      teams: teams.filter(t => t.category === 'Technical'),
    },
    {
      name: 'Co-Curricular',
      icon: '🎭',
      color: 'from-purple-500 to-purple-600',
      clubs: clubs.filter(c => c.category === 'Co-Curricular'),
      teams: teams.filter(t => t.category === 'Co-Curricular'),
    },
    {
      name: 'Sports',
      icon: '⚽',
      color: 'from-green-500 to-green-600',
      clubs: clubs.filter(c => c.category === 'Sports'),
      teams: teams.filter(t => t.category === 'Sports'),
    },
    {
      name: 'Social',
      icon: '🤝',
      color: 'from-pink-500 to-pink-600',
      clubs: clubs.filter(c => c.category === 'Social'),
      teams: teams.filter(t => t.category === 'Social'),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsRes, teamsRes] = await Promise.all([
        mentorAPI.getClubs(),
        mentorAPI.getTeams(),
      ]);
      setClubs(clubsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories.find(c => c.name === selectedCategory);
  const displayList = tab === 'clubs' ? currentCategory?.clubs || [] : currentCategory?.teams || [];
  const filtered = displayList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Club & Teams</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage clubs and teams across all categories</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New {tab === 'clubs' ? 'Club' : 'Team'}
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('clubs')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'clubs'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Clubs
        </button>
        <button
          onClick={() => setTab('teams')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'teams'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Teams
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => {
              setSelectedCategory(cat.name);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex-shrink-0 ${
              selectedCategory === cat.name
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            {cat.name}
            <span className={`ml-1 text-xs font-bold ${selectedCategory === cat.name ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
              {tab === 'clubs' ? cat.clubs.length : cat.teams.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${tab === 'clubs' ? 'clubs' : 'teams'}...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {item.memberCount} members
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition-colors text-rose-600 dark:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No {tab === 'clubs' ? 'clubs' : 'teams'} found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create one to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
