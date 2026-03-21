import { saveAssignmentDraft } from '@/features/assignments/api/save-assignment-draft';

const mockFrom = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  supabaseClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('saveAssignmentDraft', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockInsert.mockReset();
  });

  it('persists explicit exception cases on draft insert', async () => {
    mockFrom.mockReturnValue({
      insert: mockInsert,
    });
    mockInsert.mockResolvedValue({
      error: null,
    });

    await expect(
      saveAssignmentDraft({
        scheduleId: 'schedule-1',
        slotId: 'slot-2',
        assignmentId: null,
        assigneeUserId: 'employee-1',
        guestName: null,
        isExceptionCase: true,
        actorUserId: 'manager-1',
      }),
    ).resolves.toBeUndefined();

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_exception_case: true,
        assignee_user_id: 'employee-1',
      }),
    );
  });

  it('maps duplicate-assignee errors to a clearer exception prompt', async () => {
    mockFrom.mockReturnValue({
      insert: mockInsert,
    });
    mockInsert.mockResolvedValue({
      error: {
        message:
          'duplicate key value violates unique constraint "assignments_schedule_assignee_unique"',
      },
    });

    await expect(
      saveAssignmentDraft({
        scheduleId: 'schedule-1',
        slotId: 'slot-2',
        assignmentId: null,
        assigneeUserId: 'employee-1',
        guestName: null,
        isExceptionCase: false,
        actorUserId: 'manager-1',
      }),
    ).rejects.toThrow(
      'This employee is already assigned on the same schedule. Confirm the exception flow to allow a duplicate assignment.',
    );
  });
});
