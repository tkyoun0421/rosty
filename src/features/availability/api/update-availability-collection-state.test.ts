import { updateAvailabilityCollectionState } from '@/features/availability/api/update-availability-collection-state';

const mockFrom = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('updateAvailabilityCollectionState', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUpdate.mockReset();
    mockEq.mockReset();
    mockSelect.mockReset();
    mockSingle.mockReset();
  });

  it('updates the current schedule collection state through schedules write access', async () => {
    mockFrom.mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: {
        id: 'schedule-1',
        collection_state: 'locked',
      },
      error: null,
    });

    await expect(
      updateAvailabilityCollectionState({
        scheduleId: 'schedule-1',
        actorUserId: 'manager-1',
        nextState: 'locked',
      }),
    ).resolves.toEqual({
      scheduleId: 'schedule-1',
      collectionState: 'locked',
    });
  });
});
