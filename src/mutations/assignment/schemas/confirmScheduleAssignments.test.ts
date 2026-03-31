import { describe, expect, it } from "vitest";

import { parseConfirmScheduleAssignments } from "#mutations/assignment/schemas/confirmScheduleAssignments";

describe("confirmScheduleAssignmentsSchema", () => {
  it("parses exactly scheduleId from form data", () => {
    const formData = new FormData();
    formData.set("scheduleId", " schedule-1 ");
    formData.set("ignored", "value");

    expect(parseConfirmScheduleAssignments(formData)).toEqual({
      scheduleId: "schedule-1",
    });
  });

  it("rejects an empty schedule id", () => {
    expect(() =>
      parseConfirmScheduleAssignments({
        scheduleId: "",
      }),
    ).toThrow();
  });
});
