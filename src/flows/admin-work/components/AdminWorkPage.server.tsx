import "server-only";

import Link from "next/link";

import { AdminWork } from "#flows/admin-work/AdminWork.client";
import { APP_ROUTES } from "#shared/constants/routes";

export function AdminWorkPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Work Setup</p>
          <h1 className="mt-3 text-3xl font-semibold">현재 근무 생성</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            직원이 신청할 현재 근무 날짜와 시간을 먼저 생성하는 관리자 화면입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={APP_ROUTES.adminScheduleRequests}
            className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            신청 검토로 이동
          </Link>
          <Link
            href={APP_ROUTES.adminHome}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            관리자 홈으로 돌아가기
          </Link>
        </div>
      </header>

      <AdminWork />
    </main>
  );
}
