import { describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const rpc = vi.fn();
const from = vi.fn(() => ({ select }));
const getServerSupabaseClient = vi.fn(() => ({
  auth: {
    getUser,
  },
  from,
  rpc,
}));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

describe("getCurrentUser", () => {
  it("returns a stable current-user dto", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "worker@example.com",
          app_metadata: { user_role: "worker" },
          user_metadata: {},
        },
      },
    });

    const { getCurrentUser } = await import("#queries/access/dal/getCurrentUser");

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      email: "worker@example.com",
      role: "worker",
    });
  });

  it("falls back to the database-backed role lookup", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-2",
          email: "admin@example.com",
          app_metadata: {},
          user_metadata: {},
        },
      },
    });
    maybeSingle.mockResolvedValue({ data: { role: "admin" } });

    const { getCurrentUser } = await import("#queries/access/dal/getCurrentUser");

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-2",
      email: "admin@example.com",
      role: "admin",
    });
    expect(from).toHaveBeenCalledWith("user_roles");
  });

  it("bootstraps the first admin when no role exists yet", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-3",
          email: "first@example.com",
          app_metadata: {},
          user_metadata: {},
        },
      },
    });
    maybeSingle
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: { role: "admin" } });
    rpc.mockResolvedValue({ data: "admin" });

    const { getCurrentUser } = await import("#queries/access/dal/getCurrentUser");

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-3",
      email: "first@example.com",
      role: "admin",
    });
    expect(rpc).toHaveBeenCalledWith("bootstrap_first_admin", {
      target_user_id: "user-3",
    });
  });

  it("returns null for anonymous requests", async () => {
    getUser.mockResolvedValue({
      data: {
        user: null,
      },
    });

    const { getCurrentUser } = await import("#queries/access/dal/getCurrentUser");

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});