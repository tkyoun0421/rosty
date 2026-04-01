import { beforeEach, describe, expect, it, vi } from "vitest";

const select = vi.fn();
const from = vi.fn(() => ({ select }));
const getAdminSupabaseClient = vi.fn(() => ({ from }));
const getServerSupabaseClient = vi.fn(async () => ({ from }));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

describe("listWorkerRates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    select.mockResolvedValue({
      data: [
        {
          user_id: "worker-1",
          hourly_rate_cents: 14500,
          updated_by: "admin-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      error: null,
    });
  });

  it("falls back to the session client when the service role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { listWorkerRates } = await import("#queries/worker-rate/dal/listWorkerRates");
    const result = await listWorkerRates();

    expect(getServerSupabaseClient).toHaveBeenCalledTimes(1);
    expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        userId: "worker-1",
        hourlyRateCents: 14500,
        updatedBy: "admin-1",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
    ]);
  });

  it("uses the admin client when the service role key is present", async () => {
    vi.resetModules();
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const { listWorkerRates } = await import("#queries/worker-rate/dal/listWorkerRates");
    await listWorkerRates();

    expect(getAdminSupabaseClient).toHaveBeenCalledTimes(1);
    expect(getServerSupabaseClient).not.toHaveBeenCalled();
  });
});
