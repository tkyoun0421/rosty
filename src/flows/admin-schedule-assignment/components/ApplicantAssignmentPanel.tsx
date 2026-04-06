"use client";

import { startTransition, useState } from "react";

import { AssignmentSummaryCard } from "#flows/admin-schedule-assignment/components/AssignmentSummaryCard";
import { ConfirmAssignmentsDialog } from "#flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog";
import {
  buildDraftAssignmentsPayload,
  buildEditableAssignments,
  buildRoleSlotSummaries,
  buildUpdatedApplicants,
  countAssignmentsByRoleSlot,
} from "#flows/admin-schedule-assignment/utils/adminScheduleAssignment";
import { scheduleStatusLabels } from "#flows/admin-schedules/utils/formatSchedule";
import { submitScheduleAssignmentConfirm } from "#mutations/assignment/actions/submitScheduleAssignmentConfirm";
import { submitScheduleAssignmentDraft } from "#mutations/assignment/actions/submitScheduleAssignmentDraft";
import type { AdminScheduleAssignmentDetail } from "#queries/assignment/types/adminScheduleAssignmentDetail";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Badge } from "#shared/ui/badge";
import { Button } from "#shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface ApplicantAssignmentPanelProps {
  detail: AdminScheduleAssignmentDetail;
}

const applicantStatusLabels = {
  unassigned: "Unassigned",
  draft_assigned: "Draft saved",
  confirmed_assigned: "Confirmed",
} as const;

function selectClassName() {
  return "min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
}

function formatAppliedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function getApplicantBadgeVariant(
  status: keyof typeof applicantStatusLabels,
): "default" | "secondary" | "outline" {
  if (status === "confirmed_assigned") {
    return "outline";
  }

  if (status === "draft_assigned") {
    return "default";
  }

  return "secondary";
}

