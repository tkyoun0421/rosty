import { NextResponse } from "next/server";

import type {
  EmployeeScheduleRequestDto,
  ScheduleRequestRole,
  ScheduleRequestTimeSlot,
} from "#queries/schedule-request/models/dto/scheduleRequest";

const EMPLOYEE_ID = "employee-01";
const TIME_SLOTS: ScheduleRequestTimeSlot[] = ["morning", "afternoon", "evening"];
const ROLES: ScheduleRequestRole[] = ["consulting", "service", "ceremony"];

const INITIAL_REQUESTS: EmployeeScheduleRequestDto[] = [
  {
    id: "request-001",
    employeeId: EMPLOYEE_ID,
    workDate: "2026-04-12",
    timeSlot: "morning",
    role: "service",
    note: "예식 서빙 가능",
    status: "pending",
    submittedAt: "2026-03-27T09:00:00.000Z",
    adminComment: null,
  },
  {
    id: "request-002",
    employeeId: EMPLOYEE_ID,
    workDate: "2026-04-19",
    timeSlot: "afternoon",
    role: "ceremony",
    note: "행사 진행 경험 있음",
    status: "approved",
    submittedAt: "2026-03-26T06:30:00.000Z",
    adminComment: "메인 홀 우선 검토",
  },
];

let scheduleRequests = [...INITIAL_REQUESTS];

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export async function GET() {
  return NextResponse.json({ requests: scheduleRequests });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workDate?: unknown;
    timeSlot?: unknown;
    role?: unknown;
    note?: unknown;
  } | null;

  if (!body || typeof body.workDate !== "string" || typeof body.timeSlot !== "string" || typeof body.role !== "string") {
    return NextResponse.json({ message: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  if (!isValidDateString(body.workDate)) {
    return NextResponse.json({ message: "올바른 날짜를 선택하세요." }, { status: 400 });
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
    return NextResponse.json({ message: "같은 날짜와 시간대는 한 번만 신청할 수 있습니다." }, { status: 409 });
  }

  const created: EmployeeScheduleRequestDto = {
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