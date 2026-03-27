import type { ScheduleRequestRecord } from "#queries/schedule-request/dal/scheduleRequest";
import type { CurrentWorkRecord } from "#queries/work/dal/work";

export const EMPLOYEE_ID = "employee-01";
export const ADMIN_ID = "admin-01";

const INITIAL_CURRENT_WORK: CurrentWorkRecord = {
  id: "work-2026-04-26",
  workDate: "2026-04-26",
  startAt: "2026-04-26T02:00:00.000Z",
  endAt: "2026-04-26T09:00:00.000Z",
};

const INITIAL_REQUESTS: ScheduleRequestRecord[] = [
  {
    id: "request-001",
    employeeId: EMPLOYEE_ID,
    workId: "work-2026-04-12",
    workDate: "2026-04-12",
    workStartAt: "2026-04-12T02:00:00.000Z",
    workEndAt: "2026-04-12T09:00:00.000Z",
    note: "예식 시작 전 세팅 가능",
    status: "pending",
    submittedAt: "2026-03-27T09:00:00.000Z",
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
  },
  {
    id: "request-002",
    employeeId: "employee-02",
    workId: "work-2026-04-13",
    workDate: "2026-04-13",
    workStartAt: "2026-04-13T04:00:00.000Z",
    workEndAt: "2026-04-13T10:00:00.000Z",
    note: "상담 지원 가능",
    status: "pending",
    submittedAt: "2026-03-27T08:30:00.000Z",
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
  },
  {
    id: "request-003",
    employeeId: EMPLOYEE_ID,
    workId: "work-2026-04-19",
    workDate: "2026-04-19",
    workStartAt: "2026-04-19T03:00:00.000Z",
    workEndAt: "2026-04-19T10:00:00.000Z",
    note: "예식 진행 경험 있음",
    status: "approved",
    submittedAt: "2026-03-26T06:30:00.000Z",
    adminComment: "메인 홀 우선 배치",
    assignmentPosition: "main",
    assignedLocation: "메인 홀",
    assignedAt: "2026-03-27T01:30:00.000Z",
    assignedBy: ADMIN_ID,
  },
];

let currentWork: CurrentWorkRecord | null = INITIAL_CURRENT_WORK;
let scheduleRequests = [...INITIAL_REQUESTS];

export function getCurrentWorkRecord() {
  return currentWork;
}

export function setCurrentWorkRecord(record: CurrentWorkRecord) {
  currentWork = record;
}

export function listScheduleRequestRecords() {
  return scheduleRequests;
}

export function prependScheduleRequestRecord(record: ScheduleRequestRecord) {
  scheduleRequests = [record, ...scheduleRequests];
}

export function replaceScheduleRequestRecord(record: ScheduleRequestRecord) {
  scheduleRequests = scheduleRequests.map((scheduleRequest) =>
    scheduleRequest.id === record.id ? record : scheduleRequest,
  );
}
