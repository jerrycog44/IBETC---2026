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
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* PROMPT KEY IF NOT PROVIDED OR INVALID */}
        {(!participantKey || error) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Participant Verification</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
              Please enter your private 32-character participant key to view the submission status for #{id.substring(0, 8)}.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleKeySubmit} className="max-w-md mx-auto space-y-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Enter secret participant key"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 pr-10"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                Access Status
              </button>
            </form>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Verifying participant key...</p>
          </div>
        )}

        {/* AUTHORIZED SUBMISSION DETAILS */}
        {submission && !isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <header className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Submission #{submission.id.substring(0, 8)}</span>
                <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">{submission.full_name}</h1>
                <p className="text-xs text-slate-500">{submission.school}</p>
              </div>
              <div>{getStatusBadge(submission.status)}</div>
            </header>

            <div className="p-6 space-y-6">
              {/* VIDEO PLAYER */}
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Debate Video Preview</h2>
                {signedVideoUrl ? (
                  <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden shadow-inner">
                    <video
                      controls
                      src={signedVideoUrl}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Play className="w-8 h-8 mb-1 text-slate-300" />
                    <span>Loading video playback...</span>
                  </div>
                )}
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Debate Topic</span>
                  <span className="text-slate-900 font-medium">{submission.debate_topic}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Submitted On</span>
                  <span className="text-slate-900 font-medium">{formatDate(submission.created_at)}</span>
                </div>
              </div>

              {/* ACCOUNT LINKING SECTION */}
              <div className="border-t border-slate-100 pt-6">
                {submission.owner_user_id ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>This submission is linked to your user account.</span>
                  </div>
                ) : currentUser ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Link to logged-in account</p>
                      <p className="text-[11px] text-slate-500">Associate this submission with your current user account.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAssociateAccount}
                      disabled={isLinkingAccount || linkSuccess}
                      className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-xs transition-colors flex-shrink-0"
                    >
                      {isLinkingAccount ? 'Linking...' : linkSuccess ? 'Linked!' : 'Link Account'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 text-xs text-slate-600">
                    <p className="font-semibold text-slate-900 mb-1">Optional Account Association</p>
                    <p>
                      If you log in or sign up later, you can return to this status page to associate this submission with your account.
                    </p>
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
