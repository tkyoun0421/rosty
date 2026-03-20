import { useQuery } from '@tanstack/react-query';

import {
  createTeamPayrollSnapshot,
  type TeamPayrollSnapshot,
  type TeamPayrollSource,
} from '@/features/payroll/model/team-payroll';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';

export const teamPayrollQueryKey = ['team-payroll'] as const;

export type TeamPayrollSnapshotResult = TeamPayrollSnapshot & {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
};

type PayPolicyRow = {
  default_hourly_rate: number | string;
  overtime_threshold_minutes: number;
  overtime_multiplier: number | string;
};

type PayRateRow = {
  user_id: string;
  hourly_rate: number | string;
};

type MemberRow = {
  id: string;
  full_name: string;
  role: 'employee' | 'manager' | 'admin';
  status: 'profile_incomplete' | 'pending_approval' | 'active' | 'suspended' | 'deactivated';
};

type AssignmentRow = {
  id: string;
  schedule_id: string;
  assignee_user_id: string | null;
  status: 'proposed' | 'confirmed' | 'cancel_requested' | 'cancelled' | 'completed';
};

type ScheduleRow = {
  id: string;
  event_date: string;
  package_count: number;
  memo: string | null;
};

type ScheduleTimeRecordRow = {
  schedule_id: string;
  actual_start_at: string | null;
  actual_end_at: string | null;
};

const teamPayrollSeedSource: TeamPayrollSource = {
  policy: {
    defaultHourlyRate: 12000,
    overtimeThresholdMinutes: 480,
    overtimeMultiplier: 1.5,
  },
  members: [
    {
      id: 'member-1',
      fullName: 'Mina Staff',
      role: 'employee',
      hourlyRate: 14000,
    },
    {
      id: 'member-2',
      fullName: 'Sera Staff',
      role: 'employee',
      hourlyRate: null,
    },
    {
      id: 'member-3',
      fullName: 'Joon Manager',
      role: 'manager',
      hourlyRate: null,
    },
  ],
  assignments: [
    {
      id: 'assignment-1',
      scheduleId: 'schedule-1',
      assigneeUserId: 'member-1',
      positionName: 'Bride room',
      status: 'confirmed',
    },
    {
      id: 'assignment-2',
      scheduleId: 'schedule-1',
      assigneeUserId: 'member-1',
      positionName: 'Guest hall',
      status: 'confirmed',
    },
    {
      id: 'assignment-3',
      scheduleId: 'schedule-2',
      assigneeUserId: 'member-2',
      positionName: 'Banquet',
      status: 'completed',
    },
    {
      id: 'assignment-4',
      scheduleId: 'schedule-4',
      assigneeUserId: 'member-1',
      positionName: 'Reception',
      status: 'confirmed',
    },
  ],
  scheduleTimeRecords: [
    {
      scheduleId: 'schedule-1',
      scheduleTitle: 'March 23 Grand Hall wedding',
      actualStartAt: '2026-03-23T01:00:00.000Z',
      actualEndAt: '2026-03-23T09:00:00.000Z',
    },
    {
      scheduleId: 'schedule-2',
      scheduleTitle: 'March 24 Garden Hall reception',
      actualStartAt: '2026-03-24T00:00:00.000Z',
      actualEndAt: '2026-03-24T10:30:00.000Z',
    },
    {
      scheduleId: 'schedule-4',
      scheduleTitle: 'March 29 Convention Hall banquet',
      actualStartAt: null,
      actualEndAt: null,
    },
  ],
};

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

function buildScheduleTitle(schedule: ScheduleRow): string {
  const dateLabel = schedule.event_date;
  const packageLabel = `${schedule.package_count} packages`;

  return schedule.memo && schedule.memo.trim().length > 0
    ? `${dateLabel} · ${schedule.memo.trim()}`
    : `${dateLabel} · ${packageLabel}`;
}

