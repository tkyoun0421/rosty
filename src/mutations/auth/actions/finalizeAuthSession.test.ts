import { describe, expect, it, vi } from "vitest";

const getServerSupabaseClient = vi.fn();
const acceptInvite = vi.fn();

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

vi.mock("#mutations/invite/actions/acceptInvite", () => ({
  acceptInvite,
}));

vi.mock("#mutations/auth/dal/authDal", () => ({
  getIdentityAvatarUrl: () => "https://example.com/avatar.png",
  getIdentityFullName: () => "Kim Admin",
}));

describe("finalizeAuthSession", () => {
  it("sends incomplete profiles to onboarding after first-user bootstrap", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ select, upsert }));

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
      from,
      rpc,
    });

    const { finalizeAuthSession } = await import("#mutations/auth/actions/finalizeAuthSession");
    const nextPath = await finalizeAuthSession();

    expect(rpc).toHaveBeenCalledWith("bootstrap_first_admin", {
      target_user_id: "user-1",
    });
    expect(nextPath).toBe("/onboarding");
  });

  it("keeps invite acceptance in the callback flow", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        full_name: "Kim Worker",
        gender: "male",
        birth_date: "1990-01-01",
        avatar_url: "https://example.com/avatar.png",
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn();
    const from = vi.fn(() => ({ select, upsert }));

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
      from,
      rpc,
    });

    const { finalizeAuthSession } = await import("#mutations/auth/actions/finalizeAuthSession");
    const nextPath = await finalizeAuthSession("invite-token");

    expect(acceptInvite).toHaveBeenCalledWith("invite-token");
    expect(rpc).not.toHaveBeenCalled();
    expect(nextPath).toBe("/");
  });
});