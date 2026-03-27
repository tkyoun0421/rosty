import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AdminWork } from "#flows/admin-work/AdminWork.client";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("AdminWork", () => {
  it("creates the current work and refreshes the summary card", async () => {
    let currentWork = {
      id: "work-2026-04-26",
      workDate: "2026-04-26",
      startAt: "2026-04-26T02:00:00.000Z",
      endAt: "2026-04-26T09:00:00.000Z",
    };

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/api/dev/work") && (!init || init.method === "GET")) {
        return new Response(JSON.stringify({ work: currentWork }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/api/dev/work") && init?.method === "POST") {
        const payload = JSON.parse(String(init.body));
        currentWork = {
          id: `work-${payload.workDate}`,
          workDate: payload.workDate,
          startAt: "2026-05-03T01:00:00.000Z",
          endAt: "2026-05-03T08:00:00.000Z",
        };

        return new Response(JSON.stringify({ work: currentWork }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <AdminWork />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("현재 모집 중인 근무")).toBeInTheDocument();
    expect(await screen.findByText("2026-04-26")).toBeInTheDocument();
    expect(await screen.findByText("오전 11:00 - 오후 06:00")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("근무 날짜"), {
      target: { value: "2026-05-03" },
    });
    fireEvent.change(screen.getByLabelText("시작 시간"), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText("종료 시간"), {
      target: { value: "17:00" },
    });

    fireEvent.click(screen.getByRole("button", { name: "근무 저장" }));

    expect(await screen.findByText("근무를 저장했습니다.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("2026-05-03")).toBeInTheDocument();
    });

    expect(screen.getByText("오전 10:00 - 오후 05:00")).toBeInTheDocument();
  });
});
