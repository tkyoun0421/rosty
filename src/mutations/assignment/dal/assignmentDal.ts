import "server-only";

import type { SaveScheduleAssignmentDraftPayload } from "#mutations/assignment/schemas/saveScheduleAssignmentDraft";
import type { ScheduleAssignmentRecord } from "#shared/model/assignment";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

const assignmentSelect = [
  "id",
  "schedule_id",
  "schedule_role_slot_id",
  "worker_user_id",
  "status",
  "confirmed_at",
  "confirmed_by",
  "created_at",
  "updated_at",
].join(", ");

interface RoleSlotRow {
  id: string;
  headcount: number;
}

interface ApplicationRow {
  worker_user_id: string;
}

interface AssignmentRow {
  id: string;
  schedule_id: string;
  schedule_role_slot_id: string;
  worker_user_id: string;
  status: "draft" | "confirmed";
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ConfirmScheduleAssignmentDraftInput {
  scheduleId: string;
  confirmedBy: string;
}

export interface ConfirmScheduleAssignmentResult {
  confirmedAssignments: ScheduleAssignmentRecord[];
  unfilledSlotIds: string[];
}

function mapAssignmentRow(row: AssignmentRow): ScheduleAssignmentRecord {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    scheduleRoleSlotId: row.schedule_role_slot_id,
    workerUserId: row.worker_user_id,
    status: row.status,
    confirmedAt: row.confirmed_at,
    confirmedBy: row.confirmed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAssignmentAdminMutationClient() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? getAdminSupabaseClient()
    : await getServerSupabaseClient();
}

function getUnfilledSlotIds(roleSlots: RoleSlotRow[], assignments: ScheduleAssignmentRecord[]) {
  const assignmentCountBySlotId = new Map<string, number>();

  for (const assignment of assignments) {
    assignmentCountBySlotId.set(
      assignment.scheduleRoleSlotId,
      (assignmentCountBySlotId.get(assignment.scheduleRoleSlotId) ?? 0) + 1,
    );
  }

  return roleSlots
    .filter((slot) => (assignmentCountBySlotId.get(slot.id) ?? 0) < slot.headcount)
    .map((slot) => slot.id);
}

function validateDraftPayload(input: SaveScheduleAssignmentDraftPayload, roleSlots: RoleSlotRow[], applications: ApplicationRow[]) {
  const roleSlotHeadcountById = new Map(roleSlots.map((slot) => [slot.id, slot.headcount]));
  const applicantIds = new Set(applications.map((application) => application.worker_user_id));
  const assignmentCountBySlotId = new Map<string, number>();

  for (const assignment of input.assignments) {
    if (!roleSlotHeadcountById.has(assignment.scheduleRoleSlotId)) {
      throw new Error("SCHEDULE_ROLE_SLOT_NOT_FOUND");
    }

    if (!applicantIds.has(assignment.workerUserId)) {
      throw new Error("WORKER_NOT_APPLICANT");
    }

    const nextCount = (assignmentCountBySlotId.get(assignment.scheduleRoleSlotId) ?? 0) + 1;
    assignmentCountBySlotId.set(assignment.scheduleRoleSlotId, nextCount);

    if (nextCount > (roleSlotHeadcountById.get(assignment.scheduleRoleSlotId) ?? 0)) {
      throw new Error("ROLE_SLOT_CAPACITY_EXCEEDED");
    }
  }
}

export async function replaceScheduleAssignmentDraft(
  input: SaveScheduleAssignmentDraftPayload,
): Promise<ScheduleAssignmentRecord[]> {
  const supabase = await getAssignmentAdminMutationClient();

  const { data: roleSlots, error: roleSlotsError } = await supabase
    .from("schedule_role_slots")
    .select("id, headcount")
    .eq("schedule_id", input.scheduleId);

  if (roleSlotsError) {
    throw roleSlotsError;
  }

  const { data: applications, error: applicationsError } = await supabase
    .from("schedule_applications")
    .select("worker_user_id")
    .eq("schedule_id", input.scheduleId);

  if (applicationsError) {
    throw applicationsError;
  }

  validateDraftPayload(input, (roleSlots ?? []) as RoleSlotRow[], (applications ?? []) as ApplicationRow[]);

  const { data: existingDraftRows, error: existingDraftRowsError } = await supabase
    .from("schedule_assignments")
    .select(assignmentSelect)
    .eq("schedule_id", input.scheduleId)
    .eq("status", "draft");

  if (existingDraftRowsError) {
    throw existingDraftRowsError;
  }

  const existingDraftsByWorkerId = new Map(
    ((existingDraftRows ?? []) as unknown as AssignmentRow[]).map((row) => [row.worker_user_id, row]),
  );
  const savedRowsByWorkerId = new Map<string, ScheduleAssignmentRecord>();
  const desiredWorkerIds = new Set(input.assignments.map((assignment) => assignment.workerUserId));

  for (const assignment of input.assignments) {
    const existingDraft = existingDraftsByWorkerId.get(assignment.workerUserId);

    if (!existingDraft) {
      continue;
    }

    if (existingDraft.schedule_role_slot_id === assignment.scheduleRoleSlotId) {
      savedRowsByWorkerId.set(assignment.workerUserId, mapAssignmentRow(existingDraft));
      continue;
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from("schedule_assignments")
      .update({
        schedule_role_slot_id: assignment.scheduleRoleSlotId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingDraft.id)
      .select(assignmentSelect)
      .single();

    if (updateError) {
      throw updateError;
    }

    savedRowsByWorkerId.set(assignment.workerUserId, mapAssignmentRow(updatedRow as unknown as AssignmentRow));
  }

  const rowsToInsert = input.assignments.filter((assignment) => !existingDraftsByWorkerId.has(assignment.workerUserId));

  if (rowsToInsert.length > 0) {
    const { data: insertedRows, error: insertError } = await supabase
      .from("schedule_assignments")
      .insert(
        rowsToInsert.map((assignment) => ({
          schedule_id: input.scheduleId,
          schedule_role_slot_id: assignment.scheduleRoleSlotId,
          worker_user_id: assignment.workerUserId,
          status: "draft",
        })),
      )
      .select(assignmentSelect);

    if (insertError) {
      throw insertError;
    }

    for (const row of (insertedRows ?? []) as unknown as AssignmentRow[]) {
      savedRowsByWorkerId.set(row.worker_user_id, mapAssignmentRow(row));
    }
  }

  const rowsToDelete = ((existingDraftRows ?? []) as unknown as AssignmentRow[])
    .filter((row) => !desiredWorkerIds.has(row.worker_user_id))
    .map((row) => row.id);

  if (rowsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("schedule_assignments")
      .delete()
      .eq("schedule_id", input.scheduleId)
      .eq("status", "draft")
      .in("id", rowsToDelete);

    if (deleteError) {
      throw deleteError;
    }
  }

  return input.assignments.map((assignment) => {
    const savedRow = savedRowsByWorkerId.get(assignment.workerUserId);

    if (!savedRow) {
      throw new Error("SCHEDULE_ASSIGNMENT_SAVE_FAILED");
    }

    return savedRow;
  });
}

export async function confirmScheduleAssignmentDraft(
  input: ConfirmScheduleAssignmentDraftInput,
): Promise<ConfirmScheduleAssignmentResult> {
  const supabase = await getAssignmentAdminMutationClient();

  const { data: roleSlots, error: roleSlotsError } = await supabase
    .from("schedule_role_slots")
    .select("id, headcount")
    .eq("schedule_id", input.scheduleId);

  if (roleSlotsError) {
    throw roleSlotsError;
  }

  const { data, error } = await supabase.rpc("confirm_schedule_assignments", {
    p_schedule_id: input.scheduleId,
    p_confirmed_by: input.confirmedBy,
  });

  if (error) {
    throw new Error(error.message);
  }

  const confirmedAssignments = ((data ?? []) as unknown as AssignmentRow[]).map(mapAssignmentRow);

  return {
    confirmedAssignments,
    unfilledSlotIds: getUnfilledSlotIds((roleSlots ?? []) as RoleSlotRow[], confirmedAssignments),
  };
}
