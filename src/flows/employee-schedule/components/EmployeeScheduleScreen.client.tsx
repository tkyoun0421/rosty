'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateScheduleRequest } from "#mutations/schedule-request/hooks/useCreateScheduleRequest";
import {
  EMPTY_SCHEDULE_REQUEST_FORM,
  SCHEDULE_ROLE_OPTIONS,
  SCHEDULE_TIME_SLOT_OPTIONS,
  scheduleRequestFormSchema,
  type ScheduleRequestFormValues,
} from "#mutations/schedule-request/models/form/ScheduleRequestForm";
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

export function EmployeeScheduleScreen() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const requestsQuery = useEmployeeScheduleRequests();
  const createRequest = useCreateScheduleRequest();
  const form = useForm<ScheduleRequestFormValues>({
    resolver: zodResolver(scheduleRequestFormSchema),
    defaultValues: EMPTY_SCHEDULE_REQUEST_FORM,
  });

  const requests = requestsQuery.data ?? [];
  const statusSummary = useMemo(() => buildStatusSummary(requests), [requests]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSuccessMessage(null);

    try {
      await createRequest.mutateAsync(values);
      form.reset(EMPTY_SCHEDULE_REQUEST_FORM);
      setSuccessMessage("신청이 등록되었습니다.");
    } catch {
      // Mutation state is rendered below.
    }
  });

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">근무 스케줄 신청</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            신청 가능한 날짜와 시간대를 선택하면 관리자 승인 전까지 요청 현황에서 바로 상태를 추적할 수 있습니다.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            근무 날짜
            <input
              type="date"
              aria-label="근무 날짜"
              className="rounded-2xl border border-[var(--border)] px-4 py-3"
              {...form.register("workDate")}
            />
            {form.formState.errors.workDate ? (
              <span className="text-sm text-[var(--danger)]">{form.formState.errors.workDate.message}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            시간대
            <select
              aria-label="시간대"
              className="rounded-2xl border border-[var(--border)] px-4 py-3"
              {...form.register("timeSlot")}
            >
              {SCHEDULE_TIME_SLOT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            근무 역할
            <select
              aria-label="근무 역할"
              className="rounded-2xl border border-[var(--border)] px-4 py-3"
              {...form.register("role")}
            >
              {SCHEDULE_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            메모
            <textarea
              aria-label="메모"
              rows={4}
              className="rounded-2xl border border-[var(--border)] px-4 py-3"
              placeholder="추가로 전달할 내용을 남겨주세요."
              {...form.register("note")}
            />
            {form.formState.errors.note ? (
              <span className="text-sm text-[var(--danger)]">{form.formState.errors.note.message}</span>
            ) : null}
          </label>

          {createRequest.error ? (
            <p className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {createRequest.error.message}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-2xl border border-[var(--success)]/20 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createRequest.isPending}
          >
            {createRequest.isPending ? "등록 중..." : "근무 신청 등록"}
          </button>
        </form>
      </article>

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">신청 현황</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              승인 대기, 승인 완료, 반려 상태를 한 번에 확인합니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium sm:w-[240px]">
            <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
              <div className="text-[var(--muted)]">대기</div>
              <div className="mt-1 text-base text-[var(--foreground)]">{statusSummary.pending}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
              <div className="text-[var(--muted)]">승인</div>
              <div className="mt-1 text-base text-[var(--foreground)]">{statusSummary.approved}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
              <div className="text-[var(--muted)]">반려</div>
              <div className="mt-1 text-base text-[var(--foreground)]">{statusSummary.rejected}</div>
            </div>
          </div>
        </div>

        {requestsQuery.isPending ? (
          <p className="mt-6 text-sm text-[var(--muted)]">신청 내역을 불러오는 중입니다...</p>
        ) : null}

        {requestsQuery.error ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {(requestsQuery.error as Error).message}
          </p>
        ) : null}

        {!requestsQuery.isPending && !requestsQuery.error ? (
          <div className="mt-6 space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                아직 제출한 신청이 없습니다.
              </div>
            ) : (
              requests.map((request) => (
                <article key={request.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">{request.workDate}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{TIME_SLOT_LABELS[request.timeSlot]}</p>
                    </div>
                    <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">근무 역할</dt>
                      <dd className="mt-1">{ROLE_LABELS[request.role]}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">신청 시각</dt>
                      <dd className="mt-1">{formatSubmittedAt(request.submittedAt)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-[var(--foreground)]">메모</dt>
                      <dd className="mt-1">{request.note || "추가 메모 없음"}</dd>
                    </div>
                    {request.adminComment ? (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-[var(--foreground)]">관리자 메모</dt>
                        <dd className="mt-1">{request.adminComment}</dd>
                      </div>
                    ) : null}
                  </dl>
                </article>
              ))
            )}
          </div>
        ) : null}
      </article>
    </section>
  );
}