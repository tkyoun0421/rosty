import type {
  AdminAttendanceStatus,
  AdminScheduleAttendanceDetail,
} from "#queries/attendance/types/adminScheduleAttendanceDetail";

export const attendanceStatusLabels: Record<AdminAttendanceStatus, string> = {
  checked_in: "Checked in",
  late: "Late",
  not_checked_in: "Not checked in",
  not_open_yet: "Not open yet",
};

export function formatAttendanceTime(value: string | null) {
  if (!value) {
    return "No check-in recorded";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export function getAttendanceSummaryCards(detail: AdminScheduleAttendanceDetail) {
  return [
    {
      label: "Checked in",
      value: detail.summary.checkedInCount,
      tone: "default" as const,
      helper: "On time",
    },
    {
      label: "Late",
      value: detail.summary.lateCount,
      tone: "destructive" as const,
      helper: "Past start time",
    },
    {
      label: "Not checked in",
      value: detail.summary.notCheckedInCount,
      tone: "secondary" as const,
      helper: "Window already open",
    },
    {
      label: "Not open yet",
      value: detail.summary.notOpenYetCount,
      tone: "secondary" as const,
      helper: "Waiting for window",
    },
  ];
}