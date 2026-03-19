import { supabaseClient } from '@/shared/lib/supabase/client';

type ClaimInvitationLinkInput = {
  token: string;
  userId: string;
  consumedAt?: string;
};

type ReleaseInvitationLinkInput = {
  token: string;
  userId: string;
  consumedAt: string;
};

type InvitationClaimRow = {
  id: string;
};

export async function claimInvitationLink(
  input: ClaimInvitationLinkInput,
): Promise<{ consumedAt: string }> {
  if (!supabaseClient) {
    throw new Error('Supabase invitation management is not configured.');
  }

  const consumedAt = input.consumedAt ?? new Date().toISOString();
  const { data, error } = await supabaseClient
    .from('invitation_links')
    .update({
      consumed_by: input.userId,
      consumed_at: consumedAt,
    })
    .eq('token', input.token)
    .eq('target_role', 'employee')
    .is('consumed_at', null)
    .is('disabled_at', null)
    .gt('expires_at', consumedAt)
    .select('id')
    .maybeSingle<InvitationClaimRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('This invitation link is no longer valid.');
  }

  return { consumedAt };
}

export async function releaseClaimedInvitationLink(
  input: ReleaseInvitationLinkInput,
): Promise<void> {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient
    .from('invitation_links')
    .update({
      consumed_by: null,
      consumed_at: null,
    })
    .eq('token', input.token)
    .eq('consumed_by', input.userId)
    .eq('consumed_at', input.consumedAt);

  if (error) {
    throw new Error(error.message);
  }
}
