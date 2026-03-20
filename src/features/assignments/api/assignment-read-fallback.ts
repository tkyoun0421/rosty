import type { MyAssignmentSource } from '@/features/assignments/model/my-assignments';

export const myAssignmentsSeedSource: MyAssignmentSource = {
  assignments: [
    {
      id: 'assignment-1',
      scheduleId: 'schedule-1',
      slotId: 'slot-1',
      status: 'confirmed',
    },
    {
      id: 'assignment-2',
      scheduleId: 'schedule-1',
      slotId: 'slot-2',
      status: 'confirmed',
    },
    {
      id: 'assignment-3',
      scheduleId: 'schedule-2',
      slotId: 'slot-3',
      status: 'completed',
    },
    {
      id: 'assignment-4',
      scheduleId: 'schedule-3',
      slotId: 'slot-4',
      status: 'cancel_requested',
    },
  ],
  schedules: [
    {
      id: 'schedule-1',
      eventDate: '2026-03-22',
      memo: 'Grand Hall wedding',
      packageCount: 4,
    },
    {
      id: 'schedule-2',
      eventDate: '2026-03-12',
      memo: 'Garden Hall reception',
      packageCount: 2,
    },
    {
      id: 'schedule-3',
      eventDate: '2026-03-29',
      memo: 'Convention Hall banquet',
      packageCount: 3,
    },
  ],
  slots: [
    { id: 'slot-1', positionName: 'Bride room' },
    { id: 'slot-2', positionName: 'Guest hall' },
    { id: 'slot-3', positionName: 'Banquet' },
    { id: 'slot-4', positionName: 'Reception' },
  ],
};

export const assignmentRequestSeedSource = [
  {
    assignmentId: 'assignment-4',
    status: 'requested' as const,
    reason: 'Family emergency came up before the event.',
  },
];
