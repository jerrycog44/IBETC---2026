'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { createStaffUserAction, updateStaffRoleAction } from '@/app/actions/staff';
import { StaffRole } from '@/lib/supabase/database.types';
import { Shield, ShieldAlert, UserPlus, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StaffUserItem {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  created_at: string;
}

export default function AdminStaffUsersPage() {
  const [staffList, setStaffList] = useState<StaffUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Add Staff Form state
  const [newUserId, setNewUserId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('judge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Check if user is super admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: superAdmin } = await (supabase as any).rpc('is_super_admin');
    setIsSuperAdmin(Boolean(superAdmin));

    if (superAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('staff_users') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStaffList(data as StaffUserItem[]);
      }
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
      setStaffList((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, role } : item))
      );
      setMessage({ type: 'success', text: 'Staff role updated.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update role.' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link href="/staff/admin" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Overview</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Staff Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage staff user roles (Super Admin, Admin, Judge).</p>
        </div>

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

        {!isLoading && !isSuperAdmin ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
            <h2 className="text-base font-bold text-amber-900">Super Admin Privileges Required</h2>
            <p className="text-xs text-amber-800">
              Only authorized Super Administrators can view or manage staff accounts.
            </p>
          </div>
        ) : (
          <>
            {/* ADD STAFF USER FORM */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-600" />
                <span>Add / Associate Staff User</span>
              </h2>
              <p className="text-xs text-slate-500">
                Link an authenticated user ID to a staff role. (Staff users must be invited/created in Supabase Auth).
              </p>

              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userId" className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase User ID (UUID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="userId"
                    type="text"
                    required
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Dr. Oluwaseun Adeleke"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="staff@eloquentyouth.org"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as StaffRole)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="judge">Judge (Virtual Scoring)</option>
                    <option value="admin">Admin (Review & Approvals)</option>
                    <option value="super_admin">Super Admin (Full System Control)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Staff Account</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* STAFF USERS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <header className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-brand-600" />
                  <span>Authorized Staff List</span>
                </h2>
                <button
                  onClick={fetchStaff}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
                >
                  Refresh
                </button>
              </header>

              {isLoading ? (
                <div className="p-12 text-center text-xs text-slate-500">Loading staff accounts...</div>
              ) : staffList.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">No staff accounts found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="p-4">Name & Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Date Added</th>
                        <th className="p-4 text-right">Change Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {staffList.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-semibold text-slate-900">
                            {staff.full_name}
                            <span className="block text-[11px] font-mono text-slate-400 font-normal">{staff.email}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                                staff.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : staff.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {staff.role}
                            </span>
                          </td>
                          <td className="p-4">{formatDate(staff.created_at)}</td>
                          <td className="p-4 text-right">
                            <select
                              value={staff.role}
                              onChange={(e) => handleRoleChange(staff.id, e.target.value as StaffRole)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-900 bg-white"
                            >
                              <option value="judge">Judge</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
