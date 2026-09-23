'use server';

import { createClient } from '@/lib/supabase/server';

export interface CriterionInput {
  name: string;
  description?: string;
  maxScore: number;
  weight: number;
  displayOrder?: number;
  isActive?: boolean;
}

export async function createCriterionAction(input: CriterionInput) {
  const { name, description, maxScore, weight, displayOrder = 0, isActive = true } = input;

  if (!name?.trim()) {
    return { success: false, error: 'Criterion name is required.' };
  }

  if (isNaN(maxScore) || maxScore <= 0) {
    return { success: false, error: 'Maximum score must be a positive number.' };
  }

  if (isNaN(weight) || weight < 0) {
    return { success: false, error: 'Weight must be zero or a positive number.' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isSuper } = await (supabase as any).rpc('is_super_admin');
  if (!isSuper) {
    return { success: false, error: 'Unauthorized: Super Admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('judging_criteria') as any).insert({
    name: name.trim(),
    description: description?.trim() || null,
    max_score: maxScore,
    weight: weight,
    display_order: displayOrder,
    is_active: isActive,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateCriterionAction(id: string, input: Partial<CriterionInput>) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isSuper } = await (supabase as any).rpc('is_super_admin');
  if (!isSuper) {
    return { success: false, error: 'Unauthorized: Super Admin privileges required.' };
  }

  if (input.maxScore !== undefined && (isNaN(input.maxScore) || input.maxScore <= 0)) {
    return { success: false, error: 'Maximum score must be a positive number.' };
  }

  if (input.weight !== undefined && (isNaN(input.weight) || input.weight < 0)) {
    return { success: false, error: 'Weight must be a positive number.' };
  }

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) payload.description = input.description.trim() || null;
  if (input.maxScore !== undefined) payload.max_score = input.maxScore;
  if (input.weight !== undefined) payload.weight = input.weight;
  if (input.displayOrder !== undefined) payload.display_order = input.displayOrder;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('judging_criteria') as any)
    .update(payload)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