export function ApplicantAssignmentPanel({ detail }: ApplicantAssignmentPanelProps) {
  const [assignments, setAssignments] = useState(() => buildEditableAssignments(detail));
  const [applicants, setApplicants] = useState(detail.applicants);
  const [scheduleStatus, setScheduleStatus] = useState(detail.schedule.status);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const roleSlotSummaries = buildRoleSlotSummaries(detail.roleSlots, assignments);
  const assignmentCounts = countAssignmentsByRoleSlot(assignments);
  const isLocked = scheduleStatus === "confirmed";

  function updateAssignment(workerUserId: string, scheduleRoleSlotId: string | null) {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.workerUserId === workerUserId
          ? { ...assignment, scheduleRoleSlotId }
          : assignment,
      ),
    );
    setSaveMessage(null);
    setSaveError(null);
    setConfirmMessage(null);
    setConfirmError(null);
  }

  function buildDraftFormData() {
    const formData = new FormData();
    formData.set("scheduleId", detail.schedule.id);
    formData.set("assignments", JSON.stringify(buildDraftAssignmentsPayload(assignments)));

    return formData;
  }

  function saveDraft() {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    setConfirmMessage(null);

    startTransition(async () => {
      try {
        await submitScheduleAssignmentDraft(buildDraftFormData());
        setApplicants(
          buildUpdatedApplicants(
            { ...detail, schedule: { ...detail.schedule, status: "assigning" } },
            assignments,
          ),
        );
        setScheduleStatus("assigning");
        setSaveMessage("Draft saved. You can keep reviewing assignments on this page.");
      } catch {
        setSaveError("Draft save failed.");
      } finally {
        setIsSaving(false);
      }
    });
  }

  function confirmAssignments() {
    setIsConfirming(true);
    setConfirmError(null);
    setSaveError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("scheduleId", detail.schedule.id);

        await submitScheduleAssignmentConfirm(formData);
        setApplicants(
          buildUpdatedApplicants(
            { ...detail, schedule: { ...detail.schedule, status: "confirmed" } },
            assignments,
          ),
        );
        setScheduleStatus("confirmed");
        setConfirmMessage(
          "Assignments confirmed. Workers can now see final roles and pay previews.",
        );
        setSaveMessage(null);
        setIsConfirmDialogOpen(false);
      } catch {
        setConfirmError("Confirmation failed.");
      } finally {
        setIsConfirming(false);
      }
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] xl:items-start">
      <Card aria-label="Applicant assignment controls" className="bg-background">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-2">
              <CardTitle>Applicant assignment controls</CardTitle>
              <p className="m-0 text-sm text-muted-foreground">
                Review applicants by role slot, save the draft in place, and confirm separately
                when staffing is ready to publish.
              </p>
            </div>
            <Badge variant="outline">{scheduleStatusLabels[scheduleStatus]}</Badge>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          {applicants.map((applicant) => {
            const currentSlotId =
              assignments.find((assignment) => assignment.workerUserId === applicant.workerUserId)
                ?.scheduleRoleSlotId ?? "";

            return (
              <article
                key={applicant.workerUserId}
                className="grid gap-4 rounded-2xl border border-border bg-secondary/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <h3 className="m-0 text-base font-semibold">
                      {applicant.workerName ?? applicant.workerUserId}
                    </h3>
                    <p className="m-0 text-sm text-muted-foreground">
                      Applied at {formatAppliedAt(applicant.appliedAt)}
                    </p>
                  </div>
                  <Badge variant={getApplicantBadgeVariant(applicant.assignmentStatus)}>
                    {applicantStatusLabels[applicant.assignmentStatus]}
                  </Badge>
                </div>

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Role slot
                  <select
                    aria-label={`${applicant.workerName ?? applicant.workerUserId} role slot`}
                    className={selectClassName()}
                    disabled={isLocked}
                    value={currentSlotId}
                    onChange={(event) => {
                      const nextSlotId = event.target.value.trim();
                      updateAssignment(
                        applicant.workerUserId,
                        nextSlotId.length === 0 ? null : nextSlotId,
                      );
                    }}
                  >
                    <option value="">Unassigned</option>
                    {detail.roleSlots.map((roleSlot) => {
                      const slotCount = assignmentCounts.get(roleSlot.id) ?? 0;
                      const isCurrentSelection = currentSlotId === roleSlot.id;
                      const isSlotFull = slotCount >= roleSlot.headcount && !isCurrentSelection;

                      return (
                        <option key={roleSlot.id} value={roleSlot.id} disabled={isSlotFull}>
                          {roleSlot.roleCode} ({slotCount}/{roleSlot.headcount})
                        </option>
                      );
                    })}
                  </select>
                </label>
              </article>
            );
          })}
        </CardContent>
      </Card>

      <aside className="grid gap-6">
        <AssignmentSummaryCard roleSlots={roleSlotSummaries} />

        <Card aria-label="Assignment actions" className="bg-background xl:sticky xl:top-6">
          <CardHeader className="gap-3">
            <CardTitle>Assignment actions</CardTitle>
            <p className="m-0 text-sm text-muted-foreground">
              Draft save and final confirm stay separate. Final confirmation publishes worker roles
              and pay previews.
            </p>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-3">
              <Button type="button" onClick={saveDraft} disabled={isSaving || isLocked}>
                {isSaving ? "Saving..." : "Save draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={isConfirming || isLocked}
              >
                {isConfirming ? "Confirming..." : "Confirm assignments"}
              </Button>
            </div>

            {saveMessage ? (
              <Alert>
                <AlertTitle>Status: Draft saved</AlertTitle>
                <AlertDescription>{saveMessage}</AlertDescription>
              </Alert>
            ) : null}

            {confirmMessage ? (
              <Alert>
                <AlertTitle>Status: Confirmed</AlertTitle>
                <AlertDescription>{confirmMessage}</AlertDescription>
              </Alert>
            ) : null}

            {saveError ? (
              <Alert variant="destructive">
                <AlertTitle>Draft save failed.</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            ) : null}

            {confirmError ? (
              <Alert variant="destructive">
                <AlertTitle>Confirmation failed.</AlertTitle>
                <AlertDescription>{confirmError}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </aside>

      <ConfirmAssignmentsDialog
        open={isConfirmDialogOpen}
        roleSlots={roleSlotSummaries}
        submitting={isConfirming}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmAssignments}
      />
    </section>
  );
}
