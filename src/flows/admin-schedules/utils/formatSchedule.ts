import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

export const scheduleStatusLabels: Record<AdminScheduleListItem["status"], string> = {
  recruiting: "Recruiting",
  assigning: "Assigning",
  confirmed: "Confirmed",
};

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

export function formatScheduleDateLabel(value: string) {
  return scheduleDateFormatter.format(new Date(value));
}

export function formatScheduleTimeLabel(value: string) {
  return scheduleTimeFormatter.format(new Date(value));
}

export function formatScheduleWindow(startsAt: string, endsAt: string) {
  return `${formatScheduleDateLabel(startsAt)} · ${formatScheduleTimeLabel(startsAt)} to ${formatScheduleTimeLabel(endsAt)}`;
}

export function formatRoleSlotSummary(schedule: AdminScheduleListItem) {
  return schedule.roleSlotSummary.map((slot) => `${slot.roleCode} x${slot.headcount}`).join(", ");
}

export function formatScheduleStaffingSummary(schedule: AdminScheduleListItem) {
  const roleSlotCount = schedule.roleSlotSummary.length;
  const plannedSeats = schedule.roleSlotSummary.reduce((total, slot) => total + slot.headcount, 0);
  const roleSlotLabel = roleSlotCount === 1 ? "role slot" : "role slots";
  const plannedSeatsLabel = plannedSeats === 1 ? "planned seat" : "planned seats";

  return `${roleSlotCount} ${roleSlotLabel} · ${plannedSeats} ${plannedSeatsLabel}`;
}