export function mapLiveTeamPayrollSource(input: {
  policy: PayPolicyRow;
  payRates: PayRateRow[];
  members: MemberRow[];
  assignments: AssignmentRow[];
  schedules: ScheduleRow[];
  scheduleTimeRecords: ScheduleTimeRecordRow[];
}): TeamPayrollSource {
  const payRatesByUserId = new Map(
    input.payRates.map((payRate) => [payRate.user_id, toNumber(payRate.hourly_rate)]),
  );
  const schedulesById = new Map(
    input.schedules.map((schedule) => [schedule.id, schedule]),
  );

  return {
    policy: {
      defaultHourlyRate: toNumber(input.policy.default_hourly_rate),
      overtimeThresholdMinutes: input.policy.overtime_threshold_minutes,
      overtimeMultiplier: toNumber(input.policy.overtime_multiplier),
    },
    members: input.members
      .filter((member) => member.status !== 'deactivated')
      .map((member) => ({
        id: member.id,
        fullName: member.full_name,
        role: member.role,
        hourlyRate: payRatesByUserId.get(member.id) ?? null,
      })),
    assignments: input.assignments.map((assignment) => ({
      id: assignment.id,
      scheduleId: assignment.schedule_id,
      assigneeUserId: assignment.assignee_user_id,
      positionName: 'Assigned slot',
      status: assignment.status,
    })),
    scheduleTimeRecords: input.scheduleTimeRecords
      .map((record) => {
        const schedule = schedulesById.get(record.schedule_id);

        if (!schedule) {
          return null;
        }

        return {
          scheduleId: record.schedule_id,
          scheduleTitle: buildScheduleTitle(schedule),
          actualStartAt: record.actual_start_at,
          actualEndAt: record.actual_end_at,
        };
      })
      .filter((record): record is TeamPayrollSource['scheduleTimeRecords'][number] =>
        record !== null,
      ),
  };
}

function createSeedTeamPayrollSnapshotResult(
  message: string | null,
): TeamPayrollSnapshotResult {
  return {
    ...createTeamPayrollSnapshot(teamPayrollSeedSource),
    source: 'seed',
    sourceMessage: message,
  };
}

async function fetchLiveTeamPayrollSnapshot(): Promise<TeamPayrollSnapshotResult> {
  if (!supabaseClient) {
    return createSeedTeamPayrollSnapshotResult(
      'Supabase config is missing, so Team Payroll is using the local seeded snapshot.',
    );
  }

  const [
    policyResult,
    payRatesResult,
    membersResult,
    assignmentsResult,
    schedulesResult,
    scheduleTimeRecordsResult,
  ] = await Promise.all([
    supabaseClient
      .from('pay_policies')
      .select(
        'default_hourly_rate, overtime_threshold_minutes, overtime_multiplier',
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
      .returns<MemberRow[]>(),
    supabaseClient
      .from('assignments')
      .select('id, schedule_id, assignee_user_id, status')
      .returns<AssignmentRow[]>(),
    supabaseClient
      .from('schedules')
      .select('id, event_date, package_count, memo')
      .returns<ScheduleRow[]>(),
    supabaseClient
      .from('schedule_time_records')
      .select('schedule_id, actual_start_at, actual_end_at')
      .returns<ScheduleTimeRecordRow[]>(),
  ]);

  const error =
    policyResult.error ??
    payRatesResult.error ??
    membersResult.error ??
    assignmentsResult.error ??
    schedulesResult.error ??
    scheduleTimeRecordsResult.error;

  if (error || !policyResult.data?.[0]) {
    return createSeedTeamPayrollSnapshotResult(
      error?.message ??
        'The live payroll tables or policy row are not ready yet, so Team Payroll is using the seeded snapshot.',
    );
  }

  const source = mapLiveTeamPayrollSource({
    policy: policyResult.data[0],
    payRates: payRatesResult.data ?? [],
    members: membersResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
    schedules: schedulesResult.data ?? [],
    scheduleTimeRecords: scheduleTimeRecordsResult.data ?? [],
  });

  return {
    ...createTeamPayrollSnapshot(source),
    source: 'supabase',
    sourceMessage: null,
  };
}

export async function fetchTeamPayrollSnapshot(): Promise<TeamPayrollSnapshotResult> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedTeamPayrollSnapshotResult(
      'Supabase config is missing, so Team Payroll is using the local seeded snapshot.',
    );
  }

  return fetchLiveTeamPayrollSnapshot();
}

export function useTeamPayrollQuery() {
  return useQuery({
    queryKey: teamPayrollQueryKey,
    queryFn: fetchTeamPayrollSnapshot,
    staleTime: 30_000,
  });
}
