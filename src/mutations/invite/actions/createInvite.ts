"use server";

import { randomUUID } from "node:crypto";

import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import type { AppRole } from "#shared/model/access";
import { createInviteRecord, hashInviteToken } from "#mutations/invite/dal/inviteDal";

export async function createInvite(input: { role: AppRole; expiresAt: string }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  const token = randomUUID();
  const invite = await createInviteRecord({
    tokenHash: hashInviteToken(token),
    role: input.role,
    expiresAt: input.expiresAt,
    createdBy: currentUser.id,
  });

  return {
    token,
    invite,
  };
}

