import { describe, expect, it } from "vitest";

import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";

describe("formatKoreanDateTime", () => {
  it("formats a date in the Asia/Seoul timezone", () => {
    expect(formatKoreanDateTime(new Date("2026-03-27T09:00:00.000Z"))).toBe("03. 27. 오후 06:00");
  });
});
