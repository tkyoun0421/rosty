import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import type {
  ScheduleRequestNotificationTone,
  ScheduleRequestNotificationView,
} from "#queries/schedule-request/types/scheduleRequestNotificationView";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";

type ScheduleRequestNotificationScope = "employee-request" | "employee-assigned" | "admin-review";

type ScheduleRequestNotificationInput = {
  tone: ScheduleRequestNotificationTone;
  title: string;
  description: string;
  createdAt: Date;
};

function findLatestEvent(
  request: EmployeeScheduleRequest,
  eventType: EmployeeScheduleRequest["history"][number]["type"],
) {
  return [...request.history].reverse().find((item) => item.type === eventType);
}

function toNotification(
  request: EmployeeScheduleRequest,
  input: ScheduleRequestNotificationInput,
): ScheduleRequestNotificationView[] {
  return [
    {
      id: `${request.id}-${input.title}`,
      tone: input.tone,
      title: input.title,
      description: input.description,
      createdAtLabel: formatKoreanDateTime(input.createdAt),
    },
  ];
}

function buildEmployeeRequestNotifications(
  request: EmployeeScheduleRequest,
): ScheduleRequestNotificationView[] {
  if (request.status === "pending") {
    const submittedEvent = findLatestEvent(request, "submitted");

    return toNotification(request, {
      tone: "warning",
      title: "관리자 검토 대기",
      description: "관리자 검토를 기다리고 있습니다.",
      createdAt: submittedEvent?.createdAt ?? request.submittedAt,
    });
  }

  if (request.status === "rejected") {
    const rejectedEvent = findLatestEvent(request, "rejected");

    return toNotification(request, {
      tone: "danger",
      title: "신청 반려",
      description: "요청이 반려되었습니다.",
      createdAt: rejectedEvent?.createdAt ?? request.submittedAt,
    });
  }

  if (request.employeeResponseStatus === "accepted") {
    const acceptedEvent = findLatestEvent(request, "accepted");

    return toNotification(request, {
      tone: "success",
      title: "배정 수락 완료",
      description: "배정을 수락했습니다.",
      createdAt: acceptedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
    });
  }

  if (request.employeeResponseStatus === "declined") {
    const declinedEvent = findLatestEvent(request, "declined");

    return toNotification(request, {
      tone: "danger",
      title: "배정 거절 완료",
      description: "배정을 거절했습니다.",
      createdAt: declinedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
    });
  }

  const approvedEvent = findLatestEvent(request, "approved");

  return toNotification(request, {
    tone: "success",
    title: "배정 확정",
    description: "배정이 확정되었습니다. 배정 응답 화면에서 수락 또는 거절을 남겨 주세요.",
    createdAt: approvedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
  });
}

function buildEmployeeAssignedNotifications(
  request: EmployeeScheduleRequest,
): ScheduleRequestNotificationView[] {
  if (request.employeeResponseStatus === "accepted") {
    const acceptedEvent = findLatestEvent(request, "accepted");

    return toNotification(request, {
      tone: "success",
      title: "수락 반영 완료",
      description: "배정 수락이 관리자 검토 화면에 반영되었습니다.",
      createdAt: acceptedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
    });
  }

  if (request.employeeResponseStatus === "declined") {
    const declinedEvent = findLatestEvent(request, "declined");

    return toNotification(request, {
      tone: "danger",
      title: "거절 반영 완료",
      description: "배정 거절이 관리자 검토 화면에 반영되었습니다.",
      createdAt: declinedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
    });
  }

  const approvedEvent = findLatestEvent(request, "approved");

  return toNotification(request, {
    tone: "warning",
    title: "응답 필요",
    description: "배정이 확정되었습니다. 응답을 남겨 주세요.",
    createdAt: approvedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
  });
}

function buildAdminReviewNotifications(
  request: EmployeeScheduleRequest,
): ScheduleRequestNotificationView[] {
  if (request.status === "pending") {
    const submittedEvent = findLatestEvent(request, "submitted");

    return toNotification(request, {
      tone: "warning",
      title: "검토 필요",
      description: "검토가 필요한 신규 신청입니다.",
      createdAt: submittedEvent?.createdAt ?? request.submittedAt,
    });
  }

  if (request.status === "rejected") {
    const rejectedEvent = findLatestEvent(request, "rejected");

    return toNotification(request, {
      tone: "danger",
      title: "반려 처리 완료",
      description: "요청 반려가 기록되었습니다.",
      createdAt: rejectedEvent?.createdAt ?? request.submittedAt,
    });
  }

  if (request.employeeResponseStatus === "accepted") {
    const acceptedEvent = findLatestEvent(request, "accepted");

    return toNotification(request, {
      tone: "success",
      title: "직원 수락 완료",
      description: "직원이 배정을 수락했습니다.",
      createdAt: acceptedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
    });
  }

  if (request.employeeResponseStatus === "declined") {
    const declinedEvent = findLatestEvent(request, "declined");

    return toNotification(request, {
      tone: "danger",
      title: "직원 거절 완료",
      description: "직원이 배정을 거절했습니다.",
      createdAt: declinedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
    });
  }

  const approvedEvent = findLatestEvent(request, "approved");

  return toNotification(request, {
    tone: "neutral",
    title: "직원 응답 대기",
    description: "배정을 확정했습니다. 직원 응답을 기다리는 중입니다.",
    createdAt: approvedEvent?.createdAt ?? request.assignedAt ?? request.submittedAt,
  });
}

export function buildScheduleRequestNotifications(
  request: EmployeeScheduleRequest,
  scope: ScheduleRequestNotificationScope,
): ScheduleRequestNotificationView[] {
  if (scope === "employee-request") {
    return buildEmployeeRequestNotifications(request);
  }

  if (scope === "employee-assigned") {
    return buildEmployeeAssignedNotifications(request);
  }

  return buildAdminReviewNotifications(request);
}
