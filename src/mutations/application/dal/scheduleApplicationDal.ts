import "server-only";

import type { ScheduleStatus } from "#shared/model/schedule";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface RecruitingScheduleRow {
  id: string;
  status: ScheduleStatus;
}

interface ScheduleApplicationRow {
  id: string;
  schedule_id: string;
  worker_user_id: string;
  created_at: string;
}

export interface ScheduleApplicationRecord {
  id: string;
  scheduleId: string;
  workerUserId: string;
  createdAt: string;
}

export async function getRecruitingScheduleById(scheduleId: string): Promise<RecruitingScheduleRow | null> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("id, status")
    .eq("id", scheduleId)
    .eq("status", "recruiting")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as RecruitingScheduleRow | null) ?? null;
}

function mapScheduleApplication(row: ScheduleApplicationRow): ScheduleApplicationRecord {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    workerUserId: row.worker_user_id,
    createdAt: row.created_at,
  };
}

function isAlreadyAppliedError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeCode = "code" in error ? error.code : undefined;
  const maybeMessage = "message" in error ? error.message : undefined;

  return maybeCode === "23505" || maybeMessage === "ALREADY_APPLIED";
}

export async function insertScheduleApplication(input: {
  scheduleId: string;
  workerUserId: string;
}): Promise<ScheduleApplicationRecord> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedule_applications")
    .insert({
      schedule_id: input.scheduleId,
      worker_user_id: input.workerUserId,
    })
    .select("id, schedule_id, worker_user_id, created_at")
    .single();

  if (error) {
    if (isAlreadyAppliedError(error)) {
      throw new Error("ALREADY_APPLIED");
    }

    throw error;
  }

  return mapScheduleApplication(data as ScheduleApplicationRow);
}
