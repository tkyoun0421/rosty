"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateScheduleRequest } from "#mutations/schedule-request/hooks/useCreateScheduleRequest";
import {
  EMPTY_SCHEDULE_REQUEST_INPUT,
  scheduleRequestInputSchema,
  type ScheduleRequestInput,
} from "#mutations/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleViewProps } from "#flows/employee-schedule/types/employeeScheduleView";
import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  SCHEDULE_REQUEST_STATUS_LABELS,
} from "#queries/schedule-request/constants/scheduleRequest";
import { useEmployeeScheduleRequests } from "#queries/schedule-request/hooks/useEmployeeScheduleRequests";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { buildScheduleRequestHistoryView } from "#queries/schedule-request/utils/buildScheduleRequestHistoryView";
import { buildScheduleRequestNotifications } from "#queries/schedule-request/utils/buildScheduleRequestNotifications";
import { useCurrentWork } from "#queries/work/hooks/useCurrentWork";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";
import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

function buildStatusSummary(requests: EmployeeScheduleRequest[]) {
  return {
    pending: requests.filter((request) => request.status === "pending").length,
    approved: requests.filter((request) => request.status === "approved").length,
    rejected: requests.filter((request) => request.status === "rejected").length,
  };
}

export function useEmployeeSchedule(): EmployeeScheduleViewProps {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | EmployeeScheduleRequest["status"]>(
    "all",
  );
  const [sortOrder, setSortOrder] = useState<"submitted-desc" | "work-date-asc">("submitted-desc");
  const currentWorkQuery = useCurrentWork();
  const requestsQuery = useEmployeeScheduleRequests();
  const createRequest = useCreateScheduleRequest();
  const form = useForm<ScheduleRequestInput>({
    resolver: zodResolver(scheduleRequestInputSchema),
    defaultValues: EMPTY_SCHEDULE_REQUEST_INPUT,
  });
  const currentWork = currentWorkQuery.data ?? null;

  useEffect(() => {
    form.setValue("workId", currentWork?.id ?? "", {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [currentWork?.id, form]);

  const requests = requestsQuery.data ?? [];
  const filteredRequests = useMemo(() => {
    const nextRequests =
      statusFilter === "all"
        ? [...requests]
        : requests.filter((request) => request.status === statusFilter);

    nextRequests.sort((left, right) => {
      if (sortOrder === "work-date-asc") {
        return left.workDate.localeCompare(right.workDate);
      }

      return right.submittedAt.getTime() - left.submittedAt.getTime();
    });

    return nextRequests;
  }, [requests, sortOrder, statusFilter]);
  const items = useMemo(
    () =>
      filteredRequests.map((request) => ({
        id: request.id,
        workDate: request.workDate,
        workTimeLabel: formatKoreanTimeRange(request.workStartAt, request.workEndAt),
        statusLabel: SCHEDULE_REQUEST_STATUS_LABELS[request.status],
        submittedAtLabel: formatKoreanDateTime(request.submittedAt),
        note: request.note || "추가 메모 없음",
        adminComment: request.adminComment,
        assignmentPositionLabel: request.assignmentPosition
          ? SCHEDULE_ASSIGNMENT_POSITION_LABELS[request.assignmentPosition]
          : null,
        notifications: buildScheduleRequestNotifications(request, "employee-request"),
        history: buildScheduleRequestHistoryView(request.history),
      })),
    [filteredRequests],
  );
  const summary = useMemo(() => buildStatusSummary(requests), [requests]);
  const values = form.watch();

  const onSubmit = form.handleSubmit(async (nextValues) => {
    if (!currentWork) {
      return;
    }

    setSuccessMessage(null);

    try {
      await createRequest.mutateAsync({
        workId: currentWork.id,
        note: nextValues.note,
      });
      form.reset(EMPTY_SCHEDULE_REQUEST_INPUT);
      form.setValue("workId", currentWork.id, {
        shouldDirty: false,
        shouldValidate: false,
      });
      setSuccessMessage("근무 가능 신청을 등록했습니다.");
    } catch {
      // Mutation state is rendered by the view.
    }
  });

  return {
    currentWork: {
      isLoading: currentWorkQuery.isPending,
      errorMessage: currentWorkQuery.error ? (currentWorkQuery.error as Error).message : null,
      isAvailable: Boolean(currentWork),
      workDate: currentWork?.workDate ?? null,
      workTimeLabel: currentWork
        ? formatKoreanTimeRange(currentWork.startAt, currentWork.endAt)
        : null,
      helperMessage: currentWork
        ? "관리자가 생성한 현재 근무에 대해 참여 가능 여부를 제출합니다."
        : "현재 신청 가능한 근무가 없습니다. 관리자에게 새 근무 생성 여부를 확인해 주세요.",
    },
    form: {
      values: {
        note: values.note ?? "",
      },
      errors: {
        note: form.formState.errors.note?.message ?? null,
      },
      isSubmitting: createRequest.isPending,
      isDisabled: createRequest.isPending || currentWorkQuery.isPending || !currentWork,
      submitErrorMessage: createRequest.error?.message ?? null,
      successMessage,
      onNoteChange: (value) => {
        form.setValue("note", value, { shouldDirty: true, shouldValidate: true });
      },
      onSubmit,
    },
    requests: {
      isLoading: requestsQuery.isPending,
      errorMessage: requestsQuery.error ? (requestsQuery.error as Error).message : null,
      controls: {
        statusFilter,
        sortOrder,
        resultCountLabel:
          statusFilter === "all"
            ? `전체 ${items.length}건 표시 중`
            : `${SCHEDULE_REQUEST_STATUS_LABELS[statusFilter]} ${items.length}건 표시 중`,
        onStatusFilterChange: (value) => {
          setStatusFilter(value);
        },
        onSortOrderChange: (value) => {
          setSortOrder(value);
        },
      },
      summary,
      items,
    },
  };
}
