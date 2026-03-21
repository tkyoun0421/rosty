import { updateSettingsProfile } from '@/features/settings/api/update-settings-profile';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('updateSettingsProfile', () => {
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

  it('updates the limited profile fields through the settings RPC', async () => {
    mockSingle.mockResolvedValue({
      data: {
        profile_id: 'user-1',
        full_name: 'Mina Staff',
        phone_number: '01012345678',
        gender: 'female',
        role: 'employee',
        status: 'active',
      },
      error: null,
    });

    await expect(
      updateSettingsProfile({
        fullName: 'Mina Staff',
        phoneNumber: '01012345678',
        gender: 'female',
      }),
    ).resolves.toEqual({
      profile_id: 'user-1',
      full_name: 'Mina Staff',
      phone_number: '01012345678',
      gender: 'female',
      role: 'employee',
      status: 'active',
    });
  });
});
