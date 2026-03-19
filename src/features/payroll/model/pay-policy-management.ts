import type { UserRole } from '@/features/auth/model/auth-types';
import type { MemberStatus } from '@/features/members/model/member-management';

export type HallPayPolicy = {
  id: number;
  defaultHourlyRate: number;
  overtimeThresholdMinutes: number;
  overtimeMultiplier: number;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type PayPolicyMember = {
  id: string;
  fullName: string;
  role: UserRole;
  status: MemberStatus;
  hourlyRate: number | null;
};

export type PayPolicySnapshot = {
  policy: HallPayPolicy | null;
  members: PayPolicyMember[];
};

export type HallPayPolicyInput = {
  defaultHourlyRate: number;
  overtimeThresholdMinutes: number;
  overtimeMultiplier: number;
};

export type HallPayPolicyFormValues = {
  defaultHourlyRate: string;
  overtimeThresholdMinutes: string;
  overtimeMultiplier: string;
};

export type HallPayPolicyFieldErrors = Partial<
  Record<keyof HallPayPolicyFormValues, string>
>;

function normalizeNumberInput(value: string): string {
  return value.trim().replaceAll(',', '');
}

export function createHallPayPolicyFormValues(
  policy: HallPayPolicy | null,
): HallPayPolicyFormValues {
  if (!policy) {
    return {
      defaultHourlyRate: '',
      overtimeThresholdMinutes: '',
      overtimeMultiplier: '',
    };
  }

  return {
    defaultHourlyRate: String(policy.defaultHourlyRate),
    overtimeThresholdMinutes: String(policy.overtimeThresholdMinutes),
    overtimeMultiplier: String(policy.overtimeMultiplier),
  };
}

export function validateHallPayPolicy(
  values: HallPayPolicyFormValues,
): { values: HallPayPolicyInput | null; errors: HallPayPolicyFieldErrors } {
  const errors: HallPayPolicyFieldErrors = {};
  const defaultRateInput = normalizeNumberInput(values.defaultHourlyRate);
  const overtimeThresholdInput = normalizeNumberInput(
    values.overtimeThresholdMinutes,
  );
  const overtimeMultiplierInput = normalizeNumberInput(
    values.overtimeMultiplier,
  );

  const defaultHourlyRate = Number(defaultRateInput);
  const overtimeThresholdMinutes = Number(overtimeThresholdInput);
  const overtimeMultiplier = Number(overtimeMultiplierInput);

  if (defaultRateInput.length === 0) {
    errors.defaultHourlyRate = 'Enter a default hourly rate.';
  } else if (!Number.isFinite(defaultHourlyRate) || defaultHourlyRate <= 0) {
    errors.defaultHourlyRate = 'Default hourly rate must be greater than 0.';
  }

  if (overtimeThresholdInput.length === 0) {
    errors.overtimeThresholdMinutes = 'Enter an overtime threshold in minutes.';
  } else if (
    !Number.isInteger(overtimeThresholdMinutes) ||
    overtimeThresholdMinutes < 0
  ) {
    errors.overtimeThresholdMinutes =
      'Overtime threshold must be 0 minutes or more.';
  }

  if (overtimeMultiplierInput.length === 0) {
    errors.overtimeMultiplier = 'Enter an overtime multiplier.';
  } else if (!Number.isFinite(overtimeMultiplier) || overtimeMultiplier < 1) {
    errors.overtimeMultiplier = 'Overtime multiplier must be 1.0 or higher.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      values: null,
      errors,
    };
  }

  return {
    values: {
      defaultHourlyRate,
      overtimeThresholdMinutes,
      overtimeMultiplier,
    },
    errors: {},
  };
}

export function createMemberPayRateDrafts(
  members: PayPolicyMember[],
): Record<string, string> {
  return Object.fromEntries(
    members.map((member) => [
      member.id,
      member.hourlyRate === null ? '' : String(member.hourlyRate),
    ]),
  );
}

export function validateMemberPayRate(value: string): {
  value: number | null;
  error: string | null;
} {
  const normalized = normalizeNumberInput(value);

  if (normalized.length === 0) {
    return {
      value: null,
      error: null,
    };
  }

  const hourlyRate = Number(normalized);

  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
    return {
      value: null,
      error: 'Member hourly rate must be greater than 0.',
    };
  }

  return {
    value: hourlyRate,
    error: null,
  };
}

export function resolveEffectiveHourlyRate(
  policy: HallPayPolicy | null,
  member: PayPolicyMember,
): number | null {
  return member.hourlyRate ?? policy?.defaultHourlyRate ?? null;
}

export function countMemberRateOverrides(members: PayPolicyMember[]): number {
  return members.filter((member) => member.hourlyRate !== null).length;
}

export function formatHourlyRate(value: number | null): string {
  if (value === null) {
    return 'Not set';
  }

  const hasFraction = !Number.isInteger(value);
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return `KRW ${formatted}/hr`;
}

export function formatMultiplier(value: number | null): string {
  if (value === null) {
    return 'Not set';
  }

  return `${value.toFixed(2)}x`;
}

export function formatMemberRole(role: UserRole): string {
  switch (role) {
    case 'employee':
      return 'Employee';
    case 'manager':
      return 'Manager';
    case 'admin':
      return 'Admin';
  }
}

export function formatMemberStatus(status: MemberStatus): string {
  switch (status) {
    case 'profile_incomplete':
      return 'Incomplete';
    case 'pending_approval':
      return 'Pending';
    case 'active':
      return 'Active';
    case 'suspended':
      return 'Suspended';
    case 'deactivated':
      return 'Deactivated';
  }
}
