import "server-only";

import Link from "next/link";

import { APP_ROUTES } from "#shared/constants/routes";

const EMPLOYEE_SECTIONS = [
  {
    title: "근무 신청",
    description:
      "관리자가 연 현재 근무에 대해 참여 가능 여부를 제출하고 현재 상태를 바로 확인합니다.",
    href: APP_ROUTES.employeeSchedule,
    cta: "스케줄 신청 열기",
  },
  {
    title: "배정 스케줄",
    description: "관리자가 포지션 배정을 완료한 근무를 날짜, 시간, 장소 기준으로 바로 확인합니다.",
    href: APP_ROUTES.employeeAssignedSchedule,
    cta: "배정 스케줄 보기",
  },
  {
    title: "예상 급여",
    description: "출퇴근과 시급 정보가 연결되면 요약과 상세 흐름이 이 영역에 추가됩니다.",
    href: APP_ROUTES.employeeSchedule,
    cta: "준비 중",
  },
] as const;

export function EmployeeHome() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(53,35,19,0.08)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Employee Home</p>
          <h1 className="mt-3 text-3xl font-semibold">직원 대시보드</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            현재 릴리즈에서는 직원이 현재 근무에 참여 가능 여부를 제출하고, 배정된 스케줄까지 이어서
            확인하는 핵심 루프를 닫습니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={APP_ROUTES.employeeAssignedSchedule}
            className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            오늘 배정 확인
          </Link>
          <a
            href={APP_ROUTES.devLogout}
            className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            다른 역할로 전환
          </a>
        </div>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {EMPLOYEE_SECTIONS.map((section) => (
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
