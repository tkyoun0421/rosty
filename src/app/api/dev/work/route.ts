import { NextResponse } from "next/server";

import { getCurrentWorkRecord, setCurrentWorkRecord } from "#app/api/dev/lib/scheduleData";
import { buildUtcIsoStringFromKoreanDateAndTime } from "#shared/utils/buildUtcIsoStringFromKoreanDateAndTime";

export async function GET() {
  return NextResponse.json({ work: getCurrentWorkRecord() });
}

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isValidTimeString(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workDate?: unknown;
    startTime?: unknown;
    endTime?: unknown;
  } | null;

  if (
    !body ||
    typeof body.workDate !== "string" ||
    typeof body.startTime !== "string" ||
    typeof body.endTime !== "string"
  ) {
    return NextResponse.json({ message: "필수 입력값이 누락되었습니다." }, { status: 400 });
  }

  if (!isValidDateString(body.workDate)) {
    return NextResponse.json({ message: "올바른 날짜를 선택해 주세요." }, { status: 400 });
  }

  if (!isValidTimeString(body.startTime) || !isValidTimeString(body.endTime)) {
    return NextResponse.json(
      { message: "시작 시간과 종료 시간을 확인해 주세요." },
      { status: 400 },
    );
  }

  if (toMinutes(body.startTime) >= toMinutes(body.endTime)) {
    return NextResponse.json(
      { message: "종료 시간은 시작 시간보다 늦어야 합니다." },
      { status: 400 },
    );
  }

  const work = {
    id: `work-${body.workDate}`,
    workDate: body.workDate,
    startAt: buildUtcIsoStringFromKoreanDateAndTime(body.workDate, body.startTime),
    endAt: buildUtcIsoStringFromKoreanDateAndTime(body.workDate, body.endTime),
  };

  setCurrentWorkRecord(work);

  return NextResponse.json({ work }, { status: 201 });
}
