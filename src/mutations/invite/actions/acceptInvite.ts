"use server";

import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import {
  findInviteByToken,
  markInviteAccepted,
  upsertProfileRole,
} from "#mutations/invite/dal/inviteDal";

export async function acceptInvite(token: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("UNAUTHORIZED");
  }

  const invite = await findInviteByToken(token);

  if (!invite || invite.status !== "pending") {
    throw new Error("INVITE_NOT_AVAILABLE");
  }

  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new Error("INVITE_EXPIRED");
  }

  await upsertProfileRole({
    userId: currentUser.id,
    email: currentUser.email,
    role: invite.role,
  });
  await markInviteAccepted({ inviteId: invite.id, userId: currentUser.id });

  return {
    inviteId: invite.id,
    role: invite.role,
  };
}

