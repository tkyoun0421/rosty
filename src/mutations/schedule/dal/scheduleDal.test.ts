import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const selectMaybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle: selectMaybeSingle }));
const select = vi.fn(() => ({ eq }));
const updateSingle = vi.fn();
const updateEq = vi.fn(() => ({ select: updateSingle }));
const update = vi.fn(() => ({ eq: updateEq }));
const from = vi.fn((table: string) => {
  if (table !== "schedules") {
    throw new Error(`Unexpected table: ${table}`);
  }

  return {
    select,
    update,
  };
});
const getAdminSupabaseClient = vi.fn(() => ({ from, rpc }));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

describe("scheduleDal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("updates only lightweight recruiting and assigning transitions", async () => {
    selectMaybeSingle.mockResolvedValue({
      data: { status: "recruiting" },
      error: null,
    });
    updateSingle.mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: {
          id: "schedule-1",
          starts_at: "2026-04-01T09:00:00+09:00",
          ends_at: "2026-04-01T13:30:00+09:00",
          status: "assigning",
          created_by: "admin-1",
          created_at: "2026-03-31T00:00:00.000Z",
          updated_at: "2026-03-31T01:00:00.000Z",
          schedule_role_slots: [{ role_code: "captain", headcount: 2 }],
        },
        error: null,
      }),
    });

    const { updateScheduleRecordStatus } = await import("#mutations/schedule/dal/scheduleDal");
    const result = await updateScheduleRecordStatus({
      scheduleId: "schedule-1",
      status: "assigning",
    });

    expect(eq).toHaveBeenCalledWith("id", "schedule-1");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "assigning",
      }),
    );
    expect(result).toMatchObject({
      id: "schedule-1",
      status: "assigning",
    });
  });

  it("locks confirmed schedules from the generic list-status path", async () => {
    selectMaybeSingle.mockResolvedValue({
      data: { status: "confirmed" },
      error: null,
    });

    const { updateScheduleRecordStatus } = await import("#mutations/schedule/dal/scheduleDal");

    await expect(
      updateScheduleRecordStatus({
        scheduleId: "schedule-1",
        status: "assigning",
      }),
    ).rejects.toThrow("CONFIRMED_SCHEDULE_STATUS_LOCKED");

    expect(update).not.toHaveBeenCalled();
  });
});
