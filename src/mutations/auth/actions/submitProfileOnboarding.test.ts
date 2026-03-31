import { beforeEach, describe, expect, it, vi } from "vitest";

const getServerSupabaseClient = vi.fn();
const getIdentityAvatarUrl = vi.fn();
const revalidateTag = vi.fn();

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

vi.mock("#mutations/auth/dal/authDal", () => ({
  getIdentityAvatarUrl,
}));

vi.mock("next/cache", () => ({
  revalidateTag,
}));

describe("submitProfileOnboarding", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("stores the profile through the signed-in server client without a service-role helper", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { avatar_url: "https://example.com/existing.png" },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select,
          upsert,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    getServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "worker@example.com",
            },
          },
        }),
      },
      from,
      storage: {
        from: vi.fn(),
      },
    });
    getIdentityAvatarUrl.mockReturnValue("https://example.com/fallback.png");

    const formData = new FormData();
    formData.set("fullName", "Kim Worker");
    formData.set("gender", "female");
    formData.set("birthDate", "1994-05-01");

    const { submitProfileOnboarding } = await import("#mutations/auth/actions/submitProfileOnboarding");
    const result = await submitProfileOnboarding(formData);

    expect(select).toHaveBeenCalledWith("avatar_url");
    expect(upsert).toHaveBeenCalledWith({
      id: "user-1",
      email: "worker@example.com",
      full_name: "Kim Worker",
      gender: "female",
      birth_date: "1994-05-01",
      avatar_url: "https://example.com/existing.png",
    });
    expect(revalidateTag).toHaveBeenCalledWith("profile:onboarding:user-1", "max");
    expect(result).toEqual({ success: true });
  });
});