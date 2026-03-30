"use client";

import { useEffect, useMemo, useState } from "react";

import { useReviewScheduleRequest } from "#mutations/schedule-request/hooks/useReviewScheduleRequest";
import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import type {
  AdminScheduleReviewItemViewModel,
  AdminScheduleReviewViewProps,
} from "#flows/admin-schedule-review/types/adminScheduleReviewView";
import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  SCHEDULE_EMPLOYEE_RESPONSE_STATUS_LABELS,
  SCHEDULE_REQUEST_STATUS_LABELS,
} from "#queries/schedule-request/constants/scheduleRequest";
import { useAdminScheduleRequests } from "#queries/schedule-request/hooks/useAdminScheduleRequests";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { buildScheduleRequestHistoryView } from "#queries/schedule-request/utils/buildScheduleRequestHistoryView";
import { buildScheduleRequestNotifications } from "#queries/schedule-request/utils/buildScheduleRequestNotifications";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";
import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

function toViewModel(request: EmployeeScheduleRequest): AdminScheduleReviewItemViewModel {
  return {
    id: request.id,
    employeeId: request.employeeId,
    workDate: request.workDate,
    workTimeLabel: formatKoreanTimeRange(request.workStartAt, request.workEndAt),
    statusLabel: SCHEDULE_REQUEST_STATUS_LABELS[request.status],
    submittedAtLabel: formatKoreanDateTime(request.submittedAt),
    note: request.note || "추가 메모 없음",
    adminComment: request.adminComment,
    assignmentPositionLabel: request.assignmentPosition
      ? SCHEDULE_ASSIGNMENT_POSITION_LABELS[request.assignmentPosition]
      : null,
    assignedLocation: request.assignedLocation ?? null,
    assignedAtLabel: request.assignedAt ? formatKoreanDateTime(request.assignedAt) : null,
    assignedBy: request.assignedBy ?? null,
    employeeResponseStatusLabel: request.employeeResponseStatus
      ? SCHEDULE_EMPLOYEE_RESPONSE_STATUS_LABELS[request.employeeResponseStatus]
      : null,
    employeeResponseComment: request.employeeResponseComment ?? null,
    employeeRespondedAtLabel: request.employeeRespondedAt
      ? formatKoreanDateTime(request.employeeRespondedAt)
      : null,
    employeeRespondedBy: request.employeeRespondedBy ?? null,
    isProcessed: request.status !== "pending",
    notifications: buildScheduleRequestNotifications(request, "admin-review"),
    history: buildScheduleRequestHistoryView(request.history),
  };
}

export function useAdminScheduleReview(): AdminScheduleReviewViewProps {
  const requestsQuery = useAdminScheduleRequests();
  const reviewRequest = useReviewScheduleRequest();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [employeeResponseFilter, setEmployeeResponseFilter] = useState<
    "all" | "pending" | "accepted" | "declined"
  >("all");
  const [sortOrder, setSortOrder] = useState<"submitted-desc" | "work-date-asc">("submitted-desc");
  const [assignmentPosition, setAssignmentPosition] = useState<
    EmployeeScheduleRequest["assignmentPosition"] | ""
  >("");
  const [adminComment, setAdminComment] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requests = requestsQuery.data ?? [];
  const filteredRequests = useMemo(() => {
    const nextRequests = requests
      .filter((request) =>
        reviewStatusFilter === "all" ? true : request.status === reviewStatusFilter,
      )
      .filter((request) =>
        employeeResponseFilter === "all"
          ? true
          : request.employeeResponseStatus === employeeResponseFilter,
      );

    nextRequests.sort((left, right) => {
      if (sortOrder === "work-date-asc") {
        return left.workDate.localeCompare(right.workDate);
      }

      return right.submittedAt.getTime() - left.submittedAt.getTime();
    });

    return nextRequests;
  }, [employeeResponseFilter, requests, reviewStatusFilter, sortOrder]);

  const items = filteredRequests.map(toViewModel);
  const selectedRequestRecord =
    filteredRequests.find((request) => request.id === selectedRequestId) ?? null;
  const selectedRequest = selectedRequestRecord ? toViewModel(selectedRequestRecord) : null;

  useEffect(() => {
    if (items.length === 0) {
      setSelectedRequestId(null);
      return;
    }

    const hasCurrentSelection = items.some((item) => item.id === selectedRequestId);

    if (!hasCurrentSelection) {
      setSelectedRequestId(items[0].id);
    }
  }, [items, selectedRequestId]);

  useEffect(() => {
    if (!selectedRequestRecord) {
      setAssignmentPosition("");
      setAdminComment("");
      return;
    }

    setAssignmentPosition(selectedRequestRecord.assignmentPosition ?? "");
    setAdminComment(selectedRequestRecord.adminComment ?? "");
  }, [selectedRequestRecord]);

  async function submit(status: ReviewScheduleRequestInput["status"]) {
    if (!selectedRequest || selectedRequest.isProcessed) {
      return;
    }

    setSuccessMessage(null);

    try {
      const updated = await reviewRequest.mutateAsync({
        requestId: selectedRequest.id,
        status,
        adminComment,
        assignmentPosition: status === "approved" && assignmentPosition ? assignmentPosition : null,
      });

      setAssignmentPosition(updated.assignmentPosition ?? "");
      setAdminComment(updated.adminComment ?? "");
      setSuccessMessage(status === "approved" ? "배정을 완료했습니다." : "요청을 반려했습니다.");
    } catch {
      // Mutation state is rendered by the view.
    }
  }

  return {
    list: {
      isLoading: requestsQuery.isPending,
      errorMessage: requestsQuery.error ? (requestsQuery.error as Error).message : null,
      items,
      reviewStatusFilter,
      employeeResponseFilter,
      sortOrder,
      selectedRequestId,
      onReviewStatusFilterChange: (value) => {
        setReviewStatusFilter(value);
        setSuccessMessage(null);
      },
      onEmployeeResponseFilterChange: (value) => {
        setEmployeeResponseFilter(value);
        setSuccessMessage(null);
      },
      onSortOrderChange: (value) => {
        setSortOrder(value);
        setSuccessMessage(null);
      },
      onSelectRequest: (requestId) => {
        setSelectedRequestId(requestId);
        setSuccessMessage(null);
        reviewRequest.reset();
      },
    },
    detail: {
      selectedRequest,
      assignmentPosition,
      onAssignmentPositionChange: (value) => {
        setAssignmentPosition(value);
        setSuccessMessage(null);
      },
      adminComment,
      onAdminCommentChange: (value) => {
        setAdminComment(value);
        setSuccessMessage(null);
      },
      onApprove: () => submit("approved"),
      onReject: () => submit("rejected"),
      isSubmitting: reviewRequest.isPending,
      submitErrorMessage: reviewRequest.error?.message ?? null,
      successMessage,
      isApproveDisabled:
        !selectedRequest ||
        selectedRequest.isProcessed ||
        reviewRequest.isPending ||
        !assignmentPosition,
      isRejectDisabled: !selectedRequest || selectedRequest.isProcessed || reviewRequest.isPending,
      helperMessage: selectedRequest?.isProcessed
        ? "이미 처리된 요청은 다시 배정하거나 반려할 수 없습니다."
        : null,
    },
  };
}
