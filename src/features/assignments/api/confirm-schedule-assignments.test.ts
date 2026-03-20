import { confirmScheduleAssignments } from '@/features/assignments/api/confirm-schedule-assignments';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('confirmScheduleAssignments', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockReturns.mockReset();
    mockSingle.mockReset();

    mockRpc.mockReturnValue({
      returns: mockReturns,
    });
    mockReturns.mockReturnValue({
      single: mockSingle,
    });
  });

  it('confirms the current schedule through the limited RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        schedule_id: 'schedule-2',
        schedule_status: 'assigned',
        confirmed_assignment_count: 2,
      },
      error: null,
    });

    await expect(confirmScheduleAssignments('schedule-2')).resolves.toEqual({
      schedule_id: 'schedule-2',
      schedule_status: 'assigned',
      confirmed_assignment_count: 2,
    });
  });
});
