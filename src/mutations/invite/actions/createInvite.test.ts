import { describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const createInviteRecord = vi.fn();
const hashInviteToken = vi.fn(() => "hashed-token");

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#mutations/invite/dal/inviteDal", () => ({
  createInviteRecord,
  hashInviteToken,
}));

describe("createInvite", () => {
  it("allows admins to issue invite tokens", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    createInviteRecord.mockResolvedValue({ id: "invite-1", role: "worker", status: "pending" });

    const { createInvite } = await import("#mutations/invite/actions/createInvite");
    const result = await createInvite({ role: "worker", expiresAt: "2026-04-01T00:00:00.000Z" });

    expect(hashInviteToken).toHaveBeenCalledWith(expect.any(String));
    expect(createInviteRecord).toHaveBeenCalledWith({
      tokenHash: "hashed-token",
      role: "worker",
      expiresAt: "2026-04-01T00:00:00.000Z",
      createdBy: "admin-1",
    });
    expect(result.token).toEqual(expect.any(String));
  });
});

