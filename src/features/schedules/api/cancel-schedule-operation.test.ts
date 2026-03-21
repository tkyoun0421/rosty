import { cancelScheduleOperation } from '@/features/schedules/api/cancel-schedule-operation';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('cancelScheduleOperation', () => {
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

  it('calls the limited schedule cancellation rpc', async () => {
    mockSingle.mockResolvedValue({
      data: {
        schedule_id: 'schedule-2',
        schedule_status: 'cancelled',
        cancelled_assignment_count: 1,
      },
      error: null,
    });

    await expect(cancelScheduleOperation('schedule-2')).resolves.toEqual({
      schedule_id: 'schedule-2',
      schedule_status: 'cancelled',
      cancelled_assignment_count: 1,
    });

    expect(mockRpc).toHaveBeenCalledWith('cancel_schedule_operation', {
      p_schedule_id: 'schedule-2',
    });
  });
});
