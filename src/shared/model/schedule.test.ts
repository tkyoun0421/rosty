import {
  type ScheduleRecord,
  type ScheduleRoleSlotInput,
  type ScheduleStatus,
  type ScheduleWithRoleSlots,
} from "#shared/model/schedule";

describe("schedule model contracts", () => {
  it("supports the phase-2 schedule lifecycle statuses", () => {
    const statuses: ScheduleStatus[] = ["recruiting", "assigning", "confirmed"];

    expect(statuses).toEqual(["recruiting", "assigning", "confirmed"]);
  });

  it("keeps role-slot headcounts on the schedule aggregate", () => {
    const slot: ScheduleRoleSlotInput = {
      roleCode: "captain",
      headcount: 2,
    };

    expect(slot).toEqual({
      roleCode: "captain",
      headcount: 2,
    });
  });

  it("supports a schedule dto with nested role slots", () => {
    const schedule: ScheduleWithRoleSlots = {
      id: "schedule-1",
      startsAt: "2026-04-01T02:00:00.000Z",
      endsAt: "2026-04-01T06:00:00.000Z",
      status: "recruiting",
      createdBy: "admin-1",
      createdAt: "2026-03-31T00:00:00.000Z",
      updatedAt: "2026-03-31T00:00:00.000Z",
      roleSlots: [{ roleCode: "captain", headcount: 2 }],
    };

    expect<ScheduleRecord>(schedule).toMatchObject({
      id: "schedule-1",
      status: "recruiting",
    });
    expect(schedule.roleSlots).toHaveLength(1);
  });
});
