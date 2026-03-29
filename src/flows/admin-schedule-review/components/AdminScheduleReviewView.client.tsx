"use client";

import { SCHEDULE_ASSIGNMENT_POSITION_OPTIONS } from "#queries/schedule-request/constants/scheduleRequest";
import { ScheduleRequestHistoryList } from "#queries/schedule-request/components/ScheduleRequestHistoryList.client";
import type { AdminScheduleReviewViewProps } from "#flows/admin-schedule-review/types/adminScheduleReviewView";

export function AdminScheduleReviewView({ list, detail }: AdminScheduleReviewViewProps) {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">관리자 요청 검토</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            직원 신청을 검토하고 실제 배정 포지션을 확정하거나 반려를 처리합니다.
          </p>
        </div>

        {list.isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">요청 목록을 불러오는 중입니다...</p>
        ) : null}

        {list.errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {list.errorMessage}
          </p>
        ) : null}

        {!list.isLoading && !list.errorMessage ? (
          <div className="mt-6 space-y-3">
            {list.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                검토할 요청이 없습니다.
              </div>
            ) : (
              list.items.map((item) => {
                const isSelected = item.id === list.selectedRequestId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${item.employeeId} ${item.workDate} 요청 선택`}
                    onClick={() => list.onSelectRequest(item.id)}
                    className={[
                      "w-full rounded-3xl border px-5 py-4 text-left transition",
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--surface)] shadow-[0_12px_30px_rgba(53,35,19,0.08)]"
                        : "border-[var(--border)] bg-white hover:border-[var(--accent)]/40",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-[var(--foreground)]">
                          {item.employeeId}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {item.workDate} · {item.workTimeLabel}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                        {item.statusLabel}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">제출 메모</dt>
                        <dd className="mt-1">{item.note}</dd>
                      </div>
                    </dl>
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </article>

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">요청 상세</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            선택한 요청의 상세 내용을 확인하고 관리자 메모를 남길 수 있습니다.
          </p>
        </div>

        {detail.selectedRequest ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {detail.selectedRequest.employeeId}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {detail.selectedRequest.workDate} · {detail.selectedRequest.workTimeLabel}
                  </p>
                </div>
                <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                  {detail.selectedRequest.statusLabel}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-[var(--foreground)]">제출 시각</dt>
                  <dd className="mt-1">{detail.selectedRequest.submittedAtLabel}</dd>
                </div>
                {detail.selectedRequest.assignmentPositionLabel ? (
                  <div>
                    <dt className="font-medium text-[var(--foreground)]">배정 포지션</dt>
                    <dd className="mt-1">{detail.selectedRequest.assignmentPositionLabel}</dd>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <dt className="font-medium text-[var(--foreground)]">신청 메모</dt>
                  <dd className="mt-1">{detail.selectedRequest.note}</dd>
                </div>
                {detail.selectedRequest.adminComment ? (
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-[var(--foreground)]">기존 관리자 메모</dt>
                    <dd className="mt-1">{detail.selectedRequest.adminComment}</dd>
                  </div>
                ) : null}
                {detail.selectedRequest.assignedLocation ? (
                  <div>
                    <dt className="font-medium text-[var(--foreground)]">배정 장소</dt>
                    <dd className="mt-1">{detail.selectedRequest.assignedLocation}</dd>
                  </div>
                ) : null}
                {detail.selectedRequest.assignedAtLabel ? (
                  <div>
                    <dt className="font-medium text-[var(--foreground)]">배정 시각</dt>
                    <dd className="mt-1">{detail.selectedRequest.assignedAtLabel}</dd>
                  </div>
                ) : null}
                {detail.selectedRequest.assignedBy ? (
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-[var(--foreground)]">배정 담당자</dt>
                    <dd className="mt-1">{detail.selectedRequest.assignedBy}</dd>
                  </div>
                ) : null}
              </dl>

              <ScheduleRequestHistoryList
                listName={`request-history-${detail.selectedRequest.id}`}
                items={detail.selectedRequest.history}
              />
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium">
              배정 포지션
              <select
                aria-label="배정 포지션"
                className="rounded-2xl border border-[var(--border)] px-4 py-3"
                value={detail.assignmentPosition}
                onChange={(event) =>
                  detail.onAssignmentPositionChange(
                    event.target.value as typeof detail.assignmentPosition,
                  )
                }
                disabled={detail.selectedRequest.isProcessed || detail.isSubmitting}
              >
                <option value="">포지션 선택</option>
                {SCHEDULE_ASSIGNMENT_POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              관리자 메모
              <textarea
                aria-label="관리자 메모"
                rows={4}
                className="rounded-2xl border border-[var(--border)] px-4 py-3"
                placeholder="승인 근거 또는 반려 사유를 남겨 주세요."
                value={detail.adminComment}
                onChange={(event) => detail.onAdminCommentChange(event.target.value)}
              />
            </label>

            {detail.helperMessage ? (
              <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
                {detail.helperMessage}
              </p>
            ) : null}

            {detail.submitErrorMessage ? (
              <p className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                {detail.submitErrorMessage}
              </p>
            ) : null}

            {detail.successMessage ? (
              <p className="rounded-2xl border border-[var(--success)]/20 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]">
                {detail.successMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void detail.onApprove()}
                disabled={detail.isApproveDisabled}
                className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                배정 확정
              </button>
              <button
                type="button"
                onClick={() => void detail.onReject()}
                disabled={detail.isRejectDisabled}
                className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                신청 반려
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            검토할 요청을 선택해 주세요.
          </div>
        )}
      </article>
    </section>
  );
}
