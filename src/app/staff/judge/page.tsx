'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import {
  Search,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  Lock,
  Trophy,
  FileText,
  LogOut,
  BarChart2,
  Mic2,
  School,
  ShieldAlert,
} from 'lucide-react';

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lockOpen } = await (supabase as any).rpc('is_judging_open');
    setIsJudgingOpen(lockOpen !== false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subData } = await (supabase.from('public_approved_submissions') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (subData) {
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

  const evaluated = submissions.filter((s) => s.user_has_scored).length;
  const pending = submissions.length - evaluated;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#027B39] border border-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Judge Evaluation Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              My Judging Queue
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Score approved student debate submissions across all criteria.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {!isJudgingOpen && (
              <span className="badge badge-rejected text-xs py-1 px-3">
                <Lock className="w-3 h-3" />
                Judging Locked
              </span>
            )}
            <button onClick={fetchJudgeData} className="btn-ghost text-xs flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
          </div>
        </div>

        {/* Judging Lock Warning */}
        {!isJudgingOpen && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-4 text-xs text-rose-900">
            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Judging Locked by Administrators</p>
              <p className="text-neutral-700 mt-0.5">
                The evaluation period has been locked. You can view existing scores, but cannot submit new scores until unlocked by an admin.
              </p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                Total Assigned Candidates
              </span>
              <p className="text-2xl font-black text-neutral-900 font-mono">{submissions.length}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-[#027B39] uppercase tracking-wider">
                Evaluated by You
              </span>
              <p className="text-2xl font-black text-[#027B39] font-mono">{evaluated}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                Pending Evaluation
              </span>
              <p className="text-2xl font-black text-amber-800 font-mono">{pending}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, school..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium outline-none focus:border-[#027B39]"
            />
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#027B39]" />
              <span>Loading debate candidates...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No debate candidates available in your queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate & School</th>
                    <th>Debate Topic</th>
                    <th>Submitted</th>
                    <th>Evaluation Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="font-bold text-neutral-900 block">{item.full_name}</span>
                        <span className="text-[11px] text-neutral-500">{item.school}</span>
                      </td>
                      <td className="max-w-xs truncate italic text-neutral-600">&quot;{item.debate_topic}&quot;</td>
                      <td className="whitespace-nowrap text-xs text-neutral-500">{formatDate(item.created_at)}</td>
                      <td>
                        {item.user_has_scored ? (
                          <span className="badge badge-approved">
                            <CheckCircle2 className="w-3 h-3" /> Evaluated
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            <Clock className="w-3 h-3" /> Pending Evaluation
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/staff/judge/${item.id}`}
                          className={`btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto ${
                            !isJudgingOpen ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{item.user_has_scored ? 'Edit Evaluation' : 'Score Candidate'}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
