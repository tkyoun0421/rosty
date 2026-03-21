import { completeScheduleOperation } from '@/features/work-time/api/complete-schedule-operation';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('completeScheduleOperation', () => {
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

  it('calls the limited schedule completion rpc', async () => {
    mockSingle.mockResolvedValue({
      data: {
        schedule_id: 'schedule-1',
        schedule_status: 'completed',
        completed_assignment_count: 2,
      },
      error: null,
    });

    await expect(completeScheduleOperation('schedule-1')).resolves.toEqual({
      schedule_id: 'schedule-1',
      schedule_status: 'completed',
      completed_assignment_count: 2,
    });

    expect(mockRpc).toHaveBeenCalledWith('complete_schedule_operation', {
      p_schedule_id: 'schedule-1',
    });
  });
});
