import { saveSchedule } from '@/features/schedules/api/save-schedule';

const mockFrom = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('saveSchedule', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockInsert.mockReset();
    mockUpdate.mockReset();
    mockSelect.mockReset();
    mockSingle.mockReset();
    mockDelete.mockReset();
    mockEq.mockReset();
  });

  it('creates a new schedule and writes slot rows', async () => {
    mockFrom
      .mockReturnValueOnce({
        insert: mockInsert,
      })
      .mockReturnValueOnce({
        delete: mockDelete,
      })
      .mockReturnValueOnce({
        insert: mockInsert,
      });

    mockInsert
      .mockReturnValueOnce({
        select: mockSelect,
      })
      .mockReturnValueOnce(Promise.resolve({ error: null }));
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { id: 'schedule-99' },
      error: null,
    });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({
      error: null,
    });

    await expect(
      saveSchedule({
        scheduleId: null,
        actorUserId: 'manager-1',
        payload: {
          eventDate: '2026-03-30',
          packageCount: 4,
          memo: 'Grand Hall wedding',
          collectionState: 'open',
          status: 'collecting',
          slots: [
            {
              id: null,
              presetId: 'preset-1',
              positionName: 'Bride room',
              headcount: 1,
              requiredGender: 'female',
              isRequired: true,
              isEnabled: true,
              sortOrder: 0,
            },
          ],
        },
      }),
    ).resolves.toEqual({ scheduleId: 'schedule-99' });
  });
});
