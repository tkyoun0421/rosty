import { describe, expect, it } from "vitest";

import { calculatePayPreview } from "#queries/assignment/utils/calculatePayPreview";

describe("calculatePayPreview", () => {
  it("splits the first 9 hours into regular time only", () => {
    const result = calculatePayPreview({
      startsAt: "2026-04-10T09:00:00+09:00",
      endsAt: "2026-04-10T18:00:00+09:00",
      hourlyRateCents: 12000,
    });

    expect(result).toEqual({
      regularHours: 9,
      overtimeHours: 0,
      overtimeApplied: false,
      hourlyRateCents: 12000,
      regularPayCents: 108000,
      overtimePayCents: 0,
      totalPayCents: 108000,
    });
  });

  it("applies a 1.5x premium only to hours above 9", () => {
    const result = calculatePayPreview({
      startsAt: "2026-04-10T09:00:00+09:00",
      endsAt: "2026-04-10T20:00:00+09:00",
      hourlyRateCents: 10000,
    });

    expect(result).toEqual({
      regularHours: 9,
      overtimeHours: 2,
      overtimeApplied: true,
      hourlyRateCents: 10000,
      regularPayCents: 90000,
      overtimePayCents: 30000,
      totalPayCents: 120000,
    });
  });

  it("rejects invalid schedule windows", () => {
    expect(() =>
      calculatePayPreview({
        startsAt: "2026-04-10T20:00:00+09:00",
        endsAt: "2026-04-10T09:00:00+09:00",
        hourlyRateCents: 10000,
      }),
    ).toThrow("INVALID_SCHEDULE_WINDOW");
  });
});
