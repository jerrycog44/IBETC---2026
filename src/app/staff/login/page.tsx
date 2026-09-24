'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { Lock, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
      setErrorMessage('Please enter your email address and password.');
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
        throw new Error(authError?.message || 'Invalid staff email or password.');
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
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm inline-flex items-center justify-center mx-auto">
              <Image
                src="/eygii-logo.png"
                alt="EYGII Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              EYGII Staff Portal
            </h1>
            <p className="text-xs text-neutral-600 font-medium">
              Authorized Competition Administrators & Judges
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="staff@eygii.org"
                  className="form-input"
                />
              </div>

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
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full justify-center py-3 text-xs uppercase font-bold tracking-wider"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Staff Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-neutral-100 text-center">
              <p className="text-[11px] text-neutral-500">
                Staff accounts are provisioned by super administrators. Public registration is restricted.
              </p>
            </div>

          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-[#027B39]" />
            <span>IBETC 2026 Secured Authorization</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
