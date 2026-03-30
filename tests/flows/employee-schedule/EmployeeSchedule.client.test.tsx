import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmployeeSchedule } from "#flows/employee-schedule/EmployeeSchedule.client";

const CURRENT_WORK_RESPONSE = {
  work: {
    id: "work-2026-04-26",
    workDate: "2026-04-26",
    startAt: "2026-04-26T02:00:00.000Z",
    endAt: "2026-04-26T09:00:00.000Z",
  },
};

const REQUESTS_RESPONSE = {
  requests: [
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
      employeeId: "employee-01",
      workId: "work-2026-04-19",
      workDate: "2026-04-19",
      workStartAt: "2026-04-19T03:00:00.000Z",
      workEndAt: "2026-04-19T10:00:00.000Z",
      note: "ceremony-experience",
      status: "approved",
      submittedAt: "2026-03-26T06:30:00.000Z",
      adminComment: "assigned-main-hall",
      assignmentPosition: "main",
      assignedLocation: "Main hall",
      assignedAt: "2026-03-27T01:30:00.000Z",
      assignedBy: "admin-01",
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
          comment: "assigned-main-hall",
          assignmentPosition: "main",
          assignedLocation: "Main hall",
        },
      ],
    },
  ],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("EmployeeSchedule", () => {
  it("submits a new request and renders its history timeline", async () => {
    let currentRequests = [...REQUESTS_RESPONSE.requests];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/api/dev/work") && (!init || init.method === "GET")) {
        return new Response(JSON.stringify(CURRENT_WORK_RESPONSE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (
        url.endsWith("/api/dev/schedule-requests?scope=employee") &&
        (!init || init.method === "GET")
      ) {
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
          workId: payload.workId,
          workDate: CURRENT_WORK_RESPONSE.work.workDate,
          workStartAt: CURRENT_WORK_RESPONSE.work.startAt,
          workEndAt: CURRENT_WORK_RESPONSE.work.endAt,
          note: payload.note,
          status: "pending",
          submittedAt: "2026-03-27T10:00:00.000Z",
          adminComment: null,
          assignmentPosition: null,
          assignedLocation: null,
          assignedAt: null,
          assignedBy: null,
          history: [
            {
              type: "submitted",
              createdAt: "2026-03-27T10:00:00.000Z",
              actorId: "employee-01",
              comment: payload.note,
              assignmentPosition: null,
              assignedLocation: null,
            },
          ],
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

    render(
      <QueryClientProvider client={createQueryClient()}>
        <EmployeeSchedule />
      </QueryClientProvider>,
    );

    expect((await screen.findAllByText("2026-04-26")).length).toBeGreaterThan(0);
    expect(await screen.findByText("2026-04-12")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "extra-support-needed" },
    });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getAllByText("2026-04-26").length).toBeGreaterThan(1);
    });

    expect(
      within(screen.getByRole("list", { name: "request-history-request-003" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("filters request status, sorts approved requests, and keeps history visible", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/api/dev/work") && (!init || init.method === "GET")) {
        return new Response(JSON.stringify(CURRENT_WORK_RESPONSE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (
        url.endsWith("/api/dev/schedule-requests?scope=employee") &&
        (!init || init.method === "GET")
      ) {
        return new Response(
          JSON.stringify({
            requests: [
              {
                id: "request-001",
                employeeId: "employee-01",
                workId: "work-2026-04-26",
                workDate: "2026-04-26",
                workStartAt: "2026-04-26T02:00:00.000Z",
                workEndAt: "2026-04-26T09:00:00.000Z",
                note: "service-ready",
                status: "pending",
                submittedAt: "2026-03-27T09:00:00.000Z",
                adminComment: null,
                assignmentPosition: null,
                assignedLocation: null,
                assignedAt: null,
                assignedBy: null,
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
                employeeId: "employee-01",
                workId: "work-2026-04-25",
                workDate: "2026-04-25",
                workStartAt: "2026-04-25T05:00:00.000Z",
                workEndAt: "2026-04-25T11:00:00.000Z",
                note: "closing-consulting",
                status: "approved",
                submittedAt: "2026-03-27T07:00:00.000Z",
                adminComment: "closing-shift",
                assignmentPosition: "guide",
                assignedLocation: "Lobby desk",
                assignedAt: "2026-03-27T08:00:00.000Z",
                assignedBy: "admin-01",
                history: [
                  {
                    type: "submitted",
                    createdAt: "2026-03-27T07:00:00.000Z",
                    actorId: "employee-01",
                    comment: "closing-consulting",
                    assignmentPosition: null,
                    assignedLocation: null,
                  },
                  {
                    type: "approved",
                    createdAt: "2026-03-27T08:00:00.000Z",
                    actorId: "admin-01",
                    comment: "closing-shift",
                    assignmentPosition: "guide",
                    assignedLocation: "Lobby desk",
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
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <EmployeeSchedule />
      </QueryClientProvider>,
    );

    expect((await screen.findAllByText("2026-04-26")).length).toBeGreaterThan(0);

    const [statusFilter, sortOrder] = screen.getAllByRole("combobox");

    expect(screen.getByText("관리자 검토를 기다리고 있습니다.")).toBeInTheDocument();
    expect(
      screen.getAllByText("배정이 확정되었습니다. 배정 응답 화면에서 수락 또는 거절을 남겨 주세요.")
        .length,
    ).toBeGreaterThan(0);

    fireEvent.change(statusFilter, {
      target: { value: "approved" },
    });

    expect(screen.getAllByText("2026-04-26")).toHaveLength(1);
    expect(screen.getByText("2026-04-25")).toBeInTheDocument();
    expect(screen.getByText("2026-04-19")).toBeInTheDocument();

    fireEvent.change(sortOrder, {
      target: { value: "work-date-asc" },
    });

    const visibleDates = screen
      .getAllByText(/^2026-04-(19|25)$/)
      .map((element) => element.textContent);

    expect(visibleDates).toEqual(["2026-04-19", "2026-04-25"]);
    expect(
      within(screen.getByRole("list", { name: "request-history-request-003" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(2);
  });
});
