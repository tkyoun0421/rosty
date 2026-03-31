import "server-only";

import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import type { ScheduleInput } from "#mutations/schedule/schemas/schedule";
import type { ScheduleStatus, ScheduleWithRoleSlots } from "#shared/model/schedule";

interface CreateScheduleRpcRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "recruiting" | "assigning" | "confirmed";
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ScheduleRoleSlotRow {
  role_code: string;
  headcount: number;
}

interface ScheduleRecordRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: ScheduleStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  schedule_role_slots: ScheduleRoleSlotRow[] | null;
}

function mapScheduleWithRoleSlots(row: ScheduleRecordRow): ScheduleWithRoleSlots {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    roleSlots: (row.schedule_role_slots ?? []).map((slot) => ({
      roleCode: slot.role_code,
      headcount: slot.headcount,
    })),
  };
}

export async function createScheduleRecord(
  input: ScheduleInput & { createdBy: string },
): Promise<ScheduleWithRoleSlots> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.rpc("create_schedule_with_slots", {
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_created_by: input.createdBy,
    p_slots: input.roleSlots,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Schedule create RPC returned no data.");
  }

  const row = data as CreateScheduleRpcRow;

  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    roleSlots: input.roleSlots,
  };
}

export async function updateScheduleRecordStatus(input: {
  scheduleId: string;
  status: Extract<ScheduleStatus, "recruiting" | "assigning">;
}): Promise<ScheduleWithRoleSlots> {
  const supabase = getAdminSupabaseClient();
  const { data: currentSchedule, error: currentScheduleError } = await supabase
    .from("schedules")
    .select("status")
    .eq("id", input.scheduleId)
    .maybeSingle();

  if (currentScheduleError) {
    throw currentScheduleError;
  }

  if (!currentSchedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  if (currentSchedule.status === "confirmed") {
    throw new Error("CONFIRMED_SCHEDULE_STATUS_LOCKED");
  }

  if (currentSchedule.status === input.status) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const { data, error } = await supabase
    .from("schedules")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.scheduleId)
    .select("id, starts_at, ends_at, status, created_by, created_at, updated_at, schedule_role_slots(role_code, headcount)")
    .single();

  if (error) {
    throw error;
  }

  return mapScheduleWithRoleSlots(data as ScheduleRecordRow);
}
