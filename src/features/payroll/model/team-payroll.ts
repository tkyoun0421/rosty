import type { UserRole } from '@/features/auth/model/auth-types';

export type TeamPayrollPolicy = {
  defaultHourlyRate: number;
  overtimeThresholdMinutes: number;
  overtimeMultiplier: number;
};

export type TeamPayrollMember = {
  id: string;
  fullName: string;
  role: UserRole;
  hourlyRate: number | null;
};

export type TeamPayrollAssignmentStatus =
  | 'proposed'
  | 'confirmed'
  | 'cancel_requested'
  | 'cancelled'
  | 'completed';

export type TeamPayrollAssignment = {
  id: string;
  scheduleId: string;
  assigneeUserId: string | null;
  positionName: string;
  status: TeamPayrollAssignmentStatus;
};

export type TeamPayrollScheduleTimeRecord = {
  scheduleId: string;
  scheduleTitle: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
};

export type TeamPayrollSource = {
  policy: TeamPayrollPolicy;
  members: TeamPayrollMember[];
  assignments: TeamPayrollAssignment[];
  scheduleTimeRecords: TeamPayrollScheduleTimeRecord[];
};

export type TeamPayrollShiftEstimate = {
  scheduleId: string;
  scheduleTitle: string;
  positionCount: number;
  hourlyRate: number;
  durationMinutes: number | null;
  regularMinutes: number;
  overtimeMinutes: number;
  regularPay: number;
  overtimePay: number;
  estimatedPay: number;
  status: 'estimated' | 'missing_actual_time';
};

export type TeamPayrollMemberEstimate = {
  memberId: string;
  fullName: string;
  role: UserRole;
  totalEstimatedPay: number;
  totalRegularPay: number;
  totalOvertimePay: number;
  totalMinutes: number;
  estimatedShiftCount: number;
  pendingScheduleCount: number;
  shifts: TeamPayrollShiftEstimate[];
};

export type TeamPayrollSummary = {
  totalEstimatedPay: number;
  regularPayTotal: number;
  overtimePayTotal: number;
  estimatedMemberCount: number;
  missingActualTimeCount: number;
  overtimeShiftCount: number;
  scheduleCount: number;
};

export type TeamPayrollSnapshot = {
  policy: TeamPayrollPolicy;
  summary: TeamPayrollSummary;
  members: TeamPayrollMemberEstimate[];
};

function isPayrollEligibleAssignment(status: TeamPayrollAssignmentStatus): boolean {
  return status !== 'proposed' && status !== 'cancelled';
}

function roundCurrency(value: number): number {
  return Math.round(value);
}

function diffMinutes(startAt: string, endAt: string): number | null {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000);

  return minutes > 0 ? minutes : null;
}

export function formatEstimatedPay(value: number): string {
  return `KRW ${value.toLocaleString('en-US')}`;
}

export function createTeamPayrollSnapshot(
  source: TeamPayrollSource,
): TeamPayrollSnapshot {
  const membersById = new Map(source.members.map((member) => [member.id, member]));
  const scheduleTimeRecordsById = new Map(
    source.scheduleTimeRecords.map((record) => [record.scheduleId, record]),
  );
  const groupedAssignments = new Map<string, TeamPayrollAssignment[]>();

  for (const assignment of source.assignments) {
    if (!assignment.assigneeUserId || !isPayrollEligibleAssignment(assignment.status)) {
      continue;
    }

    const key = `${assignment.assigneeUserId}:${assignment.scheduleId}`;
    const currentGroup = groupedAssignments.get(key) ?? [];
    currentGroup.push(assignment);
    groupedAssignments.set(key, currentGroup);
  }

  const members: TeamPayrollMemberEstimate[] = [];

  for (const [groupKey, assignments] of groupedAssignments.entries()) {
    const [memberId, scheduleId] = groupKey.split(':');
    const member = membersById.get(memberId);
    const scheduleTimeRecord = scheduleTimeRecordsById.get(scheduleId);

    if (!member || !scheduleTimeRecord) {
      continue;
    }

    const hourlyRate = member.hourlyRate ?? source.policy.defaultHourlyRate;
    const durationMinutes =
      scheduleTimeRecord.actualStartAt && scheduleTimeRecord.actualEndAt
        ? diffMinutes(
            scheduleTimeRecord.actualStartAt,
            scheduleTimeRecord.actualEndAt,
          )
        : null;

    const regularMinutes =
      durationMinutes === null
        ? 0
        : Math.min(durationMinutes, source.policy.overtimeThresholdMinutes);
    const overtimeMinutes =
      durationMinutes === null
        ? 0
        : Math.max(0, durationMinutes - source.policy.overtimeThresholdMinutes);
    const regularPay =
      durationMinutes === null
        ? 0
        : roundCurrency((regularMinutes / 60) * hourlyRate);
    const overtimePay =
      durationMinutes === null
        ? 0
        : roundCurrency(
            (overtimeMinutes / 60) *
              hourlyRate *
              source.policy.overtimeMultiplier,
          );
    const estimatedPay =
      durationMinutes === null
        ? 0
        : regularPay + overtimePay;

    const shift: TeamPayrollShiftEstimate = {
      scheduleId,
      scheduleTitle: scheduleTimeRecord.scheduleTitle,
      positionCount: assignments.length,
      hourlyRate,
      durationMinutes,
      regularMinutes,
      overtimeMinutes,
      regularPay,
      overtimePay,
      estimatedPay,
      status: durationMinutes === null ? 'missing_actual_time' : 'estimated',
    };

    const currentMember =
      members.find((entry) => entry.memberId === member.id) ?? null;

    if (!currentMember) {
      members.push({
        memberId: member.id,
        fullName: member.fullName,
        role: member.role,
        totalEstimatedPay: estimatedPay,
        totalRegularPay: regularPay,
        totalOvertimePay: overtimePay,
        totalMinutes: durationMinutes ?? 0,
        estimatedShiftCount: durationMinutes === null ? 0 : 1,
        pendingScheduleCount: durationMinutes === null ? 1 : 0,
        shifts: [shift],
      });
      continue;
    }

    currentMember.totalEstimatedPay += estimatedPay;
    currentMember.totalRegularPay += regularPay;
    currentMember.totalOvertimePay += overtimePay;
    currentMember.totalMinutes += durationMinutes ?? 0;
    currentMember.estimatedShiftCount += durationMinutes === null ? 0 : 1;
    currentMember.pendingScheduleCount += durationMinutes === null ? 1 : 0;
    currentMember.shifts.push(shift);
  }

  members.sort((left, right) => left.fullName.localeCompare(right.fullName));

  const summary: TeamPayrollSummary = {
    totalEstimatedPay: members.reduce(
      (total, member) => total + member.totalEstimatedPay,
      0,
    ),
    regularPayTotal: members.reduce(
      (total, member) => total + member.totalRegularPay,
      0,
    ),
    overtimePayTotal: members.reduce(
      (total, member) => total + member.totalOvertimePay,
      0,
    ),
    estimatedMemberCount: members.filter(
      (member) => member.estimatedShiftCount > 0 || member.pendingScheduleCount > 0,
    ).length,
    missingActualTimeCount: members.reduce(
      (total, member) => total + member.pendingScheduleCount,
      0,
    ),
    overtimeShiftCount: members.reduce(
      (total, member) =>
        total +
        member.shifts.filter((shift) => shift.overtimeMinutes > 0).length,
      0,
    ),
    scheduleCount: members.reduce((total, member) => total + member.shifts.length, 0),
  };

  return {
    policy: source.policy,
    summary,
    members,
  };
}
