"use client";

import { ScheduleRequestHistoryList } from "#queries/schedule-request/components/ScheduleRequestHistoryList.client";
import { ScheduleRequestNotificationList } from "#queries/schedule-request/components/ScheduleRequestNotificationList.client";
import type { EmployeeScheduleViewProps } from "#flows/employee-schedule/types/employeeScheduleView";

export function EmployeeScheduleView({ currentWork, form, requests }: EmployeeScheduleViewProps) {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">근무 스케줄 신청</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            관리자가 연 현재 근무에 대해 참여 가능 여부를 제출하면, 신청 현황과 배정 스케줄에서
            결과를 바로 이어서 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {currentWork.isLoading ? (
            <p className="text-sm text-[var(--muted)]">현재 근무 정보를 불러오는 중입니다...</p>
          ) : null}

          {currentWork.errorMessage ? (
            <p className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {currentWork.errorMessage}
            </p>
          ) : null}

          {!currentWork.isLoading && !currentWork.errorMessage ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
              {currentWork.isAvailable ? (
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                    Current Work
                  </p>
                  <p className="text-2xl font-semibold text-[var(--foreground)]">
                    {currentWork.workDate}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{currentWork.workTimeLabel}</p>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {currentWork.helperMessage}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                  {currentWork.helperMessage}
                </div>
              )}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={form.onSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              메모
              <textarea
                aria-label="메모"
                rows={4}
                className="rounded-2xl border border-[var(--border)] px-4 py-3"
                placeholder="추가 전달 사항이 있다면 적어 주세요."
                value={form.values.note}
                onChange={(event) => form.onNoteChange(event.target.value)}
                disabled={form.isDisabled}
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
              disabled={form.isDisabled}
            >
              {form.isSubmitting ? "등록 중..." : "근무 가능 신청"}
            </button>
          </form>
        </div>
      </article>

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">신청 현황</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              배정 대기, 배정 완료, 반려 상태를 한 번에 확인합니다.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium sm:w-[240px]">
              <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
                <div className="text-[var(--muted)]">대기</div>
                <div className="mt-1 text-base text-[var(--foreground)]">
                  {requests.summary.pending}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] px-3 py-3">
                <div className="text-[var(--muted)]">배정</div>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                상태 필터
                <select
                  aria-label="상태 필터"
                  className="rounded-2xl border border-[var(--border)] px-4 py-3"
                  value={requests.controls.statusFilter}
                  onChange={(event) =>
                    requests.controls.onStatusFilterChange(
                      event.target.value as typeof requests.controls.statusFilter,
                    )
                  }
                >
                  <option value="all">전체</option>
                  <option value="pending">배정 대기</option>
                  <option value="approved">배정 완료</option>
                  <option value="rejected">반려</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                정렬
                <select
                  aria-label="정렬"
                  className="rounded-2xl border border-[var(--border)] px-4 py-3"
                  value={requests.controls.sortOrder}
                  onChange={(event) =>
                    requests.controls.onSortOrderChange(
                      event.target.value as typeof requests.controls.sortOrder,
                    )
                  }
                >
                  <option value="submitted-desc">신청일 최신순</option>
                  <option value="work-date-asc">근무일 빠른순</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {requests.isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">신청 내역을 불러오는 중입니다...</p>
        ) : null}

        {requests.errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {requests.errorMessage}
          </p>
        ) : null}

        {!requests.isLoading && !requests.errorMessage ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[var(--muted)]">{requests.controls.resultCountLabel}</p>
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
                      <p className="mt-1 text-sm text-[var(--muted)]">{request.workTimeLabel}</p>
                    </div>
                    <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                      {request.statusLabel}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-[var(--foreground)]">요청 시각</dt>
                      <dd className="mt-1">{request.submittedAtLabel}</dd>
                    </div>
                    {request.assignmentPositionLabel ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">배정 포지션</dt>
                        <dd className="mt-1">{request.assignmentPositionLabel}</dd>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-[var(--foreground)]">메모</dt>
                      <dd className="mt-1">{request.note}</dd>
                    </div>
                    {request.adminComment ? (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-[var(--foreground)]">배정 메모</dt>
                        <dd className="mt-1">{request.adminComment}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <ScheduleRequestNotificationList
                    listName={`employee-request-notifications-${request.id}`}
                    items={request.notifications}
                  />
                  <ScheduleRequestHistoryList
                    listName={`request-history-${request.id}`}
                    items={request.history}
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
