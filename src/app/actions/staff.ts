'use server';

import { createClient } from '@/lib/supabase/server';
import { StaffRole } from '@/lib/supabase/database.types';

export interface CreateStaffInput {
  userId: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

export async function createStaffUserAction(input: CreateStaffInput) {
  const { userId, fullName, email, role } = input;

  if (!userId || !fullName?.trim() || !email?.trim() || !role) {
    return { success: false, error: 'All fields are required.' };
  }

  const supabase = await createClient();

  // Verify caller is super admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isSuper } = await (supabase as any).rpc('is_super_admin');
  if (!isSuper) {
    return { success: false, error: 'Unauthorized: Super Admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: success, error } = await (supabase as any).rpc('create_staff_user', {
    p_user_id: userId,
    p_full_name: fullName.trim(),
    p_email: email.trim().toLowerCase(),
    p_role: role,
  });

  if (error || !success) {
    return { success: false, error: error?.message || 'Failed to create staff record.' };
  }

  return { success: true };
}

export async function updateStaffRoleAction(userId: string, newRole: StaffRole) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isSuper } = await (supabase as any).rpc('is_super_admin');
  if (!isSuper) {
    return { success: false, error: 'Unauthorized: Super Admin privileges required.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('staff_users') as any)
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
