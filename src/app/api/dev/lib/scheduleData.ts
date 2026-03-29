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
    note: "Opening support requested",
    status: "pending",
    submittedAt: "2026-03-27T09:00:00.000Z",
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
    employeeResponseStatus: null,
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: "2026-03-27T09:00:00.000Z",
        actorId: EMPLOYEE_ID,
        comment: "Opening support requested",
        assignmentPosition: null,
        assignedLocation: null,
      },
    ],
  },
  {
    id: "request-002",
    employeeId: "employee-02",
    workId: "work-2026-04-13",
    workDate: "2026-04-13",
    workStartAt: "2026-04-13T04:00:00.000Z",
    workEndAt: "2026-04-13T10:00:00.000Z",
    note: "Consulting support requested",
    status: "pending",
    submittedAt: "2026-03-27T08:30:00.000Z",
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
    employeeResponseStatus: null,
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: "2026-03-27T08:30:00.000Z",
        actorId: "employee-02",
        comment: "Consulting support requested",
        assignmentPosition: null,
        assignedLocation: null,
      },
    ],
  },
  {
    id: "request-003",
    employeeId: EMPLOYEE_ID,
    workId: "work-2026-04-19",
    workDate: "2026-04-19",
    workStartAt: "2026-04-19T03:00:00.000Z",
    workEndAt: "2026-04-19T10:00:00.000Z",
    note: "Ceremony experience available",
    status: "approved",
    submittedAt: "2026-03-26T06:30:00.000Z",
    adminComment: "Main hall priority",
    assignmentPosition: "main",
    assignedLocation: "Main hall",
    assignedAt: "2026-03-27T01:30:00.000Z",
    assignedBy: ADMIN_ID,
    employeeResponseStatus: "pending",
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: "2026-03-26T06:30:00.000Z",
        actorId: EMPLOYEE_ID,
        comment: "Ceremony experience available",
        assignmentPosition: null,
        assignedLocation: null,
      },
      {
        type: "approved",
        createdAt: "2026-03-27T01:30:00.000Z",
        actorId: ADMIN_ID,
        comment: "Main hall priority",
        assignmentPosition: "main",
        assignedLocation: "Main hall",
      },
    ],
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
