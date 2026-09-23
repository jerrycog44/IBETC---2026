'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { saveJudgeScoresAction } from '@/app/actions/scores';
import { ArrowLeft, Play, Lock, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';

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
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
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

      // Fetch signed video URL
      const res = await fetch(`/api/video/signed-url?submissionId=${id}`);
      if (res.ok) {
        const videoData = await res.json();
        if (videoData.signedUrl) {
          setSignedVideoUrl(videoData.signedUrl);
        }
      }
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
    // Clamp score between 0 and maxScore
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

    // Format score payload
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

  // Calculate total evaluation score
  const totalRawScore = criteria.reduce((acc, c) => acc + (scores[c.id] || 0), 0);
  const totalWeightedScore = criteria.reduce((acc, c) => acc + (scores[c.id] || 0) * (c.weight || 1), 0);
  const maxPossibleScore = criteria.reduce((acc, c) => acc + c.max_score, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/staff/judge" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Judge Dashboard</span>
        </Link>

        {/* JUDGING LOCK BANNER */}
        {!isJudgingOpen && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>
              <strong>Judging Locked:</strong> The organizers have locked judging. Scores cannot be created or edited at this time.
            </span>
          </div>
        )}

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

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            Loading submission and judging criteria...
          </div>
        ) : !submission ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            Submission not found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: VIDEO PLAYER & METADATA */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="aspect-video bg-slate-900 relative">
                  {signedVideoUrl ? (
                    <video controls src={signedVideoUrl} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      <Play className="w-6 h-6 mr-1" />
                      <span>Loading video...</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Submission #{submission.id.substring(0, 8)}</span>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">{submission.full_name}</h1>
                  <p className="text-xs font-semibold text-brand-600">{submission.school}</p>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Debate Topic</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{submission.debate_topic}</p>
                  </div>
                </div>
              </div>

              {/* SCORE SUMMARY CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Evaluation Summary</h3>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500">Total Score:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {totalRawScore.toFixed(1)} / {maxPossibleScore}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Weighted Total:</span>
                  <span className="font-mono font-bold text-brand-600 text-sm">
                    {totalWeightedScore.toFixed(1)} pts
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CRITERIA SCORING FORM */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                <header className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900">Evaluation Criteria</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enter scores and optional notes for each active criterion.</p>
                </header>

                <form onSubmit={handleSaveScores} className="space-y-6">
                  {criteria.map((c) => {
                    const currentScore = scores[c.id] ?? 0;
                    const currentNotes = notes[c.id] ?? '';

                    return (
                      <div key={c.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">{c.name}</h3>
                            {c.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                            <span className="text-xs font-semibold text-slate-400">Score (Max {c.max_score}):</span>
                            <input
                              type="number"
                              min="0"
                              max={c.max_score}
                              step="0.5"
                              disabled={!isJudgingOpen}
                              value={currentScore}
                              onChange={(e) => handleScoreChange(c.id, e.target.value, c.max_score)}
                              className="w-20 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor={`notes-${c.id}`} className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Judge Notes (Optional)
                          </label>
                          <textarea
                            id={`notes-${c.id}`}
                            rows={2}
                            disabled={!isJudgingOpen}
                            value={currentNotes}
                            onChange={(e) => handleNotesChange(c.id, e.target.value)}
                            placeholder="Add evaluation notes or feedback..."
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!isJudgingOpen || isSaving}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
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
      </div>
    </main>
  );
}
