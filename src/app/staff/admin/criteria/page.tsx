'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createCriterionAction, updateCriterionAction } from '@/app/actions/criteria';
import { toggleJudgingLockAction } from '@/app/actions/scores';
import {
  Sliders,
  Plus,
  Lock,
  Unlock,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  FileText,
  Users,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface CriterionItem {
  id: string;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
  is_active: boolean;
  display_order: number;
}

export default function AdminJudgingCriteriaPage() {
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);
  const [isJudgingOpen, setIsJudgingOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxScore, setMaxScore] = useState<number>(20);
  const [weight, setWeight] = useState<number>(1.0);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: superAdmin } = await (supabase as any).rpc('is_super_admin');
    setIsSuperAdmin(Boolean(superAdmin));

    if (superAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: criteriaData } = await (supabase.from('judging_criteria') as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (criteriaData) {
        setCriteria(criteriaData as CriterionItem[]);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lockOpen } = await (supabase as any).rpc('is_judging_open');
      setIsJudgingOpen(lockOpen !== false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Criterion name is required.' });
      return;
    }
    if (maxScore <= 0) {
      setMessage({ type: 'error', text: 'Maximum score must be positive.' });
      return;
    }

    setIsSubmitting(true);
    const res = await createCriterionAction({
      name,
      description,
      maxScore,
      weight,
      displayOrder,
      isActive: true,
    });
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Judging criterion added successfully.' });
      setName('');
      setDescription('');
      setMaxScore(20);
      setWeight(1.0);
      setDisplayOrder(criteria.length + 1);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to add criterion.' });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setMessage(null);
    const res = await updateCriterionAction(id, { isActive: !currentState });
    if (res.success) {
      setCriteria((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_active: !currentState } : item))
      );
      setMessage({ type: 'success', text: 'Criterion status updated.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update criterion.' });
    }
  };

  const handleToggleLock = async () => {
    setMessage(null);
    const nextState = !isJudgingOpen;
    const res = await toggleJudgingLockAction(nextState);
    if (res.success) {
      setIsJudgingOpen(nextState);
      setMessage({
        type: 'success',
        text: nextState ? 'Judging lock is now OPEN.' : 'Judging is now LOCKED.',
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to toggle judging lock.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8faf7]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#031c0e] text-white p-6 hidden lg:flex flex-col border-r border-brand-600/30">
        <div className="pb-6 border-b border-brand-600/20 mb-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/eygii-logo.png" alt="EYGII Logo" className="h-10 bg-white rounded p-1 object-contain" />
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tight font-display">EYGII Admin</p>
              <p className="text-[10px] text-emerald-400 italic">IBETC 2026</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 text-sm font-semibold">
          <Link href="/staff/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
            <BarChart2 className="w-4 h-4" />
            Dashboard Overview
          </Link>
          <Link href="/staff/admin/submissions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
            <FileText className="w-4 h-4" />
            Submissions & Votes
          </Link>
          <Link href="/staff/admin/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
            <Users className="w-4 h-4" />
            Staff & Judges
          </Link>
          <Link href="/staff/admin/criteria" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#027B39] text-white">
            <Sliders className="w-4 h-4" />
            Judging Criteria
          </Link>
        </nav>
        <div className="pt-4 border-t border-brand-600/20">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white px-3 py-2">
            <LogOut className="w-4 h-4" />
            Exit Admin Portal
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 sm:p-8 min-w-0">
        <div className="lg:hidden mb-4">
          <Link href="/staff/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Judging Criteria & Controls</h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Configure evaluation criteria, maximum bounds, weights, and lock judging during live evaluation.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 border text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#027B39] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {!isLoading && !isSuperAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
              <h2 className="text-base font-bold text-amber-900">Super Admin Privileges Required</h2>
              <p className="text-xs text-amber-800 leading-relaxed">
                Only authorized Super Administrators can configure criteria or toggle the judging lock state.
              </p>
            </div>
          ) : (
            <>
              {/* Lock Control Card */}
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#027B39]">
                      JUDGING LOCK CONTROL
                    </span>
                    <span className={`badge ${isJudgingOpen ? 'badge-approved' : 'badge-rejected'}`}>
                      {isJudgingOpen ? 'JUDGING UNLOCKED' : 'JUDGING LOCKED'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    {isJudgingOpen
                      ? 'Judges can submit and edit score evaluations.'
                      : 'Judging is locked. Score entries cannot be added or edited by judges.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleLock}
                  className={`btn-primary text-xs py-2.5 px-5 flex items-center gap-2 ${
                    isJudgingOpen ? 'bg-amber-700 hover:bg-amber-800 border-amber-700' : 'bg-[#027B39]'
                  }`}
                >
                  {isJudgingOpen ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Lock Judging</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Unlock Judging</span>
                    </>
                  )}
                </button>
              </div>

              {/* Add Criterion Form */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
                  <Plus className="w-4 h-4 text-[#027B39]" />
                  <span>Add New Judging Criterion</span>
                </div>

                <form onSubmit={handleCreateCriterion} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="form-label">
                      Criterion Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Oratory & Delivery"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="form-label">Description / Evaluation Guidelines</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Evaluates vocal clarity, tone, confidence, and rhetorical effectiveness."
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Max Score <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      required
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="form-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Weight Multiplier <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="form-input font-mono"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary text-xs py-3 w-full flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Add Criterion</span>}
                    </button>
                  </div>
                </form>
              </div>

              {/* Criteria List */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Active Criteria ({criteria.length})
                  </span>
                  <button onClick={fetchData} className="btn-ghost text-xs flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#027B39]" />
                    <span>Loading criteria...</span>
                  </div>
                ) : criteria.length === 0 ? (
                  <div className="p-12 text-center text-xs text-neutral-500">
                    No criteria configured yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Criterion & Guidelines</th>
                          <th>Max Score</th>
                          <th>Weight</th>
                          <th>Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {criteria.map((c) => (
                          <tr key={c.id}>
                            <td className="font-bold text-neutral-400 font-mono">#{c.display_order}</td>
                            <td>
                              <span className="font-bold text-neutral-900 block">{c.name}</span>
                              {c.description && <span className="text-neutral-500 text-[11px] block mt-0.5">{c.description}</span>}
                            </td>
                            <td className="font-mono font-bold text-neutral-900">{c.max_score} pts</td>
                            <td className="font-mono text-neutral-600">{c.weight}x</td>
                            <td>
                              <span className={`badge ${c.is_active ? 'badge-approved' : 'badge-hidden'}`}>
                                {c.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-right">
                              <button
                                onClick={() => handleToggleActive(c.id, c.is_active)}
                                className="btn-ghost text-xs py-1 px-3"
                              >
                                {c.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
