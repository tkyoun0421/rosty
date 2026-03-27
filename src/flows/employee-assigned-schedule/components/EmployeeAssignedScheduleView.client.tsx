"use client";

import type { EmployeeAssignedScheduleViewProps } from "#flows/employee-assigned-schedule/types/employeeAssignedScheduleView";

export function EmployeeAssignedScheduleView({
  summary,
  schedule,
}: EmployeeAssignedScheduleViewProps) {
  return (
    <section className="mt-8 grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Assigned</p>
          <p className="mt-3 text-2xl font-semibold">{summary.assignedCountLabel}</p>
        </article>
        <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Next Shift</p>
          <p className="mt-3 text-2xl font-semibold">{summary.nextShiftLabel}</p>
        </article>
      </div>

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">배정된 근무</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            관리자 승인으로 확정된 근무를 일정과 배정 메모 기준으로 확인합니다.
          </p>
        </div>

        {schedule.isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">배정 스케줄을 불러오는 중입니다...</p>
        ) : null}

        {schedule.errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {schedule.errorMessage}
          </p>
        ) : null}

        {!schedule.isLoading && !schedule.errorMessage ? (
          <div className="mt-6 space-y-4">
            {schedule.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                아직 확정된 배정 스케줄이 없습니다.
              </div>
            ) : (
              schedule.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {item.workDate}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{item.workTimeLabel}</p>
                    </div>
                    <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                      {item.assignedLocation}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">배정 포지션</dt>
                      <dd className="mt-1">{item.assignmentPositionLabel}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">신청 시각</dt>
                      <dd className="mt-1">{item.submittedAtLabel}</dd>
                    </div>
                    {item.assignedAtLabel ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">배정 시각</dt>
                        <dd className="mt-1">{item.assignedAtLabel}</dd>
                      </div>
                    ) : null}
                    {item.assignedBy ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">배정 담당자</dt>
                        <dd className="mt-1">{item.assignedBy}</dd>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-[var(--foreground)]">신청 메모</dt>
                      <dd className="mt-1">{item.note}</dd>
                    </div>
                    {item.adminComment ? (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-[var(--foreground)]">배정 메모</dt>
                        <dd className="mt-1">{item.adminComment}</dd>
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
