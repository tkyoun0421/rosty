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

describe("AdminScheduleReview filters and sorting", () => {
  it("filters by employee response state and sorts by work date", async () => {
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
                id: "request-301",
                employeeId: "employee-01",
                workId: "work-2026-05-03",
                workDate: "2026-05-03",
                workStartAt: "2026-05-03T01:00:00.000Z",
                workEndAt: "2026-05-03T08:00:00.000Z",
                note: "guide",
                status: "approved",
                submittedAt: "2026-03-28T09:00:00.000Z",
                adminComment: "Assigned to guide",
                assignmentPosition: "guide",
                assignedLocation: "Lobby desk",
                assignedAt: "2026-03-28T10:00:00.000Z",
                assignedBy: "admin-01",
                employeeResponseStatus: "accepted",
                employeeResponseComment: "Confirmed",
                employeeRespondedAt: "2026-03-28T11:00:00.000Z",
                employeeRespondedBy: "employee-01",
                history: [
                  {
                    type: "submitted",
                    createdAt: "2026-03-28T09:00:00.000Z",
                    actorId: "employee-01",
                    comment: "guide",
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
                  {
                    type: "accepted",
                    createdAt: "2026-03-28T11:00:00.000Z",
                    actorId: "employee-01",
                    comment: "Confirmed",
                    assignmentPosition: "guide",
                    assignedLocation: "Lobby desk",
                  },
                ],
              },
              {
                id: "request-302",
                employeeId: "employee-02",
                workId: "work-2026-04-26",
                workDate: "2026-04-26",
                workStartAt: "2026-04-26T02:00:00.000Z",
                workEndAt: "2026-04-26T09:00:00.000Z",
                note: "main",
                status: "approved",
                submittedAt: "2026-03-28T08:00:00.000Z",
                adminComment: "Assigned to main",
                assignmentPosition: "main",
                assignedLocation: "Main hall",
                assignedAt: "2026-03-28T09:00:00.000Z",
                assignedBy: "admin-01",
                employeeResponseStatus: "pending",
                employeeResponseComment: null,
                employeeRespondedAt: null,
                employeeRespondedBy: null,
                history: [
                  {
                    type: "submitted",
                    createdAt: "2026-03-28T08:00:00.000Z",
                    actorId: "employee-02",
                    comment: "main",
                    assignmentPosition: null,
                    assignedLocation: null,
                  },
                  {
                    type: "approved",
                    createdAt: "2026-03-28T09:00:00.000Z",
                    actorId: "admin-01",
                    comment: "Assigned to main",
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

    expect(await screen.findByRole("button", { name: "employee-01 2026-05-03 요청 선택" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "employee-02 2026-04-26 요청 선택" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "admin-employee-response-filter" }), {
      target: { value: "accepted" },
    });

    expect(screen.getByRole("button", { name: "employee-01 2026-05-03 요청 선택" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "employee-02 2026-04-26 요청 선택" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "admin-employee-response-filter" }), {
      target: { value: "all" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "admin-sort-order" }), {
      target: { value: "work-date-asc" },
    });

    const requestButtons = screen
      .getAllByRole("button")
      .filter((element) => element.getAttribute("data-request-id"));

    expect(requestButtons[0]).toHaveAttribute("data-request-id", "request-302");
    expect(requestButtons[1]).toHaveAttribute("data-request-id", "request-301");
  });
});
