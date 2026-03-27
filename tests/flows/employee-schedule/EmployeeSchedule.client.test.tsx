import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EmployeeSchedule } from "#flows/employee-schedule/EmployeeSchedule.client";

const REQUESTS_RESPONSE = {
  requests: [
    {
      id: "request-001",
      employeeId: "employee-01",
      workDate: "2026-04-12",
      timeSlot: "morning",
      role: "service",
      note: "service-ready",
      status: "pending",
      submittedAt: "2026-03-27T09:00:00.000Z",
      adminComment: null,
    },
    {
      id: "request-002",
      employeeId: "employee-01",
      workDate: "2026-04-19",
      timeSlot: "afternoon",
      role: "ceremony",
      note: "ceremony-experience",
      status: "approved",
      submittedAt: "2026-03-26T06:30:00.000Z",
      adminComment: "main-hall",
    },
  ],
};

describe("EmployeeSchedule", () => {
  it("submits a new request and refreshes the request list", async () => {
    let currentRequests = [...REQUESTS_RESPONSE.requests];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/api/dev/schedule-requests") && (!init || init.method === "GET")) {
        return new Response(JSON.stringify({ requests: currentRequests }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/api/dev/schedule-requests") && init?.method === "POST") {
        const payload = JSON.parse(String(init.body));
        const created = {
          id: "request-003",
          employeeId: "employee-01",
          workDate: payload.workDate,
          timeSlot: payload.timeSlot,
          role: payload.role,
          note: payload.note,
          status: "pending",
          submittedAt: "2026-03-27T10:00:00.000Z",
          adminComment: null,
        };

        currentRequests = [created, ...currentRequests];

        return new Response(JSON.stringify({ request: created }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <EmployeeSchedule />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("근무 다음주 요청")).toBeInTheDocument();
    expect(await screen.findByText("2026-04-12")).toBeInTheDocument();
    expect(screen.getByText("승인 완료")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("근무 날짜"), {
      target: { value: "2026-04-26" },
    });
    fireEvent.change(screen.getByLabelText("시간대"), {
      target: { value: "evening" },
    });
    fireEvent.change(screen.getByLabelText("근무 역할"), {
      target: { value: "consulting" },
    });
    fireEvent.change(screen.getByLabelText("메모"), {
      target: { value: "closing-consulting" },
    });

    fireEvent.click(screen.getByRole("button", { name: "근무 요청 등록" }));

    expect(await screen.findByText("요청이 등록되었습니다.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("2026-04-26")).toBeInTheDocument();
    });

    expect(screen.getAllByText("승인 대기").length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalled();
  });
});
