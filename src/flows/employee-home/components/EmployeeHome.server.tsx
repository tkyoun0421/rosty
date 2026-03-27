import "server-only";

import { APP_ROUTES } from "#shared/constants/routes";

const EMPLOYEE_SECTIONS = [
  {
    title: "근무 신청",
    description: "다음 섹션에서 실제 신청 폼과 상태 조회를 붙입니다.",
  },
  {
    title: "배정 스케줄",
    description: "관리자 승인 이후 직원이 확정 스케줄을 확인하는 카드가 들어옵니다.",
  },
  {
    title: "예상 급여",
    description: "출퇴근과 시급 정보가 연결되면 요약과 상세 흐름을 추가합니다.",
  },
] as const;

export function EmployeeHome() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Employee Home</p>
          <h1 className="mt-3 text-3xl font-semibold">직원 대시보드 셸</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            역할 기반 진입은 연결됐고, 다음 구현부터 스케줄 신청과 배정 확인 흐름을 이 화면에 채웁니다.
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
        {EMPLOYEE_SECTIONS.map((section) => (
          <article key={section.title} className="rounded-3xl border border-[var(--border)] bg-white/80 p-6">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}