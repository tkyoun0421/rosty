import {
  setMemberPayRate,
  upsertHallPayPolicy,
} from '@/features/payroll/api/manage-pay-policy';

const mockRpc = jest.fn();
const mockReturns = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

describe('pay policy admin RPC wrappers', () => {
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

  it('calls the hall pay policy RPC with the requested values', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 1,
        default_hourly_rate: '12000.00',
        overtime_threshold_minutes: 480,
        overtime_multiplier: '1.50',
        updated_by: 'admin-1',
        updated_at: '2026-03-19T12:00:00.000Z',
      },
      error: null,
    });

    await expect(
      upsertHallPayPolicy({
        defaultHourlyRate: 12000,
        overtimeThresholdMinutes: 480,
        overtimeMultiplier: 1.5,
      }),
    ).resolves.toBeUndefined();

    expect(mockRpc).toHaveBeenCalledWith('admin_upsert_pay_policy', {
      p_default_hourly_rate: 12000,
      p_overtime_threshold_minutes: 480,
      p_overtime_multiplier: 1.5,
    });
  });

  it('calls the member pay-rate RPC and allows clearing the override', async () => {
    mockSingle.mockResolvedValue({
      data: {
        user_id: 'member-1',
        hourly_rate: null,
        updated_by: 'admin-1',
        updated_at: '2026-03-19T12:10:00.000Z',
        cleared: true,
      },
      error: null,
    });

    await expect(
      setMemberPayRate({
        userId: 'member-1',
        hourlyRate: null,
      }),
    ).resolves.toBeUndefined();

    expect(mockRpc).toHaveBeenCalledWith('admin_set_pay_rate', {
      p_user_id: 'member-1',
      p_hourly_rate: null,
    });
  });

  it('surfaces RPC failures', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: 'Only active admins can manage pay policy.',
      },
    });

    await expect(
      upsertHallPayPolicy({
        defaultHourlyRate: 13500,
        overtimeThresholdMinutes: 540,
        overtimeMultiplier: 1.75,
      }),
    ).rejects.toThrow('Only active admins can manage pay policy.');
  });

  it('fails when the RPC returns no row', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      setMemberPayRate({
        userId: 'member-1',
        hourlyRate: 14250,
      }),
    ).rejects.toThrow('Member pay rate could not be saved.');
  });
});
