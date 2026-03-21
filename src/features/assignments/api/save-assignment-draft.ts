import {
  clearWorkspaceSeedAssignment,
  saveWorkspaceSeedAssignment,
} from '@/features/assignments/api/assignment-workspace-fallback';
import { supabaseClient } from '@/shared/lib/supabase/client';

type SaveAssignmentDraftInput = {
  scheduleId: string;
  slotId: string;
  assignmentId: string | null;
  assigneeUserId: string | null;
  guestName: string | null;
  isExceptionCase: boolean;
  actorUserId: string;
};

function validateDraftInput(input: SaveAssignmentDraftInput) {
  const hasAssignee = !!input.assigneeUserId;
  const hasGuest = !!input.guestName && input.guestName.trim().length > 0;

  if (hasAssignee === hasGuest) {
    throw new Error('Select exactly one employee assignee or guest name.');
  }
}

export async function saveAssignmentDraft(
  input: SaveAssignmentDraftInput,
): Promise<void> {
  validateDraftInput(input);

  if (!supabaseClient) {
    saveWorkspaceSeedAssignment({
      scheduleId: input.scheduleId,
      slotId: input.slotId,
      assignmentId: input.assignmentId,
      assigneeUserId: input.assigneeUserId,
      guestName: input.guestName?.trim() ?? null,
      isExceptionCase: input.isExceptionCase,
    });
    return;
  }

  if (input.assignmentId) {
    const { error } = await supabaseClient
      .from('assignments')
      .update({
        assignee_user_id: input.assigneeUserId,
        guest_name: input.guestName?.trim() ?? null,
        status: 'proposed',
        is_exception_case: input.isExceptionCase,
        updated_by: input.actorUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.assignmentId);

    if (error) {
      throw new Error(formatAssignmentDraftErrorMessage(error.message));
    }

    return;
  }

  const { error } = await supabaseClient.from('assignments').insert({
    schedule_id: input.scheduleId,
    slot_id: input.slotId,
    assignee_user_id: input.assigneeUserId,
    guest_name: input.guestName?.trim() ?? null,
    status: 'proposed',
    is_exception_case: input.isExceptionCase,
    created_by: input.actorUserId,
    updated_by: input.actorUserId,
  });

  if (error) {
    throw new Error(formatAssignmentDraftErrorMessage(error.message));
  }
}

function formatAssignmentDraftErrorMessage(message: string): string {
  if (message.includes('assignments_schedule_assignee_unique')) {
    return 'This employee is already assigned on the same schedule. Confirm the exception flow to allow a duplicate assignment.';
  }

  return message;
}

export async function clearAssignmentDraft(
  assignmentId: string,
): Promise<void> {
  if (!supabaseClient) {
    clearWorkspaceSeedAssignment(assignmentId);
    return;
  }

  const { error } = await supabaseClient
    .from('assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    throw new Error(error.message);
  }
}
