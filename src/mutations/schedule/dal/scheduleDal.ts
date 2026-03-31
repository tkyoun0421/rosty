import "server-only";

import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import type { ScheduleInput } from "#mutations/schedule/schemas/schedule";
import type { ScheduleWithRoleSlots } from "#shared/model/schedule";

interface CreateScheduleRpcRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "recruiting" | "assigning" | "confirmed";
  created_by: string;
  created_at: string;
  updated_at: string;
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
