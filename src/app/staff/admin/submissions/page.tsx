'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { updateSubmissionStatusAction } from '@/app/actions/submissions';
import { SubmissionStatus } from '@/lib/supabase/database.types';
import { Search, Filter, CheckCircle2, Clock, XCircle, EyeOff, Play, X, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

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

    if (!error && data) {
      setSubmissions(data as SubmissionItem[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Filter logic
  useEffect(() => {
    let result = [...submissions];

    if (selectedStatus !== 'all') {
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

    // Fetch signed video URL for admin review
    const res = await fetch(`/api/video/signed-url?submissionId=${item.id}`);
    if (res.ok) {
      const videoData = await res.json();
      if (videoData.signedUrl) {
        setSignedVideoUrl(videoData.signedUrl);
      }
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

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
      case 'hidden':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800">Hidden</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/staff/admin" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 mb-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Overview</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900">Submissions Management</h1>
            <p className="text-xs text-slate-500">Review participant debate entries and manage public gallery status.</p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* CONTROLS: SEARCH & STATUS TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, school, email, topic..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <span className="text-slate-400 font-semibold mr-2 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>
              {['all', 'pending', 'approved', 'rejected', 'hidden'].map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                    selectedStatus === statusKey
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {statusKey}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMISSIONS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              <span>Loading competition submissions...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No submissions found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-4">Participant</th>
                    <th className="p-4">School</th>
                    <th className="p-4">Debate Topic</th>
                    <th className="p-4">Date Submitted</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubmissions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        {item.full_name}
                        <span className="block text-[11px] font-normal text-slate-400">{item.email}</span>
                      </td>
                      <td className="p-4">{item.school}</td>
                      <td className="p-4 max-w-xs truncate">{item.debate_topic}</td>
                      <td className="p-4 whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Review Entry
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

      {/* REVIEW & STATUS UPDATE MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto my-8">
            <header className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400">ID: {selectedSubmission.id}</span>
                <h2 className="text-lg font-extrabold text-slate-900">{selectedSubmission.full_name}</h2>
                <p className="text-xs text-slate-500">{selectedSubmission.school}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* VIDEO PLAYER */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Submitted Video</h3>
              {signedVideoUrl ? (
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                  <video controls src={signedVideoUrl} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  <Play className="w-6 h-6 mr-2" />
                  <span>Loading video player...</span>
                </div>
              )}
            </div>

            {/* PARTICIPANT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Phone Number</span>
                <span className="text-slate-900 font-medium">{selectedSubmission.phone}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Email Address</span>
                <span className="text-slate-900 font-medium">{selectedSubmission.email}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-400 block mb-0.5">Debate Topic</span>
                <span className="text-slate-900 font-medium">{selectedSubmission.debate_topic}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Date Submitted</span>
                <span className="text-slate-900 font-medium">{formatDate(selectedSubmission.created_at)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Current Status</span>
                <div>{getStatusBadge(selectedSubmission.status)}</div>
              </div>
            </div>

            {/* STATUS ACTION BUTTONS */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-700">Update Status Actions</h3>

              {confirmRejectId ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2">
                  <p className="font-semibold text-red-800 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Confirm Rejection?</span>
                  </p>
                  <p className="text-slate-600">This submission will not appear in the gallery.</p>
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-xs"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => setConfirmRejectId(null)}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-xs"
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve for Gallery</span>
                  </button>

                  <button
                    onClick={() => setConfirmRejectId(selectedSubmission.id)}
                    disabled={isUpdatingStatus || selectedSubmission.status === 'rejected'}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('hidden')}
                    disabled={isUpdatingStatus || selectedSubmission.status === 'hidden'}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Hide Submission</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
