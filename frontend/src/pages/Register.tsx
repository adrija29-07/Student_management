import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Lock, Mail, User as UserIcon, Building,
  ArrowRight, Loader2, BookOpen, Heart, Cpu, Trophy
} from 'lucide-react';

const HOBBIES = [
  '⚽ Sports', '🎵 Music', '💃 Dance', '🎨 Art & Design',
  '🎮 Gaming', '📚 Reading', '📸 Photography', '✈️ Travel',
  '🍳 Cooking', '🎭 Theatre',
];

const TECH_INTERESTS = [
  '🌐 Web Development', '📱 App Development', '🤖 AI / ML',
  '🔐 Cybersecurity', '📊 Data Science', '☁️ Cloud Computing',
  '🤖 Robotics', '🔗 Blockchain', '🖥️ System Design',
];

const ACADEMIC_INTERESTS = [
  '🔬 Research', '📝 Publications', '💼 Internships',
  '🏆 Competitive Programming', '🌍 Open Source', '📜 Certifications',
  '🎤 Public Speaking', '🤝 Volunteering',
];

const DEPARTMENTS = [
  { value: 'CSE', label: 'Computer Science (CSE)' },
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'ECE', label: 'Electronics (ECE)' },
  { value: 'MECH', label: 'Mechanical (MECH)' },
  { value: 'CIVIL', label: 'Civil Engineering (CIVIL)' },
  { value: 'EE', label: 'Electrical (EE)' },
  { value: 'AIDS', label: 'AI & Data Science (AIDS)' },
  { value: 'ME', label: 'Mechatronics (ME)' },
];

const TagButton: React.FC<{
  label: string;
  selected: boolean;
  onToggle: () => void;
}> = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all duration-150 ${
      selected
        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-300'
        : 'bg-blue-50 border-blue-200 text-slate-600 hover:bg-blue-100 hover:border-blue-400'
    }`}
  >
    {label}
  </button>
);

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const toggleInterest = (item: string) => {
    setSelectedInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !department) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name, 'STUDENT', department, selectedInterests);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #e0e7ff 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-200/50 p-7 sm:p-10 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-outfit font-extrabold text-slate-800">
              {step === 1 ? 'Create Your Account' : 'Your Interests & Hobbies'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === 1
                ? 'Register as a student to track your activities'
                : 'Help us personalise your experience and send smart reminders'}
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`h-2 w-8 rounded-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-blue-100'}`} />
              <div className={`h-2 w-8 rounded-full transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-blue-100'}`} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3.5 mb-5 text-center">
              {error}
            </div>
          )}

          {/* ── STEP 1: Basic info ── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Arjun Mehta"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="arjun@university.edu"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <select
                    id="reg-dept"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1.5 text-xs text-blue-500 font-medium">
                  📌 You'll be automatically assigned to your department's mentor
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="reg-next-btn"
                className="group w-full flex justify-center items-center gap-2 py-3.5 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
              >
                Next: Add Interests
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* ── STEP 2: Interests ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hobbies */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-bold text-slate-700">Hobbies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOBBIES.map(h => (
                    <TagButton key={h} label={h} selected={selectedInterests.includes(h)} onToggle={() => toggleInterest(h)} />
                  ))}
                </div>
              </div>

              {/* Technology */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-700">Technology Interests</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TECH_INTERESTS.map(t => (
                    <TagButton key={t} label={t} selected={selectedInterests.includes(t)} onToggle={() => toggleInterest(t)} />
                  ))}
                </div>
              </div>

              {/* Academic */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-700">Academic Goals</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_INTERESTS.map(a => (
                    <TagButton key={a} label={a} selected={selectedInterests.includes(a)} onToggle={() => toggleInterest(a)} />
                  ))}
                </div>
              </div>

              {selectedInterests.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-medium">
                  ✅ {selectedInterests.length} interest{selectedInterests.length > 1 ? 's' : ''} selected — we'll remind you if you fall behind!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  id="reg-submit-btn"
                  className="flex-1 flex justify-center items-center gap-2 py-3 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                  style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>Create Account <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-5 pt-5 border-t border-blue-100">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <span>Student Curriculum & Activity Tracking System</span>
        </div>
      </div>
    </div>
  );
};
