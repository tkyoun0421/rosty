import type { UserRole } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

export type ManageMemberAccountInput = {
  memberId: string;
  action: 'approve' | 'suspend' | 'reactivate' | 'change-role';
  nextRole?: UserRole;
};

type AdminManageMemberRow = {
  profile_id: string;
  role: UserRole;
  status: 'profile_incomplete' | 'pending_approval' | 'active' | 'suspended' | 'deactivated';
  approved_at: string | null;
  approved_by: string | null;
};

export async function manageMemberAccount(
  input: ManageMemberAccountInput,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase members management is not configured.');
  }

  const { data, error } = await supabaseClient
    .rpc('admin_manage_member', {
      p_member_id: input.memberId,
      p_action: input.action,
      p_next_role: input.nextRole ?? null,
    })
    .returns<AdminManageMemberRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Member management update could not be completed.');
  }
}
