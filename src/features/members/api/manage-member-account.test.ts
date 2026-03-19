import { manageMemberAccount } from '@/features/members/api/manage-member-account';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('manageMemberAccount', () => {
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

  it('calls the admin member RPC with the requested action payload', async () => {
    mockSingle.mockResolvedValue({
      data: {
        profile_id: 'member-1',
        role: 'manager',
        status: 'active',
        approved_at: '2026-03-19T10:00:00.000Z',
        approved_by: 'admin-1',
      },
      error: null,
    });

    await expect(
      manageMemberAccount({
        memberId: 'member-1',
        action: 'change-role',
        nextRole: 'manager',
      }),
    ).resolves.toBeUndefined();

    expect(mockRpc).toHaveBeenCalledWith('admin_manage_member', {
      p_member_id: 'member-1',
      p_action: 'change-role',
      p_next_role: 'manager',
    });
  });

  it('passes null for nextRole when the action does not need it', async () => {
    mockSingle.mockResolvedValue({
      data: {
        profile_id: 'member-1',
        role: 'employee',
        status: 'suspended',
        approved_at: null,
        approved_by: null,
      },
      error: null,
    });

    await expect(
      manageMemberAccount({
        memberId: 'member-1',
        action: 'suspend',
      }),
    ).resolves.toBeUndefined();

    expect(mockRpc).toHaveBeenCalledWith('admin_manage_member', {
      p_member_id: 'member-1',
      p_action: 'suspend',
      p_next_role: null,
    });
  });

  it('surfaces member admin RPC failures', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: 'Only active admins can manage members.',
      },
    });

    await expect(
      manageMemberAccount({
        memberId: 'member-1',
        action: 'approve',
      }),
    ).rejects.toThrow('Only active admins can manage members.');
  });

  it('fails when the member admin RPC returns no row', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      manageMemberAccount({
        memberId: 'member-1',
        action: 'reactivate',
      }),
    ).rejects.toThrow('Member management update could not be completed.');
  });
});
