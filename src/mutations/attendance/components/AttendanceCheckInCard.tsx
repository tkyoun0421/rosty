"use client";

import { useState, useTransition } from "react";

import { submitAttendanceCheckIn } from "#mutations/attendance/actions/submitAttendanceCheckIn";
import {
  formatAttendanceDateTime,
  getAttendanceBadgeLabel,
  getAttendanceDefaultHelper,
  getAttendanceHeadline,
  getGeolocationErrorMessage,
} from "#mutations/attendance/utils/attendanceCheckIn";
import type { WorkerAttendanceStatus } from "#queries/attendance/types/workerAttendanceStatus";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Badge } from "#shared/ui/badge";
import { Button } from "#shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface AttendanceCheckInCardProps {
  assignmentId: string;
  roleCode: string;
  attendanceStatus: WorkerAttendanceStatus;
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
      setHelperMessage(`Check-in opens at ${formatAttendanceDateTime(status.checkInOpensAt)}.`);
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

    const confirmed = window.confirm(
      "Submit check-in: Submit this attendance record now? You can only check in once and cannot edit it later.",
    );

    if (!confirmed) {
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
            setHelperMessage(
              "We could not complete check-in. Confirm location access, move inside the venue check-in radius, and try again before the window closes.",
            );
            return;
          }

          if (result.status === "too_early") {
            setHelperMessage(`Check-in opens at ${formatAttendanceDateTime(status.checkInOpensAt)}.`);
            return;
          }

          setHelperMessage(
            "We could not complete check-in. Confirm location access, move inside the venue check-in radius, and try again before the window closes.",
          );
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
    <Card aria-label={`Attendance check-in for ${roleCode}`} className="border-primary/10 bg-background">
      <CardHeader className="gap-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Badge
              variant={
                status.submissionStatus === "submitted"
                  ? status.isLate
                    ? "destructive"
                    : "default"
                  : status.windowStatus === "open"
                    ? "default"
                    : "secondary"
              }
            >
              {getAttendanceBadgeLabel(status)}
            </Badge>
            <CardTitle className="text-xl font-semibold">{getAttendanceHeadline(status)}</CardTitle>
          </div>
          <Button onClick={handleClick} disabled={!canSubmit} aria-disabled={!canSubmit} size="lg">
            {isPending && !isSubmitted ? "Checking in..." : "Check in now"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p className="m-0">Role assignment: {roleCode}</p>
          <p className="m-0">
            {helperMessage ?? getAttendanceDefaultHelper(status, isSecureContextAvailable)}
          </p>
        </div>
        {status.submissionStatus === "submitted" && status.checkedInAt ? (
          <Alert>
            <AlertTitle>Attendance submitted</AlertTitle>
            <AlertDescription>
              Recorded at {formatAttendanceDateTime(status.checkedInAt)}
              {status.isLate ? " and marked late." : "."}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
