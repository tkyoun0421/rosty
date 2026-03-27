import { NextResponse } from "next/server";

import type { ScheduleRequestRecord } from "#queries/schedule-request/dal/scheduleRequest";
import type {
  ScheduleRequestRole,
  ScheduleRequestStatus,
  ScheduleRequestTimeSlot,
} from "#queries/schedule-request/types/scheduleRequest";

const EMPLOYEE_ID = "employee-01";
const TIME_SLOTS: ScheduleRequestTimeSlot[] = ["morning", "afternoon", "evening"];
const ROLES: ScheduleRequestRole[] = ["consulting", "service", "ceremony"];
const REVIEWABLE_STATUSES: ScheduleRequestStatus[] = ["approved", "rejected"];

const INITIAL_REQUESTS: ScheduleRequestRecord[] = [
  {
    id: "request-001",
    employeeId: EMPLOYEE_ID,
    workDate: "2026-04-12",
    timeSlot: "morning",
    role: "service",
    note: "예식 시작 전 세팅 가능",
    status: "pending",
    submittedAt: "2026-03-27T09:00:00.000Z",
    adminComment: null,
  },
  {
    id: "request-002",
    employeeId: "employee-02",
    workDate: "2026-04-13",
    timeSlot: "afternoon",
    role: "consulting",
    note: "상담 지원 가능",
    status: "pending",
    submittedAt: "2026-03-27T08:30:00.000Z",
    adminComment: null,
  },
  {
    id: "request-003",
    employeeId: EMPLOYEE_ID,
    workDate: "2026-04-19",
    timeSlot: "afternoon",
    role: "ceremony",
    note: "예식 진행 경험 있음",
    status: "approved",
    submittedAt: "2026-03-26T06:30:00.000Z",
    adminComment: "메인 홀 우선 배치",
  },
];

let scheduleRequests = [...INITIAL_REQUESTS];

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isReviewStatus(
  value: string,
): value is Extract<ScheduleRequestStatus, "approved" | "rejected"> {
  return REVIEWABLE_STATUSES.includes(value as ScheduleRequestStatus);
}

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope");
  const requests =
    scope === "admin"
      ? scheduleRequests
      : scheduleRequests.filter((scheduleRequest) => scheduleRequest.employeeId === EMPLOYEE_ID);

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workDate?: unknown;
    timeSlot?: unknown;
    role?: unknown;
    note?: unknown;
  } | null;

  if (
    !body ||
    typeof body.workDate !== "string" ||
    typeof body.timeSlot !== "string" ||
    typeof body.role !== "string"
  ) {
    return NextResponse.json({ message: "필수 입력값이 누락되었습니다." }, { status: 400 });
  }

  if (!isValidDateString(body.workDate)) {
    return NextResponse.json({ message: "올바른 날짜를 선택해 주세요." }, { status: 400 });
  }

  if (!TIME_SLOTS.includes(body.timeSlot as ScheduleRequestTimeSlot)) {
    return NextResponse.json({ message: "지원하지 않는 시간대입니다." }, { status: 400 });
  }

  if (!ROLES.includes(body.role as ScheduleRequestRole)) {
    return NextResponse.json({ message: "지원하지 않는 근무 역할입니다." }, { status: 400 });
  }

  const alreadyRequested = scheduleRequests.some(
    (scheduleRequest) =>
      scheduleRequest.employeeId === EMPLOYEE_ID &&
      scheduleRequest.workDate === body.workDate &&
      scheduleRequest.timeSlot === body.timeSlot,
  );

  if (alreadyRequested) {
    return NextResponse.json(
      { message: "같은 날짜와 시간대에는 한 번만 신청할 수 있습니다." },
      { status: 409 },
    );
  }

  const created: ScheduleRequestRecord = {
    id: `request-${String(scheduleRequests.length + 1).padStart(3, "0")}`,
    employeeId: EMPLOYEE_ID,
    workDate: body.workDate,
    timeSlot: body.timeSlot as ScheduleRequestTimeSlot,
    role: body.role as ScheduleRequestRole,
    note: typeof body.note === "string" ? body.note.trim() : "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    adminComment: null,
  };

  scheduleRequests = [created, ...scheduleRequests];

  return NextResponse.json({ request: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    requestId?: unknown;
    status?: unknown;
    adminComment?: unknown;
  } | null;

  if (!body || typeof body.requestId !== "string" || typeof body.status !== "string") {
    return NextResponse.json({ message: "처리할 요청 정보가 올바르지 않습니다." }, { status: 400 });
  }

  if (!isReviewStatus(body.status)) {
    return NextResponse.json({ message: "지원하지 않는 처리 상태입니다." }, { status: 400 });
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

  const updated: ScheduleRequestRecord = {
    ...target,
    status: body.status,
    adminComment: adminComment.length > 0 ? adminComment : null,
  };

  scheduleRequests = scheduleRequests.map((scheduleRequest) =>
    scheduleRequest.id === updated.id ? updated : scheduleRequest,
  );

  return NextResponse.json({ request: updated });
}
