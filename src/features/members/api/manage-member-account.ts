import type { UserRole } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

export type ManageMemberAccountInput = {
  memberId: string;
  action: 'approve' | 'suspend' | 'reactivate' | 'change-role';
  nextRole?: UserRole;
};

export type ManageMembersBulkInput = {
  memberIds: string[];
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

type AdminManageMembersBulkRow = {
  total_requested: number;
  total_updated: number;
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

export async function manageMembersBulk(
  input: ManageMembersBulkInput,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase members management is not configured.');
  }

  const { data, error } = await supabaseClient
    .rpc('admin_manage_members_bulk', {
      p_member_ids: input.memberIds,
      p_action: input.action,
      p_next_role: input.nextRole ?? null,
    })
    .returns<AdminManageMembersBulkRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.total_updated <= 0) {
    throw new Error('Bulk member management update could not be completed.');
  }
}
