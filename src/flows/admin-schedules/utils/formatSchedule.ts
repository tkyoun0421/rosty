import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

export const scheduleStatusLabels: Record<AdminScheduleListItem["status"], string> = {
  recruiting: "모집 중",
  assigning: "배정 중",
  confirmed: "확정 완료",
};

export function formatScheduleDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function formatRoleSlotSummary(schedule: AdminScheduleListItem) {
  return schedule.roleSlotSummary.map((slot) => `${slot.roleCode} ${slot.headcount}명`).join(", ");
}