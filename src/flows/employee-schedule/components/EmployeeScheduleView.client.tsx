"use client";

import {
  SCHEDULE_ROLE_OPTIONS,
  SCHEDULE_TIME_SLOT_OPTIONS,
} from "#mutations/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleViewProps } from "#flows/employee-schedule/types/employeeScheduleView";

export function EmployeeScheduleView({ form, requests }: EmployeeScheduleViewProps) {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">근무 다음주 요청</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            요청 가능한 날짜와 시간대를 선택하면 관리자 확인 전까지 요청 현황에서 바로 상태를 추적할
            수 있습니다.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={form.onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            근무 날짜
            <input
              type="date"
              aria-label="근무 날짜"
              className="rounded-2xl border border-[var(--border)] px-4 py-3"
              value={form.values.workDate}
              onChange={(event) => form.onWorkDateChange(event.target.value)}
            />
            {form.errors.workDate ? (
              <span className="text-sm text-[var(--danger)]">{form.errors.workDate}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            시간대
            <select
              aria-label="시간대"
              className="rounded-2xl border border-[var(--border)] px-4 py-3"
              value={form.values.timeSlot}
              onChange={(event) =>
                form.onTimeSlotChange(event.target.value as typeof form.values.timeSlot)
              }
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
              value={form.values.role}
              onChange={(event) => form.onRoleChange(event.target.value as typeof form.values.role)}
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
              placeholder="추가로 전달할 내용이 있다면 적어 주세요"
              value={form.values.note}
              onChange={(event) => form.onNoteChange(event.target.value)}
            />
            {form.errors.note ? (
              <span className="text-sm text-[var(--danger)]">{form.errors.note}</span>
            ) : null}
          </label>

          {form.submitErrorMessage ? (
            <p className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {form.submitErrorMessage}
            </p>
          ) : null}

          {form.successMessage ? (
            <p className="rounded-2xl border border-[var(--success)]/20 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]">
              {form.successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={form.isSubmitting}
          >
            {form.isSubmitting ? "등록 중..." : "근무 요청 등록"}
          </button>
        </form>
      </article>

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">요청 현황</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              승인 대기, 승인 완료, 반려 상태를 한 번에 확인합니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium sm:w-[240px]">
            <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
              <div className="text-[var(--muted)]">대기</div>
              <div className="mt-1 text-base text-[var(--foreground)]">
                {requests.summary.pending}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
              <div className="text-[var(--muted)]">승인</div>
              <div className="mt-1 text-base text-[var(--foreground)]">
                {requests.summary.approved}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
              <div className="text-[var(--muted)]">반려</div>
              <div className="mt-1 text-base text-[var(--foreground)]">
                {requests.summary.rejected}
              </div>
            </div>
          </div>
        </div>

        {requests.isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">요청 내역을 불러오는 중입니다...</p>
        ) : null}

        {requests.errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {requests.errorMessage}
          </p>
        ) : null}

        {!requests.isLoading && !requests.errorMessage ? (
          <div className="mt-6 space-y-4">
            {requests.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                아직 제출한 요청이 없습니다.
              </div>
            ) : (
              requests.items.map((request) => (
                <article
                  key={request.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {request.workDate}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{request.timeSlotLabel}</p>
                    </div>
                    <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                      {request.statusLabel}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">근무 역할</dt>
                      <dd className="mt-1">{request.roleLabel}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">요청 시각</dt>
                      <dd className="mt-1">{request.submittedAtLabel}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-[var(--foreground)]">메모</dt>
                      <dd className="mt-1">{request.note}</dd>
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
