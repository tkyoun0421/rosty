"use client";

import { startTransition, useState } from "react";

import { submitScheduleAssignmentConfirm } from "#mutations/assignment/actions/submitScheduleAssignmentConfirm";
import { submitScheduleAssignmentDraft } from "#mutations/assignment/actions/submitScheduleAssignmentDraft";
import type { AdminScheduleAssignmentDetail } from "#queries/assignment/types/adminScheduleAssignmentDetail";
import { AssignmentSummaryCard } from "#flows/admin-schedule-assignment/components/AssignmentSummaryCard";
import { ConfirmAssignmentsDialog } from "#flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog";
import {
  buildDraftAssignmentsPayload,
  buildEditableAssignments,
  buildRoleSlotSummaries,
  buildUpdatedApplicants,
  countAssignmentsByRoleSlot,
  formatScheduleWindow,
} from "#flows/admin-schedule-assignment/utils/adminScheduleAssignment";

interface ApplicantAssignmentPanelProps {
  detail: AdminScheduleAssignmentDetail;
}

const applicantStatusLabels = {
  unassigned: "Unassigned",
  draft_assigned: "Draft saved",
  confirmed_assigned: "Confirmed",
} as const;

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
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Draft save failed.");
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
      } catch (error) {
        setConfirmError(error instanceof Error ? error.message : "Confirmation failed.");
      } finally {
        setIsConfirming(false);
      }
    });
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "32px",
      }}
    >
      <section aria-label="Schedule facts" style={{ display: "grid", gap: "8px" }}>
        <h1 style={{ margin: 0 }}>Schedule assignment detail</h1>
        <p style={{ margin: 0 }}>
          {formatScheduleWindow(detail.schedule.startsAt, detail.schedule.endsAt)}
        </p>
        <p style={{ margin: 0 }}>Status: {scheduleStatus}</p>
      </section>

      <div
        className="assignment-layout"
        style={{
          display: "grid",
          gap: "32px",
        }}
      >
        <aside
          className="assignment-summary"
          style={{
            alignContent: "start",
            display: "grid",
            gap: "24px",
          }}
        >
          <AssignmentSummaryCard roleSlots={roleSlotSummaries} />
        </aside>

        <section
          className="assignment-applicants"
          aria-label="Applicant assignment controls"
          style={{ display: "grid", gap: "16px" }}
        >
          <h2 style={{ margin: 0 }}>Applicant assignment controls</h2>
          <p style={{ margin: 0 }}>
            Review applicants by slot, save the draft in place, and confirm separately when ready.
          </p>
          <ul style={{ display: "grid", gap: "16px", listStyle: "none", margin: 0, padding: 0 }}>
            {applicants.map((applicant) => {
              const currentSlotId =
                assignments.find((assignment) => assignment.workerUserId === applicant.workerUserId)
                  ?.scheduleRoleSlotId ?? "";

              return (
                <li
                  key={applicant.workerUserId}
                  style={{
                    backgroundColor: "#F6F1E8",
                    border: "1px solid #E4DACB",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <article style={{ display: "grid", gap: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>
                        {applicant.workerName ?? applicant.workerUserId}
                      </h3>
                      <p style={{ margin: "8px 0 0" }}>
                        Applied at: {applicant.appliedAt.slice(0, 16)}
                      </p>
                      <p style={{ margin: "4px 0 0", color: "#1F5A6E", fontWeight: 600 }}>
                        Status: {applicantStatusLabels[applicant.assignmentStatus]}
                      </p>
                    </div>

                    <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
                      Role slot
                      <select
                        aria-label={`${applicant.workerName ?? applicant.workerUserId} role slot`}
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
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="assignment-actions"
          aria-label="Assignment actions"
          style={{
            backgroundColor: "#E4DACB",
            borderRadius: "16px",
            bottom: "24px",
            display: "grid",
            gap: "12px",
            padding: "24px",
            position: "sticky",
          }}
        >
          <h2 style={{ margin: 0 }}>Assignment actions</h2>
          <p style={{ margin: 0 }}>Draft save and final confirm stay separate.</p>
          <button type="button" onClick={saveDraft} disabled={isSaving || isLocked}>
            {isSaving ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmDialogOpen(true)}
            disabled={isConfirming || isLocked}
          >
            {isConfirming ? "Confirming..." : "Confirm assignments"}
          </button>
          {saveMessage ? (
            <p role="status" style={{ margin: 0 }}>
              {saveMessage}
            </p>
          ) : null}
          {confirmMessage ? (
            <p role="status" style={{ margin: 0 }}>
              {confirmMessage}
            </p>
          ) : null}
          {saveError ? (
            <p role="alert" style={{ color: "#B42318", margin: 0 }}>
              {saveError}
            </p>
          ) : null}
          {confirmError ? (
            <p role="alert" style={{ color: "#B42318", margin: 0 }}>
              {confirmError}
            </p>
          ) : null}
        </section>
      </div>

      <style>{`
        .assignment-layout {
          grid-template-areas:
            "summary"
            "applicants"
            "actions";
          grid-template-columns: minmax(0, 1fr);
        }

        .assignment-summary {
          grid-area: summary;
        }

        .assignment-applicants {
          grid-area: applicants;
        }

        .assignment-actions {
          grid-area: actions;
        }

        @media (min-width: 960px) {
          .assignment-layout {
            align-items: start;
            grid-template-areas:
              "applicants summary"
              "applicants actions";
            grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
          }
        }
      `}</style>

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
