import { describe, expect, it } from "vitest";

import { scheduleSchema } from "#mutations/schedule/schemas/schedule";

describe("scheduleSchema", () => {
  it("accepts admin form input with multiple role slots and normalizes it into a create payload", () => {
    const result = scheduleSchema.parse({
      date: "2026-04-01",
      startTime: "09:00",
      endTime: "13:30",
      roleSlots: [
        { roleCode: " captain ", headcount: "2" },
        { roleCode: "server", headcount: "4" },
      ],
    });

    expect(result).toEqual({
      startsAt: "2026-04-01T09:00:00+09:00",
      endsAt: "2026-04-01T13:30:00+09:00",
      roleSlots: [
        { roleCode: "captain", headcount: 2 },
        { roleCode: "server", headcount: 4 },
      ],
    });
  });

  it("rejects schedules with invalid time ranges or non-positive slot counts", () => {
    expect(
      scheduleSchema.safeParse({
        date: "2026-04-01",
        startTime: "14:00",
        endTime: "13:00",
        roleSlots: [{ roleCode: "captain", headcount: "1" }],
      }).success,
    ).toBe(false);

    expect(
      scheduleSchema.safeParse({
        date: "2026-04-01",
        startTime: "09:00",
        endTime: "13:00",
        roleSlots: [{ roleCode: "captain", headcount: "0" }],
      }).success,
    ).toBe(false);
  });
});
