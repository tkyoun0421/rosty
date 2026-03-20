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
import {
  createAssignmentDetailSnapshot,
  type AssignmentDetailSnapshot,
  type AssignmentDetailSource,
} from '@/features/assignments/model/assignment-detail';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type AssignmentDetailSnapshotResult = {
  detail: AssignmentDetailSnapshot | null;
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
};

type CancellationRequestRow = {
  assignment_id: string;
  status: 'requested' | 'approved' | 'rejected';
  reason: string;
};

export function assignmentDetailQueryKey(scheduleId: string) {
  return ['assignment-detail', scheduleId] as const;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createSeedAssignmentDetailResult(
  scheduleId: string,
  message: string | null,
): AssignmentDetailSnapshotResult {
  const source = buildAssignmentDetailSource({
    scheduleId,
    assignments: myAssignmentsSeedSource.assignments.map((assignment) => ({
      id: assignment.id,
      schedule_id: assignment.scheduleId,
      slot_id: assignment.slotId,
      status: assignment.status,
    })),
    schedules: myAssignmentsSeedSource.schedules.map((schedule) => ({
      id: schedule.id,
      event_date: schedule.eventDate,
      memo: schedule.memo,
      package_count: schedule.packageCount,
    })),
    slots: myAssignmentsSeedSource.slots.map((slot) => ({
      id: slot.id,
      position_name: slot.positionName,
    })),
    cancellationRequests: assignmentRequestSeedSource.map((request) => ({
      assignment_id: request.assignmentId,
      status: request.status,
      reason: request.reason,
    })),
  });

  return {
    detail: createAssignmentDetailSnapshot(source, scheduleId, getTodayDate()),
    source: 'seed',
    sourceMessage: message,
  };
}

function buildAssignmentDetailSource(input: {
  scheduleId: string;
  assignments: AssignmentRow[];
  schedules: ScheduleRow[];
  slots: ScheduleSlotRow[];
  cancellationRequests: CancellationRequestRow[];
}): AssignmentDetailSource {
  const schedule = input.schedules.find((entry) => entry.id === input.scheduleId) ?? null;
  const slotsById = new Map(input.slots.map((slot) => [slot.id, slot]));
  const requestsByAssignmentId = new Map(
    input.cancellationRequests.map((request) => [request.assignment_id, request]),
  );

  return {
    schedule: schedule
      ? {
          id: schedule.id,
          eventDate: schedule.event_date,
          memo: schedule.memo,
          packageCount: schedule.package_count,
        }
      : null,
    positions: input.assignments
      .filter((assignment) => assignment.schedule_id === input.scheduleId)
      .map((assignment) => {
        const slot = slotsById.get(assignment.slot_id);
        const request = requestsByAssignmentId.get(assignment.id);

        return {
          assignmentId: assignment.id,
          slotId: assignment.slot_id,
          positionName: slot?.position_name ?? 'Assigned slot',
          status: assignment.status,
          cancellationRequest: request
            ? {
                status: request.status,
                reason: request.reason,
              }
            : null,
        };
      }),
  };
}

async function fetchLiveAssignmentDetail(
  userId: string,
  scheduleId: string,
): Promise<AssignmentDetailSnapshotResult> {
  if (!supabaseClient) {
    return createSeedAssignmentDetailResult(
      scheduleId,
      'Supabase config is missing, so Assignment Detail is using the local seeded snapshot.',
    );
  }

  const assignmentsResult = await supabaseClient
    .from('assignments')
    .select('id, schedule_id, slot_id, status')
    .eq('assignee_user_id', userId)
    .eq('schedule_id', scheduleId)
    .in('status', ['confirmed', 'cancel_requested', 'cancelled', 'completed'])
    .returns<AssignmentRow[]>();

  if (assignmentsResult.error) {
    return createSeedAssignmentDetailResult(scheduleId, assignmentsResult.error.message);
  }

  const assignmentIds = (assignmentsResult.data ?? []).map((assignment) => assignment.id);
  const slotIds = [...new Set((assignmentsResult.data ?? []).map((assignment) => assignment.slot_id))];

  const [schedulesResult, slotsResult, cancellationRequestsResult] = await Promise.all([
    supabaseClient
      .from('schedules')
      .select('id, event_date, memo, package_count')
      .eq('id', scheduleId)
      .returns<ScheduleRow[]>(),
    slotIds.length === 0
      ? Promise.resolve({ data: [], error: null } as { data: ScheduleSlotRow[]; error: null })
      : supabaseClient
          .from('schedule_slots')
          .select('id, position_name')
          .in('id', slotIds)
          .returns<ScheduleSlotRow[]>(),
    assignmentIds.length === 0
      ? Promise.resolve({ data: [], error: null } as { data: CancellationRequestRow[]; error: null })
      : supabaseClient
          .from('cancellation_requests')
          .select('assignment_id, status, reason')
          .in('assignment_id', assignmentIds)
          .returns<CancellationRequestRow[]>(),
  ]);

  const error =
    schedulesResult.error ?? slotsResult.error ?? cancellationRequestsResult.error;

  if (error) {
    return createSeedAssignmentDetailResult(scheduleId, error.message);
  }

  const source = buildAssignmentDetailSource({
    scheduleId,
    assignments: assignmentsResult.data ?? [],
    schedules: schedulesResult.data ?? [],
    slots: slotsResult.data ?? [],
    cancellationRequests: cancellationRequestsResult.data ?? [],
  });

  return {
    detail: createAssignmentDetailSnapshot(source, scheduleId, getTodayDate()),
    source: 'supabase',
    sourceMessage: null,
  };
}

export async function fetchAssignmentDetail(
  userId: string,
  scheduleId: string,
): Promise<AssignmentDetailSnapshotResult> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedAssignmentDetailResult(
      scheduleId,
      'Supabase config is missing, so Assignment Detail is using the local seeded snapshot.',
    );
  }

  return fetchLiveAssignmentDetail(userId, scheduleId);
}

export function useAssignmentDetailQuery(
  userId: string | null,
  scheduleId: string | null,
) {
  return useQuery({
    queryKey:
      userId && scheduleId
        ? assignmentDetailQueryKey(scheduleId)
        : ['assignment-detail'],
    queryFn: () => fetchAssignmentDetail(userId ?? '', scheduleId ?? ''),
    enabled: !!userId && !!scheduleId,
    staleTime: 30_000,
  });
}
