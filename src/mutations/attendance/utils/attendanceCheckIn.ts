import type { WorkerAttendanceStatus } from "#queries/attendance/types/workerAttendanceStatus";

export function formatAttendanceDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getAttendanceHeadline(status: WorkerAttendanceStatus) {
  if (status.submissionStatus === "submitted") {
    return "Check-in recorded";
  }

  return status.windowStatus === "open" ? "Check-in open" : "Check-in not open yet";
}

export function getAttendanceBadgeLabel(status: WorkerAttendanceStatus) {
  if (status.submissionStatus === "submitted") {
    return status.isLate ? "Late" : "Checked in";
  }

  return status.windowStatus === "open" ? "Check-in open" : "Not open yet";
}

export function getAttendanceDefaultHelper(
  status: WorkerAttendanceStatus,
  isSecureContextAvailable: boolean,
) {
  if (status.submissionStatus === "submitted") {
    if (status.checkedInAt) {
      return `Submitted at ${formatAttendanceDateTime(status.checkedInAt)}${status.isLate ? " (Late)." : "."}`;
    }

    return "This assignment already has a submitted check-in.";
  }

  if (status.windowStatus === "open") {
    if (!isSecureContextAvailable) {
      return "Check-in requires a secure connection (HTTPS). Please reload this page in a secure context.";
    }

    return "We will ask for your current location before sending the check-in.";
  }

  return `Check-in opens at ${formatAttendanceDateTime(status.checkInOpensAt)}.`;
}

export function getGeolocationErrorMessage(code: number) {
  if (code === 1) {
    return "Location access was denied. Allow location permission to check in.";
  }

  if (code === 3) {
    return "Location request timed out. Try again while staying near the venue.";
  }

  return "Current location is unavailable. Try again after your device can provide a position.";
}
