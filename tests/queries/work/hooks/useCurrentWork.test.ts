import { afterEach, describe, expect, it, vi } from "vitest";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

import { fetchCurrentWork } from "#queries/work/dal/fetchCurrentWork";
import { useCurrentWork } from "#queries/work/hooks/useCurrentWork";
import { queryKeys } from "#shared/constants/queryKeys";

describe("useCurrentWork", () => {
  afterEach(() => {
    useQueryMock.mockReset();
  });

  it("configures the current work query from the shared key factory", () => {
    useQueryMock.mockReturnValue({ data: null, isPending: false, error: null });

    useCurrentWork();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: queryKeys.work.current(),
      queryFn: fetchCurrentWork,
    });
  });
});
