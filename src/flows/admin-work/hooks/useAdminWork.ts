"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateWork } from "#mutations/work/hooks/useCreateWork";
import { EMPTY_WORK_INPUT, type WorkInput, workInputSchema } from "#mutations/work/schemas/work";
import type { AdminWorkViewProps } from "#flows/admin-work/types/adminWorkView";
import { useCurrentWork } from "#queries/work/hooks/useCurrentWork";
import { formatKoreanTimeRange } from "#shared/utils/formatKoreanTimeRange";

export function useAdminWork(): AdminWorkViewProps {
  const currentWorkQuery = useCurrentWork();
  const createWork = useCreateWork();
  const form = useForm<WorkInput>({
    resolver: zodResolver(workInputSchema),
    defaultValues: EMPTY_WORK_INPUT,
  });
  const currentWork = currentWorkQuery.data ?? null;
  const values = form.watch();

  const onSubmit = form.handleSubmit(async (nextValues) => {
    try {
      const savedWork = await createWork.mutateAsync(nextValues);

      form.reset({
        workDate: savedWork.workDate,
        startTime: nextValues.startTime,
        endTime: nextValues.endTime,
      });
    } catch {
      // Mutation state is rendered by the view.
    }
  });

  return {
    currentWork: {
      isLoading: currentWorkQuery.isPending,
      errorMessage: currentWorkQuery.error ? (currentWorkQuery.error as Error).message : null,
      workDate: currentWork?.workDate ?? null,
      workTimeLabel: currentWork
        ? formatKoreanTimeRange(currentWork.startAt, currentWork.endAt)
        : null,
      helperMessage: currentWork
        ? "직원이 현재 신청할 수 있는 근무입니다."
        : "현재 모집 중인 근무가 없습니다.",
    },
    form: {
      values: {
        workDate: values.workDate ?? "",
        startTime: values.startTime ?? EMPTY_WORK_INPUT.startTime,
        endTime: values.endTime ?? EMPTY_WORK_INPUT.endTime,
      },
      errors: {
        workDate: form.formState.errors.workDate?.message ?? null,
        startTime: form.formState.errors.startTime?.message ?? null,
        endTime: form.formState.errors.endTime?.message ?? null,
      },
      isSubmitting: createWork.isPending,
      submitErrorMessage: createWork.error?.message ?? null,
      successMessage: createWork.isSuccess ? "근무를 저장했습니다." : null,
      onWorkDateChange: (value) => {
        form.setValue("workDate", value, { shouldDirty: true, shouldValidate: true });
      },
      onStartTimeChange: (value) => {
        form.setValue("startTime", value, { shouldDirty: true, shouldValidate: true });
      },
      onEndTimeChange: (value) => {
        form.setValue("endTime", value, { shouldDirty: true, shouldValidate: true });
      },
      onSubmit,
    },
  };
}
