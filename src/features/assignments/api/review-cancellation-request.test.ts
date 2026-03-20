import { reviewCancellationRequest } from '@/features/assignments/api/review-cancellation-request';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('reviewCancellationRequest', () => {
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

  it('approves a cancellation request through the limited RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        request_id: 'request-1',
        request_status: 'approved',
        assignment_id: 'assignment-1',
        assignment_status: 'cancelled',
      },
      error: null,
    });

    await expect(
      reviewCancellationRequest({
        requestId: 'request-1',
        action: 'approve',
      }),
    ).resolves.toEqual({
      request_id: 'request-1',
      request_status: 'approved',
      assignment_id: 'assignment-1',
      assignment_status: 'cancelled',
    });
  });
});
