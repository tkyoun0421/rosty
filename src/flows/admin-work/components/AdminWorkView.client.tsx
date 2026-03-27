"use client";

import type { AdminWorkViewProps } from "#flows/admin-work/types/adminWorkView";

export function AdminWorkView({ currentWork, form }: AdminWorkViewProps) {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">현재 모집 중인 근무</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            직원 신청 화면에 노출될 현재 근무 일정입니다.
          </p>
        </div>

        {currentWork.isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">현재 근무를 불러오는 중입니다...</p>
        ) : null}

        {currentWork.errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {currentWork.errorMessage}
          </p>
        ) : null}

        {!currentWork.isLoading && !currentWork.errorMessage ? (
          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
            {currentWork.workDate && currentWork.workTimeLabel ? (
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                  Current Work
                </p>
                <p className="text-2xl font-semibold text-[var(--foreground)]">
                  {currentWork.workDate}
                </p>
                <p className="text-sm text-[var(--muted)]">{currentWork.workTimeLabel}</p>
                <p className="text-sm leading-6 text-[var(--muted)]">{currentWork.helperMessage}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                {currentWork.helperMessage}
              </div>
            )}
          </div>
        ) : null}
      </article>

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">근무 생성</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            직원이 신청할 근무 날짜와 시작/종료 시간을 저장합니다.
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

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              시작 시간
              <input
                type="time"
                aria-label="시작 시간"
                className="rounded-2xl border border-[var(--border)] px-4 py-3"
                value={form.values.startTime}
                onChange={(event) => form.onStartTimeChange(event.target.value)}
              />
              {form.errors.startTime ? (
                <span className="text-sm text-[var(--danger)]">{form.errors.startTime}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              종료 시간
              <input
                type="time"
                aria-label="종료 시간"
                className="rounded-2xl border border-[var(--border)] px-4 py-3"
                value={form.values.endTime}
                onChange={(event) => form.onEndTimeChange(event.target.value)}
              />
              {form.errors.endTime ? (
                <span className="text-sm text-[var(--danger)]">{form.errors.endTime}</span>
              ) : null}
            </label>
          </div>

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
            {form.isSubmitting ? "저장 중..." : "근무 저장"}
          </button>
        </form>
      </article>
    </section>
  );
}
