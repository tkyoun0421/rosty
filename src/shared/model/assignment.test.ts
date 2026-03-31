import { type AssignmentStatus, type ScheduleAssignmentRecord } from "#shared/model/assignment";

describe("assignment model contracts", () => {
  it("supports only draft and confirmed assignment statuses", () => {
    const statuses: AssignmentStatus[] = ["draft", "confirmed"];

    expect(statuses).toEqual(["draft", "confirmed"]);
  });

  it("keeps the canonical assignment row shape stable", () => {
    const record: ScheduleAssignmentRecord = {
      id: "assignment-1",
      scheduleId: "schedule-1",
      scheduleRoleSlotId: "slot-1",
      workerUserId: "worker-1",
      status: "draft",
      confirmedAt: null,
      confirmedBy: null,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    };

    expect(record).toMatchObject({
      id: "assignment-1",
      scheduleId: "schedule-1",
      scheduleRoleSlotId: "slot-1",
      workerUserId: "worker-1",
      status: "draft",
    });
  });
});
