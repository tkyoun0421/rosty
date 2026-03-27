import "server-only";

import Link from "next/link";

import { AdminScheduleReview } from "#flows/admin-schedule-review/AdminScheduleReview.client";
import { APP_ROUTES } from "#shared/constants/routes";

export function AdminScheduleReviewPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Schedule Review</p>
          <h1 className="mt-3 text-3xl font-semibold">스케줄 신청 승인 / 반려</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            전체 직원의 신청을 검토하고 처리 상태를 바로 반영합니다.
          </p>
        </div>
        <Link
          href={APP_ROUTES.adminHome}
          className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
        >
          관리자 홈으로 돌아가기
        </Link>
      </header>

      <AdminScheduleReview />
    </main>
  );
}
