"use client";

import type { EmployeeAssignedScheduleViewProps } from "#flows/employee-assigned-schedule/types/employeeAssignedScheduleView";
import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  resolveAssignedLocationLabel,
} from "#queries/schedule-request/constants/scheduleRequest";
import { useEmployeeScheduleRequests } from "#queries/schedule-request/hooks/useEmployeeScheduleRequests";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";
import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

function sortByWorkDateAscending(left: EmployeeScheduleRequest, right: EmployeeScheduleRequest) {
  return left.workDate.localeCompare(right.workDate);
}

export function useEmployeeAssignedSchedule(): EmployeeAssignedScheduleViewProps {
  const requestsQuery = useEmployeeScheduleRequests();
  const approvedRequests = (requestsQuery.data ?? [])
    .filter((request) => request.status === "approved")
    .sort(sortByWorkDateAscending);

  const items = approvedRequests.map((request) => ({
    id: request.id,
    workDate: request.workDate,
    workTimeLabel: formatKoreanTimeRange(request.workStartAt, request.workEndAt),
    assignmentPositionLabel: request.assignmentPosition
      ? SCHEDULE_ASSIGNMENT_POSITION_LABELS[request.assignmentPosition]
      : "미정",
    assignedLocation:
      request.assignedLocation ??
      (request.assignmentPosition
        ? resolveAssignedLocationLabel(request.assignmentPosition)
        : "미정"),
    submittedAtLabel: formatKoreanDateTime(request.submittedAt),
    assignedAtLabel: request.assignedAt ? formatKoreanDateTime(request.assignedAt) : null,
    assignedBy: request.assignedBy ?? null,
    note: request.note || "추가 메모 없음",
    adminComment: request.adminComment,
  }));

  return {
    summary: {
      assignedCountLabel: `확정된 근무 ${items.length}건`,
      nextShiftLabel: items[0]
        ? `${items[0].workDate} · ${items[0].workTimeLabel}`
        : "다음 확정 근무 없음",
    },
    schedule: {
      isLoading: requestsQuery.isPending,
      errorMessage: requestsQuery.error ? (requestsQuery.error as Error).message : null,
      items,
    },
  };
}
