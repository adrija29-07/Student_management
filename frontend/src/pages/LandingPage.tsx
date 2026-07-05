import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, CheckCircle, Users, BarChart3, Shield,
  Star, ChevronRight, Upload, Award, Bell, Zap, BookOpen, TrendingUp,
  Mail, Phone, MapPin
} from 'lucide-react';

const Twitter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const FEATURES = [
  { icon: <Upload className="h-6 w-6" />, title: 'Easy Activity Upload', desc: 'Submit certificates, project files, and activity proofs in seconds with our drag-and-drop system.', color: 'from-blue-500 to-indigo-600' },
  { icon: <CheckCircle className="h-6 w-6" />, title: 'Mentor Approval Flow', desc: 'Structured review process ensures every activity is verified by assigned faculty mentors.', color: 'from-emerald-500 to-teal-600' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Real-time Progress', desc: 'Visual dashboards and charts to track your curriculum completion at a glance.', color: 'from-violet-500 to-purple-600' },
  { icon: <BarChart3 className="h-6 w-6" />, title: 'Automated Reports', desc: 'Generate detailed PDF and Excel progress reports instantly for faculty reviews.', color: 'from-orange-500 to-amber-600' },
  { icon: <Bell className="h-6 w-6" />, title: 'Smart Notifications', desc: 'Real-time email and in-app alerts for approvals, rejections, and pending reviews.', color: 'from-rose-500 to-pink-600' },
  { icon: <Shield className="h-6 w-6" />, title: 'Role-based Security', desc: 'Secure access for Students, Mentors, and Admins with JWT authentication.', color: 'from-slate-500 to-slate-700' },
];

const STATS = [
  { value: '10,000+', label: 'Students Enrolled' },
  { value: '500+', label: 'Faculty Mentors' },
  { value: '98%', label: 'Approval Rate' },
  { value: '50+', label: 'Institutions' },
];

const TESTIMONIALS = [
  { name: 'Arjun Kumar', role: 'B.Tech CSE Student', text: 'EduTrack made tracking my activities so much easier. I always know exactly where I stand in my curriculum.', avatar: 'A' },
  { name: 'Prof. Sharma', role: 'Faculty Mentor, Engineering', text: 'The review queue is incredibly efficient. I can review and approve student activities in minutes.', avatar: 'S' },
  { name: 'Dr. Mehta', role: 'Academic Coordinator', text: 'The admin reports give me a bird\'s eye view of departmental progress. Game changer for our institution.', avatar: 'M' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    const interval = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-outfit font-bold text-xl text-white">EduTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors shadow-lg shadow-brand-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/10 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className={`relative max-w-5xl mx-auto px-4 text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Zap className="h-3.5 w-3.5" />
            Trusted by 50+ Educational Institutions
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-outfit font-black mb-6 leading-[1.1]">
            Track, Approve &{' '}
            <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Progress Together
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for educational institutions to manage student activities,
            streamline mentor approvals, and track curriculum progress in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/register')}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-2xl shadow-brand-500/25 transition-all duration-200 text-lg"
            >
              Start Tracking Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-2xl transition-all duration-200 text-lg"
            >
              Sign In
            </button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {['✓ Upload Activities', '✓ Get Mentor Approval', '✓ Track Progress', '✓ Generate Reports'].map(f => (
              <span key={f} className="text-sm text-slate-400 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="about" className="py-16 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-outfit font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            Everything You Need
          </div>
          <h2 className="text-4xl font-outfit font-black text-white mb-4">Powerful Features for Everyone</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Built for students, mentors, and administrators — EduTrack covers every step of the curriculum journey.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-outfit font-bold text-lg text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-outfit font-black text-white mb-16">How It Works</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-gradient-to-r from-brand-600 via-violet-600 to-indigo-600 opacity-30" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Register', desc: 'Sign up as Student, Mentor, or Admin', icon: <Users className="h-6 w-6" /> },
                { step: '02', title: 'Upload', desc: 'Submit your activity with supporting documents', icon: <Upload className="h-6 w-6" /> },
                { step: '03', title: 'Review', desc: 'Mentor reviews and provides feedback', icon: <CheckCircle className="h-6 w-6" /> },
                { step: '04', title: 'Progress', desc: 'Track credits and earn your certificate', icon: <Award className="h-6 w-6" /> },
              ].map((s, i) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 z-10">
                    {s.icon}
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-outfit font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-outfit font-black text-white mb-4">What Our Users Say</h2>
        </div>
        <div className="relative">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`transition-all duration-500 ${i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0'}`}
            >
              {i === activeTestimonial && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-slate-200 leading-relaxed mb-8 italic">"{t.text}"</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {t.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-sm text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-6 bg-brand-500' : 'w-2 bg-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-brand-600/20 to-indigo-600/20 border border-brand-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
            <h2 className="text-4xl font-outfit font-black text-white mb-4 relative">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 mb-8 relative">
              Join thousands of students and educators already using EduTrack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-2xl shadow-brand-500/25 transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-2xl transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-outfit font-bold text-white">EduTrack</span>
              </div>
              <p className="text-sm text-slate-500">Empowering educational institutions with smart activity tracking.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#about" className="block hover:text-white transition-colors">About</a>
                <button onClick={() => navigate('/login')} className="block hover:text-white transition-colors">Login</button>
                <button onClick={() => navigate('/register')} className="block hover:text-white transition-colors">Register</button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>support@edutrack.edu</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+91 98765 43210</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>New Delhi, India</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
            <span>© 2024 EduTrack. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
