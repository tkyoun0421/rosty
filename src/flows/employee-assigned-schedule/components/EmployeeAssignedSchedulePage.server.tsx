import "server-only";

import Link from "next/link";

import { EmployeeAssignedSchedule } from "#flows/employee-assigned-schedule/EmployeeAssignedSchedule.client";
import { APP_ROUTES } from "#shared/constants/routes";

export function EmployeeAssignedSchedulePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Assigned Schedule
          </p>
          <h1 className="mt-3 text-3xl font-semibold">배정 스케줄 확인</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            관리자가 포지션 배정을 확정한 근무를 날짜, 시간, 장소, 배정 메모 기준으로 확인하는
            Release 1 직원 흐름입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={APP_ROUTES.employeeHome}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]"
          >
            대시보드로 돌아가기
          </Link>
          <Link
            href={APP_ROUTES.employeeSchedule}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]"
          >
            신청 화면 보기
          </Link>
        </div>
      </header>

      <EmployeeAssignedSchedule />
    </main>
  );
}
