import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FileText, CheckCircle2, Clock, XCircle, EyeOff, Users, Sliders, ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch real submission stats using RPC
  const { data: statsData } = await supabase.rpc('get_admin_submission_stats');
  const stats = statsData?.[0] || {
    total_count: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    hidden_count: 0,
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">IBETC 2026</span>
            <h1 className="text-2xl font-extrabold text-slate-900">Organizer Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Overview of competition submissions and staff metrics.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/staff/admin/submissions"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <span>Review Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Total Entries</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{Number(stats.total_count)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/20 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold uppercase">Pending</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-900">{Number(stats.pending_count)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold uppercase">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-900">{Number(stats.approved_count)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50/20 shadow-sm">
            <div className="flex items-center justify-between text-red-700 mb-2">
              <span className="text-xs font-semibold uppercase">Rejected</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-extrabold text-red-900">{Number(stats.rejected_count)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Hidden</span>
              <EyeOff className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{Number(stats.hidden_count)}</p>
          </div>
        </div>

        {/* QUICK MANAGEMENT LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/staff/admin/submissions"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-brand-500 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Manage Submissions</h2>
            <p className="text-xs text-slate-500 mt-1">Review student debate entries, watch videos, approve, reject, or hide entries.</p>
          </Link>

          <Link
            href="/staff/admin/staff"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-brand-500 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Staff Accounts</h2>
            <p className="text-xs text-slate-500 mt-1">Manage staff users, super admins, admins, and judges.</p>
          </Link>

          <Link
            href="/staff/admin/criteria"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-brand-500 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Judging Criteria</h2>
            <p className="text-xs text-slate-500 mt-1">Configure competition criteria, weights, and scoring rules.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
