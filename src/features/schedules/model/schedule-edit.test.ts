import {
  createScheduleEditFormValues,
  validateScheduleEditForm,
  type SlotPreset,
} from '@/features/schedules/model/schedule-edit';

const presets: SlotPreset[] = [
  {
    id: 'preset-1',
    code: 'bride-room',
    positionName: 'Bride room',
    defaultHeadcount: 1,
    requiredGender: 'female',
    isRequired: true,
    sortOrder: 0,
  },
  {
    id: 'preset-2',
    code: 'guest-hall',
    positionName: 'Guest hall',
    defaultHeadcount: 2,
    requiredGender: 'any',
    isRequired: true,
    sortOrder: 1,
  },
];

describe('schedule edit form helpers', () => {
  it('creates slot form values from presets for a new schedule', () => {
    const values = createScheduleEditFormValues({
      schedule: null,
      slots: [],
      presets,
    });

    expect(values.slots).toHaveLength(2);
    expect(values.slots[0]?.positionName).toBe('Bride room');
  });

  it('validates future event date, positive packages, and enabled required slots', () => {
    const result = validateScheduleEditForm(
      {
        eventDate: '2026-03-24',
        packageCount: '4',
        memo: 'Grand Hall wedding',
        collectionState: 'open',
        slots: [
          {
            id: 'seed-preset-1',
            presetId: 'preset-1',
            positionName: 'Bride room',
            headcount: '1',
            requiredGender: 'female',
            isRequired: true,
            isEnabled: true,
            sortOrder: 0,
          },
        ],
      },
      '2026-03-21',
    );

    expect(result.payload?.packageCount).toBe(4);
    expect(result.errors).toEqual({});
  });

  it('blocks past dates and schedules with no enabled slots', () => {
    const result = validateScheduleEditForm(
      {
        eventDate: '2026-03-20',
        packageCount: '0',
        memo: '',
        collectionState: 'open',
        slots: [
          {
            id: 'seed-preset-1',
            presetId: 'preset-1',
            positionName: 'Bride room',
            headcount: '1',
            requiredGender: 'female',
            isRequired: true,
            isEnabled: false,
            sortOrder: 0,
          },
        ],
      },
      '2026-03-21',
    );

    expect(result.payload).toBeNull();
    expect(result.errors.eventDate).toBe(
      'Past dates cannot be used for new schedule planning.',
    );
    expect(result.errors.packageCount).toBe('Package count must be at least 1.');
    expect(result.errors.slots).toBe(
      'At least one required slot must stay enabled before saving the schedule.',
    );
  });
});
