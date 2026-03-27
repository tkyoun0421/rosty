import "server-only";

import { APP_ROUTES } from "#shared/constants/routes";

const ENTRY_OPTIONS = [
  {
    href: `${APP_ROUTES.devSession}?role=employee`,
    title: "직원으로 시작",
    description: "근무 신청, 배정 확인, 급여 확인으로 이어지는 직원 흐름을 엽니다.",
  },
  {
    href: `${APP_ROUTES.devSession}?role=admin`,
    title: "관리자로 시작",
    description: "승인, 배정, 전사 현황 관리로 이어지는 관리자 흐름을 엽니다.",
  },
] as const;

export function SignInShell() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 inline-flex rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm text-[var(--muted)]">
          Release 0 Auth Shell
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">웨딩홀 근무 운영 시작</h1>
        <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
          실제 Google 로그인 연동 전 단계로, 역할별 진입과 화면 구조를 빠르게 검증하는 개발용 셸입니다.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {ENTRY_OPTIONS.map((option) => (
          <a
            key={option.href}
            href={option.href}
            className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_60px_rgba(53,35,19,0.08)] transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{option.title}</h2>
              <span className="text-sm text-[var(--accent)]">진입</span>
            </div>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">{option.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}