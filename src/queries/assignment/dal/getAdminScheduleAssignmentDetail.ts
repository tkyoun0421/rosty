import "server-only";

import { unstable_cache } from "next/cache";

import type { AdminApplicantAssignmentStatus, AdminScheduleAssignmentDetail } from "#queries/assignment/types/adminScheduleAssignmentDetail";
import { cacheTags } from "#shared/config/cacheTags";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface RoleSlotAssignmentRow {
  worker_user_id: string;
  status: "draft" | "confirmed";
}

interface RoleSlotRow {
  id: string;
  role_code: string;
  headcount: number;
  schedule_assignments: RoleSlotAssignmentRow[] | null;
}

interface ApplicantProfileRow {
  full_name: string | null;
}

interface ApplicationRow {
  worker_user_id: string;
  created_at: string;
  profiles: ApplicantProfileRow | ApplicantProfileRow[] | null;
}

interface AssignmentRoleSlotRow {
  id: string;
  role_code: string;
}

interface AssignmentRow {
  worker_user_id: string;
  schedule_role_slot_id: string;
  status: "draft" | "confirmed";
  schedule_role_slots: AssignmentRoleSlotRow | null;
}

interface ScheduleRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AdminScheduleAssignmentDetail["schedule"]["status"];
  schedule_role_slots: RoleSlotRow[] | null;
  schedule_applications: ApplicationRow[] | null;
  schedule_assignments: AssignmentRow[] | null;
}

function getApplicantName(profile: ApplicationRow["profiles"]): string | null {
  if (Array.isArray(profile)) {
    return profile[0]?.full_name ?? null;
  }

  return profile?.full_name ?? null;
}

function getApplicantAssignmentStatus(status: AssignmentRow["status"] | null): AdminApplicantAssignmentStatus {
  if (status === "confirmed") {
    return "confirmed_assigned";
  }

  if (status === "draft") {
    return "draft_assigned";
  }

  return "unassigned";
}

function mapAssignmentDetail(row: ScheduleRow): AdminScheduleAssignmentDetail {
  const assignmentsByWorkerId = new Map<string, AssignmentRow>();

  for (const assignment of row.schedule_assignments ?? []) {
    const current = assignmentsByWorkerId.get(assignment.worker_user_id);

    if (!current || (current.status === "draft" && assignment.status === "confirmed")) {
      assignmentsByWorkerId.set(assignment.worker_user_id, assignment);
    }
  }

  return {
    schedule: {
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      status: row.status,
    },
    roleSlots: (row.schedule_role_slots ?? []).map((slot) => ({
      id: slot.id,
      roleCode: slot.role_code,
      headcount: slot.headcount,
      assignedCount: (slot.schedule_assignments ?? []).length,
    })),
    applicants: (row.schedule_applications ?? []).map((application) => {
      const assignment = assignmentsByWorkerId.get(application.worker_user_id);

      return {
        workerUserId: application.worker_user_id,
        workerName: getApplicantName(application.profiles),
        appliedAt: application.created_at,
        assignmentStatus: getApplicantAssignmentStatus(assignment?.status ?? null),
        assignedRoleSlotId: assignment?.schedule_role_slot_id ?? null,
        assignedRoleCode: assignment?.schedule_role_slots?.role_code ?? null,
      };
    }),
  };
}

async function runGetAdminScheduleAssignmentDetail(
  scheduleId: string,
  options: { useAdminClient: boolean },
): Promise<AdminScheduleAssignmentDetail | null> {
  const supabase = options.useAdminClient
    ? getAdminSupabaseClient()
    : await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(
      [
        "id",
        "starts_at",
        "ends_at",
        "status",
        "schedule_role_slots(id, role_code, headcount, schedule_assignments(worker_user_id, status))",
        "schedule_applications(worker_user_id, created_at, profiles(full_name))",
        "schedule_assignments(worker_user_id, schedule_role_slot_id, status, schedule_role_slots(id, role_code))",
      ].join(", "),
    )
    .eq("id", scheduleId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapAssignmentDetail(data as unknown as ScheduleRow);
}

export async function getAdminScheduleAssignmentDetail(
  scheduleId: string,
): Promise<AdminScheduleAssignmentDetail | null> {
  const useAdminClient = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const canUseAdminCache = useAdminClient && !process.env.VITEST;

  if (!canUseAdminCache) {
    return await runGetAdminScheduleAssignmentDetail(scheduleId, { useAdminClient });
  }

  const cachedQuery = unstable_cache(
    async () => await runGetAdminScheduleAssignmentDetail(scheduleId, { useAdminClient: true }),
    ["queries:assignment:getAdminScheduleAssignmentDetail", scheduleId],
    {
      tags: [cacheTags.assignments.all, cacheTags.assignments.detail(scheduleId)],
    },
  );

  return await cachedQuery();
}
