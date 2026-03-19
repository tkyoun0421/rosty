import { useQuery } from '@tanstack/react-query';

import type { UserRole } from '@/features/auth/model/auth-types';
import type { MemberStatus } from '@/features/members/model/member-management';
import type {
  HallPayPolicy,
  PayPolicySnapshot,
} from '@/features/payroll/model/pay-policy-management';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';

export const payPolicyQueryKey = ['pay-policy'] as const;

type PayPolicyRow = {
  id: number;
  default_hourly_rate: number | string;
  overtime_threshold_minutes: number;
  overtime_multiplier: number | string;
  updated_by: string | null;
  updated_at: string | null;
};

type PayRateRow = {
  user_id: string;
  hourly_rate: number | string;
};

type PayPolicyMemberRow = {
  id: string;
  full_name: string;
  role: UserRole;
  status: MemberStatus;
};

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

function mapHallPayPolicy(row: PayPolicyRow | null): HallPayPolicy | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    defaultHourlyRate: toNumber(row.default_hourly_rate),
    overtimeThresholdMinutes: row.overtime_threshold_minutes,
    overtimeMultiplier: toNumber(row.overtime_multiplier),
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  };
}

export async function fetchPayPolicySnapshot(): Promise<PayPolicySnapshot> {
  if (!supabaseClient) {
    return {
      policy: null,
      members: [],
    };
  }

  const [policyResult, payRatesResult, membersResult] = await Promise.all([
    supabaseClient
      .from('pay_policies')
      .select(
        'id, default_hourly_rate, overtime_threshold_minutes, overtime_multiplier, updated_by, updated_at',
      )
      .limit(1)
      .returns<PayPolicyRow[]>(),
    supabaseClient
      .from('pay_rates')
      .select('user_id, hourly_rate')
      .returns<PayRateRow[]>(),
    supabaseClient
      .from('profiles')
      .select('id, full_name, role, status')
      .neq('status', 'deactivated')
      .order('full_name', { ascending: true })
      .returns<PayPolicyMemberRow[]>(),
  ]);

  if (policyResult.error) {
    throw new Error(policyResult.error.message);
  }

  if (payRatesResult.error) {
    throw new Error(payRatesResult.error.message);
  }

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  const payRatesByUserId = new Map(
    (payRatesResult.data ?? []).map((payRate) => [
      payRate.user_id,
      toNumber(payRate.hourly_rate),
    ]),
  );

  return {
    policy: mapHallPayPolicy(policyResult.data?.[0] ?? null),
    members: (membersResult.data ?? []).map((member) => ({
      id: member.id,
      fullName: member.full_name,
      role: member.role,
      status: member.status,
      hourlyRate: payRatesByUserId.get(member.id) ?? null,
    })),
  };
}

export function usePayPolicyQuery(enabled = true) {
  return useQuery({
    queryKey: payPolicyQueryKey,
    queryFn: fetchPayPolicySnapshot,
    enabled: enabled && hasSupabaseConfig,
    staleTime: 15_000,
  });
}
