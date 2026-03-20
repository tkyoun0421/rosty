import { requestAssignmentCancellation } from '@/features/assignments/api/request-assignment-cancellation';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('requestAssignmentCancellation', () => {
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

  it('creates a cancellation request through the limited RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        request_id: 'request-1',
        assignment_id: 'assignment-1',
        assignment_status: 'cancel_requested',
        request_status: 'requested',
      },
      error: null,
    });

    await expect(
      requestAssignmentCancellation({
        assignmentId: 'assignment-1',
        reason: 'Family emergency came up before the event.',
      }),
    ).resolves.toEqual({
      request_id: 'request-1',
      assignment_id: 'assignment-1',
      assignment_status: 'cancel_requested',
      request_status: 'requested',
    });

    expect(mockRpc).toHaveBeenCalledWith('request_assignment_cancellation', {
      p_assignment_id: 'assignment-1',
      p_reason: 'Family emergency came up before the event.',
    });
  });
});
