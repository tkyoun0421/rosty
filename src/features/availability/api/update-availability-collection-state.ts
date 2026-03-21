import { scheduleSeedRows } from '@/features/schedules/api/schedule-read-fallback';
import type { AvailabilityCollectionState } from '@/features/schedules/model/schedules';
import { supabaseClient } from '@/shared/lib/supabase/client';

type UpdateAvailabilityCollectionStateInput = {
  scheduleId: string;
  actorUserId: string;
  nextState: AvailabilityCollectionState;
};

type UpdatedScheduleRow = {
  id: string;
  collection_state: AvailabilityCollectionState;
};

export async function updateAvailabilityCollectionState(
  input: UpdateAvailabilityCollectionStateInput,
): Promise<{
  scheduleId: string;
  collectionState: AvailabilityCollectionState;
}> {
  if (!supabaseClient) {
    const schedule = scheduleSeedRows.find(
      (entry) => entry.id === input.scheduleId,
    );

    if (!schedule) {
      throw new Error('The schedule could not be found.');
    }

    schedule.collection_state = input.nextState;

    return {
      scheduleId: schedule.id,
      collectionState: schedule.collection_state,
    };
  }

  const { data, error } = await supabaseClient
    .from('schedules')
    .update({
      collection_state: input.nextState,
      updated_by: input.actorUserId,
    })
    .eq('id', input.scheduleId)
    .select('id, collection_state')
    .single<UpdatedScheduleRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The schedule availability collection could not be updated.');
  }

  return {
    scheduleId: data.id,
    collectionState: data.collection_state,
  };
}
