'use server';

import { createClient } from '@/lib/supabase/server';
import { SubmissionStatus } from '@/lib/supabase/database.types';

export interface CreateSubmissionInput {
  fullName: string;
  school: string;
  phone: string;
  email: string;
  debateTopic: string;
  videoPath: string;
  participantKey: string;
}

export async function createSubmissionAction(input: CreateSubmissionInput) {
  const { fullName, school, phone, email, debateTopic, videoPath, participantKey } = input;

  // Input Validation
  if (!fullName?.trim() || !school?.trim() || !phone?.trim() || !email?.trim() || !debateTopic?.trim() || !videoPath?.trim() || !participantKey?.trim()) {
    return { success: false, error: 'All fields are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const phoneClean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (phoneClean.length < 7 || !/^\d+$/.test(phoneClean)) {
    return { success: false, error: 'Please enter a valid phone number.' };
  }

  const supabase = await createClient();

  // Check for duplicate active submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('submissions') as any)
    .select('id')
    .ilike('full_name', fullName.trim())
    .ilike('email', email.trim())
    .neq('status', 'rejected')
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      success: false,
      error: 'An active competition submission already exists for this participant details.',
    };
  }

  // Generate friendly slug
  const baseSlug = `${fullName.trim()}-${school.trim()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug}-${randomSuffix}`;

  // Pre-generate submission UUID & metadata server-side
  const submissionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // Insert submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('submissions') as any)
    .insert({
      id: submissionId,
      full_name: fullName.trim(),
      school: school.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      debate_topic: debateTopic.trim(),
      video_path: videoPath,
      participant_key: participantKey,
      slug: slug,
      status: 'pending',
    });

  if (error) {
    return {
      success: false,
      error: error?.message || 'Failed to save submission. Please try again.',
    };
  }

  return {
    success: true,
    data: {
      id: submissionId,
      fullName: fullName.trim(),
      school: school.trim(),
      debateTopic: debateTopic.trim(),
      slug: slug,
      createdAt: createdAt,
      participantKey: participantKey,
    },
  };
}

export async function updateSubmissionStatusAction(
  submissionId: string,
  newStatus: SubmissionStatus
) {
  const supabase = await createClient();

  // Verify staff admin role server-side
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isAdmin } = await (supabase as any).rpc('is_admin_or_super');
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Staff admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('submissions') as any)
    .update({ status: newStatus })
    .eq('id', submissionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function associateAccountAction(submissionId: string, participantKey: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Must be logged in to link account.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: success, error } = await (supabase as any).rpc(
    'associate_submission_with_account',
    {
      p_submission_id: submissionId,
      p_participant_key: participantKey,
    }
  );

  if (error || !success) {
    return { success: false, error: error?.message || 'Failed to associate account.' };
  }

  return { success: true };
}
