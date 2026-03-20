import { useQuery } from '@tanstack/react-query';

import {
  createAvailabilityOverviewSnapshot,
  type AvailabilityOverviewSnapshot,
} from '@/features/availability/model/availability-overview';
import { scheduleSeedRows, scheduleSlotSeedRows } from '@/features/schedules/api/schedule-read-fallback';
import { buildScheduleTitle, type AvailabilityCollectionState, type RequiredGender, type ScheduleStatus } from '@/features/schedules/model/schedules';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type AvailabilityOverviewSnapshotResult = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  overview: AvailabilityOverviewSnapshot | null;
};

type ScheduleRow = {
  id: string;
  event_date: string;
  package_count: number;
  status: ScheduleStatus;
  collection_state: AvailabilityCollectionState;
  memo: string | null;
};

type ScheduleSlotRow = {
  id: string;
  schedule_id: string;
  position_name: string;
  headcount: number;
  required_gender: RequiredGender;
  is_enabled: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string;
  gender: 'male' | 'female' | 'unspecified';
};

type AvailabilitySubmissionRow = {
  user_id: string;
  status: 'available' | 'unavailable';
};

const seededProfiles: ProfileRow[] = [
  {
    id: 'employee-1',
    full_name: 'Mina Staff',
    gender: 'female',
  },
  {
    id: 'employee-2',
    full_name: 'Joon Staff',
    gender: 'male',
  },
  {
    id: 'employee-3',
    full_name: 'Sera Staff',
    gender: 'female',
  },
];

const seededAvailabilityByScheduleId: Record<string, AvailabilitySubmissionRow[]> = {
  'schedule-1': [
    {
      user_id: 'employee-1',
      status: 'available',
    },
    {
      user_id: 'employee-2',
      status: 'unavailable',
    },
  ],
  'schedule-2': [
    {
      user_id: 'employee-3',
      status: 'available',
    },
  ],
};

export function availabilityOverviewQueryKey(scheduleId: string) {
  return ['availability-overview', scheduleId] as const;
}

function createSeedOverview(
  scheduleId: string,
  message: string | null,
): AvailabilityOverviewSnapshotResult {
  const schedule = scheduleSeedRows.find((entry) => entry.id === scheduleId) ?? null;
  const slots = scheduleSlotSeedRows.filter((slot) => slot.schedule_id === scheduleId);

  return {
    source: 'seed',
    sourceMessage: message,
    overview: createAvailabilityOverviewSnapshot({
      schedule: schedule
        ? {
            id: schedule.id,
            title: buildScheduleTitle({
              eventDate: schedule.event_date,
              memo: schedule.memo,
              packageCount: schedule.package_count,
            }),
            eventDate: schedule.event_date,
            scheduleStatus: schedule.status,
            collectionState: schedule.collection_state,
          }
        : null,
      slots: slots.map((slot) => ({
        id: slot.id,
        positionName: slot.position_name,
        headcount: slot.headcount,
        requiredGender: slot.required_gender,
        isEnabled: slot.is_enabled,
      })),
      employees: seededProfiles.map((profile) => ({
        id: profile.id,
        fullName: profile.full_name,
        gender: profile.gender,
      })),
      submissions: (seededAvailabilityByScheduleId[scheduleId] ?? []).map((submission) => ({
        userId: submission.user_id,
        status: submission.status,
      })),
    }),
  };
}

async function fetchLiveOverview(
  scheduleId: string,
): Promise<AvailabilityOverviewSnapshotResult> {
  if (!supabaseClient) {
    return createSeedOverview(
      scheduleId,
      'Supabase config is missing, so Availability Overview is using the local seeded snapshot.',
    );
  }

  const [scheduleResult, slotsResult, employeesResult, submissionsResult] =
    await Promise.all([
      supabaseClient
        .from('schedules')
        .select('id, event_date, package_count, status, collection_state, memo')
        .eq('id', scheduleId)
        .maybeSingle<ScheduleRow>(),
      supabaseClient
        .from('schedule_slots')
        .select('id, schedule_id, position_name, headcount, required_gender, is_enabled')
        .eq('schedule_id', scheduleId)
        .returns<ScheduleSlotRow[]>(),
      supabaseClient
        .from('profiles')
        .select('id, full_name, gender')
        .eq('role', 'employee')
        .eq('status', 'active')
        .returns<ProfileRow[]>(),
      supabaseClient
        .from('availability_submissions')
        .select('user_id, status')
        .eq('schedule_id', scheduleId)
        .returns<AvailabilitySubmissionRow[]>(),
    ]);

  const error =
    scheduleResult.error ??
    slotsResult.error ??
    employeesResult.error ??
    submissionsResult.error;

  if (error) {
    return createSeedOverview(scheduleId, error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    overview: createAvailabilityOverviewSnapshot({
      schedule: scheduleResult.data
        ? {
            id: scheduleResult.data.id,
            title: buildScheduleTitle({
              eventDate: scheduleResult.data.event_date,
              memo: scheduleResult.data.memo,
              packageCount: scheduleResult.data.package_count,
            }),
            eventDate: scheduleResult.data.event_date,
            scheduleStatus: scheduleResult.data.status,
            collectionState: scheduleResult.data.collection_state,
          }
        : null,
      slots: (slotsResult.data ?? []).map((slot) => ({
        id: slot.id,
        positionName: slot.position_name,
        headcount: slot.headcount,
        requiredGender: slot.required_gender,
        isEnabled: slot.is_enabled,
      })),
      employees: (employeesResult.data ?? []).map((profile) => ({
        id: profile.id,
        fullName: profile.full_name,
        gender: profile.gender,
      })),
      submissions: (submissionsResult.data ?? []).map((submission) => ({
        userId: submission.user_id,
        status: submission.status,
      })),
    }),
  };
}

export async function fetchAvailabilityOverview(
  scheduleId: string,
): Promise<AvailabilityOverviewSnapshotResult> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedOverview(
      scheduleId,
      'Supabase config is missing, so Availability Overview is using the local seeded snapshot.',
    );
  }

  return fetchLiveOverview(scheduleId);
}

export function useAvailabilityOverviewQuery(scheduleId: string | null) {
  return useQuery({
    queryKey:
      scheduleId ? availabilityOverviewQueryKey(scheduleId) : ['availability-overview'],
    queryFn: () => fetchAvailabilityOverview(scheduleId ?? ''),
    enabled: !!scheduleId,
    staleTime: 30_000,
  });
}
