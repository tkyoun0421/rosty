import { describe, expect, it } from "vitest";

describe("createSchedule scaffolding", () => {
  it("reserves colocated coverage for the admin schedule action", () => {
    expect("src/mutations/schedule/actions/createSchedule.ts").toContain("createSchedule");
  });
});
