import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { EmployeeAssignedSchedule } from "#flows/employee-assigned-schedule/EmployeeAssignedSchedule.client";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("EmployeeAssignedSchedule", () => {
  it("shows approved applications as assigned shifts with position details", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

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
                employeeId: "employee-01",
                workId: "work-2026-04-19",
                workDate: "2026-04-19",
                workStartAt: "2026-04-19T03:00:00.000Z",
                workEndAt: "2026-04-19T10:00:00.000Z",
                note: "ceremony-experience",
                status: "approved",
                submittedAt: "2026-03-26T06:30:00.000Z",
                adminComment: "Pre-brief before ceremony",
                assignmentPosition: "main",
                assignedLocation: "Main hall",
                assignedAt: "2026-03-27T01:30:00.000Z",
                assignedBy: "manager-01",
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
                    actorId: "manager-01",
                    comment: "Pre-brief before ceremony",
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
        <EmployeeAssignedSchedule />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2026-04-19")).toBeInTheDocument();
    expect(screen.getByText("Main hall")).toBeInTheDocument();
    expect(screen.getByText("manager-01")).toBeInTheDocument();
    expect(screen.getAllByText("Pre-brief before ceremony").length).toBeGreaterThan(0);
  });

  it("renders an empty state when there are no approved assignments", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

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
        <EmployeeAssignedSchedule />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("아직 확정된 배정 스케줄이 없습니다.")).toBeInTheDocument();
  });

  it("accepts an approved assignment and keeps the history visible", async () => {
    let currentRequests = [
      {
        id: "request-201",
        employeeId: "employee-01",
        workId: "work-2026-05-03",
        workDate: "2026-05-03",
        workStartAt: "2026-05-03T01:00:00.000Z",
        workEndAt: "2026-05-03T08:00:00.000Z",
        note: "front-desk",
        status: "approved",
        submittedAt: "2026-03-28T09:00:00.000Z",
        adminComment: "Assigned to guide",
        assignmentPosition: "guide",
        assignedLocation: "Lobby desk",
        assignedAt: "2026-03-28T10:00:00.000Z",
        assignedBy: "admin-01",
        employeeResponseStatus: "pending",
        employeeResponseComment: null,
        employeeRespondedAt: null,
        employeeRespondedBy: null,
        history: [
          {
            type: "submitted",
            createdAt: "2026-03-28T09:00:00.000Z",
            actorId: "employee-01",
            comment: "front-desk",
            assignmentPosition: null,
            assignedLocation: null,
          },
          {
            type: "approved",
            createdAt: "2026-03-28T10:00:00.000Z",
            actorId: "admin-01",
            comment: "Assigned to guide",
            assignmentPosition: "guide",
            assignedLocation: "Lobby desk",
          },
        ],
      },
    ];
    let lastPayload: Record<string, unknown> | null = null;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (
        url.endsWith("/api/dev/schedule-requests?scope=employee") &&
        (!init || init.method === "GET")
      ) {
        return new Response(JSON.stringify({ requests: currentRequests }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/api/dev/schedule-requests") && init?.method === "PUT") {
        const payload = JSON.parse(String(init.body));
        lastPayload = payload;
        currentRequests = currentRequests.map((request) =>
          request.id === payload.requestId
            ? {
                ...request,
                employeeResponseStatus: payload.status,
                employeeResponseComment: payload.employeeComment,
                employeeRespondedAt: "2026-03-28T11:00:00.000Z",
                employeeRespondedBy: "employee-01",
                history: [
                  ...request.history,
                  {
                    type: payload.status,
                    createdAt: "2026-03-28T11:00:00.000Z",
                    actorId: "employee-01",
                    comment: payload.employeeComment,
                    assignmentPosition: request.assignmentPosition,
                    assignedLocation: request.assignedLocation,
                  },
                ],
              }
            : request,
        );

        return new Response(JSON.stringify({ request: currentRequests[0] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <EmployeeAssignedSchedule />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2026-05-03")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "assignment-response-comment-request-201" }), {
      target: { value: "I can cover this shift." },
    });
    fireEvent.click(screen.getByRole("button", { name: "accept-assignment-request-201" }));

    await waitFor(() => {
      expect(lastPayload).toMatchObject({
        requestId: "request-201",
        status: "accepted",
        employeeComment: "I can cover this shift.",
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText("I can cover this shift.").length).toBeGreaterThan(0);
    });

    expect(screen.queryByRole("button", { name: "accept-assignment-request-201" })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "assigned-request-history-request-201" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(3);
  });
});
