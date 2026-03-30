import "server-only";

import Link from "next/link";

import { AdminScheduleOverview } from "#flows/admin-schedule-overview/AdminScheduleOverview.client";
import { APP_ROUTES } from "#shared/constants/routes";

export function AdminScheduleOverviewPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Schedule Overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold">전체 일정 조회</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            배정 완료된 일정과 직원 응답 상태를 읽기 전용으로 확인하는 관리자 화면입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={APP_ROUTES.adminScheduleRequests}
            className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            요청 검토
          </Link>
          <Link
            href={APP_ROUTES.adminHome}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            관리자 홈으로 돌아가기
          </Link>
        </div>
      </header>

      <AdminScheduleOverview />
    </main>
  );
}
