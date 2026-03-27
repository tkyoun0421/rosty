import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

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
                adminComment: "예식 리허설 20분 전 도착",
                assignmentPosition: "main",
                assignedLocation: "메인 홀",
                assignedAt: "2026-03-27T01:30:00.000Z",
                assignedBy: "manager-01",
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

    expect(await screen.findByText("확정된 근무 1건")).toBeInTheDocument();
    expect(screen.getByText("2026-04-19")).toBeInTheDocument();
    expect(screen.getByText("메인")).toBeInTheDocument();
    expect(screen.getByText("메인 홀")).toBeInTheDocument();
    expect(screen.getByText("manager-01")).toBeInTheDocument();
    expect(screen.getByText("예식 리허설 20분 전 도착")).toBeInTheDocument();
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
});
