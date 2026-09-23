'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createCriterionAction, updateCriterionAction } from '@/app/actions/criteria';
import { toggleJudgingLockAction } from '@/app/actions/scores';
import { Sliders, Plus, Lock, Unlock, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

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

  // New Criterion Form State
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
        text: nextState ? 'Judging is now OPEN.' : 'Judging is now LOCKED.',
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to toggle judging lock.' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link href="/staff/admin" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Overview</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Judging Criteria & System Controls</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure competition evaluation metrics and control judging lock state.</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {!isLoading && !isSuperAdmin ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h2 className="text-base font-bold text-amber-900">Super Admin Privileges Required</h2>
            <p className="text-xs text-amber-800">
              Only authorized Super Administrators can configure criteria or toggle judging lock state.
            </p>
          </div>
        ) : (
          <>
            {/* JUDGING LOCK CONTROL CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                      isJudgingOpen
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {isJudgingOpen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>Judging Status: {isJudgingOpen ? 'OPEN' : 'LOCKED'}</span>
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900">Global Judging Lock System</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isJudgingOpen
                    ? 'Judges can currently view assigned entries and submit or edit scores.'
                    : 'Judging is locked. Judges cannot submit new scores or modify existing scores.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleLock}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors flex items-center space-x-1.5 flex-shrink-0 ${
                  isJudgingOpen
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isJudgingOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{isJudgingOpen ? 'Lock Judging' : 'Unlock Judging'}</span>
              </button>
            </div>

            {/* CREATE CRITERION FORM */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-brand-600" />
                <span>Add Judging Criterion</span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure official evaluation criteria for IBETC 2026 judges.
              </p>

              <form onSubmit={handleCreateCriterion} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Criterion Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Content Quality & Argument Strength"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="displayOrder" className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    id="displayOrder"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
                    Description / Evaluation Guidelines
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Evaluates logical structure, evidence, and clarity of points presented."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="maxScore" className="block text-xs font-semibold text-slate-700 mb-1">
                    Maximum Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="maxScore"
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-xs font-semibold text-slate-700 mb-1">
                    Weight Multiplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Add Criterion</span>}
                  </button>
                </div>
              </form>
            </div>

            {/* CRITERIA LIST TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <header className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  <span>Configured Criteria ({criteria.length})</span>
                </h2>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
                >
                  Refresh
                </button>
              </header>

              {isLoading ? (
                <div className="p-12 text-center text-xs text-slate-500">Loading criteria...</div>
              ) : criteria.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">No judging criteria configured yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="p-4">Order</th>
                        <th className="p-4">Criterion & Description</th>
                        <th className="p-4">Max Score</th>
                        <th className="p-4">Weight</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {criteria.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-400">#{c.display_order}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            {c.description && <span className="text-slate-500 text-[11px] block mt-0.5">{c.description}</span>}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900">{c.max_score} pts</td>
                          <td className="p-4 font-mono text-slate-600">{c.weight}x</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {c.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleActive(c.id, c.is_active)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                c.is_active
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
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
  );
}
