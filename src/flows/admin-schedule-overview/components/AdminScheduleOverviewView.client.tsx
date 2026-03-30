"use client";

import Link from "next/link";

import type { AdminScheduleOverviewViewProps } from "#flows/admin-schedule-overview/types/adminScheduleOverviewView";
import { ScheduleRequestNotificationList } from "#queries/schedule-request/components/ScheduleRequestNotificationList.client";

const RESPONSE_TONE_CLASS_NAMES: Record<
  AdminScheduleOverviewViewProps["items"][number]["responseTone"],
  string
> = {
  warning: "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--foreground)]",
  success: "border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)]",
};

export function AdminScheduleOverviewView({
  isLoading,
  errorMessage,
  summaryCards,
  pendingReviewAlert,
  items,
}: AdminScheduleOverviewViewProps) {
  return (
    <section className="mt-8 space-y-6">
      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">운영 요약</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            현재 요청, 배정 확정, 직원 응답 상태를 한눈에 확인합니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="text-sm font-medium text-[var(--muted)]">{card.title}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                {card.valueText}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.helperText}</p>
            </article>
          ))}
        </div>
      </article>

      {pendingReviewAlert ? (
        <article className="rounded-3xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--foreground)]">
                {pendingReviewAlert.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {pendingReviewAlert.description}
              </p>
            </div>
            <Link
              href={pendingReviewAlert.href}
              className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              {pendingReviewAlert.ctaLabel}
            </Link>
          </div>
        </article>
      ) : null}

      <article className="rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[0_18px_60px_rgba(53,35,19,0.06)]">
        <div>
          <h2 className="text-2xl font-semibold">배정된 일정</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            배정이 확정된 일정만 근무일 순서로 정리합니다.
          </p>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">일정 개요를 불러오는 중입니다...</p>
        ) : null}

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage ? (
          items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              아직 배정된 일정이 없습니다. 요청 검토에서 배정을 확정하면 이 화면에 표시됩니다.
            </div>
          ) : (
            <ol aria-label="admin-schedule-overview-list" className="mt-6 space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {item.employeeId}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.workDate} · {item.workTimeLabel}
                      </p>
                    </div>
                    <span
                      className={[
                        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                        RESPONSE_TONE_CLASS_NAMES[item.responseTone],
                      ].join(" ")}
                    >
                      {item.responseStatusLabel}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                    {item.assignmentPositionLabel ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">배정 포지션</dt>
                        <dd className="mt-1">{item.assignmentPositionLabel}</dd>
                      </div>
                    ) : null}
                    {item.assignedLocation ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">배정 장소</dt>
                        <dd className="mt-1">{item.assignedLocation}</dd>
                      </div>
                    ) : null}
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
                    {item.adminComment ? (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-[var(--foreground)]">관리자 메모</dt>
                        <dd className="mt-1">{item.adminComment}</dd>
                      </div>
                    ) : null}
                    {item.employeeRespondedAtLabel ? (
                      <div>
                        <dt className="font-medium text-[var(--foreground)]">직원 응답 시각</dt>
                        <dd className="mt-1">{item.employeeRespondedAtLabel}</dd>
                      </div>
                    ) : null}
                    {item.employeeResponseComment ? (
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-[var(--foreground)]">직원 응답 메모</dt>
                        <dd className="mt-1">{item.employeeResponseComment}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <ScheduleRequestNotificationList
                    listName={`admin-schedule-overview-notifications-${item.id}`}
                    items={item.notifications}
                  />
                </li>
              ))}
            </ol>
          )
        ) : null}
      </article>
    </section>
  );
}
