import { queryKeys } from "#shared/constants/queryKeys";

describe("queryKeys", () => {
  it("builds stable schedule request keys from a shared factory", () => {
    expect(queryKeys.scheduleRequests.all()).toEqual(["schedule-requests"]);
    expect(queryKeys.scheduleRequests.list()).toEqual(["schedule-requests", "list"]);
    expect(queryKeys.scheduleRequests.employeeList()).toEqual([
      "schedule-requests",
      "list",
      "employee",
    ]);
  });
});