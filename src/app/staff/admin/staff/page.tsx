'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { createStaffUserAction, updateStaffRoleAction } from '@/app/actions/staff';
import { StaffRole } from '@/lib/supabase/database.types';
import {
  Shield, ShieldAlert, UserPlus, ArrowLeft, RefreshCw,
  AlertCircle, CheckCircle2, Trophy, FileText, Users, Sliders, LogOut, BarChart2
} from 'lucide-react';

interface StaffUserItem {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  created_at: string;
}

const ROLE_LABELS: Record<StaffRole, { label: string; classes: string }> = {
  super_admin: { label: 'Super Admin', classes: 'bg-violet-100 text-violet-800 border-violet-200' },
  admin: { label: 'Admin', classes: 'bg-brand-100 text-brand-800 border-brand-200' },
  judge: { label: 'Judge', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function AdminStaffUsersPage() {
  const [staffList, setStaffList] = useState<StaffUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [newUserId, setNewUserId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('judge');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: superAdmin } = await (supabase as any).rpc('is_super_admin');
    setIsSuperAdmin(Boolean(superAdmin));

    if (superAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('staff_users') as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setStaffList(data as StaffUserItem[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!newUserId.trim() || !newFullName.trim() || !newEmail.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    setIsSubmitting(true);
    const res = await createStaffUserAction({
      userId: newUserId.trim(),
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
    });
    setIsSubmitting(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Staff user created successfully.' });
      setNewUserId('');
      setNewFullName('');
      setNewEmail('');
      setNewRole('judge');
      fetchStaff();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create staff user.' });
    }
  };

  const handleRoleChange = async (userId: string, role: StaffRole) => {
    setMessage(null);
    const res = await updateStaffRoleAction(userId, role);
    if (res.success) {
      setStaffList((prev) => prev.map((item) => (item.id === userId ? { ...item, role } : item)));
      setMessage({ type: 'success', text: 'Staff role updated.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update role.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      {/* ====================================================================
          SIDEBAR
          ==================================================================== */}
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
          <Link href="/staff/admin" className="sidebar-link">
            <BarChart2 className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/staff/admin/submissions" className="sidebar-link">
            <FileText className="w-4 h-4" />
            Submissions
          </Link>
          <Link href="/staff/admin/staff" className="sidebar-link active">
            <Users className="w-4 h-4" />
            Staff Accounts
          </Link>
          <Link href="/staff/admin/criteria" className="sidebar-link">
            <Sliders className="w-4 h-4" />
            Judging Criteria
          </Link>
        </nav>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/" className="sidebar-link text-slate-400">
            <LogOut className="w-4 h-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT
          ==================================================================== */}
      <main className="flex-1 p-6 sm:p-8 min-w-0">
        <div className="lg:hidden mb-4">
          <Link
            href="/staff/admin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-5xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="section-title text-2xl sm:text-3xl">Staff Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage staff roles — Super Admins, Admins, and Judges.
            </p>
          </div>

          {/* Status message */}
          {message && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 border animate-slide-up ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {!isLoading && !isSuperAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-lg font-display font-bold text-amber-900">Super Admin Required</h2>
              <p className="text-sm text-amber-800">
                Only authorized Super Administrators can view or manage staff accounts.
              </p>
            </div>
          ) : (
            <>
              {/* Add Staff Form */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-brand-500 to-brand-700" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold text-slate-900">Add / Associate Staff User</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Link an authenticated Supabase user ID to a staff role.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateStaff} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="userId" className="form-label">
                        Supabase User ID (UUID) <span className="required">*</span>
                      </label>
                      <input
                        id="userId"
                        type="text"
                        required
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        placeholder="123e4567-e89b-12d3-a456-426614174000"
                        className="form-input font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label htmlFor="staffFullName" className="form-label">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        id="staffFullName"
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Dr. Oluwaseun Adeleke"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="staffEmail" className="form-label">
                        Email Address <span className="required">*</span>
                      </label>
                      <input
                        id="staffEmail"
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="staff@eloquentyouth.org"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="staffRole" className="form-label">
                        Staff Role <span className="required">*</span>
                      </label>
                      <select
                        id="staffRole"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as StaffRole)}
                        className="form-input"
                      >
                        <option value="judge">Judge (Virtual Scoring)</option>
                        <option value="admin">Admin (Review &amp; Approvals)</option>
                        <option value="super_admin">Super Admin (Full Control)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 pt-1">
                      <button
                        type="submit"
                        id="add-staff-btn"
                        disabled={isSubmitting}
                        className="btn-primary disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>
                        ) : (
                          <><UserPlus className="w-4 h-4" />Save Staff Account</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Staff list table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-brand-600" />
                    <h2 className="text-sm font-display font-bold text-slate-900">Authorized Staff</h2>
                    <span className="badge badge-approved">{staffList.length}</span>
                  </div>
                  <button onClick={fetchStaff} className="btn-ghost text-xs">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                    Loading staff accounts...
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-500 text-sm">No staff accounts found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name &amp; Email</th>
                          <th>Role</th>
                          <th>Date Added</th>
                          <th className="text-right">Change Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((staff) => {
                          const roleInfo = ROLE_LABELS[staff.role];
                          return (
                            <tr key={staff.id}>
                              <td>
                                <span className="font-semibold text-slate-900 block">{staff.full_name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{staff.email}</span>
                              </td>
                              <td>
                                <span className={`badge border ${roleInfo.classes}`}>
                                  {roleInfo.label}
                                </span>
                              </td>
                              <td className="text-slate-500 whitespace-nowrap">{formatDate(staff.created_at)}</td>
                              <td className="text-right">
                                <select
                                  value={staff.role}
                                  onChange={(e) => handleRoleChange(staff.id, e.target.value as StaffRole)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                >
                                  <option value="judge">Judge</option>
                                  <option value="admin">Admin</option>
                                  <option value="super_admin">Super Admin</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
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
