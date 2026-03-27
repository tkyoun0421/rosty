import { describe, expect, it } from "vitest";

import { resolveHomePathForRole } from "#shared/lib/authSession";

describe("resolveHomePathForRole", () => {
  it("returns the employee home path for employee role", () => {
    expect(resolveHomePathForRole("employee")).toBe("/employee");
  });

  it("returns the admin home path for admin role", () => {
    expect(resolveHomePathForRole("admin")).toBe("/admin");
  });

  it("falls back to sign-in for unknown or missing roles", () => {
    expect(resolveHomePathForRole(null)).toBe("/sign-in");
    expect(resolveHomePathForRole(undefined)).toBe("/sign-in");
    expect(resolveHomePathForRole("guest")).toBe("/sign-in");
  });
});