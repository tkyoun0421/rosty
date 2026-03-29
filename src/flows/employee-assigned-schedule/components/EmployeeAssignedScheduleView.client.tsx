"use client";

import { ScheduleRequestHistoryList } from "#queries/schedule-request/components/ScheduleRequestHistoryList.client";
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
                      <p className="text-lg font-semibold text-[var(--foreground)]">{item.workDate}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{item.workTimeLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                        {item.assignedLocation}
                      </span>
                      {item.employeeResponseStatusLabel ? (
                        <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                          {item.employeeResponseStatusLabel}
                        </span>
                      ) : null}
                    </div>
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
                    {item.employeeRespondedAtLabel ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">응답 시각</dt>
                        <dd className="mt-1">{item.employeeRespondedAtLabel}</dd>
                      </div>
                    ) : null}
                    {item.employeeRespondedBy ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">응답자</dt>
                        <dd className="mt-1">{item.employeeRespondedBy}</dd>
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
                    {item.employeeResponseComment ? (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-[var(--foreground)]">응답 메모</dt>
                        <dd className="mt-1">{item.employeeResponseComment}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {item.canRespond ? (
                    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
                      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                        배정 응답 메모
                        <textarea
                          aria-label={`assignment-response-comment-${item.id}`}
                          rows={3}
                          className="rounded-2xl border border-[var(--border)] px-4 py-3"
                          value={item.responseDraftComment}
                          onChange={(event) =>
                            schedule.onResponseCommentChange(item.id, event.target.value)
                          }
                        />
                      </label>

                      {item.responseHelperMessage ? (
                        <p className="mt-3 text-sm text-[var(--muted)]">{item.responseHelperMessage}</p>
                      ) : null}

                      {item.responseErrorMessage ? (
                        <p className="mt-3 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                          {item.responseErrorMessage}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          aria-label={`accept-assignment-${item.id}`}
                          onClick={() => void schedule.onAccept(item.id)}
                          disabled={item.isResponding}
                          className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          수락
                        </button>
                        <button
                          type="button"
                          aria-label={`decline-assignment-${item.id}`}
                          onClick={() => void schedule.onDecline(item.id)}
                          disabled={item.isResponding}
                          className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <ScheduleRequestHistoryList
                    listName={`assigned-request-history-${item.id}`}
                    items={item.history}
                  />
                </article>
              ))
            )}
          </div>
        ) : null}
      </article>
    </section>
  );
}
