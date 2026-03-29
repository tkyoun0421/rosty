import {
  SCHEDULE_ASSIGNMENT_POSITION_LABELS,
  SCHEDULE_REQUEST_HISTORY_EVENT_LABELS,
} from "#queries/schedule-request/constants/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import type { ScheduleRequestHistoryItemViewModel } from "#queries/schedule-request/types/scheduleRequestHistoryView";
import { formatKoreanDateTime } from "#shared/utils/formatKoreanDateTime";

export function buildScheduleRequestHistoryView(
  history: EmployeeScheduleRequest["history"],
): ScheduleRequestHistoryItemViewModel[] {
  return [...history]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((item) => ({
      typeLabel: SCHEDULE_REQUEST_HISTORY_EVENT_LABELS[item.type],
      createdAtLabel: formatKoreanDateTime(item.createdAt),
      actorLabel: item.actorId,
      comment: item.comment ?? null,
      assignmentPositionLabel: item.assignmentPosition
        ? SCHEDULE_ASSIGNMENT_POSITION_LABELS[item.assignmentPosition]
        : null,
      assignedLocation: item.assignedLocation ?? null,
    }));
}
