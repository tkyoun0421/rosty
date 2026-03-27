import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AdminScheduleReview } from "#flows/admin-schedule-review/AdminScheduleReview.client";
import { EmployeeSchedule } from "#flows/employee-schedule/EmployeeSchedule.client";

const INITIAL_REQUESTS = [
  {
    id: "request-001",
    employeeId: "employee-01",
    workId: "work-2026-04-12",
    workDate: "2026-04-12",
    workStartAt: "2026-04-12T02:00:00.000Z",
    workEndAt: "2026-04-12T09:00:00.000Z",
    note: "service-ready",
    status: "pending",
    submittedAt: "2026-03-27T09:00:00.000Z",
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
  },
  {
    id: "request-002",
    employeeId: "employee-02",
    workId: "work-2026-04-13",
    workDate: "2026-04-13",
    workStartAt: "2026-04-13T04:00:00.000Z",
    workEndAt: "2026-04-13T10:00:00.000Z",
    note: "consulting-support",
    status: "pending",
    submittedAt: "2026-03-27T08:30:00.000Z",
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
  },
  {
    id: "request-003",
    employeeId: "employee-01",
    workId: "work-2026-04-19",
    workDate: "2026-04-19",
    workStartAt: "2026-04-19T03:00:00.000Z",
    workEndAt: "2026-04-19T10:00:00.000Z",
    note: "ceremony-experience",
    status: "approved",
    submittedAt: "2026-03-26T06:30:00.000Z",
    adminComment: "main-hall",
    assignmentPosition: "main",
    assignedLocation: "메인 홀",
    assignedAt: "2026-03-27T01:30:00.000Z",
    assignedBy: "admin-01",
  },
];

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("AdminScheduleReview", () => {
  it("approves a pending request and refreshes the employee status view", async () => {
    let currentRequests = [...INITIAL_REQUESTS];
    let lastReviewPayload: Record<string, unknown> | null = null;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (
        url.endsWith("/api/dev/schedule-requests?scope=employee") &&
        (!init || init.method === "GET")
      ) {
        return new Response(
          JSON.stringify({
            requests: currentRequests.filter((request) => request.employeeId === "employee-01"),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (
        url.endsWith("/api/dev/schedule-requests?scope=admin") &&
        (!init || init.method === "GET")
      ) {
        return new Response(JSON.stringify({ requests: currentRequests }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/api/dev/schedule-requests") && init?.method === "PATCH") {
        const payload = JSON.parse(String(init.body));
        lastReviewPayload = payload;
        currentRequests = currentRequests.map((request) =>
          request.id === payload.requestId
            ? {
                ...request,
                status: payload.status,
                adminComment: payload.adminComment,
                assignmentPosition: payload.assignmentPosition,
                assignedLocation: "메인 홀",
                assignedAt: "2026-03-27T12:30:00.000Z",
                assignedBy: "admin-01",
              }
            : request,
        );

        const updated = currentRequests.find((request) => request.id === payload.requestId);

        return new Response(JSON.stringify({ request: updated }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <EmployeeSchedule />
        <AdminScheduleReview />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("근무 스케줄 신청")).toBeInTheDocument();
    expect(await screen.findByText("관리자 요청 검토")).toBeInTheDocument();

    fireEvent.change(await screen.findByLabelText("배정 포지션"), {
      target: { value: "main" },
    });
    fireEvent.change(await screen.findByLabelText("관리자 메모"), {
      target: { value: "메인 홀 우선 배치" },
    });
    fireEvent.click(screen.getByRole("button", { name: "배정 확정" }));

    expect(await screen.findByText("배정을 완료했습니다.")).toBeInTheDocument();
    expect(lastReviewPayload).toMatchObject({
      requestId: "request-001",
      status: "approved",
      assignmentPosition: "main",
    });

    await waitFor(() => {
      const employeeFetchCalls = fetchMock.mock.calls.filter(([input, init]) => {
        const url = input instanceof URL ? input.toString() : String(input);
        return (
          url.endsWith("/api/dev/schedule-requests?scope=employee") &&
          (!init || init.method === undefined || init.method === "GET")
        );
      });

      expect(employeeFetchCalls.length).toBeGreaterThan(1);
    });
  });

  it("rejects a pending request with an admin comment", async () => {
    let currentRequests = [...INITIAL_REQUESTS];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (
        url.endsWith("/api/dev/schedule-requests?scope=admin") &&
        (!init || init.method === "GET")
      ) {
        return new Response(JSON.stringify({ requests: currentRequests }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/api/dev/schedule-requests") && init?.method === "PATCH") {
        const payload = JSON.parse(String(init.body));
        currentRequests = currentRequests.map((request) =>
          request.id === payload.requestId
            ? {
                ...request,
                status: payload.status,
                adminComment: payload.adminComment,
              }
            : request,
        );

        const updated = currentRequests.find((request) => request.id === payload.requestId);

        return new Response(JSON.stringify({ request: updated }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <AdminScheduleReview />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("button", { name: "employee-02 2026-04-13 요청 선택" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "employee-02 2026-04-13 요청 선택" }));
    fireEvent.change(await screen.findByLabelText("관리자 메모"), {
      target: { value: "인원 충돌로 반려" },
    });
    fireEvent.click(screen.getByRole("button", { name: "신청 반려" }));

    expect(await screen.findByText("신청을 반려했습니다.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("인원 충돌로 반려")).toBeInTheDocument();
  });

  it("disables review actions for already processed requests", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (
        url.endsWith("/api/dev/schedule-requests?scope=admin") &&
        (!init || init.method === "GET")
      ) {
        return new Response(JSON.stringify({ requests: INITIAL_REQUESTS }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <AdminScheduleReview />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("button", { name: "employee-01 2026-04-19 요청 선택" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "employee-01 2026-04-19 요청 선택" }));

    expect(screen.getByRole("button", { name: "배정 확정" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "신청 반려" })).toBeDisabled();
    expect(
      screen.getByText("이미 처리된 신청은 다시 배정하거나 반려할 수 없습니다."),
    ).toBeInTheDocument();
  });
});
