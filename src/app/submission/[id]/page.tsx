'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { associateAccountAction } from '@/app/actions/submissions';
import {
  ArrowLeft,
  Key,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  EyeOff,
  RefreshCw,
  UserCheck,
  ThumbsUp,
  Share2,
  ExternalLink,
} from 'lucide-react';

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
  vote_count?: number;
  slug?: string | null;
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
        const { data, error: rpcError } = await (supabase as any).rpc(
          'get_submission_by_participant_key',
          {
            p_submission_id: id,
            p_participant_key: participantKey as string,
          }
        );

        if (rpcError || !data || data.length === 0) {
          setError('Invalid access key or submission ID. Verification failed.');
          setSubmission(null);
          return;
        }

        const sub = data[0] as SubmissionData;
        setSubmission(sub);
      } catch {
        setError('Failed to verify participant key.');
      }
      setIsLoading(false);
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
          <span className="badge badge-approved text-xs py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved for Competition
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-rejected text-xs py-1 px-3">
            <XCircle className="w-3.5 h-3.5" /> Not Selected
          </span>
        );
      case 'hidden':
        return (
          <span className="badge badge-hidden text-xs py-1 px-3">
            <EyeOff className="w-3.5 h-3.5" /> Hidden
          </span>
        );
      default:
        return (
          <span className="badge badge-pending text-xs py-1 px-3">
            <Clock className="w-3.5 h-3.5" /> Pending Organizer Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-6">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#027B39]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>

        {/* PROMPT KEY IF NOT PROVIDED OR INVALID */}
        {(!participantKey || error) && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#027B39] flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Participant Verification</h1>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Enter your private participant access key to check submission status for <strong className="font-mono">#{id.substring(0, 8)}</strong>.
            </p>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleKeySubmit} className="max-w-sm mx-auto space-y-3 pt-2">
              <div className="relative">
                <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Enter your 32-character participant key"
                  className="form-input pl-10 font-mono text-xs"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-xs uppercase font-bold">
                Verify Participant Key
              </button>
            </form>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
            <RefreshCw className="w-6 h-6 animate-spin text-[#027B39] mx-auto mb-2" />
            <span>Verifying participant key...</span>
          </div>
        )}

        {/* AUTHORIZED SUBMISSION DETAILS */}
        {submission && !isLoading && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
            
            <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200 pb-6">
              <div>
                <p className="text-[10px] font-mono text-neutral-400">SUBMISSION #{submission.id.substring(0, 8)}</p>
                <h1 className="text-2xl font-black text-neutral-900 mt-0.5">{submission.full_name}</h1>
                <p className="text-xs font-semibold text-neutral-600">{submission.school}</p>
              </div>
              <div>{getStatusBadge(submission.status)}</div>
            </header>

            {/* Approved Status Link Banner */}
            {submission.status === 'approved' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3 text-xs text-neutral-900">
                <div className="flex items-center gap-2 font-bold text-[#027B39]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your debate entry is live for voting!</span>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  Supporters can now watch your video and vote for you. Share your public competition page link to gather votes:
                </p>
                <Link
                  href={`/entry/${submission.slug || submission.id}`}
                  className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
                >
                  <span>Open Public Competition Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Video Player */}
            <div>
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Video Stream Preview</p>
              <VideoPlayer
                submissionId={submission.id}
                participantKey={participantKey as string}
                posterTitle={`${submission.full_name} — ${submission.school}`}
              />
            </div>

            {/* Details Table */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 divide-y divide-neutral-200 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-neutral-500 uppercase">Debate Motion</span>
                <span className="font-semibold text-neutral-900 italic max-w-xs text-right">&quot;{submission.debate_topic}&quot;</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-neutral-500 uppercase">Phone &amp; Email</span>
                <span className="font-semibold text-neutral-900">{submission.phone} · {submission.email}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-neutral-500 uppercase">Submitted On</span>
                <span className="font-semibold text-neutral-900">{formatDate(submission.created_at)}</span>
              </div>
            </div>

            {/* Optional Account Linking */}
            <div className="border-t border-neutral-200 pt-6">
              {submission.owner_user_id ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <UserCheck className="w-4 h-4 text-[#027B39]" />
                  <span>Submission is linked to your user account.</span>
                </div>
              ) : currentUser ? (
                <div className="flex items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-xs">
                    <p className="font-bold text-neutral-900">Link to your user account</p>
                    <p className="text-neutral-500 text-[11px]">Associate this entry with your logged-in account.</p>
                  </div>
                  <button
                    onClick={handleAssociateAccount}
                    disabled={isLinkingAccount || linkSuccess}
                    className="btn-primary text-xs py-2 px-3 shrink-0"
                  >
                    {isLinkingAccount ? 'Linking...' : linkSuccess ? 'Linked!' : 'Link Account'}
                  </button>
                </div>
              ) : null}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
