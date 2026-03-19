import { fetchInvitationForJoin } from '@/features/invitations/api/fetch-invitation-join';

const mockRpc = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  hasSupabaseConfig: true,
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('fetchInvitationForJoin', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it('reads invitation status through the limited RPC', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          id: 'invite-1',
          token: 'invite-token',
          target_role: 'employee',
          created_by: 'admin-1',
          expires_at: '2026-03-26T00:00:00.000Z',
          consumed_at: null,
          disabled_at: null,
          created_at: '2026-03-19T00:00:00.000Z',
        },
      ],
      error: null,
    });

    await expect(fetchInvitationForJoin('invite-token')).resolves.toEqual({
      id: 'invite-1',
      token: 'invite-token',
      targetRole: 'employee',
      createdBy: 'admin-1',
      expiresAt: '2026-03-26T00:00:00.000Z',
      consumedAt: null,
      disabledAt: null,
      createdAt: '2026-03-19T00:00:00.000Z',
    });

    expect(mockRpc).toHaveBeenCalledWith('get_employee_invitation_status', {
      p_invitation_token: 'invite-token',
    });
  });

  it('returns null when the RPC returns no invitation row', async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
    });

    await expect(fetchInvitationForJoin('missing-token')).resolves.toBeNull();
  });

  it('surfaces RPC errors', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: 'status lookup failed',
      },
    });

    await expect(fetchInvitationForJoin('broken-token')).rejects.toThrow(
      'status lookup failed',
    );
  });
});