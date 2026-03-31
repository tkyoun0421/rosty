import { describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const getAdminSupabaseClient = vi.fn(() => ({ rpc }));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

describe("createScheduleRecord", () => {
  it("persists schedules atomically and returns the default recruiting status", async () => {
    rpc.mockResolvedValue({
      data: {
        id: "schedule-1",
        starts_at: "2026-04-01T09:00:00+09:00",
        ends_at: "2026-04-01T13:30:00+09:00",
        status: "recruiting",
        created_by: "admin-1",
        created_at: "2026-03-31T00:00:00.000Z",
        updated_at: "2026-03-31T00:00:00.000Z",
      },
      error: null,
    });

    const { createScheduleRecord } = await import("#mutations/schedule/dal/scheduleDal");
    const result = await createScheduleRecord({
      startsAt: "2026-04-01T09:00:00+09:00",
      endsAt: "2026-04-01T13:30:00+09:00",
      createdBy: "admin-1",
      roleSlots: [
        { roleCode: "captain", headcount: 2 },
        { roleCode: "server", headcount: 4 },
      ],
    });

    expect(getAdminSupabaseClient).toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith("create_schedule_with_slots", {
      p_starts_at: "2026-04-01T09:00:00+09:00",
      p_ends_at: "2026-04-01T13:30:00+09:00",
      p_created_by: "admin-1",
      p_slots: [
        { roleCode: "captain", headcount: 2 },
        { roleCode: "server", headcount: 4 },
      ],
    });
    expect(result).toMatchObject({
      id: "schedule-1",
      status: "recruiting",
      createdBy: "admin-1",
    });
  });
});
