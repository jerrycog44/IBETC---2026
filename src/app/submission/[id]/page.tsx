'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { associateAccountAction } from '@/app/actions/submissions';
import { ArrowLeft, Key, Lock, CheckCircle2, Clock, XCircle, EyeOff, Play, RefreshCw, UserCheck } from 'lucide-react';

interface SubmissionData {
  id: string;
  full_name: string;
  school: string;
  phone: string;
  email: string;
  debate_topic: string;
  video_path: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function SubmissionStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { id } = use(params);
  const { key: initialKey } = use(searchParams);

  const [inputKey, setInputKey] = useState<string>(initialKey || '');
  const [participantKey, setParticipantKey] = useState<string | null>(initialKey || null);
  
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(initialKey));
  const [error, setError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLinkingAccount, setIsLinkingAccount] = useState<boolean>(false);
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!participantKey) {
      setIsLoading(false);
      return;
    }

    async function fetchSubmission() {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: rpcError } = await (supabase as any).rpc('get_submission_by_participant_key', {
          p_submission_id: id,
          p_participant_key: participantKey as string,
        });

        if (rpcError || !data || data.length === 0) {
          setError('Invalid access key or submission ID. Verification failed.');
          setSubmission(null);
          return;
        }

        const sub = data[0] as SubmissionData;
        setSubmission(sub);

        // Fetch short-lived signed video URL
        const res = await fetch(`/api/video/signed-url?submissionId=${id}&participantKey=${encodeURIComponent(participantKey as string)}`);
        if (res.ok) {
          const videoData = await res.json();
          if (videoData.signedUrl) {
            setSignedVideoUrl(videoData.signedUrl);
          }
        }
      } catch {
        setError('Failed to verify participant key.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubmission();
  }, [id, participantKey]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setParticipantKey(inputKey.trim());
    }
  };

  const handleAssociateAccount = async () => {
    if (!participantKey || !submission) return;
    setIsLinkingAccount(true);
    const result = await associateAccountAction(submission.id, participantKey);
    setIsLinkingAccount(false);

    if (result.success) {
      setLinkSuccess(true);
      setSubmission((prev) => (prev ? { ...prev, owner_user_id: currentUser } : prev));
    } else {
      alert(result.error || 'Failed to associate account');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved for Public Gallery</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Selected</span>
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hidden</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Top nav */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* PROMPT KEY IF NOT PROVIDED OR INVALID */}
        {(!participantKey || error) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden animate-slide-up">
            <div className="h-1 bg-gradient-to-r from-brand-500 to-brand-700" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 text-brand-600 animate-pulse-glow">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="section-title text-2xl mb-2">Participant Verification</h1>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                Enter your private access key to view submission status for <strong className="text-slate-700 font-mono">#{id.substring(0, 8)}</strong>.
              </p>

              {error && (
                <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-left animate-slide-up">
                  <Lock className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleKeySubmit} className="max-w-sm mx-auto space-y-3">
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter your private 32-character key"
                    className="form-input pl-10 font-mono text-sm"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-3">
                  <Key className="w-4 h-4" />
                  Access Status
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center animate-fade-in">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Verifying participant key...</p>
          </div>
        )}

        {/* AUTHORIZED SUBMISSION DETAILS */}
        {submission && !isLoading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden animate-slide-up">
            {/* Status header bar */}
            <div className={`h-1.5 ${submission.status === 'approved' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : submission.status === 'rejected' ? 'bg-gradient-to-r from-rose-400 to-rose-600' : submission.status === 'hidden' ? 'bg-gradient-to-r from-slate-300 to-slate-400' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} />

            <header className="px-7 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono text-slate-400 mb-1">#{submission.id.substring(0, 8)}</p>
                <h1 className="text-xl font-display font-bold text-slate-900">{submission.full_name}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{submission.school}</p>
              </div>
              <div>{getStatusBadge(submission.status)}</div>
            </header>

            <div className="px-7 py-6 space-y-6">
              {/* VIDEO PLAYER */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Debate Video Preview</p>
                {signedVideoUrl ? (
                  <div className="aspect-video rounded-xl bg-brand-950 overflow-hidden shadow-lg">
                    <video controls src={signedVideoUrl} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
                    <span className="text-sm">Loading video playback...</span>
                  </div>
                )}
              </div>

              {/* DETAILS GRID */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Debate Topic</span>
                  <span className="text-sm text-slate-900 font-medium">{submission.debate_topic}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Submitted On</span>
                  <span className="text-sm text-slate-900 font-medium">{formatDate(submission.created_at)}</span>
                </div>
              </div>

              {/* ACCOUNT LINKING SECTION */}
              <div className="border-t border-slate-100 pt-5">
                {submission.owner_user_id ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-800 font-medium">Submission linked to your user account.</span>
                  </div>
                ) : currentUser ? (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-0.5">Link to your account</p>
                      <p className="text-xs text-slate-500">Associate this submission with your logged-in account.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAssociateAccount}
                      disabled={isLinkingAccount || linkSuccess}
                      className="btn-primary text-xs px-4 py-2.5 flex-shrink-0 disabled:opacity-60"
                    >
                      {isLinkingAccount ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Linking...</> : linkSuccess ? <><CheckCircle2 className="w-3.5 h-3.5" />Linked!</> : <><UserCheck className="w-3.5 h-3.5" />Link Account</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-brand-50/50 border border-brand-100 rounded-xl">
                    <Key className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 mb-0.5">Optional Account Association</p>
                      <p className="text-xs text-slate-500">
                        Log in or sign up later and return to this page to associate this submission with your account.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
