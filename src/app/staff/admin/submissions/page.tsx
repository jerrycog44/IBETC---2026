'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { updateSubmissionStatusAction } from '@/app/actions/submissions';
import { generateSubmissionsCSV } from '@/lib/utils/export-csv';
import { SubmissionStatus } from '@/lib/supabase/database.types';
import {
  Search, Filter, CheckCircle2, XCircle, EyeOff, Play, X,
  AlertTriangle, ArrowLeft, RefreshCw, Download, FileText,
  Trophy, Users, BarChart2, Sliders, LogOut
} from 'lucide-react';

interface SubmissionItem {
  id: string;
  full_name: string;
  school: string;
  phone: string;
  email: string;
  debate_topic: string;
  video_path: string;
  status: SubmissionStatus;
  created_at: string;
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'hidden'] as const;

function getStatusBadge(status: SubmissionStatus) {
  switch (status) {
    case 'approved': return <span className="badge badge-approved"><CheckCircle2 className="w-3 h-3" />Approved</span>;
    case 'rejected': return <span className="badge badge-rejected"><XCircle className="w-3 h-3" />Rejected</span>;
    case 'hidden': return <span className="badge badge-hidden"><EyeOff className="w-3 h-3" />Hidden</span>;
    default: return <span className="badge badge-pending">Pending</span>;
  }
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSubmissions(data as SubmissionItem[]);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  useEffect(() => {
    let result = [...submissions];
    if (selectedStatus !== 'all') result = result.filter((item) => item.status === selectedStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.full_name.toLowerCase().includes(q) ||
        item.school.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.debate_topic.toLowerCase().includes(q)
      );
    }
    setFilteredSubmissions(result);
  }, [submissions, selectedStatus, searchQuery]);

  const handleOpenReview = async (item: SubmissionItem) => {
    setSelectedSubmission(item);
    setSignedVideoUrl(null);
    setConfirmRejectId(null);
    const res = await fetch(`/api/video/signed-url?submissionId=${item.id}`);
    if (res.ok) {
      const videoData = await res.json();
      if (videoData.signedUrl) setSignedVideoUrl(videoData.signedUrl);
    }
  };

  const handleStatusChange = async (newStatus: SubmissionStatus) => {
    if (!selectedSubmission) return;
    setIsUpdatingStatus(true);
    const res = await updateSubmissionStatusAction(selectedSubmission.id, newStatus);
    setIsUpdatingStatus(false);
    if (res.success) {
      setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedSubmission.id ? { ...item, status: newStatus } : item))
      );
      setConfirmRejectId(null);
    } else {
      alert(res.error || 'Failed to update status.');
    }
  };

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;
    const exportRows = filteredSubmissions.map((item) => ({
      submissionId: item.id,
      fullName: item.full_name,
      school: item.school,
      phone: item.phone,
      email: item.email,
      debateTopic: item.debate_topic,
      status: item.status,
      submittedAt: formatDate(item.created_at),
    }));
    const csvContent = generateSubmissionsCSV(exportRows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IBETC_2026_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <p className="text-xs font-black text-emerald-950 uppercase tracking-tight leading-tight font-display">EYGII Admin</p>
              <p className="text-[10px] text-emerald-700 italic mt-0.5">IBETC 2026</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5">
          <Link href="/staff/admin" className="sidebar-link">
            <BarChart2 className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/staff/admin/submissions" className="sidebar-link active">
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
        {/* Mobile back link */}
        <div className="lg:hidden mb-4">
          <Link
            href="/staff/admin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-6xl space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="section-title text-2xl sm:text-3xl">Submissions Management</h1>
              <p className="text-slate-500 text-sm mt-1">
                Review debate entries · {submissions.length} total
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleExportCSV}
                disabled={filteredSubmissions.length === 0}
                className="btn-ghost text-xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={fetchSubmissions}
                className="btn-ghost text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="search-bar max-w-sm">
                <Search className="search-icon w-4 h-4" />
                <input
                  type="text"
                  id="submissions-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, school, email, topic..."
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Filter className="w-3.5 h-3.5" />
                  Filter:
                </div>
                {STATUS_TABS.map((tab) => {
                  const count = tab === 'all'
                    ? submissions.length
                    : submissions.filter((s) => s.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedStatus(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
                        selectedStatus === tab
                          ? 'bg-brand-600 text-white shadow-button'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        selectedStatus === tab ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                <span>Loading competition submissions...</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">No submissions found</p>
                <p className="text-xs text-slate-400">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>School</th>
                      <th>Debate Topic</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="font-semibold text-slate-900 block">{item.full_name}</span>
                          <span className="text-[11px] text-slate-400">{item.email}</span>
                        </td>
                        <td className="text-slate-600">{item.school}</td>
                        <td className="max-w-xs">
                          <span className="block truncate text-slate-600">{item.debate_topic}</span>
                        </td>
                        <td className="whitespace-nowrap text-slate-500">{formatDate(item.created_at)}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td className="text-right">
                          <button
                            onClick={() => handleOpenReview(item)}
                            className="btn-primary text-xs px-4 py-2"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Review
                          </button>
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

      {/* ====================================================================
          REVIEW MODAL
          ==================================================================== */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSubmission(null); }}>
          <div className="modal-panel mx-4">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <p className="text-[11px] font-mono text-slate-400 mb-0.5">ID: {selectedSubmission.id}</p>
                <h2 className="text-lg font-display font-bold text-slate-900">{selectedSubmission.full_name}</h2>
                <p className="text-xs text-slate-500">{selectedSubmission.school}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedSubmission.status)}
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Video player */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Submitted Video</p>
                {signedVideoUrl ? (
                  <div className="aspect-video bg-brand-950 rounded-xl overflow-hidden shadow-lg">
                    <video controls src={signedVideoUrl} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
                    <span className="text-sm">Loading video player...</span>
                  </div>
                )}
              </div>

              {/* Participant details */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Participant Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Phone</span>
                    <span className="font-medium text-slate-900">{selectedSubmission.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Email</span>
                    <span className="font-medium text-slate-900">{selectedSubmission.email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Debate Topic</span>
                    <span className="font-medium text-slate-900">{selectedSubmission.debate_topic}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Date Submitted</span>
                    <span className="font-medium text-slate-900">{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Status actions */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Update Status</p>

                {confirmRejectId ? (
                  <div className="confirm-dialog">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-900 mb-1">Confirm Rejection?</p>
                      <p className="text-xs text-slate-600 mb-3">
                        This entry will be rejected and will not appear in the public gallery.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange('rejected')}
                          disabled={isUpdatingStatus}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs disabled:opacity-50 transition-colors"
                        >
                          {isUpdatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-1" /> : null}
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => setConfirmRejectId(null)}
                          className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange('approved')}
                      disabled={isUpdatingStatus || selectedSubmission.status === 'approved'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      {isUpdatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve for Gallery
                    </button>
                    <button
                      onClick={() => setConfirmRejectId(selectedSubmission.id)}
                      disabled={isUpdatingStatus || selectedSubmission.status === 'rejected'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange('hidden')}
                      disabled={isUpdatingStatus || selectedSubmission.status === 'hidden'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
