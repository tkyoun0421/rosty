import { beforeEach, describe, expect, it, vi } from "vitest";

const order = vi.fn();
const eq = vi.fn(() => ({ order }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const getServerSupabaseClient = vi.fn(async () => ({ from }));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

describe("listRecruitingSchedules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the minimal recruiting schedule fields ordered by start time", async () => {
    order.mockResolvedValue({
      data: [
        {
          id: "schedule-1",
          starts_at: "2026-04-10T09:00:00+09:00",
          ends_at: "2026-04-10T13:00:00+09:00",
          status: "recruiting",
          created_by: "admin-1",
        },
      ],
      error: null,
    });

    const { listRecruitingSchedules } = await import("#queries/schedule/dal/listRecruitingSchedules");
    const result = await listRecruitingSchedules();

    expect(getServerSupabaseClient).toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith("schedules");
    expect(select).toHaveBeenCalledWith("id, starts_at, ends_at, status");
    expect(eq).toHaveBeenCalledWith("status", "recruiting");
    expect(order).toHaveBeenCalledWith("starts_at", { ascending: true });
    expect(result).toEqual([
      {
        id: "schedule-1",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T13:00:00+09:00",
        status: "recruiting",
      },
    ]);
  });
});
