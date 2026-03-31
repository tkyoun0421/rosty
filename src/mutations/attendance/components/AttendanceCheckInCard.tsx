"use client";

import { useState, useTransition } from "react";

import { submitAttendanceCheckIn } from "#mutations/attendance/actions/submitAttendanceCheckIn";
import type { WorkerAttendanceStatus } from "#queries/attendance/types/workerAttendanceStatus";

interface AttendanceCheckInCardProps {
  assignmentId: string;
  roleCode: string;
  attendanceStatus: WorkerAttendanceStatus;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getHeadline(status: WorkerAttendanceStatus) {
  if (status.submissionStatus === "submitted") {
    return "Check-in recorded";
  }

  return status.windowStatus === "open" ? "Check-in open" : "Check-in not open yet";
}

function getDefaultHelper(status: WorkerAttendanceStatus, isSecureContextAvailable: boolean) {
  if (status.submissionStatus === "submitted") {
    if (status.checkedInAt) {
      return `Submitted at ${formatDateTime(status.checkedInAt)}${status.isLate ? " (Late)." : "."}`;
    }

    return "This assignment already has a submitted check-in.";
  }

  if (status.windowStatus === "open") {
    if (!isSecureContextAvailable) {
      return "Check-in requires a secure connection (HTTPS). Please reload this page in a secure context.";
    }

    return "We will ask for your current location before sending the check-in.";
  }

  return `Check-in opens at ${formatDateTime(status.checkInOpensAt)}.`;
}

function getGeolocationErrorMessage(code: number) {
  if (code === 1) {
    return "Location access was denied. Allow location permission to check in.";
  }

  if (code === 3) {
    return "Location request timed out. Try again while staying near the venue.";
  }

  return "Current location is unavailable. Try again after your device can provide a position.";
}

export function AttendanceCheckInCard({
  assignmentId,
  roleCode,
  attendanceStatus,
}: AttendanceCheckInCardProps) {
  const [status, setStatus] = useState(attendanceStatus);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isSecureContextAvailable = typeof window === "undefined" ? true : window.isSecureContext;
  const isSubmitted = status.submissionStatus === "submitted";
  const canSubmit = status.windowStatus === "open" && !isSubmitted && !isPending && isSecureContextAvailable;

  const handleClick = () => {
    if (isSubmitted) {
      setHelperMessage("This assignment already has a submitted check-in.");
      return;
    }

    if (status.windowStatus !== "open") {
      setHelperMessage(`Check-in opens at ${formatDateTime(status.checkInOpensAt)}.`);
      return;
    }

    if (!isSecureContextAvailable) {
      setHelperMessage("Check-in requires a secure connection (HTTPS). Please reload this page in a secure context.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setHelperMessage("This browser does not support location access for check-in.");
      return;
    }

    setHelperMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("scheduleAssignmentId", assignmentId);
          formData.set("latitude", String(position.coords.latitude));
          formData.set("longitude", String(position.coords.longitude));
          if (typeof position.coords.accuracy === "number") {
            formData.set("accuracyMeters", String(position.coords.accuracy));
          }

          const result = await submitAttendanceCheckIn(formData);

          if (result.status === "success") {
            setStatus((currentStatus) => ({
              ...currentStatus,
              windowStatus: "submitted",
              submissionStatus: "submitted",
              checkedInAt: result.attendance.checkedInAt,
              isLate: result.attendance.isLate,
            }));
            setHelperMessage(null);
            return;
          }

          if (result.status === "duplicate") {
            setStatus((currentStatus) => ({
              ...currentStatus,
              windowStatus: "submitted",
              submissionStatus: "submitted",
            }));
            setHelperMessage("This assignment already has a submitted check-in.");
            return;
          }

          if (result.status === "out_of_radius") {
            setHelperMessage("You are outside the allowed venue check-in radius.");
            return;
          }

          if (result.status === "too_early") {
            setHelperMessage(`Check-in opens at ${formatDateTime(status.checkInOpensAt)}.`);
            return;
          }

          setHelperMessage("We could not complete check-in. Confirm location access and try again.");
        });
      },
      (error) => {
        setHelperMessage(getGeolocationErrorMessage(error.code));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <section aria-label={`Attendance check-in for ${roleCode}`}>
      <h4>{getHeadline(status)}</h4>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        {isPending ? "Checking in..." : "Check in now"}
      </button>
      <p>{helperMessage ?? getDefaultHelper(status, isSecureContextAvailable)}</p>
    </section>
  );
}