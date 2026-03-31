import { describe, expect, it, vi } from "vitest";

const getServerSupabaseClient = vi.fn();
const acceptInvite = vi.fn();
const bootstrapFirstAdmin = vi.fn();
const getProfileByUserId = vi.fn();
const upsertProfile = vi.fn();

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

vi.mock("#mutations/invite/actions/acceptInvite", () => ({
  acceptInvite,
}));

vi.mock("#mutations/auth/dal/authDal", () => ({
  bootstrapFirstAdmin,
  getIdentityAvatarUrl: () => "https://example.com/avatar.png",
  getIdentityFullName: () => "Kim Admin",
  getProfileByUserId,
  upsertProfile,
}));

describe("finalizeAuthSession", () => {
  it("sends incomplete profiles to onboarding after first-user bootstrap", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "admin@example.com",
              user_metadata: {},
            },
          },
        }),
      },
    });
    getProfileByUserId.mockResolvedValueOnce(null).mockResolvedValueOnce({
      fullName: "Kim Admin",
      gender: null,
      birthDate: null,
      avatarUrl: "https://example.com/avatar.png",
    });

    const { finalizeAuthSession } = await import("#mutations/auth/actions/finalizeAuthSession");
    const nextPath = await finalizeAuthSession();

    expect(bootstrapFirstAdmin).toHaveBeenCalledWith("user-1");
    expect(nextPath).toBe("/onboarding");
  });

  it("keeps invite acceptance in the callback flow", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "worker@example.com",
              user_metadata: {},
            },
          },
        }),
      },
    });
    getProfileByUserId.mockResolvedValue({
      fullName: "Kim Worker",
      gender: "male",
      birthDate: "1990-01-01",
      avatarUrl: "https://example.com/avatar.png",
    });

    const { finalizeAuthSession } = await import("#mutations/auth/actions/finalizeAuthSession");
    const nextPath = await finalizeAuthSession("invite-token");

    expect(acceptInvite).toHaveBeenCalledWith("invite-token");
    expect(nextPath).toBe("/");
  });
});
