import { queryKeys } from "#shared/constants/queryKeys";
import { describe, expect, it } from "vitest";

describe("queryKeys", () => {
  it("builds stable schedule request keys from a shared factory", () => {
    expect(queryKeys.scheduleRequests.all()).toEqual(["schedule-requests"]);
    expect(queryKeys.scheduleRequests.list()).toEqual(["schedule-requests", "list"]);
    expect(queryKeys.scheduleRequests.employeeList()).toEqual([
      "schedule-requests",
      "list",
      "employee",
    ]);
    expect(queryKeys.scheduleRequests.adminList()).toEqual(["schedule-requests", "list", "admin"]);
  });
});
