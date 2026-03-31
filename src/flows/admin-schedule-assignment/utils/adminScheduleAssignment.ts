import type { AdminScheduleAssignmentDetail } from "#queries/assignment/types/adminScheduleAssignmentDetail";

export interface EditableAssignment {
  workerUserId: string;
  scheduleRoleSlotId: string | null;
}

export interface RoleSlotSummary {
  id: string;
  roleCode: string;
  headcount: number;
  assignedCount: number;
  unfilledCount: number;
}

export function buildEditableAssignments(
  detail: AdminScheduleAssignmentDetail,
): EditableAssignment[] {
  return detail.applicants.map((applicant) => ({
    workerUserId: applicant.workerUserId,
    scheduleRoleSlotId: applicant.assignedRoleSlotId,
  }));
}

export function buildDraftAssignmentsPayload(assignments: EditableAssignment[]) {
  return assignments
    .filter((assignment) => assignment.scheduleRoleSlotId !== null)
    .map((assignment) => ({
      scheduleRoleSlotId: assignment.scheduleRoleSlotId as string,
      workerUserId: assignment.workerUserId,
    }));
}

export function countAssignmentsByRoleSlot(assignments: EditableAssignment[]) {
  const counts = new Map<string, number>();

  for (const assignment of assignments) {
    if (!assignment.scheduleRoleSlotId) {
      continue;
    }

    counts.set(assignment.scheduleRoleSlotId, (counts.get(assignment.scheduleRoleSlotId) ?? 0) + 1);
  }

  return counts;
}

export function buildRoleSlotSummaries(
  roleSlots: AdminScheduleAssignmentDetail["roleSlots"],
  assignments: EditableAssignment[],
): RoleSlotSummary[] {
  const counts = countAssignmentsByRoleSlot(assignments);

  return roleSlots.map((slot) => {
    const assignedCount = counts.get(slot.id) ?? 0;

    return {
      id: slot.id,
      roleCode: slot.roleCode,
      headcount: slot.headcount,
      assignedCount,
      unfilledCount: Math.max(slot.headcount - assignedCount, 0),
    };
  });
}

export function buildUpdatedApplicants(
  detail: AdminScheduleAssignmentDetail,
  assignments: EditableAssignment[],
): AdminScheduleAssignmentDetail["applicants"] {
  const roleCodeBySlotId = new Map(detail.roleSlots.map((slot) => [slot.id, slot.roleCode]));
  const assignmentByWorkerId = new Map(
    assignments.map((assignment) => [assignment.workerUserId, assignment]),
  );

  return detail.applicants.map((applicant) => {
    const assignment = assignmentByWorkerId.get(applicant.workerUserId);
    const assignedRoleSlotId = assignment?.scheduleRoleSlotId ?? null;

    if (!assignedRoleSlotId) {
      return {
        ...applicant,
        assignmentStatus: "unassigned",
        assignedRoleSlotId: null,
        assignedRoleCode: null,
      };
    }

    return {
      ...applicant,
      assignmentStatus:
        detail.schedule.status === "confirmed" ? "confirmed_assigned" : "draft_assigned",
      assignedRoleSlotId,
      assignedRoleCode: roleCodeBySlotId.get(assignedRoleSlotId) ?? null,
    };
  });
}

export function formatScheduleWindow(startsAt: string, endsAt: string) {
  return `${startsAt.slice(0, 10)} ${startsAt.slice(11, 16)} - ${endsAt.slice(11, 16)}`;
}
