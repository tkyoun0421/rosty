export type AvailabilityResponseState =
  | 'not_responded'
  | 'available'
  | 'unavailable';

export function formatAvailabilityResponseState(
  state: AvailabilityResponseState,
): string {
  switch (state) {
    case 'not_responded':
      return 'Not responded';
    case 'available':
      return 'Available';
    case 'unavailable':
      return 'Unavailable';
  }
}

export function canSubmitAvailability(input: {
  role: 'employee' | 'manager' | 'admin';
  scheduleStatus: 'collecting' | 'assigned' | 'completed' | 'cancelled';
  collectionState: 'open' | 'locked';
}): boolean {
  return (
    input.role === 'employee' &&
    input.scheduleStatus !== 'cancelled' &&
    input.collectionState === 'open'
  );
}
