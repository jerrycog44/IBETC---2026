'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import {
  Search, CheckCircle2, Clock, Play, RefreshCw, Lock,
  Trophy, FileText, LogOut, BarChart2, Mic2
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

    const { data: { user } } = await supabase.auth.getUser();

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

  useEffect(() => { fetchJudgeData(); }, [fetchJudgeData]);

  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredSubmissions(submissions); return; }
    const q = searchQuery.toLowerCase();
    setFilteredSubmissions(
      submissions.filter((s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.debate_topic.toLowerCase().includes(q)
      )
    );
  }, [submissions, searchQuery]);

  const evaluated = submissions.filter((s) => s.user_has_scored).length;
  const pending = submissions.length - evaluated;

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      {/* ====================================================================
          SIDEBAR
          ==================================================================== */}
      <aside className="sidebar-nav hidden lg:flex">
        <div className="sidebar-logo">
          <Link href="/" className="flex items-center gap-3">
            <img src="/eygii-logo.png" alt="EYGII Logo" className="h-10 object-contain" />
            <div>
              <p className="text-xs font-black text-emerald-950 uppercase tracking-tight leading-tight font-display">EYGII Judge</p>
              <p className="text-[10px] text-emerald-700 italic mt-0.5">IBETC 2026</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5">
          <Link href="/staff/judge" className="sidebar-link active">
            <BarChart2 className="w-4 h-4" />
            My Queue
          </Link>
        </nav>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/" className="sidebar-link text-slate-400">
            <LogOut className="w-4 h-4" />
            Exit Portal
          </Link>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT
          ==================================================================== */}
      <main className="flex-1 p-6 sm:p-8 min-w-0">
        <div className="max-w-5xl space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="section-eyebrow mb-3">
                <Mic2 className="w-3.5 h-3.5" />
                Virtual Judge Portal
              </div>
              <h1 className="section-title text-3xl">My Judging Queue</h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Evaluate approved student debate submissions.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {!isJudgingOpen && (
                <span className="badge badge-rejected">
                  <Lock className="w-3 h-3" />
                  Judging Locked
                </span>
              )}
              <button
                onClick={fetchJudgeData}
                className="btn-ghost text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats row */}
          {!isLoading && (
            <div className="grid grid-cols-3 gap-4 animate-fade-in">
              {[
                { label: 'Total Assigned', value: submissions.length, color: 'stat-card-indigo', icon: FileText, iconClass: 'text-brand-600 bg-brand-50' },
                { label: 'Evaluated', value: evaluated, color: 'stat-card-emerald', icon: CheckCircle2, iconClass: 'text-emerald-700 bg-emerald-50' },
                { label: 'Remaining', value: pending, color: 'stat-card-amber', icon: Clock, iconClass: 'text-amber-700 bg-amber-50' },
              ].map(({ label, value, color, icon: Icon, iconClass }) => (
                <div key={label} className={`stat-card ${color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Judging locked warning */}
          {!isJudgingOpen && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-4 animate-slide-up">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-rose-900 mb-1">Judging is Currently Locked</p>
                <p className="text-sm text-rose-700">
                  The competition administrator has locked the judging process. Contact the admin for more information.
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="search-bar max-w-md">
            <Search className="search-icon w-4 h-4" />
            <input
              type="text"
              id="judge-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participant, school, or topic..."
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                <span className="text-sm">Loading available debate entries...</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <Mic2 className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">
                  {searchQuery ? 'No matches found' : 'No entries available for judging'}
                </p>
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Approved debate entries will appear here once approved by the organizer.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participant &amp; School</th>
                      <th>Debate Topic</th>
                      <th>Submitted</th>
                      <th>Your Evaluation</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="font-semibold text-slate-900 block">{item.full_name}</span>
                          <span className="text-[11px] text-slate-400">{item.school}</span>
                        </td>
                        <td className="max-w-xs">
                          <span className="text-slate-600 block truncate">{item.debate_topic}</span>
                        </td>
                        <td className="whitespace-nowrap text-slate-500">{formatDate(item.created_at)}</td>
                        <td>
                          {item.user_has_scored ? (
                            <span className="badge badge-approved">
                              <CheckCircle2 className="w-3 h-3" />
                              Evaluated
                            </span>
                          ) : (
                            <span className="badge badge-pending">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/staff/judge/${item.id}`}
                            className={`btn-primary text-xs px-4 py-2 ${!isJudgingOpen ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            {item.user_has_scored ? 'Edit Scores' : 'Judge Video'}
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
    </div>
  );
}
