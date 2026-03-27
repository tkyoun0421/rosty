import { describe, expect, it } from "vitest";

import { parseNightWorkGoal } from "../../scripts/night-work/lib/parseNightWorkGoal.mjs";

describe("parseNightWorkGoal", () => {
  it("strips the pnpm separator argument before joining the goal", () => {
    expect(parseNightWorkGoal(["--", "Smoke prompt goal"])).toBe("Smoke prompt goal");
  });

  it("joins a plain argv array into one goal string", () => {
    expect(parseNightWorkGoal(["continue", "the", "current", "work"])).toBe(
      "continue the current work",
    );
  });
});
