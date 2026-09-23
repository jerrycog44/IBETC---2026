'use server';

import { createClient } from '@/lib/supabase/server';

export interface ScoreEntryInput {
  criterionId: string;
  score: number;
  notes?: string;
}

export async function saveJudgeScoresAction(submissionId: string, scoreEntries: ScoreEntryInput[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Authentication required.' };
  }

  // 1. Verify staff role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isStaff } = await (supabase as any).rpc('is_staff');
  if (!isStaff) {
    return { success: false, error: 'Unauthorized: Staff judge authorization required.' };
  }

  // 2. Check if judging is open
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isOpen } = await (supabase as any).rpc('is_judging_open');
  if (isOpen === false) {
    return { success: false, error: 'Judging is currently locked by system administrators.' };
  }

  // 3. Fetch active criteria for score bounds validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: criteria } = await (supabase.from('judging_criteria') as any)
    .select('id, max_score, is_active')
    .eq('is_active', true);

  if (!criteria || criteria.length === 0) {
    return { success: false, error: 'No active judging criteria found.' };
  }

  const criteriaMap = new Map<string, number>();
  criteria.forEach((c: { id: string; max_score: number }) => {
    criteriaMap.set(c.id, Number(c.max_score));
  });

  // Validate all scores against active criteria and max bounds
  for (const item of scoreEntries) {
    const maxScore = criteriaMap.get(item.criterionId);
    if (maxScore === undefined) {
      return { success: false, error: 'Invalid or inactive judging criterion specified.' };
    }
    if (isNaN(item.score) || item.score < 0) {
      return { success: false, error: 'Scores cannot be negative.' };
    }
    if (item.score > maxScore) {
      return { success: false, error: `Score exceeds maximum allowed limit of ${maxScore}.` };
    }
  }

  // 4. Save/upsert judge scores into database
  for (const item of scoreEntries) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertError } = await (supabase.from('scores') as any).upsert(
      {
        submission_id: submissionId,
        judge_id: user.id,
        criterion_id: item.criterionId,
        score: item.score,
        notes: item.notes?.trim() || null,
      },
      { onConflict: 'submission_id,judge_id,criterion_id' }
    );

    if (upsertError) {
      return { success: false, error: upsertError.message };
    }
  }

  return { success: true };
}

export async function toggleJudgingLockAction(open: boolean) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isSuper } = await (supabase as any).rpc('is_super_admin');
  if (!isSuper) {
    return { success: false, error: 'Unauthorized: Super Admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase as any).rpc('toggle_judging_lock', { p_open: open });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, open: result };
}
