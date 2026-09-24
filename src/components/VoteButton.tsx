'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { castVoteAction } from '@/app/actions/voting';

interface VoteButtonProps {
  submissionId: string;
  initialVoteCount: number;
  votingOpen?: boolean;
  size?: 'normal' | 'large';
  onVoteSuccess?: (newCount: number) => void;
}

export default function VoteButton({
  submissionId,
  initialVoteCount,
  votingOpen = true,
  size = 'normal',
  onVoteSuccess,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Check if user has already voted for this specific entry locally
    if (typeof window !== 'undefined') {
      const votedStorageKey = `voted_${submissionId}`;
      if (localStorage.getItem(votedStorageKey)) {
        setHasVoted(true);
      }
    }
  }, [submissionId]);

  const getOrCreateVoterFingerprint = (): string => {
    if (typeof window === 'undefined') return 'unknown';

    let token = localStorage.getItem('ibetc_voter_id');
    if (!token) {
      token = 'voter_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('ibetc_voter_id', token);
    }

    // Combine token with browser characteristics for unique fingerprinting
    const ua = navigator.userAgent;
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const lang = navigator.language || 'en';
    const raw = `${token}_${ua}_${screenInfo}_${lang}`;

    // Simple hash calculation for fingerprint
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `fp_${Math.abs(hash).toString(36)}_${token}`;
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!votingOpen) {
      setFeedback({ type: 'error', message: 'Voting is currently closed for the competition.' });
      return;
    }

    if (hasVoted) {
      setFeedback({ type: 'error', message: 'You have already voted for this debater.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const fingerprint = getOrCreateVoterFingerprint();
      const res = await castVoteAction(submissionId, fingerprint);

      if (res.success && res.voteCount !== undefined) {
        setVoteCount(res.voteCount);
        setHasVoted(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`voted_${submissionId}`, 'true');
        }
        setFeedback({ type: 'success', message: res.message || 'Vote counted successfully!' });
        if (onVoteSuccess) {
          onVoteSuccess(res.voteCount);
        }
      } else {
        if (res.message.includes('already voted')) {
          setHasVoted(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`voted_${submissionId}`, 'true');
          }
        }
        setFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'An error occurred while casting your vote. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!votingOpen) {
    return (
      <div className="w-full text-center">
        <button
          disabled
          className="w-full py-3 px-6 bg-neutral-200 text-neutral-600 rounded-lg text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          Voting Closed
        </button>
      </div>
    );
  }

  const isLarge = size === 'large';

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleVote}
        disabled={isSubmitting || hasVoted}
        className={`w-full flex items-center justify-center gap-2.5 font-bold rounded-lg transition-all ${
          hasVoted
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
            : 'bg-[#027B39] hover:bg-[#02632f] text-white shadow-md hover:shadow-lg active:scale-[0.99]'
        } ${isLarge ? 'py-4 px-6 text-base sm:text-lg' : 'py-3 px-5 text-sm'}`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Recording Vote...</span>
          </>
        ) : hasVoted ? (
          <>
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <span>Vote Recorded ({voteCount.toLocaleString()})</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-5 h-5" />
            <span>VOTE FOR THIS DEBATER</span>
            <span className="ml-1 bg-black/20 text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
              {voteCount.toLocaleString()}
            </span>
          </>
        )}
      </button>

      {feedback && (
        <div
          className={`p-3 rounded-md text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
