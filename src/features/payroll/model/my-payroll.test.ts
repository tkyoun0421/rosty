import { createMyPayrollSnapshot } from '@/features/payroll/model/my-payroll';

describe('createMyPayrollSnapshot', () => {
  it('returns only the current employee estimate from the shared payroll snapshot', () => {
    const snapshot = createMyPayrollSnapshot(
      {
        source: 'seed',
        sourceMessage: 'seeded fallback',
        policy: {
          defaultHourlyRate: 12000,
          overtimeThresholdMinutes: 480,
          overtimeMultiplier: 1.5,
        },
        summary: {
          totalEstimatedPay: 253000,
          estimatedMemberCount: 2,
          missingActualTimeCount: 1,
          overtimeShiftCount: 1,
          scheduleCount: 3,
        },
        members: [
          {
            memberId: 'member-1',
            fullName: 'Mina Staff',
            role: 'employee',
            totalEstimatedPay: 112000,
            totalMinutes: 480,
            estimatedShiftCount: 1,
            pendingScheduleCount: 1,
            shifts: [],
          },
          {
            memberId: 'member-2',
            fullName: 'Sera Staff',
            role: 'employee',
            totalEstimatedPay: 141000,
            totalMinutes: 630,
            estimatedShiftCount: 1,
            pendingScheduleCount: 0,
            shifts: [],
          },
        ],
      },
      'member-2',
    );

    expect(snapshot.source).toBe('seed');
    expect(snapshot.member?.fullName).toBe('Sera Staff');
    expect(snapshot.member?.totalEstimatedPay).toBe(141000);
  });
});
