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
  ScheduleRequestStatus,
} from "#queries/schedule-request/types/scheduleRequest";
import {
  SCHEDULE_ASSIGNMENT_POSITION_OPTIONS,
  resolveAssignedLocationLabel,
} from "#queries/schedule-request/constants/scheduleRequest";

const REVIEWABLE_STATUSES: ScheduleRequestStatus[] = ["approved", "rejected"];
const ASSIGNMENT_POSITIONS = SCHEDULE_ASSIGNMENT_POSITION_OPTIONS.map((option) => option.value);

function isReviewStatus(
  value: string,
): value is Extract<ScheduleRequestStatus, "approved" | "rejected"> {
  return REVIEWABLE_STATUSES.includes(value as ScheduleRequestStatus);
}

function isAssignmentPosition(value: string): value is ScheduleAssignmentPosition {
  return ASSIGNMENT_POSITIONS.includes(value as ScheduleAssignmentPosition);
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
      scheduleRequest.employeeId === EMPLOYEE_ID && scheduleRequest.workId === body.workId,
  );

  if (alreadyRequested) {
    return NextResponse.json(
      { message: "같은 근무에는 한 번만 신청할 수 있습니다." },
      { status: 409 },
    );
  }

  const created: ScheduleRequestRecord = {
    id: `request-${String(scheduleRequests.length + 1).padStart(3, "0")}`,
    employeeId: EMPLOYEE_ID,
    workId: currentWork.id,
    workDate: currentWork.workDate,
    workStartAt: currentWork.startAt,
    workEndAt: currentWork.endAt,
    note: typeof body.note === "string" ? body.note.trim() : "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    adminComment: null,
    assignmentPosition: null,
    assignedLocation: null,
    assignedAt: null,
    assignedBy: null,
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
  const assignedAt = new Date().toISOString();
  const assignmentPosition =
    body.status === "approved" ? (body.assignmentPosition as ScheduleAssignmentPosition) : null;

  const updated: ScheduleRequestRecord = {
    ...target,
    status: body.status,
    adminComment: adminComment.length > 0 ? adminComment : null,
    assignmentPosition,
    assignedLocation: assignmentPosition ? resolveAssignedLocationLabel(assignmentPosition) : null,
    assignedAt: body.status === "approved" ? assignedAt : null,
    assignedBy: body.status === "approved" ? ADMIN_ID : null,
  };

  replaceScheduleRequestRecord(updated);

  return NextResponse.json({ request: updated });
}
