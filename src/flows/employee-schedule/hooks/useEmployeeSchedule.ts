'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateScheduleRequest } from "#mutations/schedule-request/hooks/useCreateScheduleRequest";
import {
  EMPTY_SCHEDULE_REQUEST_FORM,
  scheduleRequestFormSchema,
  type ScheduleRequestFormValues,
} from "#mutations/schedule-request/models/form/ScheduleRequestForm";
import type { EmployeeScheduleViewProps } from "#flows/employee-schedule/models/employeeScheduleView";
import { useEmployeeScheduleRequests } from "#queries/schedule-request/hooks/useEmployeeScheduleRequests";
import type { EmployeeScheduleRequestDal } from "#queries/schedule-request/models/dal/scheduleRequest";

const STATUS_LABELS = {
  pending: "승인 대기",
  approved: "승인 완료",
  rejected: "반려",
} as const;

const ROLE_LABELS = {
  consulting: "상담",
  service: "음식 서빙",
  ceremony: "행사 진행",
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

function buildStatusSummary(requests: EmployeeScheduleRequestDal[]) {
  return {
    pending: requests.filter((request) => request.status === "pending").length,
    approved: requests.filter((request) => request.status === "approved").length,
    rejected: requests.filter((request) => request.status === "rejected").length,
  };
}

export function useEmployeeSchedule(): EmployeeScheduleViewProps {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const requestsQuery = useEmployeeScheduleRequests();
  const createRequest = useCreateScheduleRequest();
  const form = useForm<ScheduleRequestFormValues>({
    resolver: zodResolver(scheduleRequestFormSchema),
    defaultValues: EMPTY_SCHEDULE_REQUEST_FORM,
  });

  const requests = requestsQuery.data ?? [];
  const items = useMemo(
    () =>
      requests.map((request) => ({
        id: request.id,
        workDate: request.workDate,
        timeSlotLabel: TIME_SLOT_LABELS[request.timeSlot],
        statusLabel: STATUS_LABELS[request.status],
        roleLabel: ROLE_LABELS[request.role],
        submittedAtLabel: formatSubmittedAt(request.submittedAt),
        note: request.note || "추가 메모 없음",
        adminComment: request.adminComment,
      })),
    [requests],
  );
  const summary = useMemo(() => buildStatusSummary(requests), [requests]);
  const values = form.watch();

  const onSubmit = form.handleSubmit(async (nextValues) => {
    setSuccessMessage(null);

    try {
      await createRequest.mutateAsync(nextValues);
      form.reset(EMPTY_SCHEDULE_REQUEST_FORM);
      setSuccessMessage("신청이 등록되었습니다.");
    } catch {
      // Mutation state is rendered by the view.
    }
  });

  return {
    form: {
      values: {
        workDate: values.workDate ?? "",
        timeSlot: values.timeSlot ?? EMPTY_SCHEDULE_REQUEST_FORM.timeSlot,
        role: values.role ?? EMPTY_SCHEDULE_REQUEST_FORM.role,
        note: values.note ?? "",
      },
      errors: {
        workDate: form.formState.errors.workDate?.message ?? null,
        note: form.formState.errors.note?.message ?? null,
      },
      isSubmitting: createRequest.isPending,
      submitErrorMessage: createRequest.error?.message ?? null,
      successMessage,
      onWorkDateChange: (value) => {
        form.setValue("workDate", value, { shouldDirty: true, shouldValidate: true });
      },
      onTimeSlotChange: (value) => {
        form.setValue("timeSlot", value, { shouldDirty: true, shouldValidate: true });
      },
      onRoleChange: (value) => {
        form.setValue("role", value, { shouldDirty: true, shouldValidate: true });
      },
      onNoteChange: (value) => {
        form.setValue("note", value, { shouldDirty: true, shouldValidate: true });
      },
      onSubmit,
    },
    requests: {
      isLoading: requestsQuery.isPending,
      errorMessage: requestsQuery.error ? (requestsQuery.error as Error).message : null,
      summary,
      items,
    },
  };
}