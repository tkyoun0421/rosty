import { useQuery } from '@tanstack/react-query';

import { myAssignmentsSeedSource } from '@/features/assignments/api/assignment-read-fallback';
import {
  createMyAssignmentsSnapshot,
  type MyAssignmentSource,
  type MyAssignmentsSnapshot,
} from '@/features/assignments/model/my-assignments';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type MyAssignmentsSnapshotResult = MyAssignmentsSnapshot & {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
};

export type AssignmentRow = {
  id: string;
  schedule_id: string;
  slot_id: string;
  status: 'confirmed' | 'cancel_requested' | 'cancelled' | 'completed';
};

export type ScheduleRow = {
  id: string;
  event_date: string;
  memo: string | null;
  package_count: number;
};

export type ScheduleSlotRow = {
  id: string;
  position_name: string;
};

export function myAssignmentsQueryKey(userId: string) {
  return ['my-assignments', userId] as const;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createSeedAssignmentsSnapshotResult(
  message: string | null,
): MyAssignmentsSnapshotResult {
  return {
    ...createMyAssignmentsSnapshot(myAssignmentsSeedSource, getTodayDate()),
    source: 'seed',
    sourceMessage: message,
  };
}

function mapLiveAssignmentsSource(input: {
  assignments: AssignmentRow[];
  schedules: ScheduleRow[];
  slots: ScheduleSlotRow[];
}): MyAssignmentSource {
  return {
    assignments: input.assignments.map((assignment) => ({
      id: assignment.id,
      scheduleId: assignment.schedule_id,
      slotId: assignment.slot_id,
      status: assignment.status,
    })),
    schedules: input.schedules.map((schedule) => ({
      id: schedule.id,
      eventDate: schedule.event_date,
      memo: schedule.memo,
      packageCount: schedule.package_count,
    })),
    slots: input.slots.map((slot) => ({
      id: slot.id,
      positionName: slot.position_name,
    })),
  };
}

async function fetchLiveMyAssignmentsSnapshot(
  userId: string,
): Promise<MyAssignmentsSnapshotResult> {
  if (!supabaseClient) {
    return createSeedAssignmentsSnapshotResult(
      'Supabase config is missing, so My Assignments is using the local seeded snapshot.',
    );
  }

  const assignmentsResult = await supabaseClient
    .from('assignments')
    .select('id, schedule_id, slot_id, status')
    .eq('assignee_user_id', userId)
    .in('status', ['confirmed', 'cancel_requested', 'cancelled', 'completed'])
    .returns<AssignmentRow[]>();

  if (assignmentsResult.error) {
    return createSeedAssignmentsSnapshotResult(assignmentsResult.error.message);
  }

  const scheduleIds = [...new Set((assignmentsResult.data ?? []).map((row) => row.schedule_id))];
  const slotIds = [...new Set((assignmentsResult.data ?? []).map((row) => row.slot_id))];

  if (scheduleIds.length === 0 || slotIds.length === 0) {
    return {
      upcoming: [],
      past: [],
      source: 'supabase',
      sourceMessage: null,
    };
  }

  const [schedulesResult, slotsResult] = await Promise.all([
    supabaseClient
      .from('schedules')
      .select('id, event_date, memo, package_count')
      .in('id', scheduleIds)
      .returns<ScheduleRow[]>(),
    supabaseClient
      .from('schedule_slots')
      .select('id, position_name')
      .in('id', slotIds)
      .returns<ScheduleSlotRow[]>(),
  ]);

  const error = schedulesResult.error ?? slotsResult.error;

  if (error) {
    return createSeedAssignmentsSnapshotResult(error.message);
  }

  return {
    ...createMyAssignmentsSnapshot(
      mapLiveAssignmentsSource({
        assignments: assignmentsResult.data ?? [],
        schedules: schedulesResult.data ?? [],
        slots: slotsResult.data ?? [],
      }),
      getTodayDate(),
    ),
    source: 'supabase',
    sourceMessage: null,
  };
}

export async function fetchMyAssignmentsSnapshot(
  userId: string,
): Promise<MyAssignmentsSnapshotResult> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedAssignmentsSnapshotResult(
      'Supabase config is missing, so My Assignments is using the local seeded snapshot.',
    );
  }

  return fetchLiveMyAssignmentsSnapshot(userId);
}

export function useMyAssignmentsQuery(userId: string | null) {
  return useQuery({
    queryKey: userId ? myAssignmentsQueryKey(userId) : ['my-assignments'],
    queryFn: () => fetchMyAssignmentsSnapshot(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
