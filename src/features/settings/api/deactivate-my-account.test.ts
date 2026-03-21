import { deactivateMyAccount } from '@/features/settings/api/deactivate-my-account';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('deactivateMyAccount', () => {
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

  it('deactivates the current account through the limited settings RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        profile_id: 'user-1',
        role: 'employee',
        status: 'deactivated',
      },
      error: null,
    });

    await expect(deactivateMyAccount()).resolves.toEqual({
      profile_id: 'user-1',
      role: 'employee',
      status: 'deactivated',
    });

    expect(mockRpc).toHaveBeenCalledWith('deactivate_my_account');
  });
});
