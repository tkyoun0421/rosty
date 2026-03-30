import { describe, expect, it } from "vitest";

import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { buildScheduleRequestNotifications } from "#queries/schedule-request/utils/buildScheduleRequestNotifications";

function createBaseRequest(): EmployeeScheduleRequest {
  return {
    id: "request-001",
    employeeId: "employee-01",
    workId: "work-2026-04-19",
    workDate: "2026-04-19",
    workStartAt: new Date("2026-04-19T03:00:00.000Z"),
    workEndAt: new Date("2026-04-19T10:00:00.000Z"),
    note: "ceremony-experience",
    status: "approved",
    submittedAt: new Date("2026-03-26T06:30:00.000Z"),
    adminComment: "main-hall",
    assignmentPosition: "main",
    assignedLocation: "Main hall",
    assignedAt: new Date("2026-03-27T01:30:00.000Z"),
    assignedBy: "admin-01",
    employeeResponseStatus: "pending",
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: new Date("2026-03-26T06:30:00.000Z"),
        actorId: "employee-01",
        comment: "ceremony-experience",
        assignmentPosition: null,
        assignedLocation: null,
      },
      {
        type: "approved",
        createdAt: new Date("2026-03-27T01:30:00.000Z"),
        actorId: "admin-01",
        comment: "main-hall",
        assignmentPosition: "main",
        assignedLocation: "Main hall",
      },
    ],
  };
}

describe("buildScheduleRequestNotifications", () => {
  it("builds an employee request notification when approval still needs a response", () => {
    const notifications = buildScheduleRequestNotifications(
      createBaseRequest(),
      "employee-request",
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      title: "배정 확정",
      description: "배정이 확정되었습니다. 배정 응답 화면에서 수락 또는 거절을 남겨 주세요.",
    });
  });

  it("builds an assigned schedule notification after the employee accepts", () => {
    const baseRequest = createBaseRequest();
    const notifications = buildScheduleRequestNotifications(
      {
        ...baseRequest,
        employeeResponseStatus: "accepted",
        employeeResponseComment: "확인했습니다.",
        employeeRespondedAt: new Date("2026-03-27T03:00:00.000Z"),
        employeeRespondedBy: "employee-01",
        history: [
          ...baseRequest.history,
          {
            type: "accepted",
            createdAt: new Date("2026-03-27T03:00:00.000Z"),
            actorId: "employee-01",
            comment: "확인했습니다.",
            assignmentPosition: "main",
            assignedLocation: "Main hall",
          },
        ],
      },
      "employee-assigned",
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      title: "수락 반영 완료",
      description: "배정 수락이 관리자 검토 화면에 반영되었습니다.",
    });
  });

  it("builds an admin review notification when the employee declines", () => {
    const baseRequest = createBaseRequest();
    const notifications = buildScheduleRequestNotifications(
      {
        ...baseRequest,
        employeeResponseStatus: "declined",
        employeeResponseComment: "이번에는 어렵습니다.",
        employeeRespondedAt: new Date("2026-03-27T03:30:00.000Z"),
        employeeRespondedBy: "employee-01",
        history: [
          ...baseRequest.history,
          {
            type: "declined",
            createdAt: new Date("2026-03-27T03:30:00.000Z"),
            actorId: "employee-01",
            comment: "이번에는 어렵습니다.",
            assignmentPosition: "main",
            assignedLocation: "Main hall",
          },
        ],
      },
      "admin-review",
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      title: "직원 거절 완료",
      description: "직원이 배정을 거절했습니다.",
    });
  });
});
