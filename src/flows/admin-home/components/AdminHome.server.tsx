import "server-only";

import { APP_ROUTES } from "#shared/constants/routes";

const ADMIN_SECTIONS = [
  {
    title: "신청 승인/반려",
    description: "직원 신청을 검토하고 확정하는 첫 운영 루프를 다음 단계에서 붙입니다.",
  },
  {
    title: "전사 스케줄",
    description: "주간/월간 시각화와 충돌 확인은 관리자 MVP에서 이어집니다.",
  },
  {
    title: "운영 대시보드",
    description: "실시간 현황, 공지, 근태, 급여 운영 도구를 순서대로 확장합니다.",
  },
] as const;

export function AdminHome() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Admin Home</p>
          <h1 className="mt-3 text-3xl font-semibold">관리자 대시보드 셸</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            승인과 배정 중심의 운영 화면을 위한 첫 허브입니다. 다음 섹션에서 실제 신청 검토와 일정
            조회가 이어집니다.
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
          </article>
        ))}
      </section>
    </main>
  );
}
