import { saveWorkTime } from '@/features/work-time/api/save-work-time';

const mockFrom = jest.fn();
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('saveWorkTime', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUpsert.mockReset();
    mockSelect.mockReset();
    mockSingle.mockReset();

    mockFrom.mockReturnValue({
      upsert: mockUpsert,
    });
    mockUpsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
  });

  it('upserts the schedule_time_records row', async () => {
    mockSingle.mockResolvedValue({
      data: {
        schedule_id: 'schedule-1',
        planned_start_at: '2026-03-22T10:00:00.000Z',
        planned_end_at: '2026-03-22T18:00:00.000Z',
        actual_start_at: null,
        actual_end_at: null,
        status: 'planned',
        updated_at: '2026-03-21T10:00:00.000Z',
      },
      error: null,
    });

    await expect(
      saveWorkTime({
        scheduleId: 'schedule-1',
        actorUserId: 'manager-1',
        plannedStartAt: '2026-03-22T10:00:00.000Z',
        plannedEndAt: '2026-03-22T18:00:00.000Z',
        actualStartAt: null,
        actualEndAt: null,
        status: 'planned',
      }),
    ).resolves.toEqual({
      schedule_id: 'schedule-1',
      planned_start_at: '2026-03-22T10:00:00.000Z',
      planned_end_at: '2026-03-22T18:00:00.000Z',
      actual_start_at: null,
      actual_end_at: null,
      status: 'planned',
      updated_at: '2026-03-21T10:00:00.000Z',
    });
  });
});
