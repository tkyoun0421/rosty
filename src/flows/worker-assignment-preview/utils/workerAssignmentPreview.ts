import type { WorkerAssignmentPreview } from "#queries/assignment/types/workerAssignmentPreview";

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

export function formatCurrency(amount: number) {
  return `${amount.toLocaleString()} KRW`;
}

function formatBreakdownValue(value: number | null, type: "currency" | "number") {
  if (value === null) {
    return "Pending admin rate";
  }

  return type === "currency" ? formatCurrency(value) : value.toString();
}

export function getAssignmentBreakdown(assignment: WorkerAssignmentPreview) {
  return [
    { label: "Role", value: assignment.roleCode },
    { label: "Hourly rate", value: formatBreakdownValue(assignment.hourlyRateCents, "currency") },
    { label: "Regular hours", value: formatBreakdownValue(assignment.regularHours, "number") },
    { label: "Overtime hours", value: formatBreakdownValue(assignment.overtimeHours, "number") },
    { label: "Expected pay", value: formatBreakdownValue(assignment.totalPayCents, "currency") },
  ];
}
