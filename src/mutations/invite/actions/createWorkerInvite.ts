"use server";

import { createInvite } from "#mutations/invite/actions/createInvite";

export async function createWorkerInvite() {
  await createInvite({
    role: "worker",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  });
}
