import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminScheduleReview } from "#flows/admin-schedule-review/AdminScheduleReview.client";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("AdminScheduleReview notifications", () => {
  it("shows a response-waiting notification for approved requests", async () => {
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
        <AdminScheduleReview />
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "employee-01 2026-04-19 요청 선택" }),
    );

    expect(
      screen.getByText("배정을 확정했습니다. 직원 응답을 기다리는 중입니다."),
    ).toBeInTheDocument();
  });
});
