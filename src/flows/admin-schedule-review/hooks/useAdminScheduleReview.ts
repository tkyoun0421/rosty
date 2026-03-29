"use client";

import { useEffect, useState } from "react";

import { useReviewScheduleRequest } from "#mutations/schedule-request/hooks/useReviewScheduleRequest";
import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  SCHEDULE_REQUEST_STATUS_LABELS,
} from "#queries/schedule-request/constants/scheduleRequest";
import { useAdminScheduleRequests } from "#queries/schedule-request/hooks/useAdminScheduleRequests";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { buildScheduleRequestHistoryView } from "#queries/schedule-request/utils/buildScheduleRequestHistoryView";
import type {
  AdminScheduleReviewItemViewModel,
  AdminScheduleReviewViewProps,
} from "#flows/admin-schedule-review/types/adminScheduleReviewView";
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
    isProcessed: request.status !== "pending",
    history: buildScheduleRequestHistoryView(request.history),
  };
}

export function useAdminScheduleReview(): AdminScheduleReviewViewProps {
  const requestsQuery = useAdminScheduleRequests();
  const reviewRequest = useReviewScheduleRequest();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assignmentPosition, setAssignmentPosition] = useState<
    EmployeeScheduleRequest["assignmentPosition"] | ""
  >("");
  const [adminComment, setAdminComment] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requests = requestsQuery.data ?? [];
  const items = requests.map(toViewModel);
  const selectedRequestRecord =
    requests.find((request) => request.id === selectedRequestId) ?? null;
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
      setSuccessMessage(status === "approved" ? "배정을 완료했습니다." : "신청을 반려했습니다.");
    } catch {
      // Mutation state is rendered by the view.
    }
  }

  return {
    list: {
      isLoading: requestsQuery.isPending,
      errorMessage: requestsQuery.error ? (requestsQuery.error as Error).message : null,
      items,
      selectedRequestId,
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
        ? "이미 처리된 신청은 다시 배정하거나 반려할 수 없습니다."
        : null,
    },
  };
}
