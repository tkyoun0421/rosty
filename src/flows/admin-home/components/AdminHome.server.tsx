import "server-only";

import Link from "next/link";

import { APP_ROUTES } from "#shared/constants/routes";

const ADMIN_SECTIONS = [
  {
    title: "요청 승인 / 반려",
    description: "직원 신청을 검토하고 상태를 확정하는 관리자 승인 루프입니다.",
    href: APP_ROUTES.adminScheduleRequests,
    cta: "요청 검토하러 가기",
  },
  {
    title: "전체 일정 조회",
    description: "주간/월간 스케줄 확인, 충돌 검토, 배정 현황 시각화가 이어질 영역입니다.",
    href: APP_ROUTES.adminScheduleRequests,
    cta: "현재 구현 범위 보기",
  },
  {
    title: "운영 대시보드",
    description: "공지, 근태, 급여, 주요 운영 지표를 다음 단계에서 이 영역에 통합합니다.",
    href: APP_ROUTES.adminHome,
    cta: "다음 단계 준비 중",
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
            승인과 배정 중심의 운영 화면입니다. 현재 릴리즈에서는 직원 신청을 검토하고 상태를
            반영하는 흐름부터 닫습니다.
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
