import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

export const scheduleStatusLabels: Record<AdminScheduleListItem["status"], string> = {
  recruiting: "Recruiting",
  assigning: "Assigning",
  confirmed: "Confirmed",
};

export function formatScheduleDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function formatRoleSlotSummary(schedule: AdminScheduleListItem) {
  return schedule.roleSlotSummary.map((slot) => `${slot.roleCode} x${slot.headcount}`).join(", ");
}
