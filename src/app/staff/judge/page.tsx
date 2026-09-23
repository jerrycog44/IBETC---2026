'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { Search, CheckCircle2, Clock, Play, RefreshCw, Lock } from 'lucide-react';

interface JudgeSubmissionItem {
  id: string;
  full_name: string;
  school: string;
  debate_topic: string;
  created_at: string;
  user_has_scored?: boolean;
}

export default function JudgeDashboardPage() {
  const [submissions, setSubmissions] = useState<JudgeSubmissionItem[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<JudgeSubmissionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJudgingOpen, setIsJudgingOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJudgeData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check judging lock status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lockOpen } = await (supabase as any).rpc('is_judging_open');
    setIsJudgingOpen(lockOpen !== false);

    // Query approved submissions available for judging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subData } = await (supabase.from('public_approved_submissions') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (subData) {
      // Fetch judge's existing scores to mark completed submissions
      let scoredSubmissionIds = new Set<string>();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: scoresData } = await (supabase.from('scores') as any)
          .select('submission_id')
          .eq('judge_id', user.id);

        if (scoresData) {
          scoredSubmissionIds = new Set(scoresData.map((s: { submission_id: string }) => s.submission_id));
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = (subData as any[]).map((item) => ({
        ...item,
        user_has_scored: scoredSubmissionIds.has(item.id),
      }));

      setSubmissions(formatted as JudgeSubmissionItem[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchJudgeData();
  }, [fetchJudgeData]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredSubmissions(
      submissions.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.debate_topic.toLowerCase().includes(q)
      )
    );
  }, [submissions, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">IBETC 2026</span>
            <h1 className="text-2xl font-extrabold text-slate-900">Virtual Judge Portal</h1>
            <p className="text-xs text-slate-500 mt-0.5">Evaluate approved student debate submissions.</p>
          </div>

          <div className="flex items-center space-x-3">
            {!isJudgingOpen && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Judging Locked</span>
              </span>
            )}
            <button
              onClick={fetchJudgeData}
              className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant name, school, topic..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* SUBMISSIONS LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              <span>Loading debate entries available for judging...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No debate entries available for judging.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-4">Participant & School</th>
                    <th className="p-4">Debate Topic</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4">Your Evaluation</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubmissions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{item.full_name}</span>
                        <span className="text-slate-500 text-[11px] block">{item.school}</span>
                      </td>
                      <td className="p-4 max-w-xs truncate">{item.debate_topic}</td>
                      <td className="p-4 whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="p-4">
                        {item.user_has_scored ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Evaluated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Not Judged Yet</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/staff/judge/${item.id}`}
                          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors inline-flex items-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{item.user_has_scored ? 'Edit Scores' : 'Judge Video'}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
