import type { HallPayPolicyInput } from '@/features/payroll/model/pay-policy-management';
import { supabaseClient } from '@/shared/lib/supabase/client';

export type SetMemberPayRateInput = {
  userId: string;
  hourlyRate: number | null;
};

type AdminUpsertPayPolicyRow = {
  id: number;
  default_hourly_rate: number | string;
  overtime_threshold_minutes: number;
  overtime_multiplier: number | string;
  updated_by: string;
  updated_at: string;
};

type AdminSetPayRateRow = {
  user_id: string;
  hourly_rate: number | string | null;
  updated_by: string;
  updated_at: string;
  cleared: boolean;
};

export async function upsertHallPayPolicy(
  input: HallPayPolicyInput,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase pay policy management is not configured.');
  }

  const { data, error } = await supabaseClient
    .rpc('admin_upsert_pay_policy', {
      p_default_hourly_rate: input.defaultHourlyRate,
      p_overtime_threshold_minutes: input.overtimeThresholdMinutes,
      p_overtime_multiplier: input.overtimeMultiplier,
    })
    .returns<AdminUpsertPayPolicyRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Hall pay policy could not be saved.');
  }
}

export async function setMemberPayRate(
  input: SetMemberPayRateInput,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase pay policy management is not configured.');
  }

  const { data, error } = await supabaseClient
    .rpc('admin_set_pay_rate', {
      p_user_id: input.userId,
      p_hourly_rate: input.hourlyRate,
    })
    .returns<AdminSetPayRateRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Member pay rate could not be saved.');
  }
}
