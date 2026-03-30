import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
    employeeResponseStatus: null,
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: "2026-03-27T09:00:00.000Z",
        actorId: "employee-01",
        comment: "service-ready",
        assignmentPosition: null,
        assignedLocation: null,
      },
    ],
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
    employeeResponseStatus: null,
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: "2026-03-27T08:30:00.000Z",
        actorId: "employee-02",
        comment: "consulting-support",
        assignmentPosition: null,
        assignedLocation: null,
      },
    ],
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
    assignedLocation: "Main hall",
    assignedAt: "2026-03-27T01:30:00.000Z",
    assignedBy: "admin-01",
    employeeResponseStatus: "pending",
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: "2026-03-26T06:30:00.000Z",
        actorId: "employee-01",
        comment: "ceremony-experience",
        assignmentPosition: null,
        assignedLocation: null,
      },
      {
        type: "approved",
        createdAt: "2026-03-27T01:30:00.000Z",
        actorId: "admin-01",
        comment: "main-hall",
        assignmentPosition: "main",
        assignedLocation: "Main hall",
      },
    ],
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

async function findRequestButton(name: string) {
  return screen.findByRole("button", { name });
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

      if (url.endsWith("/api/dev/work") && (!init || init.method === "GET")) {
        return new Response(
          JSON.stringify({
            work: {
              id: "work-2026-04-26",
              workDate: "2026-04-26",
              startAt: "2026-04-26T02:00:00.000Z",
              endAt: "2026-04-26T09:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
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
                assignedLocation: "Main hall",
                assignedAt: "2026-03-27T12:30:00.000Z",
                assignedBy: "admin-01",
                history: [
                  ...request.history,
                  {
                    type: payload.status,
                    createdAt: "2026-03-27T12:30:00.000Z",
                    actorId: "admin-01",
                    comment: payload.adminComment,
                    assignmentPosition: payload.assignmentPosition,
                    assignedLocation: "Main hall",
                  },
                ],
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

    const pendingRequestButton = await findRequestButton("employee-01 2026-04-12 요청 선택");
    expect(pendingRequestButton).toBeInTheDocument();
    fireEvent.click(pendingRequestButton);

    fireEvent.change(screen.getByRole("combobox", { name: "배정 포지션" }), {
      target: { value: "main" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "관리자 메모" }), {
      target: { value: "main-hall-approved" },
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "배정 확정" })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "배정 확정" }));

    await waitFor(() => {
      expect(lastReviewPayload).toMatchObject({
        requestId: "request-001",
        status: "approved",
        assignmentPosition: "main",
      });
    });

    expect(
      screen
        .getAllByRole("list", { name: "request-history-request-001" })
        .map((element) => within(element).getAllByRole("listitem").length),
    ).toEqual([2, 2]);

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

  it("rejects a pending request with an admin comment and appends history", async () => {
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
                history: [
                  ...request.history,
                  {
                    type: payload.status,
                    createdAt: "2026-03-27T11:00:00.000Z",
                    actorId: "admin-01",
                    comment: payload.adminComment,
                    assignmentPosition: null,
                    assignedLocation: null,
                  },
                ],
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

    fireEvent.click(await findRequestButton("employee-02 2026-04-13 요청 선택"));
    fireEvent.change(screen.getByRole("textbox", { name: "관리자 메모" }), {
      target: { value: "staffing-conflict" },
    });
    fireEvent.click(screen.getByRole("button", { name: "신청 반려" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("staffing-conflict")).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole("list", { name: "request-history-request-002" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(2);
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

    fireEvent.click(await findRequestButton("employee-01 2026-04-19 요청 선택"));

    expect(screen.getByRole("button", { name: "배정 확정" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "신청 반려" })).toBeDisabled();
    expect(
      within(screen.getByRole("list", { name: "request-history-request-003" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(2);
  });
});
