import { mapLiveTeamPayrollSource } from '@/features/payroll/api/fetch-team-payroll';

describe('mapLiveTeamPayrollSource', () => {
  it('maps Supabase rows into the team payroll calculation source', () => {
    const source = mapLiveTeamPayrollSource({
      policy: {
        default_hourly_rate: '12000',
        overtime_threshold_minutes: 480,
        overtime_multiplier: '1.5',
      },
      payRates: [
        {
          user_id: 'member-1',
          hourly_rate: '14000',
        },
      ],
      members: [
        {
          id: 'member-1',
          full_name: 'Mina Staff',
          role: 'employee',
          status: 'active',
        },
        {
          id: 'member-2',
          full_name: 'Retired Staff',
          role: 'employee',
          status: 'deactivated',
        },
      ],
      assignments: [
        {
          id: 'assignment-1',
          schedule_id: 'schedule-1',
          assignee_user_id: 'member-1',
          status: 'confirmed',
        },
      ],
      schedules: [
        {
          id: 'schedule-1',
          event_date: '2026-03-23',
          package_count: 4,
          memo: 'Grand Hall wedding',
        },
      ],
      scheduleTimeRecords: [
        {
          schedule_id: 'schedule-1',
          actual_start_at: '2026-03-23T01:00:00.000Z',
          actual_end_at: '2026-03-23T09:00:00.000Z',
        },
      ],
    });

    expect(source.policy).toEqual({
      defaultHourlyRate: 12000,
      overtimeThresholdMinutes: 480,
      overtimeMultiplier: 1.5,
    });
    expect(source.members).toEqual([
      {
        id: 'member-1',
        fullName: 'Mina Staff',
        role: 'employee',
        hourlyRate: 14000,
      },
    ]);
    expect(source.scheduleTimeRecords[0]?.scheduleTitle).toBe(
      '2026-03-23 · Grand Hall wedding',
    );
  });
});
