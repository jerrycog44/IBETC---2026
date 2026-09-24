'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { updateSubmissionStatusAction } from '@/app/actions/submissions';
import { toggleFinalistAction } from '@/app/actions/voting';
import { generateSubmissionsCSV } from '@/lib/utils/export-csv';
import { SubmissionStatus } from '@/lib/supabase/database.types';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  EyeOff,
  Play,
  X,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Download,
  FileText,
  Trophy,
  Users,
  BarChart2,
  Sliders,
  LogOut,
  ThumbsUp,
  Award,
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
  vote_count: number;
  is_finalist: boolean;
  finalist_rank: number | null;
  slug: string | null;
  created_at: string;
}

const STATUS_TABS = ['all', 'pending', 'approved', 'finalists', 'rejected', 'hidden'] as const;

function getStatusBadge(status: SubmissionStatus, isFinalist?: boolean) {
  if (isFinalist) {
    return (
      <span className="badge badge-finalist">
        <Trophy className="w-3 h-3 text-amber-600" /> Finalist
      </span>
    );
  }
  switch (status) {
    case 'approved':
      return <span className="badge badge-approved"><CheckCircle2 className="w-3 h-3" />Approved</span>;
    case 'rejected':
      return <span className="badge badge-rejected"><XCircle className="w-3 h-3" />Rejected</span>;
    case 'hidden':
      return <span className="badge badge-hidden"><EyeOff className="w-3 h-3" />Hidden</span>;
    default:
      return <span className="badge badge-pending">Pending Review</span>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('submissions') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as SubmissionItem[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    let result = [...submissions];

    if (selectedStatus === 'finalists') {
      result = result.filter((item) => item.is_finalist);
    } else if (selectedStatus !== 'all') {
      result = result.filter((item) => item.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
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

  const handleToggleFinalist = async (isFinalist: boolean) => {
    if (!selectedSubmission) return;
    setIsUpdatingStatus(true);
    const res = await toggleFinalistAction(selectedSubmission.id, isFinalist);
    setIsUpdatingStatus(false);

    if (res.success) {
      setSelectedSubmission((prev) => (prev ? { ...prev, is_finalist: isFinalist } : null));
      setSubmissions((prev) =>
        prev.map((item) => (item.id === selectedSubmission.id ? { ...item, is_finalist: isFinalist } : item))
      );
    } else {
      alert(res.error || 'Failed to toggle finalist status.');
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
      voteCount: item.vote_count || 0,
      isFinalist: item.is_finalist ? 'Yes' : 'No',
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
          <Link href="/staff/admin/submissions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#027B39] text-white">
            <FileText className="w-4 h-4" />
            Submissions &amp; Votes
          </Link>
          <Link href="/staff/admin/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors">
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

        <div className="max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Submissions &amp; Voting Management
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Review entries, inspect votes, approve debaters, and assign Grand Finale finalists.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleExportCSV}
                disabled={filteredSubmissions.length === 0}
                className="btn-ghost text-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button onClick={fetchSubmissions} className="btn-ghost text-xs flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, school, email, topic..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium outline-none focus:border-[#027B39]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {STATUS_TABS.map((tab) => {
                  const count =
                    tab === 'all'
                      ? submissions.length
                      : tab === 'finalists'
                      ? submissions.filter((s) => s.is_finalist).length
                      : submissions.filter((s) => s.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedStatus(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-1.5 shrink-0 ${
                        selectedStatus === tab
                          ? 'bg-[#027B39] text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {tab}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#027B39]" />
                <span>Loading submissions...</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500">
                No submissions matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>School</th>
                      <th>Debate Topic</th>
                      <th>Votes</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="font-bold text-neutral-900 block">{item.full_name}</span>
                          <span className="text-[11px] text-neutral-500">{item.email}</span>
                        </td>
                        <td className="text-neutral-700 font-medium">{item.school}</td>
                        <td className="max-w-xs truncate italic text-neutral-600">&quot;{item.debate_topic}&quot;</td>
                        <td>
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#027B39] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <ThumbsUp className="w-3 h-3" />
                            {(item.vote_count || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>{getStatusBadge(item.status, item.is_finalist)}</td>
                        <td className="whitespace-nowrap text-xs text-neutral-500">{formatDate(item.created_at)}</td>
                        <td className="text-right">
                          <button
                            onClick={() => handleOpenReview(item)}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
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

      {/* REVIEW MODAL */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSubmission(null); }}>
          <div className="modal-panel mx-4 my-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <p className="text-[10px] font-mono text-neutral-400">ID: {selectedSubmission.id}</p>
                <h2 className="text-lg font-bold text-neutral-900">{selectedSubmission.full_name}</h2>
                <p className="text-xs text-neutral-600 font-medium">{selectedSubmission.school}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedSubmission.status, selectedSubmission.is_finalist)}
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Video Player */}
              <div>
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Debate Video</p>
                {signedVideoUrl ? (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md">
                    <video controls src={signedVideoUrl} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center text-xs text-neutral-500">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#027B39] mr-2" />
                    Loading secure stream...
                  </div>
                )}
              </div>

              {/* Details & Votes */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <span className="font-bold text-neutral-500 uppercase">Current Public Votes</span>
                  <span className="text-sm font-extrabold text-[#027B39] flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {(selectedSubmission.vote_count || 0).toLocaleString()} votes
                  </span>
                </div>
                <div>
                  <span className="font-bold text-neutral-500 uppercase block mb-1">Debate Motion</span>
                  <p className="text-neutral-900 italic font-medium">&quot;{selectedSubmission.debate_topic}&quot;</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200">
                  <div>
                    <span className="font-bold text-neutral-500 uppercase block">Phone</span>
                    <span className="text-neutral-800">{selectedSubmission.phone}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase block">Email</span>
                    <span className="text-neutral-800">{selectedSubmission.email}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Review &amp; Status Actions</p>

                {confirmRejectId ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Confirm Rejection of this Submission?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange('rejected')}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setConfirmRejectId(null)}
                        className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-bold rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange('approved')}
                      disabled={isUpdatingStatus || selectedSubmission.status === 'approved'}
                      className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Entry
                    </button>

                    {selectedSubmission.status === 'approved' && (
                      <button
                        onClick={() => handleToggleFinalist(!selectedSubmission.is_finalist)}
                        disabled={isUpdatingStatus}
                        className={`text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors ${
                          selectedSubmission.is_finalist
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        {selectedSubmission.is_finalist ? 'Remove Finalist Status' : 'Mark as Grand Finale Finalist'}
                      </button>
                    )}

                    <button
                      onClick={() => setConfirmRejectId(selectedSubmission.id)}
                      disabled={isUpdatingStatus || selectedSubmission.status === 'rejected'}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Entry
                    </button>

                    <button
                      onClick={() => handleStatusChange('hidden')}
                      disabled={isUpdatingStatus || selectedSubmission.status === 'hidden'}
                      className="bg-neutral-700 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide Entry
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
