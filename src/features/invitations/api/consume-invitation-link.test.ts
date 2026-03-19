import { completeEmployeeJoin } from '@/features/invitations/api/consume-invitation-link';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('completeEmployeeJoin', () => {
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

  it('calls the employee join RPC with the invitation and profile payload', async () => {
    mockSingle.mockResolvedValue({
      data: {
        profile_id: 'user-1',
        consumed_at: '2026-03-19T09:30:00.000Z',
      },
      error: null,
    });

    await expect(
      completeEmployeeJoin({
        invitationToken: 'invite-token',
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).resolves.toEqual({
      profileId: 'user-1',
      consumedAt: '2026-03-19T09:30:00.000Z',
    });

    expect(mockRpc).toHaveBeenCalledWith('complete_employee_join', {
      p_invitation_token: 'invite-token',
      p_full_name: 'Mina Staff',
      p_phone_number: '01012345678',
      p_gender: 'female',
    });
  });

  it('surfaces RPC errors from Supabase', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: 'This invitation link is no longer valid.',
      },
    });

    await expect(
      completeEmployeeJoin({
        invitationToken: 'bad-token',
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).rejects.toThrow('This invitation link is no longer valid.');
  });

  it('fails when the RPC returns no row', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      completeEmployeeJoin({
        invitationToken: 'invite-token',
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).rejects.toThrow('Employee join could not be completed.');
  });
});