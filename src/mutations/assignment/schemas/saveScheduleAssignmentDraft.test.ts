import { describe, expect, it } from "vitest";

import { parseSaveScheduleAssignmentDraft } from "#mutations/assignment/schemas/saveScheduleAssignmentDraft";

describe("saveScheduleAssignmentDraftSchema", () => {
  it("accepts whole-schedule draft input and normalizes form data into the save payload", () => {
    const formData = new FormData();
    formData.set("scheduleId", "schedule-1");
    formData.set(
      "assignments",
      JSON.stringify([
        {
          scheduleRoleSlotId: " slot-1 ",
          workerUserId: " worker-1 ",
          ignored: true,
        },
        {
          scheduleRoleSlotId: "slot-2",
          workerUserId: "worker-2",
        },
      ]),
    );

    const result = parseSaveScheduleAssignmentDraft(formData);

    expect(result).toEqual({
      scheduleId: "schedule-1",
      assignments: [
        {
          scheduleRoleSlotId: "slot-1",
          workerUserId: "worker-1",
        },
        {
          scheduleRoleSlotId: "slot-2",
          workerUserId: "worker-2",
        },
      ],
    });
  });

  it("rejects duplicate worker assignments before persistence", () => {
    expect(() =>
      parseSaveScheduleAssignmentDraft({
        scheduleId: "schedule-1",
        assignments: [
          {
            scheduleRoleSlotId: "slot-1",
            workerUserId: "worker-1",
          },
          {
            scheduleRoleSlotId: "slot-2",
            workerUserId: "worker-1",
          },
        ],
      }),
    ).toThrow("Each worker can only be assigned once per schedule.");
  });
});
