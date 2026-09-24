'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import { createClient } from '@/lib/supabase/client';
import { saveJudgeScoresAction } from '@/app/actions/scores';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  School,
  MessageSquare,
  Award,
} from 'lucide-react';

interface CriterionItem {
  id: string;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
}

interface SubmissionItem {
  id: string;
  full_name: string;
  school: string;
  debate_topic: string;
}

export default function JudgeScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [submission, setSubmission] = useState<SubmissionItem | null>(null);
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);

  // Scores state: Map of criterionId -> score number
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [isJudgingOpen, setIsJudgingOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadJudgingData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Check judging lock status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lockOpen } = await (supabase as any).rpc('is_judging_open');
    setIsJudgingOpen(lockOpen !== false);

    // 2. Fetch submission metadata
    const { data: subData } = await supabase
      .from('public_approved_submissions')
      .select('id, full_name, school, debate_topic')
      .eq('id', id)
      .single();

    if (subData) {
      setSubmission(subData as SubmissionItem);
    }

    // 3. Fetch active criteria
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: criteriaData } = await (supabase.from('judging_criteria') as any)
      .select('id, name, description, max_score, weight')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (criteriaData) {
      setCriteria(criteriaData as CriterionItem[]);
    }

    // 4. Fetch judge's existing scores if any
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingScores } = await (supabase.from('scores') as any)
        .select('criterion_id, score, notes')
        .eq('submission_id', id)
        .eq('judge_id', user.id);

      if (existingScores && existingScores.length > 0) {
        const initialScores: Record<string, number> = {};
        const initialNotes: Record<string, string> = {};
        existingScores.forEach((s: { criterion_id: string; score: number; notes: string | null }) => {
          initialScores[s.criterion_id] = Number(s.score);
          if (s.notes) initialNotes[s.criterion_id] = s.notes;
        });
        setScores(initialScores);
        setNotes(initialNotes);
      }
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadJudgingData();
  }, [loadJudgingData]);

  const handleScoreChange = (criterionId: string, val: string, maxScore: number) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setScores((prev) => ({ ...prev, [criterionId]: 0 }));
      return;
    }
    const clamped = Math.max(0, Math.min(num, maxScore));
    setScores((prev) => ({ ...prev, [criterionId]: clamped }));
  };

  const handleNotesChange = (criterionId: string, val: string) => {
    setNotes((prev) => ({ ...prev, [criterionId]: val }));
  };

  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isJudgingOpen) {
      setMessage({ type: 'error', text: 'Judging is currently locked by administrators.' });
      return;
    }

    if (criteria.length === 0) {
      setMessage({ type: 'error', text: 'No active judging criteria found.' });
      return;
    }

    const scoreEntries = criteria.map((c) => ({
      criterionId: c.id,
      score: scores[c.id] || 0,
      notes: notes[c.id] || '',
    }));

    setIsSaving(true);
    const res = await saveJudgeScoresAction(id, scoreEntries);
    setIsSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Your evaluation scores have been saved successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save scores.' });
    }
  };

  const totalRawScore = criteria.reduce((acc, c) => acc + (scores[c.id] || 0), 0);
  const maxPossibleScore = criteria.reduce((acc, c) => acc + c.max_score, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <Link
          href="/staff/judge"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#027B39]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Judge Queue</span>
        </Link>

        {/* Lock warning */}
        {!isJudgingOpen && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Judging Locked:</strong> The organizers have locked judging. Scores cannot be modified at this time.
            </span>
          </div>
        )}

        {/* Feedback message */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
            Loading candidate details &amp; scoring criteria...
          </div>
        ) : !submission ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
            Candidate submission not found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Candidate & Video */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#027B39]">
                    DEBATER CANDIDATE
                  </span>
                  <h1 className="text-xl font-extrabold text-neutral-900">{submission.full_name}</h1>
                  <p className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-[#027B39]" /> {submission.school}
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] block">Debate Motion</span>
                  <p className="italic text-neutral-800">&quot;{submission.debate_topic}&quot;</p>
                </div>
              </div>

              {/* Video Player */}
              <VideoPlayer
                submissionId={submission.id}
                posterTitle={`${submission.full_name} — ${submission.school}`}
              />

              {/* Total Score Summary */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-2 shadow-sm">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Total Evaluation Score
                </h3>
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-neutral-600 font-medium">Accumulated Points:</span>
                  <span className="font-black text-[#027B39] text-xl font-mono">
                    {totalRawScore.toFixed(1)} / {maxPossibleScore}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Scoring Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
                
                <div className="border-b border-neutral-200 pb-4">
                  <h2 className="text-lg font-black text-neutral-900">Judging Evaluation Criteria</h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Score each active criterion out of its maximum bounds.
                  </p>
                </div>

                <form onSubmit={handleSaveScores} className="space-y-6">
                  {criteria.map((c) => {
                    const currentScore = scores[c.id] ?? 0;
                    const currentNotes = notes[c.id] ?? '';

                    return (
                      <div key={c.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-extrabold text-neutral-900">{c.name}</h3>
                            {c.description && (
                              <p className="text-[11px] text-neutral-600 mt-0.5">{c.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-xs font-bold text-neutral-600">
                              Score (Max {c.max_score}):
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={c.max_score}
                              step="0.5"
                              disabled={!isJudgingOpen}
                              value={currentScore}
                              onChange={(e) => handleScoreChange(c.id, e.target.value, c.max_score)}
                              className="w-20 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 outline-none focus:border-[#027B39]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-500 mb-1">
                            Judge Notes &amp; Observations (Optional)
                          </label>
                          <textarea
                            rows={2}
                            disabled={!isJudgingOpen}
                            value={currentNotes}
                            onChange={(e) => handleNotesChange(c.id, e.target.value)}
                            placeholder="Add evaluation comments..."
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-900 outline-none focus:border-[#027B39]"
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!isJudgingOpen || isSaving}
                      className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Evaluation...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Evaluation Scores</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
