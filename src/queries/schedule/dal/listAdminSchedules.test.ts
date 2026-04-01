import { beforeEach, describe, expect, it, vi } from "vitest";

const order = vi.fn();
const select = vi.fn(() => ({ order }));
const from = vi.fn(() => ({ select }));
const getAdminSupabaseClient = vi.fn(() => ({ from }));
const getServerSupabaseClient = vi.fn(async () => ({ from }));
const unstable_cache = vi.fn((callback: (options: { useAdminClient: boolean }) => unknown) => callback);

vi.mock("next/cache", () => ({
  unstable_cache,
}));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

describe("listAdminSchedules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
    order.mockResolvedValue({
      data: [
        {
          id: "schedule-1",
          starts_at: "2026-04-10T09:00:00+09:00",
          ends_at: "2026-04-10T13:00:00+09:00",
          status: "assigning",
          schedule_role_slots: [{ role_code: "captain", headcount: 2 }],
        },
      ],
      error: null,
    });
  });

  it("falls back to the session client without caching when the service role key is missing", async () => {
    process.env.VITEST = "";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { listAdminSchedules } = await import("#queries/schedule/dal/listAdminSchedules");
    const result = await listAdminSchedules();

    expect(getServerSupabaseClient).toHaveBeenCalledTimes(1);
    expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    expect(unstable_cache).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        id: "schedule-1",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T13:00:00+09:00",
        status: "assigning",
        roleSlotSummary: [{ roleCode: "captain", headcount: 2 }],
      },
    ]);
  });

  it("uses the admin client and cached query when the service role key is present", async () => {
    vi.resetModules();
    process.env.VITEST = "";
    process.env.NODE_ENV = "production";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const { listAdminSchedules } = await import("#queries/schedule/dal/listAdminSchedules");
    await listAdminSchedules();

    expect(getAdminSupabaseClient).toHaveBeenCalledTimes(1);
    expect(getServerSupabaseClient).not.toHaveBeenCalled();
  });
});
