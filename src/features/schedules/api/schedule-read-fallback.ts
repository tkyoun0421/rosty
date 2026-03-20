import type {
  AvailabilityCollectionState,
  RequiredGender,
  ScheduleStatus,
} from '@/features/schedules/model/schedules';

export const scheduleSeedRows = [
  {
    id: 'schedule-1',
    event_date: '2026-03-22',
    package_count: 4,
    status: 'assigned' as ScheduleStatus,
    collection_state: 'locked' as AvailabilityCollectionState,
    memo: 'Grand Hall wedding',
  },
  {
    id: 'schedule-2',
    event_date: '2026-03-29',
    package_count: 3,
    status: 'collecting' as ScheduleStatus,
    collection_state: 'open' as AvailabilityCollectionState,
    memo: 'Convention Hall banquet',
  },
  {
    id: 'schedule-3',
    event_date: '2026-03-12',
    package_count: 2,
    status: 'completed' as ScheduleStatus,
    collection_state: 'locked' as AvailabilityCollectionState,
    memo: 'Garden Hall reception',
  },
];

export const scheduleSlotSeedRows = [
  {
    id: 'slot-1',
    schedule_id: 'schedule-1',
    position_name: 'Bride room',
    headcount: 1,
    required_gender: 'female' as RequiredGender,
    is_enabled: true,
  },
  {
    id: 'slot-2',
    schedule_id: 'schedule-1',
    position_name: 'Guest hall',
    headcount: 2,
    required_gender: 'any' as RequiredGender,
    is_enabled: true,
  },
  {
    id: 'slot-3',
    schedule_id: 'schedule-2',
    position_name: 'Reception',
    headcount: 1,
    required_gender: 'any' as RequiredGender,
    is_enabled: true,
  },
  {
    id: 'slot-4',
    schedule_id: 'schedule-2',
    position_name: 'Banquet',
    headcount: 3,
    required_gender: 'male' as RequiredGender,
    is_enabled: true,
  },
  {
    id: 'slot-5',
    schedule_id: 'schedule-3',
    position_name: 'Support',
    headcount: 1,
    required_gender: 'any' as RequiredGender,
    is_enabled: false,
  },
];
