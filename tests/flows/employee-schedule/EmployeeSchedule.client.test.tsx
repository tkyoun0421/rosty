import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
      adminComment: "리허설 20분 전 도착",
      assignmentPosition: "main",
      assignedLocation: "메인 홀",
      assignedAt: "2026-03-27T01:30:00.000Z",
      assignedBy: "admin-01",
    },
  ],
};

describe("EmployeeSchedule", () => {
  it("submits a new request and refreshes the request list", async () => {
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

    expect(await screen.findByText("근무 스케줄 신청")).toBeInTheDocument();
    expect((await screen.findAllByText("2026-04-26")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("오전 11:00 - 오후 06:00").length).toBeGreaterThan(0);
    expect(await screen.findByText("2026-04-12")).toBeInTheDocument();
    expect(screen.getAllByText("배정 완료").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("메모"), {
      target: { value: "추가 투입 가능합니다." },
    });

    fireEvent.click(screen.getByRole("button", { name: "근무 가능 신청" }));

    expect(await screen.findByText("근무 가능 신청을 등록했습니다.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("2026-04-26").length).toBeGreaterThan(1);
    });

    expect(screen.getAllByText("배정 대기").length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("filters request status and sorts approved requests by work date", async () => {
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
                assignedLocation: "로비 안내 데스크",
                assignedAt: "2026-03-27T08:00:00.000Z",
                assignedBy: "admin-01",
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

    expect((await screen.findAllByText("2026-04-26")).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("상태 필터"), {
      target: { value: "approved" },
    });

    expect(screen.getAllByText("2026-04-26")).toHaveLength(1);
    expect(screen.getByText("2026-04-25")).toBeInTheDocument();
    expect(screen.getByText("2026-04-19")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("정렬"), {
      target: { value: "work-date-asc" },
    });

    const visibleDates = screen
      .getAllByText(/^2026-04-(19|25)$/)
      .map((element) => element.textContent);

    expect(visibleDates).toEqual(["2026-04-19", "2026-04-25"]);
    expect(screen.getByText("배정 완료 2건 표시 중")).toBeInTheDocument();
  });
});
