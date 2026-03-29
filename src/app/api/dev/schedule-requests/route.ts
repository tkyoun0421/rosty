import { NextResponse } from "next/server";

import {
  ADMIN_ID,
  EMPLOYEE_ID,
  getCurrentWorkRecord,
  listScheduleRequestRecords,
  prependScheduleRequestRecord,
  replaceScheduleRequestRecord,
} from "#app/api/dev/lib/scheduleData";
import type { ScheduleRequestRecord } from "#queries/schedule-request/dal/scheduleRequest";
import type {
  ScheduleAssignmentPosition,
  ScheduleEmployeeResponseStatus,
  ScheduleRequestStatus,
} from "#queries/schedule-request/types/scheduleRequest";
import {
  SCHEDULE_ASSIGNMENT_POSITION_OPTIONS,
  resolveAssignedLocationLabel,
} from "#queries/schedule-request/constants/scheduleRequest";

const REVIEWABLE_STATUSES: ScheduleRequestStatus[] = ["approved", "rejected"];
const EMPLOYEE_RESPONSE_STATUSES: ScheduleEmployeeResponseStatus[] = ["accepted", "declined"];
const ASSIGNMENT_POSITIONS = SCHEDULE_ASSIGNMENT_POSITION_OPTIONS.map((option) => option.value);

function isReviewStatus(
  value: string,
): value is Extract<ScheduleRequestStatus, "approved" | "rejected"> {
  return REVIEWABLE_STATUSES.includes(value as ScheduleRequestStatus);
}

function isAssignmentPosition(value: string): value is ScheduleAssignmentPosition {
  return ASSIGNMENT_POSITIONS.includes(value as ScheduleAssignmentPosition);
}

