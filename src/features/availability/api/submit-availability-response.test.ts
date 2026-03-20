import { submitAvailabilityResponse } from '@/features/availability/api/submit-availability-response';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('submitAvailabilityResponse', () => {
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

  it('submits the employee availability response through the limited RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        submission_id: 'submission-1',
        schedule_id: 'schedule-1',
        user_id: 'employee-1',
        status: 'available',
        submitted_at: '2026-03-20T10:00:00.000Z',
      },
      error: null,
    });

    await expect(
      submitAvailabilityResponse({
        scheduleId: 'schedule-1',
        status: 'available',
      }),
    ).resolves.toEqual({
      submission_id: 'submission-1',
      schedule_id: 'schedule-1',
      user_id: 'employee-1',
      status: 'available',
      submitted_at: '2026-03-20T10:00:00.000Z',
    });

    expect(mockRpc).toHaveBeenCalledWith('submit_my_availability_response', {
      p_schedule_id: 'schedule-1',
      p_status: 'available',
    });
  });
});
