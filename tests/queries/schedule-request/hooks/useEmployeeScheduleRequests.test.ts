import { afterEach, describe, expect, it, vi } from "vitest";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

import { fetchEmployeeScheduleRequests } from "#queries/schedule-request/dal/fetchEmployeeScheduleRequests";
import { useEmployeeScheduleRequests } from "#queries/schedule-request/hooks/useEmployeeScheduleRequests";
import { queryKeys } from "#shared/constants/queryKeys";

describe("useEmployeeScheduleRequests", () => {
  afterEach(() => {
    useQueryMock.mockReset();
  });

  it("configures employee requests polling for release 1 status refresh", () => {
    useQueryMock.mockReturnValue({ data: [], isPending: false, error: null });

    useEmployeeScheduleRequests();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: queryKeys.scheduleRequests.employeeList(),
      queryFn: fetchEmployeeScheduleRequests,
      refetchInterval: 30_000,
      refetchIntervalInBackground: true,
    });
  });
});
