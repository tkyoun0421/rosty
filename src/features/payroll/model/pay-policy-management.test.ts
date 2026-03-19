import {
  countMemberRateOverrides,
  createHallPayPolicyFormValues,
  createMemberPayRateDrafts,
  formatHourlyRate,
  formatMultiplier,
  resolveEffectiveHourlyRate,
  validateHallPayPolicy,
  validateMemberPayRate,
  type HallPayPolicy,
  type PayPolicyMember,
} from '@/features/payroll/model/pay-policy-management';

const hallPolicy: HallPayPolicy = {
  id: 1,
  defaultHourlyRate: 12000,
  overtimeThresholdMinutes: 480,
  overtimeMultiplier: 1.5,
  updatedBy: 'admin-1',
  updatedAt: '2026-03-19T12:00:00.000Z',
};

const members: PayPolicyMember[] = [
  {
    id: 'member-1',
    fullName: 'Mina Staff',
    role: 'employee',
    status: 'active',
    hourlyRate: null,
  },
  {
    id: 'member-2',
    fullName: 'Joon Manager',
    role: 'manager',
    status: 'active',
    hourlyRate: 14500,
  },
];

describe('pay policy management', () => {
  it('builds form values from the current hall policy', () => {
    expect(createHallPayPolicyFormValues(hallPolicy)).toEqual({
      defaultHourlyRate: '12000',
      overtimeThresholdMinutes: '480',
      overtimeMultiplier: '1.5',
    });
    expect(createHallPayPolicyFormValues(null)).toEqual({
      defaultHourlyRate: '',
      overtimeThresholdMinutes: '',
      overtimeMultiplier: '',
    });
  });

  it('validates hall policy inputs and returns parsed numeric values', () => {
    expect(
      validateHallPayPolicy({
        defaultHourlyRate: '13,500',
        overtimeThresholdMinutes: '540',
        overtimeMultiplier: '1.75',
      }),
    ).toEqual({
      values: {
        defaultHourlyRate: 13500,
        overtimeThresholdMinutes: 540,
        overtimeMultiplier: 1.75,
      },
      errors: {},
    });
  });

  it('rejects invalid hall policy values', () => {
    expect(
      validateHallPayPolicy({
        defaultHourlyRate: '0',
        overtimeThresholdMinutes: '-10',
        overtimeMultiplier: '0.5',
      }).errors,
    ).toEqual({
      defaultHourlyRate: 'Default hourly rate must be greater than 0.',
      overtimeThresholdMinutes: 'Overtime threshold must be 0 minutes or more.',
      overtimeMultiplier: 'Overtime multiplier must be 1.0 or higher.',
    });
  });

  it('parses member pay rates and allows empty input to clear the override', () => {
    expect(validateMemberPayRate('14,250')).toEqual({
      value: 14250,
      error: null,
    });
    expect(validateMemberPayRate('')).toEqual({
      value: null,
      error: null,
    });
    expect(validateMemberPayRate('0')).toEqual({
      value: null,
      error: 'Member hourly rate must be greater than 0.',
    });
  });

  it('merges hall defaults with member overrides', () => {
    expect(resolveEffectiveHourlyRate(hallPolicy, members[0])).toBe(12000);
    expect(resolveEffectiveHourlyRate(hallPolicy, members[1])).toBe(14500);
    expect(resolveEffectiveHourlyRate(null, members[0])).toBeNull();
    expect(countMemberRateOverrides(members)).toBe(1);
    expect(createMemberPayRateDrafts(members)).toEqual({
      'member-1': '',
      'member-2': '14500',
    });
  });

  it('formats rate and multiplier labels for the screen', () => {
    expect(formatHourlyRate(12000)).toBe('KRW 12,000/hr');
    expect(formatHourlyRate(12500.5)).toBe('KRW 12,500.50/hr');
    expect(formatHourlyRate(null)).toBe('Not set');
    expect(formatMultiplier(1.5)).toBe('1.50x');
  });
});
