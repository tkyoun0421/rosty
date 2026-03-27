"use client";

import { useEffect, useState } from "react";

import { useReviewScheduleRequest } from "#mutations/schedule-request/hooks/useReviewScheduleRequest";
import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import { useAdminScheduleRequests } from "#queries/schedule-request/hooks/useAdminScheduleRequests";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import type {
  AdminScheduleReviewItemViewModel,
  AdminScheduleReviewViewProps,
} from "#flows/admin-schedule-review/types/adminScheduleReviewView";

const STATUS_LABELS = {
  pending: "승인 대기",
  approved: "승인 완료",
  rejected: "반려",
} as const;

const ROLE_LABELS = {
  consulting: "상담",
  service: "뷔페 세팅",
  ceremony: "예식 진행",
} as const;

const TIME_SLOT_LABELS = {
  morning: "오전 (09:00 - 13:00)",
  afternoon: "오후 (13:00 - 17:00)",
  evening: "저녁 (17:00 - 21:00)",
} as const;

function formatSubmittedAt(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function toViewModel(request: EmployeeScheduleRequest): AdminScheduleReviewItemViewModel {
  return {
    id: request.id,
    employeeId: request.employeeId,
    workDate: request.workDate,
    timeSlotLabel: TIME_SLOT_LABELS[request.timeSlot],
    roleLabel: ROLE_LABELS[request.role],
    statusLabel: STATUS_LABELS[request.status],
    submittedAtLabel: formatSubmittedAt(request.submittedAt),
    note: request.note || "추가 메모 없음",
    adminComment: request.adminComment,
    isProcessed: request.status !== "pending",
  };
}

export function useAdminScheduleReview(): AdminScheduleReviewViewProps {
  const requestsQuery = useAdminScheduleRequests();
  const reviewRequest = useReviewScheduleRequest();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requests = requestsQuery.data ?? [];
  const items = requests.map(toViewModel);
  const selectedRequest = items.find((item) => item.id === selectedRequestId) ?? null;

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
    if (!selectedRequest) {
      setAdminComment("");
      return;
    }

    setAdminComment(selectedRequest.adminComment ?? "");
  }, [selectedRequest?.id]);

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
      });

      setAdminComment(updated.adminComment ?? "");
      setSuccessMessage(status === "approved" ? "요청을 승인했습니다." : "요청을 반려했습니다.");
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
      areActionsDisabled:
        !selectedRequest || selectedRequest.isProcessed || reviewRequest.isPending,
      helperMessage: selectedRequest?.isProcessed
        ? "이미 처리된 요청은 다시 승인하거나 반려할 수 없습니다."
        : null,
    },
  };
}
