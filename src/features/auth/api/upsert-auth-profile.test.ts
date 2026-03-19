import { upsertAuthProfile } from '@/features/auth/api/upsert-auth-profile';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('upsertAuthProfile', () => {
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

  it('completes profile setup through the limited RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        profile_id: 'user-1',
        role: 'employee',
        status: 'pending_approval',
      },
      error: null,
    });

    await expect(
      upsertAuthProfile({
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).resolves.toBeUndefined();

    expect(mockRpc).toHaveBeenCalledWith('complete_profile_setup', {
      p_full_name: 'Mina Staff',
      p_phone_number: '01012345678',
      p_gender: 'female',
    });
  });

  it('surfaces profile setup RPC failures', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: 'Profile setup is only available during onboarding.',
      },
    });

    await expect(
      upsertAuthProfile({
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).rejects.toThrow('Profile setup is only available during onboarding.');
  });

  it('fails when the profile setup RPC returns no row', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      upsertAuthProfile({
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).rejects.toThrow('Profile setup could not be completed.');
  });
});