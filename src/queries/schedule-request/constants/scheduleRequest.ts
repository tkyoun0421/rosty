import type {
  ScheduleAssignmentPosition,
  ScheduleRequestHistoryEventType,
  ScheduleRequestStatus,
} from "#queries/schedule-request/types/scheduleRequest";

export const SCHEDULE_REQUEST_STATUS_LABELS: Record<ScheduleRequestStatus, string> = {
  pending: "배정 대기",
  approved: "배정 완료",
  rejected: "반려",
};

export const SCHEDULE_REQUEST_HISTORY_EVENT_LABELS: Record<
  ScheduleRequestHistoryEventType,
  string
> = {
  submitted: "신청 제출",
  approved: "배정 확정",
  rejected: "신청 반려",
};

export const SCHEDULE_ASSIGNMENT_POSITION_LABELS: Record<ScheduleAssignmentPosition, string> = {
  teamLead: "팀장",
  scan: "스캔",
  main: "메인",
  dress: "드레스",
  waitingRoom: "대기실",
  congratulatorySong: "축가",
  manager: "매니저",
  guide: "안내",
  dressRoom: "드레스실",
};

export const SCHEDULE_ASSIGNMENT_POSITION_OPTIONS: Array<{
  value: ScheduleAssignmentPosition;
  label: string;
}> = [
  { value: "teamLead", label: "팀장" },
  { value: "scan", label: "스캔" },
  { value: "main", label: "메인" },
  { value: "dress", label: "드레스" },
  { value: "waitingRoom", label: "대기실" },
  { value: "congratulatorySong", label: "축가" },
  { value: "manager", label: "매니저" },
  { value: "guide", label: "안내" },
  { value: "dressRoom", label: "드레스실" },
];

const DEFAULT_ASSIGNED_LOCATION_LABELS: Record<ScheduleAssignmentPosition, string> = {
  teamLead: "메인 홀 컨트롤",
  scan: "스캔 데스크",
  main: "메인 홀",
  dress: "드레스 피팅룸",
  waitingRoom: "대기실",
  congratulatorySong: "축가 대기 구역",
  manager: "운영 데스크",
  guide: "로비 안내 데스크",
  dressRoom: "드레스실",
};

export function resolveAssignedLocationLabel(position: ScheduleAssignmentPosition) {
  return DEFAULT_ASSIGNED_LOCATION_LABELS[position];
}
