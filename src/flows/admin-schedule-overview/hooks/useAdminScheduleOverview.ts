"use client";

import { useMemo } from "react";

import type {
  AdminScheduleOverviewAlertViewModel,
  AdminScheduleOverviewItemViewModel,
  AdminScheduleOverviewSummaryCardViewModel,
  AdminScheduleOverviewViewProps,
} from "#flows/admin-schedule-overview/types/adminScheduleOverviewView";
import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  SCHEDULE_EMPLOYEE_RESPONSE_STATUS_LABELS,
} from "#queries/schedule-request/constants/scheduleRequest";
import { useAdminScheduleRequests } from "#queries/schedule-request/hooks/useAdminScheduleRequests";
import type {
  EmployeeScheduleRequest,
  ScheduleEmployeeResponseStatus,
} from "#queries/schedule-request/types/scheduleRequest";
import { buildScheduleRequestNotifications } from "#queries/schedule-request/utils/buildScheduleRequestNotifications";
import { APP_ROUTES } from "#shared/constants/routes";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";
import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

const RESPONSE_TONE_BY_STATUS: Record<
  ScheduleEmployeeResponseStatus,
  AdminScheduleOverviewItemViewModel["responseTone"]
> = {
  pending: "warning",
  accepted: "success",
  declined: "danger",
};

function resolveEmployeeResponseStatus(
  request: EmployeeScheduleRequest,
): ScheduleEmployeeResponseStatus {
  return request.employeeResponseStatus ?? "pending";
}

function buildSummaryCards(
  requests: EmployeeScheduleRequest[],
): AdminScheduleOverviewSummaryCardViewModel[] {
  const approvedRequests = requests.filter((request) => request.status === "approved");
  const pendingResponseCount = approvedRequests.filter(
    (request) => resolveEmployeeResponseStatus(request) === "pending",
  ).length;
  const acceptedCount = approvedRequests.filter(
    (request) => resolveEmployeeResponseStatus(request) === "accepted",
  ).length;

  return [
    {
      id: "totalRequests",
      title: "전체 요청",
      valueText: `전체 요청 ${requests.length}건`,
      helperText: "검토 전, 배정 완료, 반려까지 현재 요청 전체를 집계합니다.",
    },
    {
      id: "approvedAssignments",
      title: "배정된 일정",
      valueText: `배정된 일정 ${approvedRequests.length}건`,
      helperText: "관리자가 배정을 확정한 일정만 일정 조회 목록에 표시합니다.",
    },
    {
      id: "pendingResponse",
      title: "직원 응답 대기",
      valueText: `직원 응답 대기 ${pendingResponseCount}건`,
      helperText: "배정은 확정됐지만 직원이 아직 수락이나 거절을 하지 않은 일정입니다.",
    },
    {
      id: "acceptedAssignments",
      title: "수락 완료",
      valueText: `수락 완료 ${acceptedCount}건`,
      helperText: "직원이 수락까지 마쳐 운영 일정으로 봐도 되는 건수입니다.",
    },
  ];
}

function buildPendingReviewAlert(
  requests: EmployeeScheduleRequest[],
): AdminScheduleOverviewAlertViewModel | null {
  const pendingReviewCount = requests.filter((request) => request.status === "pending").length;

  if (pendingReviewCount === 0) {
    return null;
  }

  return {
    title: `검토 대기 요청 ${pendingReviewCount}건이 있습니다.`,
    description: "배정이나 반려 처리는 요청 검토 화면에서 계속 진행하세요.",
    ctaLabel: "요청 검토로 이동",
    href: APP_ROUTES.adminScheduleRequests,
  };
}

function buildOverviewItems(
  requests: EmployeeScheduleRequest[],
): AdminScheduleOverviewItemViewModel[] {
  return requests
    .filter((request) => request.status === "approved")
    .sort((left, right) => {
      const workDateComparison = left.workDate.localeCompare(right.workDate);

      if (workDateComparison !== 0) {
        return workDateComparison;
      }

      const leftAssignedAt = left.assignedAt?.getTime() ?? 0;
      const rightAssignedAt = right.assignedAt?.getTime() ?? 0;

      if (leftAssignedAt !== rightAssignedAt) {
        return leftAssignedAt - rightAssignedAt;
      }

      return left.employeeId.localeCompare(right.employeeId);
    })
    .map((request) => {
      const responseStatus = resolveEmployeeResponseStatus(request);

      return {
        id: request.id,
        employeeId: request.employeeId,
        workDate: request.workDate,
        workTimeLabel: formatKoreanTimeRange(request.workStartAt, request.workEndAt),
        assignmentPositionLabel: request.assignmentPosition
          ? SCHEDULE_ASSIGNMENT_POSITION_LABELS[request.assignmentPosition]
          : null,
        assignedLocation: request.assignedLocation ?? null,
        assignedAtLabel: request.assignedAt ? formatKoreanDateTime(request.assignedAt) : null,
        assignedBy: request.assignedBy ?? null,
        adminComment: request.adminComment ?? null,
        responseStatusLabel: SCHEDULE_EMPLOYEE_RESPONSE_STATUS_LABELS[responseStatus],
        responseTone: RESPONSE_TONE_BY_STATUS[responseStatus],
        employeeResponseComment: request.employeeResponseComment ?? null,
        employeeRespondedAtLabel: request.employeeRespondedAt
          ? formatKoreanDateTime(request.employeeRespondedAt)
          : null,
        notifications: buildScheduleRequestNotifications(request, "admin-review"),
      };
    });
}

export function useAdminScheduleOverview(): AdminScheduleOverviewViewProps {
  const requestsQuery = useAdminScheduleRequests();
  const requests = requestsQuery.data ?? [];

  const summaryCards = useMemo(() => buildSummaryCards(requests), [requests]);
  const pendingReviewAlert = useMemo(() => buildPendingReviewAlert(requests), [requests]);
  const items = useMemo(() => buildOverviewItems(requests), [requests]);

  return {
    isLoading: requestsQuery.isPending,
    errorMessage: requestsQuery.error ? (requestsQuery.error as Error).message : null,
    summaryCards,
    pendingReviewAlert,
    items,
  };
}
