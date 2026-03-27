import { describe, expect, it } from "vitest";

import {
  buildNightWorkStatusText,
  parseNightWorkResult,
} from "../../scripts/night-work/lib/parseNightWorkResult.mjs";

describe("parseNightWorkResult", () => {
  it("parses a valid continue payload", () => {
    const result = parseNightWorkResult(
      JSON.stringify({
        status: "CONTINUE",
        reason: "slice_complete",
        summary: "Implemented the next coherent slice.",
        validation: "pnpm test",
        next_step: "Continue into the next in-scope task.",
      }),
    );

    expect(result.status).toBe("CONTINUE");
    expect(result.reason).toBe("slice_complete");
  });

  it("rejects an invalid status payload", () => {
    expect(() =>
      parseNightWorkResult(
        JSON.stringify({
          status: "DONE",
          reason: "slice_complete",
          summary: "bad",
          validation: "bad",
          next_step: "bad",
        }),
      ),
    ).toThrow("night-work result");
  });
});

describe("buildNightWorkStatusText", () => {
  it("renders plain-text markers for the runner state file", () => {
    const text = buildNightWorkStatusText({
      status: "BLOCKED",
      reason: "approval_required",
      summary: "A privileged command is required.",
      validation: "Not run",
      next_step: "Request approval before continuing.",
    });

    expect(text).toContain("NIGHT_WORK_STATUS: BLOCKED");
    expect(text).toContain("NIGHT_WORK_REASON: approval_required");
    expect(text).toContain("A privileged command is required.");
  });
});
