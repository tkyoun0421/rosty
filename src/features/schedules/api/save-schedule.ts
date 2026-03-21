import { scheduleSeedRows, scheduleSlotSeedRows } from '@/features/schedules/api/schedule-read-fallback';
import type { SaveSchedulePayload } from '@/features/schedules/model/schedule-edit';
import { supabaseClient } from '@/shared/lib/supabase/client';

type SaveScheduleInput = {
  scheduleId: string | null;
  actorUserId: string;
  payload: SaveSchedulePayload;
};

type SavedScheduleResult = {
  scheduleId: string;
};

function ensureSeedScheduleId(currentId: string | null) {
  return currentId ?? `schedule-${scheduleSeedRows.length + 1}`;
}

export async function saveSchedule(
  input: SaveScheduleInput,
): Promise<SavedScheduleResult> {
  if (!supabaseClient) {
    const scheduleId = ensureSeedScheduleId(input.scheduleId);
    const scheduleIndex = scheduleSeedRows.findIndex((schedule) => schedule.id === scheduleId);

    const nextSchedule = {
      id: scheduleId,
      event_date: input.payload.eventDate,
      package_count: input.payload.packageCount,
      status: input.payload.status,
      collection_state: input.payload.collectionState,
      memo: input.payload.memo,
    };

    if (scheduleIndex === -1) {
      scheduleSeedRows.push(nextSchedule);
    } else {
      scheduleSeedRows[scheduleIndex] = nextSchedule;
    }

    for (let index = scheduleSlotSeedRows.length - 1; index >= 0; index -= 1) {
      if (scheduleSlotSeedRows[index]?.schedule_id === scheduleId) {
        scheduleSlotSeedRows.splice(index, 1);
      }
    }

    for (const slot of input.payload.slots) {
      scheduleSlotSeedRows.push({
        id: slot.id ?? `slot-${scheduleSlotSeedRows.length + 1}`,
        schedule_id: scheduleId,
        position_name: slot.positionName,
        headcount: slot.headcount,
        required_gender: slot.requiredGender,
        is_enabled: slot.isEnabled,
      });
    }

    return { scheduleId };
  }

  const baseSchedule = {
    event_date: input.payload.eventDate,
    package_count: input.payload.packageCount,
    status: input.payload.status,
    collection_state: input.payload.collectionState,
    memo: input.payload.memo,
    created_by: input.actorUserId,
    updated_by: input.actorUserId,
  };

  let scheduleId = input.scheduleId;

  if (scheduleId) {
    const { error } = await supabaseClient
      .from('schedules')
      .update({
        ...baseSchedule,
        created_by: undefined,
      })
      .eq('id', scheduleId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { data, error } = await supabaseClient
      .from('schedules')
      .insert(baseSchedule)
      .select('id')
      .single<{ id: string }>();

    if (error || !data) {
      throw new Error(error?.message ?? 'The schedule could not be created.');
    }

    scheduleId = data.id;
  }

  if (!scheduleId) {
    throw new Error('The schedule could not be saved.');
  }

  const { error: deleteError } = await supabaseClient
    .from('schedule_slots')
    .delete()
    .eq('schedule_id', scheduleId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: insertError } = await supabaseClient.from('schedule_slots').insert(
    input.payload.slots.map((slot) => ({
      schedule_id: scheduleId,
      preset_id: slot.presetId,
      position_name: slot.positionName,
      headcount: slot.headcount,
      required_gender: slot.requiredGender,
      is_required: slot.isRequired,
      is_enabled: slot.isEnabled,
      sort_order: slot.sortOrder,
    })),
  );

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { scheduleId };
}
