import type { RecruitingScheduleRoleSlotSummary } from "#queries/schedule/dal/listRecruitingSchedules";

const scheduleDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

const scheduleTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

export function formatScheduleWindow(startsAt: string, endsAt: string) {
  return `${scheduleDateFormatter.format(new Date(startsAt))}, ${scheduleTimeFormatter.format(new Date(startsAt))} to ${scheduleTimeFormatter.format(new Date(endsAt))}`;
}

export function formatRoleSlotSummary(roleSlotSummary: RecruitingScheduleRoleSlotSummary[]) {
  return roleSlotSummary.map((slot) => `${slot.roleCode} x${slot.headcount}`).join(", ");
}
