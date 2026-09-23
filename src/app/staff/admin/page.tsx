import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  FileText, CheckCircle2, Clock, XCircle, EyeOff, Users,
  Sliders, ArrowRight, Trophy, LogOut, BarChart2, Shield
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: statsData } = await supabase.rpc('get_admin_submission_stats');
  const stats = statsData?.[0] || {
    total_count: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    hidden_count: 0,
  };

  const { data: { user } } = await supabase.auth.getUser();

  const statCards = [
    {
      label: 'Total Entries',
      value: Number(stats.total_count),
      icon: FileText,
      variant: 'stat-card-indigo',
      color: 'text-brand-600 bg-brand-50',
    },
    {
      label: 'Pending Review',
      value: Number(stats.pending_count),
      icon: Clock,
      variant: 'stat-card-amber',
      color: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Approved',
      value: Number(stats.approved_count),
      icon: CheckCircle2,
      variant: 'stat-card-emerald',
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Rejected',
      value: Number(stats.rejected_count),
      icon: XCircle,
      variant: 'stat-card-rose',
      color: 'text-rose-700 bg-rose-50',
    },
    {
      label: 'Hidden',
      value: Number(stats.hidden_count),
      icon: EyeOff,
      variant: 'stat-card-slate',
      color: 'text-slate-600 bg-slate-100',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      {/* ================================================================
          SIDEBAR
          ================================================================ */}
      <aside className="sidebar-nav hidden lg:flex">
        <div className="sidebar-logo">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-brand-900 leading-none">IBETC 2026</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          <Link href="/staff/admin" className="sidebar-link active">
            <BarChart2 className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/staff/admin/submissions" className="sidebar-link">
            <FileText className="w-4 h-4" />
            Submissions
          </Link>
          <Link href="/staff/admin/staff" className="sidebar-link">
            <Users className="w-4 h-4" />
            Staff Accounts
          </Link>
          <Link href="/staff/admin/criteria" className="sidebar-link">
            <Sliders className="w-4 h-4" />
            Judging Criteria
          </Link>
        </nav>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          {user && (
            <div className="px-3 py-2 rounded-xl bg-slate-50">
              <p className="text-[10px] text-slate-400 mb-0.5">Signed in as</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{user.email}</p>
            </div>
          )}
          <Link href="/" className="sidebar-link text-slate-400">
            <LogOut className="w-4 h-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <main className="flex-1 p-6 sm:p-8 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-black text-brand-900">IBETC 2026 Admin</p>
          </div>
          <Link href="/" className="btn-ghost text-xs">
            <LogOut className="w-3.5 h-3.5" />
            Exit
          </Link>
        </div>

        <div className="max-w-5xl space-y-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="section-eyebrow mb-3">
                <Shield className="w-3.5 h-3.5" />
                Organizer Dashboard
              </div>
              <h1 className="section-title text-3xl sm:text-4xl">Admin Overview</h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Competition submissions and operations at a glance.
              </p>
            </div>
            <Link
              href="/staff/admin/submissions"
              className="btn-primary self-start sm:self-center"
            >
              Review Submissions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {statCards.map(({ label, value, icon: Icon, variant, color }) => (
              <div key={label} className={`stat-card ${variant}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-display font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  href: '/staff/admin/submissions',
                  icon: FileText,
                  title: 'Manage Submissions',
                  desc: 'Review student debate entries, watch videos, approve, reject or hide entries.',
                  gradient: 'from-brand-500 to-brand-700',
                  shadow: 'shadow-button',
                  hover: 'hover:border-brand-200 hover:shadow-[0_4px_20px_rgba(99,102,241,0.12)]',
                },
                {
                  href: '/staff/admin/staff',
                  icon: Users,
                  title: 'Staff Accounts',
                  desc: 'Invite and manage super admins, admins, and judges. Control access roles.',
                  gradient: 'from-slate-700 to-slate-900',
                  shadow: 'shadow-[0_2px_8px_rgba(15,23,42,0.2)]',
                  hover: 'hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]',
                },
                {
                  href: '/staff/admin/criteria',
                  icon: Sliders,
                  title: 'Judging Criteria',
                  desc: 'Configure competition scoring criteria, weights, and judging rules.',
                  gradient: 'from-gold-400 to-gold-600',
                  shadow: 'shadow-[0_2px_8px_rgba(234,179,8,0.3)]',
                  hover: 'hover:border-gold-200 hover:shadow-[0_4px_20px_rgba(234,179,8,0.1)]',
                },
              ].map(({ href, icon: Icon, title, desc, gradient, shadow, hover }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group bg-white rounded-2xl p-6 border border-slate-100 shadow-card transition-all duration-200 ${hover} card-hover`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5 ${shadow} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-base mb-1.5">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
                  <div className="flex items-center text-brand-600 text-xs font-semibold gap-1 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
