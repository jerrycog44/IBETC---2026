'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface CastVoteResult {
  success: boolean;
  voteCount?: number;
  message: string;
}

export async function castVoteAction(
  submissionId: string,
  voterFingerprint: string
): Promise<CastVoteResult> {
  if (!submissionId || !voterFingerprint) {
    return { success: false, message: 'Invalid vote parameters.' };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const realIp = requestHeaders.get('x-real-ip');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || null;

  // Call secure cast_vote RPC function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('cast_vote', {
    p_submission_id: submissionId,
    p_voter_fingerprint: voterFingerprint,
    p_ip_address: ipAddress,
  });

  if (error) {
    return { success: false, message: error.message || 'Failed to record vote. Please try again.' };
  }

  if (data && data.length > 0) {
    const res = data[0];
    return {
      success: res.success,
      voteCount: res.vote_count,
      message: res.message,
    };
  }

  return { success: false, message: 'Unexpected server response.' };
}

export async function toggleVotingLockAction(open: boolean) {
  const supabase = await createClient();

  // Verify admin authorization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isAdmin } = await (supabase as any).rpc('is_admin_or_super');
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase as any).rpc('toggle_voting_lock', { p_open: open });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, open: result };
}

export async function toggleFinalistAction(
  submissionId: string,
  isFinalist: boolean,
  rank?: number
) {
  const supabase = await createClient();

  // Verify admin authorization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isAdmin } = await (supabase as any).rpc('is_admin_or_super');
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc('toggle_finalist', {
    p_submission_id: submissionId,
    p_is_finalist: isFinalist,
    p_rank: rank || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function checkVotingStatusAction(): Promise<boolean> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc('is_voting_open');
  return data ?? true;
}
