import type { UserRole } from '@/features/auth/model/auth-types';
import type {
  AvailabilityCollectionState,
  ScheduleStatus,
} from '@/features/schedules/model/schedules';

export function canManageAvailabilityCollection(input: {
  role: UserRole;
  scheduleStatus: ScheduleStatus;
}): boolean {
  return input.role !== 'employee' && input.scheduleStatus === 'collecting';
}

export function getNextAvailabilityCollectionState(
  current: AvailabilityCollectionState,
): AvailabilityCollectionState {
  return current === 'open' ? 'locked' : 'open';
}

export function getAvailabilityCollectionActionLabel(
  current: AvailabilityCollectionState,
): string {
  return current === 'open' ? 'Lock collection' : 'Reopen collection';
}
