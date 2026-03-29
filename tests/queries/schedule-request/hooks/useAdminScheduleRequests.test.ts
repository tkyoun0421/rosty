import { afterEach, describe, expect, it, vi } from "vitest";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

import { fetchAdminScheduleRequests } from "#queries/schedule-request/dal/fetchAdminScheduleRequests";
import { useAdminScheduleRequests } from "#queries/schedule-request/hooks/useAdminScheduleRequests";
import { queryKeys } from "#shared/constants/queryKeys";

describe("useAdminScheduleRequests", () => {
  afterEach(() => {
    useQueryMock.mockReset();
  });

  it("configures admin requests polling for the review dashboard", () => {
    useQueryMock.mockReturnValue({ data: [], isPending: false, error: null });

    useAdminScheduleRequests();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: queryKeys.scheduleRequests.adminList(),
      queryFn: fetchAdminScheduleRequests,
      refetchInterval: 30_000,
      refetchIntervalInBackground: true,
    });
  });
});
