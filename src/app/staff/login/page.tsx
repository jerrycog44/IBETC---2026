'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Lock, AlertCircle, RefreshCw, ArrowLeft, Eye, EyeOff, Mic2 } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Invalid staff credentials.');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: staffData, error: staffError } = await (supabase.from('staff_users') as any)
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (staffError || !staffData) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Account is not registered as authorized staff.');
      }

      if (staffData.role === 'judge') {
        router.push('/staff/judge');
      } else {
        router.push('/staff/admin');
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Top nav */}
      <div className="bg-white border-b border-emerald-900/10 shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <div className="w-px h-6 bg-emerald-900/15" />
            <Link href="/" className="flex items-center gap-3">
              <img src="/eygii-logo.png" alt="EYGII Logo" className="h-10 object-contain" />
              <div className="text-left">
                <span className="block text-xs font-black text-emerald-900 uppercase tracking-tight">EYGII — IBETC 2026</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="bg-white p-4 rounded-3xl border border-emerald-400/30 shadow-xl inline-flex flex-col items-center gap-2 mb-4">
              <img src="/eygii-logo.png" alt="EYGII Official Logo" className="h-16 object-contain" />
              <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider font-display">
                Eloquent Youth &amp; Global Integrity (EYGII)
              </p>
            </div>
            <h1 className="section-title text-3xl">Staff Portal</h1>
            <p className="text-emerald-700 text-sm mt-1 font-medium">
              Authorized Admin &amp; Judge Portal
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-950 via-brand-700 to-brand-500" />

            <div className="p-8">
              {/* Error alert */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-slide-up">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="form-label">
                    Staff Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@eloquentyouth.org"
                    autoComplete="email"
                    className="form-input"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="form-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="staff-login-btn"
                    disabled={isLoading}
                    className="btn-primary w-full justify-center py-4 text-base"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Sign In to Staff Portal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer note */}
            <div className="bg-slate-50 border-t border-slate-100 px-8 py-4">
              <p className="text-center text-xs text-slate-400 leading-relaxed">
                Staff accounts are provisioned by authorized system administrators.
                Public registration is disabled.
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Secured by Supabase Auth · IBETC 2026</span>
          </div>
        </div>
      </div>
    </main>
  );
}
