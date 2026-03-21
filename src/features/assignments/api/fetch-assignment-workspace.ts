import { useQuery } from '@tanstack/react-query';

import {
  readWorkspaceSeedSource,
  workspaceSeedProfiles,
} from '@/features/assignments/api/assignment-workspace-fallback';
import { createAssignmentWorkspaceSnapshot } from '@/features/assignments/model/assignment-workspace';
import { buildScheduleTitle, type AvailabilityCollectionState, type RequiredGender, type ScheduleStatus } from '@/features/schedules/model/schedules';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type AssignmentWorkspaceSnapshotResult = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  workspace: ReturnType<typeof createAssignmentWorkspaceSnapshot>;
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

type AssignmentRow = {
  id: string;
  slot_id: string;
  status: 'proposed' | 'confirmed' | 'cancel_requested' | 'cancelled' | 'completed';
  assignee_user_id: string | null;
  guest_name: string | null;
};

export function assignmentWorkspaceQueryKey(scheduleId: string) {
  return ['assignment-workspace', scheduleId] as const;
}

function createSeedWorkspace(scheduleId: string, message: string | null): AssignmentWorkspaceSnapshotResult {
  const seed = readWorkspaceSeedSource(scheduleId);

  return {
    source: 'seed',
    sourceMessage: message,
    workspace: createAssignmentWorkspaceSnapshot({
      schedule: seed.schedule
        ? {
            id: seed.schedule.id,
            title: buildScheduleTitle({
              eventDate: seed.schedule.event_date,
              memo: seed.schedule.memo,
              packageCount: seed.schedule.package_count,
            }),
            eventDate: seed.schedule.event_date,
            scheduleStatus: seed.schedule.status,
            collectionState: seed.schedule.collection_state,
          }
        : null,
      slots: seed.slots.map((slot) => ({
        id: slot.id,
        positionName: slot.position_name,
        headcount: slot.headcount,
        requiredGender: slot.required_gender,
        isEnabled: slot.is_enabled,
      })),
      employees: seed.employees.map((profile) => ({
        id: profile.id,
        fullName: profile.full_name,
        gender: profile.gender,
      })),
      submissions: seed.submissions,
      assignments: seed.assignments.map((assignment) => ({
        id: assignment.id,
        slotId: assignment.slot_id,
        status: assignment.status,
        assigneeUserId: assignment.assignee_user_id,
        assigneeName: assignment.assignee_user_id
          ? workspaceSeedProfiles.find((profile) => profile.id === assignment.assignee_user_id)
              ?.full_name ?? null
          : null,
        guestName: assignment.guest_name,
      })),
    }),
  };
}

async function fetchLiveWorkspace(scheduleId: string): Promise<AssignmentWorkspaceSnapshotResult> {
  if (!supabaseClient) {
    return createSeedWorkspace(
      scheduleId,
      'Supabase config is missing, so Assignment Workspace is using the local seeded snapshot.',
    );
  }

  const [scheduleResult, slotsResult, profilesResult, submissionsResult, assignmentsResult] =
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
      supabaseClient
        .from('assignments')
        .select('id, slot_id, status, assignee_user_id, guest_name')
        .eq('schedule_id', scheduleId)
        .returns<AssignmentRow[]>(),
    ]);

  const error =
    scheduleResult.error ??
    slotsResult.error ??
    profilesResult.error ??
    submissionsResult.error ??
    assignmentsResult.error;

  if (error) {
    return createSeedWorkspace(scheduleId, error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    workspace: createAssignmentWorkspaceSnapshot({
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
      employees: (profilesResult.data ?? []).map((profile) => ({
        id: profile.id,
        fullName: profile.full_name,
        gender: profile.gender,
      })),
      submissions: (submissionsResult.data ?? []).map((submission) => ({
        userId: submission.user_id,
        status: submission.status,
      })),
      assignments: (assignmentsResult.data ?? []).map((assignment) => ({
        id: assignment.id,
        slotId: assignment.slot_id,
        status: assignment.status,
        assigneeUserId: assignment.assignee_user_id,
        assigneeName: assignment.assignee_user_id
          ? (profilesResult.data ?? []).find((profile) => profile.id === assignment.assignee_user_id)?.full_name ?? null
          : null,
        guestName: assignment.guest_name,
      })),
    }),
  };
}

export async function fetchAssignmentWorkspace(
  scheduleId: string,
): Promise<AssignmentWorkspaceSnapshotResult> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedWorkspace(
      scheduleId,
      'Supabase config is missing, so Assignment Workspace is using the local seeded snapshot.',
    );
  }

  return fetchLiveWorkspace(scheduleId);
}

export function useAssignmentWorkspaceQuery(scheduleId: string | null) {
  return useQuery({
    queryKey:
      scheduleId ? assignmentWorkspaceQueryKey(scheduleId) : ['assignment-workspace'],
    queryFn: () => fetchAssignmentWorkspace(scheduleId ?? ''),
    enabled: !!scheduleId,
    staleTime: 30_000,
  });
}
