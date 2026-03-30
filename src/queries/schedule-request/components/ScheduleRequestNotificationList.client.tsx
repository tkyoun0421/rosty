"use client";

import type { ScheduleRequestNotificationView } from "#queries/schedule-request/types/scheduleRequestNotificationView";

type ScheduleRequestNotificationListProps = {
  listName: string;
  items: ScheduleRequestNotificationView[];
};

const TONE_CLASS_NAMES: Record<ScheduleRequestNotificationView["tone"], string> = {
  neutral: "border-[var(--border)] bg-white text-[var(--foreground)]",
  success: "border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)]",
  warning: "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--foreground)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)]",
};

export function ScheduleRequestNotificationList({
  listName,
  items,
}: ScheduleRequestNotificationListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3" aria-label={listName}>
      {items.map((item) => (
        <article
          key={item.id}
          className={["rounded-2xl border px-4 py-4", TONE_CLASS_NAMES[item.tone]].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-6">{item.description}</p>
            </div>
            <span className="text-xs">{item.createdAtLabel}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
