import { useQuery } from '@tanstack/react-query';

import {
  assignmentRequestSeedSource,
  myAssignmentsSeedSource,
} from '@/features/assignments/api/assignment-read-fallback';
import type {
  AssignmentRow,
  ScheduleRow,
  ScheduleSlotRow,
} from '@/features/assignments/api/fetch-my-assignments';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type CancellationQueueItem = {
  requestId: string;
  assignmentId: string;
  requesterName: string;
  scheduleId: string;
  scheduleTitle: string;
  eventDate: string;
  positionName: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected';
};

export type CancellationQueueSnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  items: CancellationQueueItem[];
};

type QueueAssignmentRow = AssignmentRow & {
  assignee_user_id: string | null;
};

type QueueProfileRow = {
  id: string;
  full_name: string;
};

type CancellationRequestRow = {
  id: string;
  assignment_id: string;
  requested_by: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected';
};

export const cancellationQueueQueryKey = ['cancellation-queue'] as const;

function buildScheduleTitle(schedule: ScheduleRow): string {
  const packageLabel = `${schedule.package_count} packages`;

  return schedule.memo && schedule.memo.trim().length > 0
    ? `${schedule.event_date} · ${schedule.memo.trim()}`
    : `${schedule.event_date} · ${packageLabel}`;
}

function createSeedQueueSnapshot(message: string | null): CancellationQueueSnapshot {
  const schedulesById = new Map(
    myAssignmentsSeedSource.schedules.map((schedule) => [schedule.id, schedule]),
  );
  const slotsById = new Map(
    myAssignmentsSeedSource.slots.map((slot) => [slot.id, slot]),
  );

  return {
    source: 'seed',
    sourceMessage: message,
    items: assignmentRequestSeedSource
      .filter((request) => request.status === 'requested')
      .map((request) => {
        const assignment = myAssignmentsSeedSource.assignments.find(
          (entry) => entry.id === request.assignmentId,
        )!;
        const schedule = schedulesById.get(assignment.scheduleId)!;
        const slot = slotsById.get(assignment.slotId)!;

        return {
          requestId: `seed-${request.assignmentId}`,
          assignmentId: request.assignmentId,
          requesterName: 'Mina Staff',
          scheduleId: assignment.scheduleId,
          scheduleTitle:
            schedule.memo && schedule.memo.trim().length > 0
              ? `${schedule.eventDate} · ${schedule.memo.trim()}`
              : `${schedule.eventDate} · ${schedule.packageCount} packages`,
          eventDate: schedule.eventDate,
          positionName: slot.positionName,
          reason: request.reason,
          status: request.status,
        };
      }),
  };
}

function mapLiveCancellationQueue(input: {
  requests: CancellationRequestRow[];
  assignments: QueueAssignmentRow[];
  schedules: ScheduleRow[];
  slots: ScheduleSlotRow[];
  profiles: QueueProfileRow[];
}): CancellationQueueItem[] {
  const assignmentsById = new Map(
    input.assignments.map((assignment) => [assignment.id, assignment]),
  );
  const schedulesById = new Map(
    input.schedules.map((schedule) => [schedule.id, schedule]),
  );
  const slotsById = new Map(input.slots.map((slot) => [slot.id, slot]));
  const profilesById = new Map(
    input.profiles.map((profile) => [profile.id, profile]),
  );

  return input.requests
    .map((request) => {
      const assignment = assignmentsById.get(request.assignment_id);

      if (!assignment) {
        return null;
      }

      const schedule = schedulesById.get(assignment.schedule_id);
      const slot = slotsById.get(assignment.slot_id);
      const requester =
        assignment.assignee_user_id
          ? profilesById.get(assignment.assignee_user_id)
          : profilesById.get(request.requested_by);

      if (!schedule || !slot || !requester) {
        return null;
      }

      return {
        requestId: request.id,
        assignmentId: request.assignment_id,
        requesterName: requester.full_name,
        scheduleId: assignment.schedule_id,
        scheduleTitle: buildScheduleTitle(schedule),
        eventDate: schedule.event_date,
        positionName: slot.position_name,
        reason: request.reason,
        status: request.status,
      };
    })
    .filter((item): item is CancellationQueueItem => item !== null)
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate));
}

async function fetchLiveCancellationQueue(): Promise<CancellationQueueSnapshot> {
  if (!supabaseClient) {
    return createSeedQueueSnapshot(
      'Supabase config is missing, so Cancellation Queue is using the local seeded snapshot.',
    );
  }

  const requestsResult = await supabaseClient
    .from('cancellation_requests')
    .select('id, assignment_id, requested_by, reason, status')
    .eq('status', 'requested')
    .returns<CancellationRequestRow[]>();

  if (requestsResult.error) {
    return createSeedQueueSnapshot(requestsResult.error.message);
  }

  const assignmentIds = [...new Set((requestsResult.data ?? []).map((row) => row.assignment_id))];

  if (assignmentIds.length === 0) {
    return {
      source: 'supabase',
      sourceMessage: null,
      items: [],
    };
  }

  const assignmentsResult = await supabaseClient
    .from('assignments')
    .select('id, schedule_id, slot_id, assignee_user_id, status')
    .in('id', assignmentIds)
    .returns<QueueAssignmentRow[]>();

  if (assignmentsResult.error) {
    return createSeedQueueSnapshot(assignmentsResult.error.message);
  }

  const scheduleIds = [...new Set((assignmentsResult.data ?? []).map((row) => row.schedule_id))];
  const slotIds = [...new Set((assignmentsResult.data ?? []).map((row) => row.slot_id))];
  const userIds = [
    ...new Set(
      (assignmentsResult.data ?? [])
        .map((row) => row.assignee_user_id)
        .filter((value): value is string => !!value),
    ),
  ];

  const [schedulesResult, slotsResult, profilesResult] = await Promise.all([
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
    userIds.length === 0
      ? Promise.resolve({ data: [], error: null } as { data: QueueProfileRow[]; error: null })
      : supabaseClient
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)
          .returns<QueueProfileRow[]>(),
  ]);

  const error =
    schedulesResult.error ?? slotsResult.error ?? profilesResult.error;

  if (error) {
    return createSeedQueueSnapshot(error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    items: mapLiveCancellationQueue({
      requests: requestsResult.data ?? [],
      assignments: assignmentsResult.data ?? [],
      schedules: schedulesResult.data ?? [],
      slots: slotsResult.data ?? [],
      profiles: profilesResult.data ?? [],
    }),
  };
}

export async function fetchCancellationQueue(): Promise<CancellationQueueSnapshot> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedQueueSnapshot(
      'Supabase config is missing, so Cancellation Queue is using the local seeded snapshot.',
    );
  }

  return fetchLiveCancellationQueue();
}

export function useCancellationQueueQuery() {
  return useQuery({
    queryKey: cancellationQueueQueryKey,
    queryFn: fetchCancellationQueue,
    staleTime: 30_000,
  });
}
