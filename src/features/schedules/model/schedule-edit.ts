import type {
  AvailabilityCollectionState,
  RequiredGender,
  ScheduleStatus,
} from '@/features/schedules/model/schedules';

export type SlotPreset = {
  id: string;
  code: string;
  positionName: string;
  defaultHeadcount: number;
  requiredGender: RequiredGender;
  isRequired: boolean;
  sortOrder: number;
};

export type ScheduleEditSlotForm = {
  id: string;
  presetId: string | null;
  positionName: string;
  headcount: string;
  requiredGender: RequiredGender;
  isRequired: boolean;
  isEnabled: boolean;
  sortOrder: number;
};

export type ScheduleEditFormValues = {
  eventDate: string;
  packageCount: string;
  memo: string;
  collectionState: AvailabilityCollectionState;
  slots: ScheduleEditSlotForm[];
};

export type ScheduleEditFieldErrors = {
  eventDate?: string;
  packageCount?: string;
  slots?: string;
};

export type SaveSchedulePayload = {
  eventDate: string;
  packageCount: number;
  memo: string | null;
  collectionState: AvailabilityCollectionState;
  status: ScheduleStatus;
  slots: {
    id: string | null;
    presetId: string | null;
    positionName: string;
    headcount: number;
    requiredGender: RequiredGender;
    isRequired: boolean;
    isEnabled: boolean;
    sortOrder: number;
  }[];
};

export function createScheduleEditFormValues(input: {
  schedule:
    | {
        eventDate: string;
        packageCount: number;
        memo: string | null;
        collectionState: AvailabilityCollectionState;
      }
    | null;
  slots: {
    id: string;
    presetId: string | null;
    positionName: string;
    headcount: number;
    requiredGender: RequiredGender;
    isRequired: boolean;
    isEnabled: boolean;
    sortOrder: number;
  }[];
  presets: SlotPreset[];
}): ScheduleEditFormValues {
  const baseSlots =
    input.slots.length > 0
      ? input.slots
      : input.presets.map((preset) => ({
          id: `seed-${preset.id}`,
          presetId: preset.id,
          positionName: preset.positionName,
          headcount: preset.defaultHeadcount,
          requiredGender: preset.requiredGender,
          isRequired: preset.isRequired,
          isEnabled: true,
          sortOrder: preset.sortOrder,
        }));

  return {
    eventDate: input.schedule?.eventDate ?? '',
    packageCount: input.schedule ? String(input.schedule.packageCount) : '1',
    memo: input.schedule?.memo ?? '',
    collectionState: input.schedule?.collectionState ?? 'open',
    slots: baseSlots.map((slot) => ({
      id: slot.id,
      presetId: slot.presetId,
      positionName: slot.positionName,
      headcount: String(slot.headcount),
      requiredGender: slot.requiredGender,
      isRequired: slot.isRequired,
      isEnabled: slot.isEnabled,
      sortOrder: slot.sortOrder,
    })),
  };
}

export function validateScheduleEditForm(
  values: ScheduleEditFormValues,
  today: string,
): {
  payload: SaveSchedulePayload | null;
  errors: ScheduleEditFieldErrors;
} {
  const errors: ScheduleEditFieldErrors = {};
  const eventDate = values.eventDate.trim();
  const packageCount = Number(values.packageCount.trim());

  if (eventDate.length === 0) {
    errors.eventDate = 'Enter an event date.';
  } else if (eventDate < today) {
    errors.eventDate = 'Past dates cannot be used for new schedule planning.';
  }

  if (!Number.isInteger(packageCount) || packageCount <= 0) {
    errors.packageCount = 'Package count must be at least 1.';
  }

  const normalizedSlots = values.slots.map((slot) => ({
    id: slot.id.startsWith('seed-') ? null : slot.id,
    presetId: slot.presetId,
    positionName: slot.positionName.trim(),
    headcount: Number(slot.headcount.trim()),
    requiredGender: slot.requiredGender,
    isRequired: slot.isRequired,
    isEnabled: slot.isEnabled,
    sortOrder: slot.sortOrder,
  }));

  if (normalizedSlots.filter((slot) => slot.isEnabled).length === 0) {
    errors.slots = 'Enable at least one slot before saving the schedule.';
  }

  if (
    normalizedSlots.filter((slot) => slot.isEnabled && slot.isRequired).length === 0
  ) {
    errors.slots =
      'At least one required slot must stay enabled before saving the schedule.';
  }

  if (
    normalizedSlots.some(
      (slot) => slot.positionName.length === 0 || !Number.isInteger(slot.headcount) || slot.headcount <= 0,
    )
  ) {
    errors.slots = 'Each slot needs a position name and headcount of at least 1.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      payload: null,
      errors,
    };
  }

  return {
    payload: {
      eventDate,
      packageCount,
      memo: values.memo.trim() || null,
      collectionState: values.collectionState,
      status: 'collecting',
      slots: normalizedSlots,
    },
    errors: {},
  };
}
