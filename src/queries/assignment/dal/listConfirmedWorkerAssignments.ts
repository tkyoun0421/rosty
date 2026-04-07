import "server-only";

import { unstable_cache } from "next/cache";

import type { WorkerAssignmentPreview } from "#queries/assignment/types/workerAssignmentPreview";
import { calculatePayPreview } from "#queries/assignment/utils/calculatePayPreview";
import { cacheTags } from "#shared/config/cacheTags";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface AssignmentScheduleRow {
  starts_at: string;
  ends_at: string;
  status: "confirmed" | "assigning" | "recruiting";
}

interface AssignmentRoleSlotRow {
  id: string;
  role_code: string;
}

interface ConfirmedAssignmentRow {
  id: string;
  schedule_id: string;
  schedule_role_slot_id: string;
  worker_user_id: string;
  status: "draft" | "confirmed";
  schedules: AssignmentScheduleRow | null;
  schedule_role_slots: AssignmentRoleSlotRow | null;
}

interface WorkerRateRow {
  hourly_rate_cents: number;
}

function mapWorkerAssignmentPreview(
  row: ConfirmedAssignmentRow,
  hourlyRateCents: number | null,
): WorkerAssignmentPreview | null {
  if (row.status !== "confirmed" || row.schedules?.status !== "confirmed" || !row.schedule_role_slots) {
    return null;
  }

  const baseAssignment = {
    assignmentId: row.id,
    scheduleId: row.schedule_id,
    scheduleRoleSlotId: row.schedule_role_slot_id,
    roleCode: row.schedule_role_slots.role_code,
    startsAt: row.schedules.starts_at,
    endsAt: row.schedules.ends_at,
  };

  if (hourlyRateCents === null) {
    return {
      ...baseAssignment,
      payStatus: "missing_worker_rate",
      hourlyRateCents: null,
      regularHours: null,
      overtimeHours: null,
      overtimeApplied: false,
      regularPayCents: null,
      overtimePayCents: null,
      totalPayCents: null,
    };
  }

  const payPreview = calculatePayPreview({
    startsAt: row.schedules.starts_at,
    endsAt: row.schedules.ends_at,
    hourlyRateCents,
  });

  return {
    ...baseAssignment,
    payStatus: "ready",
    ...payPreview,
  };
}

async function runListConfirmedWorkerAssignments(
  workerUserId: string,
): Promise<WorkerAssignmentPreview[]> {
  const supabase = await getServerSupabaseClient();
  const [assignmentsResult, workerRateResult] = await Promise.all([
    supabase
      .from("schedule_assignments")
      .select(
        [
          "id",
          "schedule_id",
          "schedule_role_slot_id",
          "worker_user_id",
          "status",
          "schedules!inner(starts_at, ends_at, status)",
          "schedule_role_slots!inner(id, role_code)",
        ].join(", "),
      )
      .eq("worker_user_id", workerUserId)
      .eq("status", "confirmed"),
    supabase
      .from("worker_rates")
      .select("hourly_rate_cents")
      .eq("user_id", workerUserId)
      .maybeSingle(),
  ]);

  if (assignmentsResult.error) {
    throw assignmentsResult.error;
  }

  if (workerRateResult.error) {
    throw workerRateResult.error;
  }

  const workerRateCents =
    (workerRateResult.data as WorkerRateRow | null | undefined)?.hourly_rate_cents ?? null;

  return (((assignmentsResult.data as unknown as ConfirmedAssignmentRow[] | null | undefined) ?? []))
    .map((row) => mapWorkerAssignmentPreview(row, workerRateCents))
    .filter((row): row is WorkerAssignmentPreview => row !== null)
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

export async function listConfirmedWorkerAssignments(
  workerUserId: string,
): Promise<WorkerAssignmentPreview[]> {
  if (process.env.VITEST) {
    return await runListConfirmedWorkerAssignments(workerUserId);
  }

  const cachedQuery = unstable_cache(
    async () => await runListConfirmedWorkerAssignments(workerUserId),
    ["queries:assignment:listConfirmedWorkerAssignments", workerUserId],
    {
      tags: [
        cacheTags.assignments.all,
        cacheTags.assignments.workerConfirmed(workerUserId),
        cacheTags.assignments.workerPayPreview(workerUserId),
      ],
    },
  );

  return await cachedQuery();
}
