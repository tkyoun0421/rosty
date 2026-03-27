import { describe, expect, it } from "vitest";

import { buildUtcIsoStringFromKoreanDateAndTime } from "#shared/utils/buildUtcIsoStringFromKoreanDateAndTime";

describe("buildUtcIsoStringFromKoreanDateAndTime", () => {
  it("converts a Korean local date and time into a UTC ISO string", () => {
    expect(buildUtcIsoStringFromKoreanDateAndTime("2026-05-03", "10:00")).toBe(
      "2026-05-03T01:00:00.000Z",
    );
  });
});
