import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { activityAPI, mentorAPI } from '../../services/api';
import {
  UploadCloud, X, FileText, Tag, Plus, ArrowLeft, Send, Save,
  Calendar, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

interface ActivityCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface ActivityType {
  id: string;
  name: string;
  categoryId: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export const UploadActivity: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resubmit = location.state?.resubmit;

  // State
  const [title, setTitle] = useState(resubmit?.title || '');
  const [categoryId, setCategoryId] = useState(resubmit?.categoryId || '');
  const [typeId, setTypeId] = useState(resubmit?.typeId || '');
  const [description, setDescription] = useState(resubmit?.description || '');
  const [credits, setCredits] = useState(resubmit?.credits?.toString() || '1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [githubLink, setGithubLink] = useState(resubmit?.githubLink || '');
  const [linkedinLink, setLinkedinLink] = useState(resubmit?.linkedinLink || '');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Dynamic data
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ActivityType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch dynamic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, typeRes, deptRes] = await Promise.all([
          mentorAPI.getCategories(),
          mentorAPI.getActivityTypes(),
          mentorAPI.getDepartments(),
        ]);
        setCategories(catRes.data);
        setTypes(typeRes.data);
        setDepartments(deptRes.data);
        
        // Set default category if not resubmitting
        if (!resubmit && catRes.data.length > 0) {
          setCategoryId(catRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch form data:', err);
        setError('Failed to load form data. Please refresh.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [resubmit]);

  // Filter types when category changes
  useEffect(() => {
    if (categoryId) {
      const filtered = types.filter(t => t.categoryId === categoryId);
      setFilteredTypes(filtered);
      if (filtered.length > 0 && !typeId) {
        setTypeId(filtered[0].id);
      }
    }
  }, [categoryId, types, typeId]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(p => [...p, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId || !typeId) {
      setError('Title, description, category and type are required.');
      return;
    }
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('typeId', typeId);
    formData.append('credits', credits);
    formData.append('githubLink', githubLink);
    formData.append('linkedinLink', linkedinLink);
    if (file) formData.append('file', file);
    try {
      if (resubmit) {
        await activityAPI.resubmitActivity(resubmit.id, formData);
      } else {
        await activityAPI.uploadActivity(formData);
      }
      setSuccess(true);
      setTimeout(() => navigate('/student/activities'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-24">
      <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white mb-2">
        {resubmit ? 'Activity Resubmitted!' : 'Activity Submitted!'}
      </h2>
      <p className="text-slate-500 dark:text-slate-400">
        Your activity has been submitted and is awaiting mentor review. Redirecting…
      </p>
    </div>
  );

  if (loadingData) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
        </button>
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">
            {resubmit ? 'Resubmit Activity' : 'Upload New Activity'}
          </h2>
          {resubmit && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg w-fit">
              <AlertCircle className="h-3.5 w-3.5" />
              Resubmitting: {resubmit.title}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-3">
            Activity Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Activity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Leadership Workshop Attendance, Summer Internship at TCS..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select a category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Activity Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={typeId}
                onChange={e => setTypeId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select a type...</option>
                {filteredTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Proposed Credits (1–5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCredits(c.toString())}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${credits === c.toString()
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* External References Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800 pb-3">
            External Project References (Optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                GitHub Repository Link
              </label>
              <input
                type="url"
                value={githubLink}
                onChange={e => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                LinkedIn Post / Profile Link
              </label>
              <input
                type="url"
                value={linkedinLink}
                onChange={e => setLinkedinLink(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your role, what you learned, dates attended, key outcomes, organizer details..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-2 text-right">{description.length} characters</p>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Supporting Document (PDF, Image)
          </label>
          {file ? (
            <div className="flex items-center gap-4 p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-xl">
              <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <UploadCloud className={`mx-auto h-10 w-10 mb-3 transition-colors ${dragOver ? 'text-brand-500' : 'text-slate-300 dark:text-slate-700'}`} />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Drag & drop a file or <span className="text-brand-600 dark:text-brand-400">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOCX — max 10 MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Tag className="inline h-3.5 w-3.5 mr-1" />Tags / Keywords
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-full">
                {t}
                <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-rose-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Add a tag and press Enter..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-[2] py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              : <><Send className="h-4 w-4" /> {resubmit ? 'Resubmit Activity' : 'Submit Activity'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};
