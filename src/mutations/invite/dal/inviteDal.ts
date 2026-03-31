import "server-only";

import { createHash } from "node:crypto";

import type { AppRole, InviteStatus } from "#shared/model/access";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";

export interface InviteRecord {
  id: string;
  role: AppRole;
  status: InviteStatus;
  expiresAt: string;
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createInviteRecord(input: {
  tokenHash: string;
  role: AppRole;
  expiresAt: string;
  createdBy: string;
}) {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .insert({
      token_hash: input.tokenHash,
      role: input.role,
      status: "pending",
      expires_at: input.expiresAt,
      created_by: input.createdBy,
    })
    .select("id, role, status, expires_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    role: data.role,
    status: data.status,
    expiresAt: data.expires_at,
  } satisfies InviteRecord;
}

export async function findInviteByToken(token: string) {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .select("id, role, status, expires_at")
    .eq("token_hash", hashInviteToken(token))
    .single();

  if (error) {
    throw error;
  }

  return data
    ? ({
        id: data.id,
        role: data.role,
        status: data.status,
        expiresAt: data.expires_at,
      } satisfies InviteRecord)
    : null;
}

export async function markInviteAccepted(input: { inviteId: string; userId: string }) {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from("invites")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: input.userId,
    })
    .eq("id", input.inviteId);

  if (error) {
    throw error;
  }
}

export async function revokeInvite(inviteId: string) {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from("invites")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", inviteId);

  if (error) {
    throw error;
  }
}

export async function upsertProfileRole(input: {
  userId: string;
  email: string;
  role: AppRole;
}) {
  const supabase = getAdminSupabaseClient();
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: input.userId,
    email: input.email,
  });

  if (profileError) {
    throw profileError;
  }

  const { error: roleError } = await supabase.from("user_roles").upsert({
    user_id: input.userId,
    role: input.role,
  });

  if (roleError) {
    throw roleError;
  }
}

