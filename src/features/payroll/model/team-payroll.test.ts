import {
  createTeamPayrollSnapshot,
  formatEstimatedPay,
  type TeamPayrollSource,
} from '@/features/payroll/model/team-payroll';

function createSource(): TeamPayrollSource {
  return {
    policy: {
      defaultHourlyRate: 12000,
      overtimeThresholdMinutes: 480,
      overtimeMultiplier: 1.5,
    },
    members: [
      {
        id: 'member-1',
        fullName: 'Mina Staff',
        role: 'employee',
        hourlyRate: 14000,
      },
      {
        id: 'member-2',
        fullName: 'Sera Staff',
        role: 'employee',
        hourlyRate: null,
      },
    ],
    assignments: [
      {
        id: 'assignment-1',
        scheduleId: 'schedule-1',
        assigneeUserId: 'member-1',
        positionName: 'Bride room',
        status: 'confirmed',
      },
      {
        id: 'assignment-2',
        scheduleId: 'schedule-1',
        assigneeUserId: 'member-1',
        positionName: 'Guest hall',
        status: 'confirmed',
      },
      {
        id: 'assignment-3',
        scheduleId: 'schedule-2',
        assigneeUserId: 'member-2',
        positionName: 'Banquet',
        status: 'completed',
      },
      {
        id: 'assignment-4',
        scheduleId: 'schedule-3',
        assigneeUserId: 'member-2',
        positionName: 'Support',
        status: 'cancelled',
      },
      {
        id: 'assignment-5',
        scheduleId: 'schedule-4',
        assigneeUserId: 'member-1',
        positionName: 'Reception',
        status: 'confirmed',
      },
    ],
    scheduleTimeRecords: [
      {
        scheduleId: 'schedule-1',
        scheduleTitle: 'March 23 Grand Hall wedding',
        actualStartAt: '2026-03-23T01:00:00.000Z',
        actualEndAt: '2026-03-23T09:00:00.000Z',
      },
      {
        scheduleId: 'schedule-2',
        scheduleTitle: 'March 24 Garden Hall reception',
        actualStartAt: '2026-03-24T00:00:00.000Z',
        actualEndAt: '2026-03-24T10:30:00.000Z',
      },
      {
        scheduleId: 'schedule-3',
        scheduleTitle: 'March 28 Convention Hall banquet',
        actualStartAt: '2026-03-28T01:00:00.000Z',
        actualEndAt: '2026-03-28T07:00:00.000Z',
      },
      {
        scheduleId: 'schedule-4',
        scheduleTitle: 'March 29 Convention Hall banquet',
        actualStartAt: null,
        actualEndAt: null,
      },
    ],
  };
}

describe('team payroll snapshot', () => {
  it('dedupes duplicate schedule assignments into one paid shift', () => {
    const snapshot = createTeamPayrollSnapshot(createSource());
    const mina = snapshot.members.find((member) => member.memberId === 'member-1');

    expect(mina?.shifts).toHaveLength(2);
    expect(mina?.shifts[0]?.positionCount).toBe(2);
    expect(mina?.totalEstimatedPay).toBe(112000);
    expect(mina?.totalRegularPay).toBe(112000);
    expect(mina?.totalOvertimePay).toBe(0);
  });

  it('falls back to the hall default rate and applies overtime', () => {
    const snapshot = createTeamPayrollSnapshot(createSource());
    const sera = snapshot.members.find((member) => member.memberId === 'member-2');

    expect(sera?.shifts[0]?.hourlyRate).toBe(12000);
    expect(sera?.shifts[0]?.overtimeMinutes).toBe(150);
    expect(sera?.shifts[0]?.regularPay).toBe(96000);
    expect(sera?.shifts[0]?.overtimePay).toBe(45000);
    expect(sera?.shifts[0]?.estimatedPay).toBe(141000);
  });

  it('excludes cancelled assignments and tracks missing actual time separately', () => {
    const snapshot = createTeamPayrollSnapshot(createSource());
    const mina = snapshot.members.find((member) => member.memberId === 'member-1');

    expect(snapshot.summary.scheduleCount).toBe(3);
    expect(snapshot.summary.missingActualTimeCount).toBe(1);
    expect(snapshot.summary.regularPayTotal).toBe(208000);
    expect(snapshot.summary.overtimePayTotal).toBe(45000);
    expect(mina?.pendingScheduleCount).toBe(1);
    expect(mina?.shifts[1]?.status).toBe('missing_actual_time');
  });

  it('formats estimated pay for display', () => {
    expect(formatEstimatedPay(253000)).toBe('KRW 253,000');
  });
});
