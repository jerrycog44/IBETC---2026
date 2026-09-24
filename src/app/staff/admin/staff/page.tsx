'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { createStaffUserAction, updateStaffRoleAction } from '@/app/actions/staff';
import { StaffRole } from '@/lib/supabase/database.types';
import {
  Shield,
  ShieldAlert,
  UserPlus,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Users,
  Sliders,
  LogOut,
  BarChart2,
  FileText,
} from 'lucide-react';

interface StaffUserItem {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  created_at: string;
}

const ROLE_BADGES: Record<StaffRole, { label: string; classes: string }> = {
  super_admin: { label: 'Super Admin', classes: 'bg-purple-100 text-purple-900 border-purple-200' },
  admin: { label: 'Admin', classes: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  judge: { label: 'Judge', classes: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
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

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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
    <div className="flex min-h-screen bg-[#f8faf7]">
      {/* SIDEBAR */}
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
          <Link href="/staff/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
            <BarChart2 className="w-4 h-4" />
            Dashboard Overview
          </Link>
          <Link href="/staff/admin/submissions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
            <FileText className="w-4 h-4" />
            Submissions &amp; Votes
          </Link>
          <Link href="/staff/admin/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#027B39] text-white">
            <Users className="w-4 h-4" />
            Staff &amp; Judges
          </Link>
          <Link href="/staff/admin/criteria" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
            <Sliders className="w-4 h-4" />
            Judging Criteria
          </Link>
        </nav>
        <div className="pt-4 border-t border-brand-600/20">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white px-3 py-2">
            <LogOut className="w-4 h-4" />
            Exit Admin Portal
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 sm:p-8 min-w-0">
        <div className="lg:hidden mb-4">
          <Link href="/staff/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Staff User Accounts</h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Manage organizer staff roles — Super Admins, Admins, and Judges.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 border text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#027B39] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {!isLoading && !isSuperAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
              <h2 className="text-base font-bold text-amber-900">Super Admin Privileges Required</h2>
              <p className="text-xs text-amber-800 leading-relaxed">
                Only authorized Super Administrators can view or manage staff user accounts.
              </p>
            </div>
          ) : (
            <>
              {/* Add Staff Card */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
                  <UserPlus className="w-4 h-4 text-[#027B39]" />
                  <span>Provision Staff Account</span>
                </div>

                <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      Supabase User ID (UUID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      placeholder="123e4567-e89b-12d3-a456-426614174000"
                      className="form-input font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Dr. Oluwaseun Adeleke"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="staff@eygii.org"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Staff Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as StaffRole)}
                      className="form-input"
                    >
                      <option value="judge">Judge (Virtual Evaluation)</option>
                      <option value="admin">Admin (Review &amp; Approvals)</option>
                      <option value="super_admin">Super Admin (Full Control)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary text-xs py-3 px-6 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Provision Staff Record</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Staff List */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Authorized Staff ({staffList.length})
                  </span>
                  <button onClick={fetchStaff} className="btn-ghost text-xs flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#027B39]" />
                    <span>Loading staff records...</span>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="p-12 text-center text-xs text-neutral-500">
                    No staff records provisioned yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name &amp; Email</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th className="text-right">Change Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((staff) => {
                          const badge = ROLE_BADGES[staff.role];
                          return (
                            <tr key={staff.id}>
                              <td>
                                <span className="font-bold text-neutral-900 block">{staff.full_name}</span>
                                <span className="text-[11px] text-neutral-500 font-mono">{staff.email}</span>
                              </td>
                              <td>
                                <span className={`badge border ${badge.classes}`}>{badge.label}</span>
                              </td>
                              <td className="text-xs text-neutral-500 whitespace-nowrap">{formatDate(staff.created_at)}</td>
                              <td className="text-right">
                                <select
                                  value={staff.role}
                                  onChange={(e) => handleRoleChange(staff.id, e.target.value as StaffRole)}
                                  className="px-2.5 py-1 text-xs font-bold border border-neutral-300 rounded-lg outline-none bg-white focus:border-[#027B39]"
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