function isEmployeeResponseStatus(value: string): value is Exclude<ScheduleEmployeeResponseStatus, "pending"> {
  return EMPLOYEE_RESPONSE_STATUSES.includes(value as ScheduleEmployeeResponseStatus);
}

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope");
  const scheduleRequests = listScheduleRequestRecords();
  const requests =
    scope === "admin"
      ? scheduleRequests
      : scheduleRequests.filter((scheduleRequest) => scheduleRequest.employeeId === EMPLOYEE_ID);

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workId?: unknown;
    note?: unknown;
  } | null;
  const currentWork = getCurrentWorkRecord();
  const scheduleRequests = listScheduleRequestRecords();

  if (!body || typeof body.workId !== "string") {
    return NextResponse.json({ message: "필수 입력값이 누락되었습니다." }, { status: 400 });
  }

  if (!currentWork || body.workId !== currentWork.id) {
    return NextResponse.json(
      { message: "현재 신청 가능한 근무가 없거나 이미 마감되었습니다." },
      { status: 409 },
    );
  }

  const alreadyRequested = scheduleRequests.some(
    (scheduleRequest) =>
      scheduleRequest.employeeId === EMPLOYEE_ID &&
      scheduleRequest.workId === body.workId &&
      scheduleRequest.status === "pending",
  );

  if (alreadyRequested) {
    return NextResponse.json(
      { message: "같은 근무에는 한 번만 신청할 수 있습니다." },
      { status: 409 },
    );
  }

  const note = typeof body.note === "string" ? body.note.trim() : "";
  const submittedAt = new Date().toISOString();

  const created: ScheduleRequestRecord = {
    id: `request-${String(scheduleRequests.length + 1).padStart(3, "0")}`,
    employeeId: EMPLOYEE_ID,
    workId: currentWork.id,
    workDate: currentWork.workDate,
    workStartAt: currentWork.startAt,
    workEndAt: currentWork.endAt,
    note,
    status: "pending",
    submittedAt,
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
    history: [
      {
        type: "submitted",
        createdAt: submittedAt,
        actorId: EMPLOYEE_ID,
        comment: note.length > 0 ? note : null,
        assignmentPosition: null,
        assignedLocation: null,
      },
    ],
  };

  prependScheduleRequestRecord(created);

  return NextResponse.json({ request: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    requestId?: unknown;
    status?: unknown;
    adminComment?: unknown;
    assignmentPosition?: unknown;
  } | null;
  const scheduleRequests = listScheduleRequestRecords();

  if (!body || typeof body.requestId !== "string" || typeof body.status !== "string") {
    return NextResponse.json({ message: "처리할 요청 정보가 올바르지 않습니다." }, { status: 400 });
  }

  if (!isReviewStatus(body.status)) {
    return NextResponse.json({ message: "지원하지 않는 처리 상태입니다." }, { status: 400 });
  }

  if (
    body.status === "approved" &&
    (typeof body.assignmentPosition !== "string" || !isAssignmentPosition(body.assignmentPosition))
  ) {
    return NextResponse.json({ message: "배정 포지션을 선택해 주세요." }, { status: 400 });
  }

  const target = scheduleRequests.find((scheduleRequest) => scheduleRequest.id === body.requestId);

  if (!target) {
    return NextResponse.json({ message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  if (target.status !== "pending") {
    return NextResponse.json(
      { message: "이미 처리된 요청은 다시 승인하거나 반려할 수 없습니다." },
      { status: 409 },
    );
  }

  const adminComment = typeof body.adminComment === "string" ? body.adminComment.trim() : "";
  const processedAt = new Date().toISOString();
  const assignmentPosition =
    body.status === "approved" ? (body.assignmentPosition as ScheduleAssignmentPosition) : null;
  const assignedLocation = assignmentPosition ? resolveAssignedLocationLabel(assignmentPosition) : null;

  const updated: ScheduleRequestRecord = {
    ...target,
    status: body.status,
    adminComment: adminComment.length > 0 ? adminComment : null,
    assignmentPosition,
    assignedLocation,
    assignedAt: body.status === "approved" ? processedAt : null,
    assignedBy: body.status === "approved" ? ADMIN_ID : null,
    employeeResponseStatus: body.status === "approved" ? "pending" : null,
    employeeResponseComment: null,
    employeeRespondedAt: null,
    employeeRespondedBy: null,
    history: [
      ...target.history,
      {
        type: body.status,
        createdAt: processedAt,
        actorId: ADMIN_ID,
        comment: adminComment.length > 0 ? adminComment : null,
        assignmentPosition,
        assignedLocation,
      },
    ],
  };

  replaceScheduleRequestRecord(updated);

  return NextResponse.json({ request: updated });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    requestId?: unknown;
    status?: unknown;
    employeeComment?: unknown;
  } | null;
  const scheduleRequests = listScheduleRequestRecords();

  if (!body || typeof body.requestId !== "string" || typeof body.status !== "string") {
    return NextResponse.json({ message: "직원 응답 정보가 올바르지 않습니다." }, { status: 400 });
  }

  if (!isEmployeeResponseStatus(body.status)) {
    return NextResponse.json({ message: "지원하지 않는 직원 응답 상태입니다." }, { status: 400 });
  }

  const target = scheduleRequests.find((scheduleRequest) => scheduleRequest.id === body.requestId);

  if (!target) {
    return NextResponse.json({ message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  if (target.status !== "approved" || target.employeeResponseStatus !== "pending") {
    return NextResponse.json(
      { message: "응답 가능한 배정 요청이 아니거나 이미 응답이 완료되었습니다." },
      { status: 409 },
    );
  }

  const employeeComment = typeof body.employeeComment === "string" ? body.employeeComment.trim() : "";
  const respondedAt = new Date().toISOString();

  const updated: ScheduleRequestRecord = {
    ...target,
    employeeResponseStatus: body.status,
    employeeResponseComment: employeeComment.length > 0 ? employeeComment : null,
    employeeRespondedAt: respondedAt,
    employeeRespondedBy: EMPLOYEE_ID,
    history: [
      ...target.history,
      {
        type: body.status,
        createdAt: respondedAt,
        actorId: EMPLOYEE_ID,
        comment: employeeComment.length > 0 ? employeeComment : null,
        assignmentPosition: target.assignmentPosition,
        assignedLocation: target.assignedLocation,
      },
    ],
  };

  replaceScheduleRequestRecord(updated);

  return NextResponse.json({ request: updated });
}
