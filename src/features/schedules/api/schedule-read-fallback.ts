import type {
  AvailabilityCollectionState,
  RequiredGender,
  ScheduleStatus,
} from '@/features/schedules/model/schedules';

export const scheduleSeedRows: {
  id: string;
  event_date: string;
  package_count: number;
  status: ScheduleStatus;
  collection_state: AvailabilityCollectionState;
  memo: string | null;
}[] = [
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

export const scheduleSlotSeedRows: {
  id: string;
  schedule_id: string;
  position_name: string;
  headcount: number;
  required_gender: RequiredGender;
  is_enabled: boolean;
}[] = [
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

export const slotPresetSeedRows: {
  id: string;
  code: string;
  position_name: string;
  default_headcount: number;
  required_gender: RequiredGender;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}[] = [
  {
    id: 'preset-1',
    code: 'bride-room',
    position_name: 'Bride room',
    default_headcount: 1,
    required_gender: 'female' as RequiredGender,
    is_required: true,
    sort_order: 0,
    is_active: true,
  },
  {
    id: 'preset-2',
    code: 'guest-hall',
    position_name: 'Guest hall',
    default_headcount: 2,
    required_gender: 'any' as RequiredGender,
    is_required: true,
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'preset-3',
    code: 'reception',
    position_name: 'Reception',
    default_headcount: 1,
    required_gender: 'any' as RequiredGender,
    is_required: false,
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'preset-4',
    code: 'banquet',
    position_name: 'Banquet',
    default_headcount: 3,
    required_gender: 'male' as RequiredGender,
    is_required: false,
    sort_order: 3,
    is_active: true,
  },
];
