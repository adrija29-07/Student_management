import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    // Mock: wait 1.5s then show success (real implementation would call authAPI.forgotPassword)
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    startCooldown();
  };

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    startCooldown();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-outfit font-bold text-2xl text-white">EduTrack</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {!submitted ? (
            <>
              {/* Step 1: Email input */}
              <div className="text-center mb-8">
                <div className="h-14 w-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-brand-400" />
                </div>
                <h2 className="text-2xl font-outfit font-bold text-white mb-2">Reset Password</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      id="forgot-email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@institution.edu"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:border-brand-500/50 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>

              <button
                onClick={() => navigate('/login')}
                className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </>
          ) : (
            <>
              {/* Step 2: Success state */}
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-outfit font-bold text-white mb-3">Check Your Email</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-brand-400 mb-6 text-sm">{email}</p>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-2 mb-6">
                  <p className="text-xs text-slate-400">💡 <strong className="text-slate-300">Didn't receive it?</strong></p>
                  <ul className="text-xs text-slate-500 space-y-1 ml-4">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• The link expires in 30 minutes</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-slate-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Resending...</>
                      : cooldown > 0
                        ? <><RefreshCw className="h-4 w-4" /> Resend in {cooldown}s</>
                        : <><RefreshCw className="h-4 w-4" /> Resend Link</>
                    }
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2024 EduTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
};
