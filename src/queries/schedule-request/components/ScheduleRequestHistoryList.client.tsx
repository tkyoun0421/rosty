"use client";

import type { ScheduleRequestHistoryItemViewModel } from "#queries/schedule-request/types/scheduleRequestHistoryView";

type ScheduleRequestHistoryListProps = {
  listName: string;
  items: ScheduleRequestHistoryItemViewModel[];
};

export function ScheduleRequestHistoryList({
  listName,
  items,
}: ScheduleRequestHistoryListProps) {
  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          처리 이력
        </p>
        <span className="text-xs text-[var(--muted)]">{items.length}건</span>
      </div>

      <ol aria-label={listName} className="mt-3 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item.typeLabel}-${item.createdAtLabel}-${index}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.typeLabel}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {item.actorLabel} · {item.createdAtLabel}
                </p>
              </div>
              {item.assignmentPositionLabel ? (
                <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                  {item.assignmentPositionLabel}
                </span>
              ) : null}
            </div>

            {item.comment ? (
              <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{item.comment}</p>
            ) : null}

            {item.assignedLocation ? (
              <p className="mt-2 text-xs text-[var(--muted)]">
                배정 장소: {item.assignedLocation}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
