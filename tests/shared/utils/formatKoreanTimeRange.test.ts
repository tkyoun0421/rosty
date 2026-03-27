import { describe, expect, it } from "vitest";

import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

describe("formatKoreanTimeRange", () => {
  it("formats a work time range in the Asia/Seoul timezone", () => {
    expect(
      formatKoreanTimeRange(
        new Date("2026-04-26T02:00:00.000Z"),
        new Date("2026-04-26T09:00:00.000Z"),
      ),
    ).toBe("오전 11:00 - 오후 06:00");
  });
});
