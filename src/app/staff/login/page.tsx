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
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">IBETC 2026</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-950 to-brand-800 flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-glow">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="section-title text-3xl">Staff Portal</h1>
            <p className="text-slate-500 text-sm mt-2">
              Authorized admin &amp; judge access only
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
