import "server-only";

import Link from "next/link";

import { EmployeeSchedule } from "#flows/employee-schedule/EmployeeSchedule.client";
import { APP_ROUTES } from "#shared/constants/routes";

export function EmployeeSchedulePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Schedule Requests
          </p>
          <h1 className="mt-3 text-3xl font-semibold">근무 스케줄 신청</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            직원이 가능한 날짜와 시간대를 제출하고, 제출한 요청의 상태를 한 화면에서 확인하는 첫
            번째 스케줄 MVP 흐름입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={APP_ROUTES.employeeHome}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]"
          >
            대시보드로 돌아가기
          </Link>
          <a
            href={APP_ROUTES.devLogout}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            로그아웃
          </a>
        </div>
      </header>

      <EmployeeSchedule />
    </main>
  );
}
