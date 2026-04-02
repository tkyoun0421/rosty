import type { WorkerAssignmentPreview } from "#queries/assignment/types/workerAssignmentPreview";

export function formatScheduleWindow(startsAt: string, endsAt: string) {
  const startsAtDate = new Date(startsAt);
  const endsAtDate = new Date(endsAt);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAtDate) + ` - ${new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(endsAtDate)}`;
}

export function formatCurrency(amount: number) {
  return `${amount.toLocaleString()} KRW`;
}

export function getAssignmentBreakdown(assignment: WorkerAssignmentPreview) {
  return [
    { label: "Role", value: assignment.roleCode },
    { label: "Hourly rate", value: formatCurrency(assignment.hourlyRateCents) },
    { label: "Regular hours", value: assignment.regularHours.toString() },
    { label: "Overtime hours", value: assignment.overtimeHours.toString() },
    { label: "Expected pay", value: formatCurrency(assignment.totalPayCents) },
  ];
}