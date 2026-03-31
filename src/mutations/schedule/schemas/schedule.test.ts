import { describe, expect, it } from "vitest";

import { scheduleSchema } from "#mutations/schedule/schemas/schedule";

describe("scheduleSchema scaffolding", () => {
  it("exposes a parseable schedule schema module", () => {
    const result = scheduleSchema.safeParse({
      startsAt: "2026-04-01T02:00:00.000Z",
      endsAt: "2026-04-01T06:00:00.000Z",
      roleSlots: [{ roleCode: "captain", headcount: 2 }],
    });

    expect(result.success).toBe(true);
  });
});
