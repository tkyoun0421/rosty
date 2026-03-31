import { describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const findInviteByToken = vi.fn();
const markInviteAccepted = vi.fn();
const upsertProfileRole = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#mutations/invite/dal/inviteDal", () => ({
  findInviteByToken,
  markInviteAccepted,
  upsertProfileRole,
}));

describe("acceptInvite", () => {
  it("accepts a valid token without email-match enforcement", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-1", email: "alt@example.com", role: null });
    findInviteByToken.mockResolvedValue({
      id: "invite-1",
      role: "worker",
      status: "pending",
      expiresAt: "2099-04-01T00:00:00.000Z",
    });

    const { acceptInvite } = await import("#mutations/invite/actions/acceptInvite");
    const result = await acceptInvite("invite-token");

    expect(upsertProfileRole).toHaveBeenCalledWith({
      userId: "user-1",
      email: "alt@example.com",
      role: "worker",
    });
    expect(markInviteAccepted).toHaveBeenCalledWith({ inviteId: "invite-1", userId: "user-1" });
    expect(result).toEqual({ inviteId: "invite-1", role: "worker" });
  });
});

