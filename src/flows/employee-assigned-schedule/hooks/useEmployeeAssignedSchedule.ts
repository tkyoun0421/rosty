"use client";

import { useMemo, useState } from "react";

import { useRespondScheduleAssignment } from "#mutations/schedule-request/hooks/useRespondScheduleAssignment";
import type { EmployeeAssignedScheduleViewProps } from "#flows/employee-assigned-schedule/types/employeeAssignedScheduleView";
import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  SCHEDULE_EMPLOYEE_RESPONSE_STATUS_LABELS,
  resolveAssignedLocationLabel,
} from "#queries/schedule-request/constants/scheduleRequest";
import { useEmployeeScheduleRequests } from "#queries/schedule-request/hooks/useEmployeeScheduleRequests";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { buildScheduleRequestHistoryView } from "#queries/schedule-request/utils/buildScheduleRequestHistoryView";
import { buildScheduleRequestNotifications } from "#queries/schedule-request/utils/buildScheduleRequestNotifications";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";
import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

function sortByWorkDateAscending(left: EmployeeScheduleRequest, right: EmployeeScheduleRequest) {
  return left.workDate.localeCompare(right.workDate);
}

export function useEmployeeAssignedSchedule(): EmployeeAssignedScheduleViewProps {
  const requestsQuery = useEmployeeScheduleRequests();
  const respondAssignment = useRespondScheduleAssignment();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});

  const approvedRequests = (requestsQuery.data ?? [])
    .filter((request) => request.status === "approved")
    .sort(sortByWorkDateAscending);

  async function submitResponse(requestId: string, status: "accepted" | "declined") {
    const request = approvedRequests.find((item) => item.id === requestId);

    if (!request || request.employeeResponseStatus !== "pending") {
      return;
    }

    setActiveRequestId(requestId);

    try {
      await respondAssignment.mutateAsync({
        requestId,
        status,
        employeeComment: draftComments[requestId] ?? "",
      });
    } catch {
      // Mutation state is rendered by the view.
    }
  }

  const items = useMemo(
    () =>
      approvedRequests.map((request) => ({
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
        employeeResponseStatusLabel: request.employeeResponseStatus
          ? SCHEDULE_EMPLOYEE_RESPONSE_STATUS_LABELS[request.employeeResponseStatus]
          : null,
        employeeResponseComment: request.employeeResponseComment ?? null,
        employeeRespondedAtLabel: request.employeeRespondedAt
          ? formatKoreanDateTime(request.employeeRespondedAt)
          : null,
        employeeRespondedBy: request.employeeRespondedBy ?? null,
        responseDraftComment: draftComments[request.id] ?? request.employeeResponseComment ?? "",
        responseHelperMessage:
          request.employeeResponseStatus === "pending"
            ? "응답을 제출하면 관리자 검토 화면에 즉시 반영됩니다."
            : null,
        responseErrorMessage:
          activeRequestId === request.id ? (respondAssignment.error?.message ?? null) : null,
        isResponding: respondAssignment.isPending && activeRequestId === request.id,
        canRespond: request.employeeResponseStatus === "pending",
        notifications: buildScheduleRequestNotifications(request, "employee-assigned"),
        history: buildScheduleRequestHistoryView(request.history),
      })),
    [
      activeRequestId,
      approvedRequests,
      draftComments,
      respondAssignment.error?.message,
      respondAssignment.isPending,
    ],
  );

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
      onResponseCommentChange: (requestId, value) => {
        setDraftComments((current) => ({
          ...current,
          [requestId]: value,
        }));
      },
      onAccept: (requestId) => submitResponse(requestId, "accepted"),
      onDecline: (requestId) => submitResponse(requestId, "declined"),
    },
  };
}
