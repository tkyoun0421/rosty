import "server-only";

import Link from "next/link";

import { APP_ROUTES } from "#shared/constants/routes";

const ADMIN_SECTIONS = [
  {
    title: "신청 배정 / 반려",
    description: "직원 신청을 검토하고 포지션 배정 또는 반려를 확정하는 관리자 루프입니다.",
    href: APP_ROUTES.adminScheduleRequests,
    cta: "요청 검토하러 가기",
  },
  {
    title: "전체 일정 조회",
    description:
      "현재 릴리즈에서 배정 완료된 신청과 처리 상태를 같은 검토 흐름에서 다시 확인합니다.",
    href: APP_ROUTES.adminScheduleRequests,
    cta: "승인 현황 보기",
  },
  {
    title: "근무 생성",
    description: "직원이 신청할 현재 근무 날짜와 시간을 생성하거나 갱신합니다.",
    href: APP_ROUTES.adminWork,
    cta: "근무 만들기",
  },
] as const;

export function AdminHome() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Admin Home</p>
          <h1 className="mt-3 text-3xl font-semibold">관리자 대시보드</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            근무 생성과 배정 중심의 운영 화면입니다. 현재 릴리즈에서는 직원 신청 검토와 포지션 배정
            결과 확인 흐름을 우선 고정합니다.
          </p>
        </div>
        <a
          href={APP_ROUTES.devLogout}
          className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
        >
          다른 역할로 전환
        </a>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-[var(--border)] bg-white/80 p-6"
          >
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.description}</p>
            <Link
              href={section.href}
              className="mt-6 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium"
            >
              {section.cta}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
