import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { toggleVotingLockAction } from '@/app/actions/voting';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  EyeOff,
  Users,
  Sliders,
  ArrowRight,
  Trophy,
  LogOut,
  BarChart2,
  Shield,
  ThumbsUp,
  Award,
  Lock,
  Unlock,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch updated stats including total votes and finalists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: statsData } = await (supabase as any).rpc('get_admin_submission_stats');
  const stats = statsData?.[0] || {
    total_count: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    hidden_count: 0,
    total_votes: 0,
    finalists_count: 0,
  };

  // Check voting open setting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isVotingOpen } = await (supabase as any).rpc('is_voting_open');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const statCards = [
    {
      label: 'Total Submissions',
      value: Number(stats.total_count),
      icon: FileText,
      color: 'text-[#027B39] bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pending Review',
      value: Number(stats.pending_count),
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Approved Entries',
      value: Number(stats.approved_count),
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total Votes Recorded',
      value: Number(stats.total_votes),
      icon: ThumbsUp,
      color: 'text-emerald-800 bg-[#e8f5ed] border-emerald-300',
    },
    {
      label: 'Grand Finale Finalists',
      value: Number(stats.finalists_count),
      icon: Trophy,
      color: 'text-amber-800 bg-amber-100 border-amber-300',
    },
    {
      label: 'Rejected Entries',
      value: Number(stats.rejected_count),
      icon: XCircle,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      label: 'Hidden Entries',
      value: Number(stats.hidden_count),
      icon: EyeOff,
      color: 'text-neutral-600 bg-neutral-100 border-neutral-200',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8faf7]">
      {/* ====================================================================
          SIDEBAR
          ==================================================================== */}
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
          <Link href="/staff/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#027B39] text-white">
            <BarChart2 className="w-4 h-4" />
            Dashboard Overview
          </Link>
          <Link href="/staff/admin/submissions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
            Submissions &amp; Votes
          </Link>
          <Link href="/staff/admin/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white transition-colors">
            <Users className="w-4 h-4" />
            Staff &amp; Judges
          </Link>
          <Link href="/staff/admin/criteria" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white transition-colors">
            <Sliders className="w-4 h-4" />
            Judging Criteria
          </Link>
        </nav>

        <div className="pt-4 border-t border-brand-600/20 space-y-3">
          {user && (
            <div className="px-3 py-2 rounded-lg bg-[#062915] border border-emerald-500/20 text-xs">
              <p className="text-[10px] text-neutral-400">Logged in as</p>
              <p className="font-bold text-emerald-300 truncate">{user.email}</p>
            </div>
          )}
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors px-3 py-2">
            <LogOut className="w-4 h-4" />
            Exit Admin Portal
          </Link>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT
          ==================================================================== */}
      <main className="flex-1 p-6 sm:p-8 min-w-0">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <img src="/eygii-logo.png" alt="EYGII Logo" className="h-8 object-contain" />
            <span className="text-sm font-extrabold text-neutral-900">IBETC 2026 Admin</span>
          </div>
          <Link href="/" className="btn-ghost text-xs">
            <LogOut className="w-3.5 h-3.5" />
            Exit
          </Link>
        </div>

        <div className="max-w-6xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#027B39] border border-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5" />
                EYGII Competition Control Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Admin Dashboard Overview
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Real-time metrics, submission reviews, and voting controls.
              </p>
            </div>

            <Link
              href="/staff/admin/submissions"
              className="btn-primary text-xs uppercase tracking-wider py-3 px-6 flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Review Submissions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Voting Control Box */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#027B39]">
                  PUBLIC VOTING STATUS
                </span>
                <span className={`badge ${isVotingOpen ? 'badge-approved' : 'badge-rejected'}`}>
                  {isVotingOpen ? 'VOTING OPEN' : 'VOTING CLOSED'}
                </span>
              </div>
              <p className="text-xs text-neutral-600">
                {isVotingOpen
                  ? 'Supporters can cast votes on approved debater entry pages.'
                  : 'Public voting is locked by organizers.'}
              </p>
            </div>

            <form
              action={async () => {
                'use server';
                await toggleVotingLockAction(!isVotingOpen);
              }}
            >
              <button
                type="submit"
                className={`btn-primary text-xs py-2.5 px-5 flex items-center gap-2 ${
                  isVotingOpen ? 'bg-amber-700 hover:bg-amber-800 border-amber-700' : 'bg-[#027B39]'
                }`}
              >
                {isVotingOpen ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Close Voting</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Open Voting</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className={`p-5 rounded-xl border bg-white shadow-sm space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                      {card.label}
                    </span>
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-neutral-900">Competition Management Portals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <Link
                href="/staff/admin/submissions"
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:border-[#027B39] transition-all group space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#027B39] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-[#027B39]">
                  Submissions &amp; Voting
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Review student entries, play videos, approve entries, inspect vote counts, and manage finalists.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#027B39] pt-2">
                  <span>Manage Submissions</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/staff/admin/staff"
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:border-[#027B39] transition-all group space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-[#027B39]">
                  Staff &amp; Judges
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Manage organizer staff roles, assign super admins, admins, and panel judges.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#027B39] pt-2">
                  <span>Manage Staff</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/staff/admin/criteria"
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:border-[#027B39] transition-all group space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-[#027B39]">
                  Judging Criteria
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Define evaluation criteria, maximum scores, weights, and lock judging for the Grand Finale.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#027B39] pt-2">
                  <span>Manage Criteria</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
