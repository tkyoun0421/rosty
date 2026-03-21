import { myAssignmentsSeedSource } from '@/features/assignments/api/assignment-read-fallback';
import { scheduleSeedRows, scheduleSlotSeedRows } from '@/features/schedules/api/schedule-read-fallback';

export const workspaceSeedProfiles = [
  {
    id: 'employee-1',
    full_name: 'Mina Staff',
    gender: 'female' as const,
  },
  {
    id: 'employee-2',
    full_name: 'Joon Staff',
    gender: 'male' as const,
  },
  {
    id: 'employee-3',
    full_name: 'Sera Staff',
    gender: 'female' as const,
  },
];

type SeedWorkspaceAssignment = {
  id: string;
  schedule_id: string;
  slot_id: string;
  status: 'proposed' | 'confirmed';
  assignee_user_id: string | null;
  guest_name: string | null;
  is_exception_case: boolean;
};

let workspaceSeedAssignments: SeedWorkspaceAssignment[] = [
  {
    id: 'workspace-assignment-1',
    schedule_id: 'schedule-2',
    slot_id: 'slot-3',
    status: 'proposed' as const,
    assignee_user_id: 'employee-3',
    guest_name: null as string | null,
    is_exception_case: false,
  },
];

export function getWorkspaceSeedAssignments() {
  return workspaceSeedAssignments.map((row) => ({ ...row }));
}

export function saveWorkspaceSeedAssignment(input: {
  scheduleId: string;
  slotId: string;
  assignmentId: string | null;
  assigneeUserId: string | null;
  guestName: string | null;
}) {
  if (input.assignmentId) {
    workspaceSeedAssignments = workspaceSeedAssignments.map((assignment) =>
      assignment.id === input.assignmentId
        ? {
            ...assignment,
            assignee_user_id: input.assigneeUserId,
            guest_name: input.guestName,
            status: 'proposed',
          }
        : assignment,
    );
    return;
  }

  workspaceSeedAssignments = [
    ...workspaceSeedAssignments,
    {
      id: `workspace-assignment-${workspaceSeedAssignments.length + 1}`,
      schedule_id: input.scheduleId,
      slot_id: input.slotId,
      status: 'proposed',
      assignee_user_id: input.assigneeUserId,
      guest_name: input.guestName,
      is_exception_case: false,
    },
  ];
}

export function clearWorkspaceSeedAssignment(assignmentId: string) {
  workspaceSeedAssignments = workspaceSeedAssignments.filter(
    (assignment) => assignment.id !== assignmentId,
  );
}

export function confirmWorkspaceSeedSchedule(scheduleId: string) {
  workspaceSeedAssignments = workspaceSeedAssignments.map((assignment) =>
    assignment.schedule_id === scheduleId
      ? {
          ...assignment,
          status: 'confirmed',
        }
      : assignment,
  );

  const schedule = scheduleSeedRows.find((entry) => entry.id === scheduleId);

  if (schedule) {
    schedule.status = 'assigned';
    schedule.collection_state = 'locked';
  }

  const assignmentsForSchedule = myAssignmentsSeedSource.assignments.filter(
    (assignment) => assignment.scheduleId !== scheduleId,
  );

  const projected = workspaceSeedAssignments
    .filter((assignment) => assignment.schedule_id === scheduleId)
    .map((assignment) => ({
      id: assignment.id,
      scheduleId: assignment.schedule_id,
      slotId: assignment.slot_id,
      status: 'confirmed' as const,
    }));

  myAssignmentsSeedSource.assignments = [...assignmentsForSchedule, ...projected];
}

export function readWorkspaceSeedSource(scheduleId: string) {
  const schedule = scheduleSeedRows.find((entry) => entry.id === scheduleId) ?? null;
  const slots = scheduleSlotSeedRows.filter((slot) => slot.schedule_id === scheduleId);
  const seededSubmissionsByScheduleId: Record<
    string,
    { userId: string; status: 'available' | 'unavailable' }[]
  > = {
    'schedule-2': [
      {
        userId: 'employee-3',
        status: 'available',
      },
      {
        userId: 'employee-1',
        status: 'unavailable',
      },
    ],
  };
  const submissions = seededSubmissionsByScheduleId[scheduleId] ?? [];

  return {
    schedule,
    slots,
    employees: workspaceSeedProfiles,
    submissions,
    assignments: workspaceSeedAssignments.filter(
      (assignment) => assignment.schedule_id === scheduleId,
    ),
  };
}
