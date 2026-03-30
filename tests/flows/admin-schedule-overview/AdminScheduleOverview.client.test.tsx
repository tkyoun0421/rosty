import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminScheduleOverview } from "#flows/admin-schedule-overview/AdminScheduleOverview.client";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("AdminScheduleOverview", () => {
  it("summarizes approved schedules and points pending reviews back to the review screen", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (
        url.endsWith("/api/dev/schedule-requests?scope=admin") &&
        (!init || init.method === "GET")
      ) {
        return new Response(
          JSON.stringify({
            requests: [
              {
                id: "request-401",
                employeeId: "employee-01",
                workId: "work-2026-05-10",
                workDate: "2026-05-10",
                workStartAt: "2026-05-10T01:00:00.000Z",
                workEndAt: "2026-05-10T08:00:00.000Z",
                note: "guide",
                status: "approved",
                submittedAt: "2026-03-29T09:00:00.000Z",
                adminComment: "guide desk",
                assignmentPosition: "guide",
                assignedLocation: "Lobby desk",
                assignedAt: "2026-03-29T10:00:00.000Z",
                assignedBy: "admin-01",
                employeeResponseStatus: "pending",
                employeeResponseComment: null,
                employeeRespondedAt: null,
                employeeRespondedBy: null,
                history: [
                  {
                    type: "submitted",
                    createdAt: "2026-03-29T09:00:00.000Z",
                    actorId: "employee-01",
                    comment: "guide",
                    assignmentPosition: null,
                    assignedLocation: null,
                  },
                  {
                    type: "approved",
                    createdAt: "2026-03-29T10:00:00.000Z",
                    actorId: "admin-01",
                    comment: "guide desk",
                    assignmentPosition: "guide",
                    assignedLocation: "Lobby desk",
                  },
                ],
              },
              {
                id: "request-402",
                employeeId: "employee-02",
                workId: "work-2026-05-03",
                workDate: "2026-05-03",
                workStartAt: "2026-05-03T01:00:00.000Z",
                workEndAt: "2026-05-03T08:00:00.000Z",
                note: "main",
                status: "approved",
                submittedAt: "2026-03-29T08:00:00.000Z",
                adminComment: "main hall",
                assignmentPosition: "main",
                assignedLocation: "Main hall",
                assignedAt: "2026-03-29T09:00:00.000Z",
                assignedBy: "admin-01",
                employeeResponseStatus: "accepted",
                employeeResponseComment: "confirmed",
                employeeRespondedAt: "2026-03-29T11:00:00.000Z",
                employeeRespondedBy: "employee-02",
                history: [
                  {
                    type: "submitted",
                    createdAt: "2026-03-29T08:00:00.000Z",
                    actorId: "employee-02",
                    comment: "main",
                    assignmentPosition: null,
                    assignedLocation: null,
                  },
                  {
                    type: "approved",
                    createdAt: "2026-03-29T09:00:00.000Z",
                    actorId: "admin-01",
                    comment: "main hall",
                    assignmentPosition: "main",
                    assignedLocation: "Main hall",
                  },
                  {
                    type: "accepted",
                    createdAt: "2026-03-29T11:00:00.000Z",
                    actorId: "employee-02",
                    comment: "confirmed",
                    assignmentPosition: "main",
                    assignedLocation: "Main hall",
                  },
                ],
              },
              {
                id: "request-403",
                employeeId: "employee-03",
                workId: "work-2026-05-17",
                workDate: "2026-05-17",
                workStartAt: "2026-05-17T01:00:00.000Z",
                workEndAt: "2026-05-17T08:00:00.000Z",
                note: "scan",
                status: "approved",
                submittedAt: "2026-03-29T07:00:00.000Z",
                adminComment: "scan desk",
                assignmentPosition: "scan",
                assignedLocation: "Scan desk",
                assignedAt: "2026-03-29T08:00:00.000Z",
                assignedBy: "admin-01",
                employeeResponseStatus: "declined",
                employeeResponseComment: "cannot join",
                employeeRespondedAt: "2026-03-29T12:00:00.000Z",
                employeeRespondedBy: "employee-03",
                history: [
                  {
                    type: "submitted",
                    createdAt: "2026-03-29T07:00:00.000Z",
                    actorId: "employee-03",
                    comment: "scan",
                    assignmentPosition: null,
                    assignedLocation: null,
                  },
                  {
                    type: "approved",
                    createdAt: "2026-03-29T08:00:00.000Z",
                    actorId: "admin-01",
                    comment: "scan desk",
                    assignmentPosition: "scan",
                    assignedLocation: "Scan desk",
                  },
                  {
                    type: "declined",
                    createdAt: "2026-03-29T12:00:00.000Z",
                    actorId: "employee-03",
                    comment: "cannot join",
                    assignmentPosition: "scan",
                    assignedLocation: "Scan desk",
                  },
                ],
              },
              {
                id: "request-404",
                employeeId: "employee-04",
                workId: "work-2026-05-24",
                workDate: "2026-05-24",
                workStartAt: "2026-05-24T01:00:00.000Z",
                workEndAt: "2026-05-24T08:00:00.000Z",
                note: "waiting room",
                status: "pending",
                submittedAt: "2026-03-29T06:00:00.000Z",
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
                    createdAt: "2026-03-29T06:00:00.000Z",
                    actorId: "employee-04",
                    comment: "waiting room",
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
        <AdminScheduleOverview />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("전체 요청 4건")).toBeInTheDocument();
    expect(screen.getByText("배정된 일정 3건")).toBeInTheDocument();
    expect(screen.getByText("직원 응답 대기 1건")).toBeInTheDocument();
    expect(screen.getByText("수락 완료 1건")).toBeInTheDocument();
    expect(screen.getByText("검토 대기 요청 1건이 있습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "요청 검토로 이동" })).toHaveAttribute(
      "href",
      "/admin/schedule-requests",
    );

    const assignmentList = screen.getByRole("list", { name: "admin-schedule-overview-list" });
    const assignmentItems = within(assignmentList).getAllByRole("listitem");

    expect(assignmentItems).toHaveLength(3);
    expect(assignmentItems[0]).toHaveTextContent("employee-02");
    expect(assignmentItems[1]).toHaveTextContent("employee-01");
    expect(assignmentItems[2]).toHaveTextContent("employee-03");

    expect(screen.queryByText("employee-04")).not.toBeInTheDocument();
    expect(screen.getByText("직원 거절 완료")).toBeInTheDocument();
  });
});
