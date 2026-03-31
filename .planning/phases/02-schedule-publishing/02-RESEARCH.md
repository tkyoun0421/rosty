# Phase 02: Schedule Publishing - Research

**Researched:** 2026-03-31
**Domain:** Next.js App Router + Supabase/Postgres schedule publishing and worker applications
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 하나의 근무 스케줄은 하나의 근무일/타임블록을 나타낸다.
- **D-02:** 각 스케줄 안에 여러 역할 슬롯과 역할별 모집 인원을 둔다.
- **D-03:** 같은 날짜와 시간대라도 역할별로 별도 스케줄을 쪼개지 않는다.

- **D-04:** 근무자는 역할 슬롯이 아니라 스케줄 전체에 신청한다.
- **D-05:** 신청 단계에서 역할을 확정하지 않고, 실제 역할 배정은 이후 단계에서 관리자가 결정한다.
- **D-06:** Phase 2의 신청 모델은 “이 근무에 참여 의사가 있다”는 제출을 표현해야 한다.

- **D-07:** 상태 전환은 부분 자동화로 간다.
- **D-08:** 스케줄 생성 직후 기본 상태는 `recruiting`이다.
- **D-09:** 관리자는 필요 시 상태를 `assigning`, `confirmed`로 변경할 수 있다.
- **D-10:** 시스템은 명백히 잘못된 상태값이나 전환만 막고 운영 판단 자체를 과하게 강제하지 않는다.

- **D-11:** 근무자 모집 목록은 간단 목록으로 제공한다.
- **D-12:** 목록에는 날짜, 시간, 모집 가능 여부 정도의 최소 정보만 우선 노출한다.
- **D-13:** 상세 정보는 별도 화면이나 이후 단계로 넘기고 목록은 가볍게 유지한다.

- **D-14:** 런타임 코드는 `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared` 구조를 따른다.
- **D-15:** 의존 방향은 `app -> flows -> mutations -> queries -> shared`로 고정한다.
- **D-16:** `app`는 thin route layer이며, 한 route는 하나의 flow에 대응한다.
- **D-17:** UI 컴포넌트는 도메인 로직을 직접 소유하지 않는다. 도메인 로직은 해당 도메인 폴더 아래에 두고, 공통 로직은 `shared` 아래에 둔다.
- **D-18:** 일반 파일명은 `camelCase`, React 컴포넌트 파일명은 `PascalCase`를 사용한다.
- **D-19:** server action은 `mutations/*/actions`에만 둔다.
- **D-20:** 작은 UI라도 단일 write action에 강하게 결합돼 있으면 `mutations/{domain}/components`에 둘 수 있다.
- **D-21:** read DAL은 `queries/*/dal`, write DAL은 `mutations/*/dal`에 둔다.
- **D-22:** 내부 alias는 `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, `#shared/*`만 사용한다.
- **D-23:** 테스트는 구현 파일 옆에 colocated로 둔다.

### Claude's Discretion
- 상태 enum 이름과 transition helper 형태
- 관리자 스케줄 생성 form의 상세 레이아웃
- 근무자 모집 목록의 카드/테이블 표현 방식
- 신청 제출 후 피드백 메시지와 refresh 방식

### Deferred Ideas (OUT OF SCOPE)
- 역할 슬롯별 직접 신청 및 선호 역할 선택
- 목록에서 상세 정보 대량 노출
- 더 엄격한 상태 전환 정책 강제
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHD-01 | 관리자는 근무일의 날짜, 시작 시각, 종료 시각을 포함한 근무 스케줄을 생성할 수 있다. | Schedule table shape, server action form flow, atomic create guidance, admin route boundaries |
| SCHD-02 | 관리자는 근무 스케줄별로 필요한 역할과 모집 인원을 설정할 수 있다. | Role-slot child table, uniqueness/headcount constraints, atomic multi-table write guidance |
| SCHD-03 | 관리자는 모집 중, 배정 중, 확정 완료 등 근무 스케줄 상태를 관리할 수 있다. | `schedule_status` enum, lightweight transition helper, admin status mutation placement |
| APPL-01 | 근무자는 모집 중인 근무 스케줄 목록을 확인할 수 있다. | Worker query slice, server-first list rendering, recruiting-only visibility, indexing/RLS guidance |
| APPL-02 | 근무자는 특정 근무 스케줄에 근무 신청을 제출할 수 있다. | Minimal application model, uniqueness constraint, worker-only insert path, feedback/revalidation strategy |
</phase_requirements>

## Summary

Phase 02 should stay intentionally narrow: create a schedule, attach role-slot headcounts, expose a lightweight recruiting list to workers, and record a single schedule-level application per worker. Do not leak Phase 3 concerns into this phase. In particular, do not model role assignment, applicant review workflow, or rich schedule detail screens yet.

The repository already has the right architectural shape for this work. Admin and worker pages should remain thin server-rendered routes under `src/app`, page composition should live in `src/flows`, writes should be server actions in `src/mutations`, and read models should live in `src/queries`. Existing code shows a simple pattern of server-rendered pages plus form actions, which matches current Next.js guidance for internal mutations.

The highest-risk planning decision is persistence shape. The cleanest Phase 02 model is three tables: `schedules`, `schedule_role_slots`, and `schedule_applications`. Keep application rows minimal and schedule-level. Enforce uniqueness and validity in Postgres, not only in UI code. For worker-facing reads and writes, prefer a session-bound Supabase server client plus RLS; using the service-role admin client for worker paths would bypass the safety boundary that this repository will need as worker features expand.

**Primary recommendation:** Use a minimal three-table schedule model, server-first reads, server actions for writes, and RLS-backed worker paths so Phase 03 can extend the model without redoing Phase 02.

## Project Constraints (from CLAUDE.md)

- Start repo-changing work through a GSD workflow command so planning artifacts stay in sync.
- Do not bypass the GSD workflow for direct edits unless explicitly requested.
- When a coherent unit of work is finished, commit and push unless the user explicitly says not to.
- Runtime code in this repo must follow the current planning/codebase contract rather than stale older artifacts.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 (installed) | App Router routes, Server Components, Server Actions | Official guidance favors direct server reads and form-backed server actions for internal app workflows |
| React | 19.1.1 (repo range) | UI runtime | Required by Next.js App Router and current repo |
| `@supabase/supabase-js` | 2.100.1 (installed) | Database/Auth client | Already used for DAL and Supabase integration throughout the repo |
| `@supabase/ssr` | 0.7.0 (installed) | Cookie-backed server/browser Supabase clients | Official Supabase Next.js guidance uses dedicated server and browser clients for SSR auth |
| Zod | 4.3.6 (installed) | Input validation | Existing mutation schema pattern already uses Zod |
| React Hook Form | 7.72.0 (installed) | Admin create/edit forms | Repo convention standard; useful once the schedule form stops being a trivial HTML form |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 3.2.4 (installed) | Colocated unit/component tests | Default automated verification path in this repo |
| `@tanstack/react-query` | 5.95.2 (installed) | Client cache for server state | Only if Phase 02 adds client-side refetch/pending UX beyond simple server-rendered refreshes |
| Zustand | 5.0.8 (repo range) | Client UI state | Only for local UI state that outgrows component state; not needed for initial schedule list/apply flow |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions for internal writes | Route Handlers | Route Handlers make sense for external clients/webhooks, but add unnecessary API surface for this internal phase |
| Server-first worker list reads | Client fetch + React Query from first render | Adds client waterfalls and cache wiring before the phase needs it |
| Session-bound Supabase client for worker paths | Service-role admin client everywhere | Faster to wire, but bypasses RLS and raises worker-data leakage risk |
| Atomic DB function for schedule + slots create | Two separate inserts in action code | Simpler at first, but can leave orphaned schedules or missing slots on partial failure |

**Installation:**
```bash
pnpm install
```

**Version verification:** No new packages are required for Phase 02. The versions above are the repository’s currently installed runtime versions from `node_modules`, which is the correct baseline for planning this phase in this repo.

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/
│   ├── admin/schedules/page.tsx          # thin admin route
│   └── worker/schedules/page.tsx         # thin worker route
├── flows/
│   ├── admin-schedules/components/       # page-level admin composition
│   └── worker-schedules/components/      # page-level worker composition
├── mutations/
│   ├── schedule/
│   │   ├── actions/
│   │   ├── dal/
│   │   └── schemas/
│   └── application/
│       ├── actions/
│       ├── dal/
│       └── schemas/
├── queries/
│   ├── schedule/
│   │   ├── dal/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   └── application/
│       ├── dal/
│       ├── types/
│       └── utils/
└── shared/
    ├── model/                           # shared primitive enums/types only
    └── config/
```

### Pattern 1: Thin App Route -> One Flow
**What:** Keep `src/app/*/page.tsx` as a thin async entry that delegates to exactly one flow component.
**When to use:** Every new admin and worker schedule route in this phase.
**Example:**
```tsx
import { AdminSchedulesPage } from "#flows/admin-schedules/components/AdminSchedulesPage";

export default async function AdminSchedulesRoute() {
  return await AdminSchedulesPage();
}
```
Source pattern in repo: `src/app/admin/worker-rates/page.tsx`

### Pattern 2: Server-First Reads, React Query Only When Needed
**What:** Fetch recruiting schedules in server code first; only introduce React Query if the UI later needs client refetch, optimistic state, or pagination.
**When to use:** Initial worker schedule list and admin schedule list.
**Example:**
```tsx
export async function WorkerSchedulesPage() {
  const schedules = await listRecruitingSchedulesForWorker();
  return <WorkerScheduleList schedules={schedules} />;
}
```
Source basis: Next.js server-first data guidance and repo flow pages

### Pattern 3: Form -> Server Action -> DAL
**What:** Submit admin create/status changes and worker applications through server actions that parse input, authorize, validate, persist, and revalidate.
**When to use:** All Phase 02 writes.
**Example:**
```tsx
"use server";

import { revalidatePath } from "next/cache";

export async function submitScheduleApplication(formData: FormData) {
  const scheduleId = String(formData.get("scheduleId") ?? "");
  await createScheduleApplication({ scheduleId });
  revalidatePath("/worker/schedules");
}
```
Source: https://nextjs.org/docs/app/guides/forms

### Pattern 4: Minimal Schedule-Level Application Model
**What:** Represent a worker’s Phase 02 intent as one row per `(schedule_id, worker_user_id)`.
**When to use:** APPL-02 and any worker “already applied” checks.
**Example:**
```sql
create table public.schedule_applications (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (schedule_id, worker_user_id)
);
```
Source basis: locked decisions D-04, D-05, D-06

### Pattern 5: Atomic Schedule Creation for Parent + Child Rows
**What:** Persist the schedule row and all role-slot rows atomically.
**When to use:** Admin create schedule action.
**Example:**
```ts
const { error } = await supabase.rpc("create_schedule_with_slots", {
  p_starts_at: startsAt,
  p_ends_at: endsAt,
  p_created_by: currentUser.id,
  p_slots: slots,
});
```
Source basis: Supabase RPC support and the need to avoid partial multi-table writes

### Recommended Data Model

**`public.schedule_status`**
- Enum values: `recruiting`, `assigning`, `confirmed`

**`public.schedules`**
- `id uuid primary key default gen_random_uuid()`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `status public.schedule_status not null default 'recruiting'`
- `created_by uuid not null references public.profiles (id)`
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`
- Check: `ends_at > starts_at`

**`public.schedule_role_slots`**
- `id uuid primary key default gen_random_uuid()`
- `schedule_id uuid not null references public.schedules (id) on delete cascade`
- `role_code text not null`
- `headcount integer not null check (headcount > 0)`
- Unique: `(schedule_id, role_code)`

**`public.schedule_applications`**
- `id uuid primary key default gen_random_uuid()`
- `schedule_id uuid not null references public.schedules (id) on delete cascade`
- `worker_user_id uuid not null references public.profiles (id) on delete cascade`
- `created_at timestamptz not null default timezone('utc', now())`
- Unique: `(schedule_id, worker_user_id)`

**Why this shape is the right Phase 02 cutoff**
- It satisfies all locked decisions without introducing assignment concepts early.
- It leaves Phase 03 free to add review/assignment tables without rewriting the Phase 02 application meaning.
- It avoids duplicate derived fields such as total headcount on `schedules`.

### Recommended DAL / Action / Query Placement

**Admin schedule creation**
- Flow: `flows/admin-schedules/components/AdminSchedulesPage.tsx`
- Action: `mutations/schedule/actions/createSchedule.ts`
- Submit wrapper: `mutations/schedule/actions/submitSchedule.ts`
- Write DAL: `mutations/schedule/dal/scheduleDal.ts`
- Schema: `mutations/schedule/schemas/schedule.ts`

**Admin status management**
- Flow-level table or list in `flows/admin-schedules/components/*`
- Action: `mutations/schedule/actions/updateScheduleStatus.ts`
- Write DAL: `mutations/schedule/dal/scheduleDal.ts`
- Read side: `queries/schedule/dal/listAdminSchedules.ts`

**Worker recruiting list**
- Flow: `flows/worker-schedules/components/WorkerSchedulesPage.tsx`
- Read DAL: `queries/schedule/dal/listRecruitingSchedules.ts`
- Read helper for applied flags: `queries/application/dal/listMyScheduleApplicationIds.ts`

**Worker application submit**
- Action: `mutations/application/actions/createScheduleApplication.ts`
- Submit wrapper: `mutations/application/actions/submitScheduleApplication.ts`
- Write DAL: `mutations/application/dal/scheduleApplicationDal.ts`
- Optional mutation-scoped button: `mutations/application/components/ApplyToScheduleButton.tsx`

### Admin / Worker UI Boundaries

**Admin UI should include**
- Create schedule form with date, start time, end time
- Inline repeatable role-slot inputs
- Schedule list with current status and status-change control

**Worker UI should include**
- Lightweight recruiting list only
- Minimal fields: date, time, recruiting/open indicator, apply action
- Applied state indicator if the worker already submitted

**Worker UI should not include in Phase 02**
- Role choice
- Applicant counts
- Schedule detail screen with rich metadata
- Assignment/review status language

### Anti-Patterns to Avoid
- **Role-slot application modeling now:** Conflicts with locked decisions and pulls assignment design into Phase 02.
- **Domain logic in flow components:** Keep auth, validation, and persistence out of `flows/*`.
- **Shared DAL in `shared/lib`:** Violates the repo contract.
- **Client-first worker listing:** Adds complexity without solving a current requirement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Internal write endpoints | Custom REST handlers for every admin/worker form | Next.js Server Actions | Current official App Router path for internal UI mutations |
| Worker authorization filtering | UI-only visibility checks | RLS + session-bound server client | Prevents accidental overfetch and data leaks |
| Multi-table create consistency | Sequential inserts with manual cleanup | Postgres function + Supabase RPC, or another atomic DB mechanism | Schedule and slot rows are one logical write |
| Form validation | Ad hoc string/number parsing scattered across components | Zod schema in mutation slice | Keeps parsing and validation centralized and testable |
| Server-state caching | Custom fetch state stores | TanStack Query when client caching is actually needed | Existing repo stack already includes it |

**Key insight:** The deceptively expensive part of this phase is not rendering forms. It is preserving the intended invariants across schedule status, role-slot counts, and one-application-per-worker rules. Put those invariants in Postgres and mutation-layer validation, not in component code.

## Common Pitfalls

### Pitfall 1: Using the Service-Role Client for Worker Flows
**What goes wrong:** Worker list/apply code accidentally bypasses RLS and can read or write more than intended.
**Why it happens:** Existing admin DAL already uses `getAdminSupabaseClient()`, which is convenient to copy.
**How to avoid:** Use `getServerSupabaseClient()` for worker-facing read/write paths and reserve the service-role client for explicitly admin-only DAL.
**Warning signs:** Worker query DAL imports `adminClient.ts`; action tests never cover non-admin users.

### Pitfall 2: Partial Schedule Creation
**What goes wrong:** A schedule row is created but one or more role-slot rows fail, leaving broken recruiting data.
**Why it happens:** Supabase JS inserts across multiple tables are not automatically one transaction when split across calls.
**How to avoid:** Make schedule+slots creation atomic with a database function/RPC or another single-transaction DB path.
**Warning signs:** DAL has one insert for `schedules` and a second loop/insert for `schedule_role_slots` with no atomic wrapper.

### Pitfall 3: Duplicate Worker Applications
**What goes wrong:** A worker can apply repeatedly to the same schedule, inflating counts and complicating Phase 03.
**Why it happens:** The UI disables the button, but the database does not enforce uniqueness.
**How to avoid:** Add a unique constraint on `(schedule_id, worker_user_id)` and handle the conflict in the action.
**Warning signs:** Only UI state blocks re-submission; tests do not cover duplicate submits.

### Pitfall 4: Over-Strict Transition Logic
**What goes wrong:** Admins cannot correct operational mistakes because the app overfits a workflow state machine too early.
**Why it happens:** Developers model a full lifecycle engine even though D-10 explicitly rejects that.
**How to avoid:** Keep the helper small: validate enum membership, reject obviously invalid inputs, and only add minimal transition blocking.
**Warning signs:** Transition logic spans many cases, side effects, and hidden automatic jumps.

### Pitfall 5: Missing Recruiting Indexes
**What goes wrong:** Worker list queries slow down as schedules and applications grow.
**Why it happens:** Postgres does not automatically create the exact indexes the query pattern needs.
**How to avoid:** Add indexes that match filters and joins, especially on `schedule_role_slots.schedule_id`, `schedule_applications.worker_user_id`, and recruiting schedule queries.
**Warning signs:** Queries filter `status = 'recruiting'` and order by `starts_at` with no dedicated index.

### Pitfall 6: Using Mutable JWT Metadata for Authorization
**What goes wrong:** Policies trust user-editable metadata.
**Why it happens:** Supabase exposes both user metadata and app metadata in JWT helpers.
**How to avoid:** Only rely on role claims sourced from `raw_app_meta_data` / secure app-managed claims. The Phase 1 custom access-token hook already points in this direction.
**Warning signs:** RLS references `user_metadata`; role changes behave inconsistently until token refresh.

## Code Examples

Verified patterns from official sources:

### Internal Mutation Form With Revalidation
```tsx
"use server";

import { revalidatePath } from "next/cache";

export async function updateScheduleStatus(formData: FormData) {
  const scheduleId = String(formData.get("scheduleId") ?? "");
  const status = String(formData.get("status") ?? "");

  await setScheduleStatus({ scheduleId, status });
  revalidatePath("/admin/schedules");
}
```
Source: https://nextjs.org/docs/app/guides/forms

### Worker-Owned Application Policy
```sql
alter table public.schedule_applications enable row level security;

create policy "workers_insert_own_schedule_applications"
on public.schedule_applications
for insert
to authenticated
with check (
  (select auth.uid()) = worker_user_id
  and (select auth.jwt() ->> 'user_role') = 'worker'
);
```
Source: https://supabase.com/docs/guides/database/postgres/row-level-security

### Recruiting Query Index
```sql
create index schedules_recruiting_starts_at_idx
on public.schedules (starts_at)
where status = 'recruiting';
```
Source: https://www.postgresql.org/docs/current/indexes-partial.html

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Internal UI posts to custom API routes by default | Next.js App Router prefers Server Actions for internal mutations | Current docs updated 2026-02-27 | Phase 02 should keep writes in `mutations/*/actions`, not add route handlers |
| App-only authorization filtering | RLS-backed filtering in Postgres for exposed tables | Current Supabase guidance | Worker-facing schedule/application paths should be safe even if UI code is wrong |
| General-purpose client state for server data | TanStack Query specifically for server state when client caching is needed | Current TanStack docs | Do not create bespoke cache state for schedule listings |

**Deprecated/outdated:**
- Treating every internal read/write as an API route: unnecessary in this repo’s App Router architecture.
- Using root-level `middleware.ts` naming assumptions in Next 16+: this repo already uses `proxy.ts`.

## Open Questions

1. **What is the canonical role vocabulary for schedule slots?**
   - What we know: Phase 02 needs per-schedule role slots with headcount.
   - What's unclear: Whether role values are fixed and finite enough for a DB enum, or should remain app-managed strings for now.
   - Recommendation: If the business already has a stable short list, use a DB enum now. Otherwise use `text role_code` plus centralized app validation and revisit enum-ization later.

2. **Does admin need edit-in-place of role slots after creation in this phase, or only create + status manage?**
   - What we know: Requirements explicitly require create and status management.
   - What's unclear: Whether slot editing after creation is required for UAT in Phase 02.
   - Recommendation: Plan for create and status update as required scope; treat slot editing after creation as optional unless planning decides it is necessary for success criteria.

3. **Should application rows include a status column now?**
   - What we know: Phase 02 only needs submission of schedule-level participation intent.
   - What's unclear: Whether the planner wants to front-load Phase 03 review states.
   - Recommendation: Keep Phase 02 application rows minimal unless Phase 03 planning is imminent and the team wants to add `submitted` as a forward-compatible seed.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js app, tests, tooling | yes | 22.22.1 | N/A |
| pnpm | Package scripts | yes | 10.32.1 | npm can run some scripts, but repo is pinned to pnpm |
| Next.js runtime | App Router build/run | yes | 16.2.1 installed | N/A |
| Vitest | Automated phase tests | yes | 3.2.4 installed | N/A |
| Supabase env vars | Actual DB/auth execution | no - missing in current shell | N/A | Use `.env.local` / CI secrets before execution |
| Supabase CLI | Local migration/apply convenience | no | N/A | Use checked-in SQL migration files and apply via Supabase dashboard/SQL editor |
| Docker | Optional local infra only | no | N/A | Not required for this phase |

**Missing dependencies with no fallback:**
- Runtime Supabase credentials are not present in the current shell. Phase execution cannot be verified end-to-end until they are supplied.

**Missing dependencies with fallback:**
- Supabase CLI is absent, but the phase can still be planned and its migrations can still be authored as SQL files.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- <path-to-test-file>` |
| Full suite command | `pnpm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCHD-01 | Admin can create a schedule with date/start/end | unit + action | `pnpm test -- src/mutations/schedule/actions/createSchedule.test.ts` | ❌ Wave 0 |
| SCHD-02 | Admin can attach role slots and headcounts to a schedule | unit + DAL/action | `pnpm test -- src/mutations/schedule/dal/scheduleDal.test.ts` | ❌ Wave 0 |
| SCHD-03 | Admin can manage schedule status | unit + action | `pnpm test -- src/mutations/schedule/actions/updateScheduleStatus.test.ts` | ❌ Wave 0 |
| APPL-01 | Worker sees only recruiting schedules in lightweight list | component + query | `pnpm test -- src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | ❌ Wave 0 |
| APPL-02 | Worker can submit one schedule application | unit + action | `pnpm test -- src/mutations/application/actions/createScheduleApplication.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- <changed-test-file>`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/mutations/schedule/schemas/schedule.test.ts` - validates form parsing and slot constraints
- [ ] `src/mutations/schedule/actions/createSchedule.test.ts` - covers SCHD-01
- [ ] `src/mutations/schedule/actions/updateScheduleStatus.test.ts` - covers SCHD-03
- [ ] `src/mutations/application/actions/createScheduleApplication.test.ts` - covers APPL-02
- [ ] `src/queries/schedule/dal/listRecruitingSchedules.test.ts` - covers recruiting read model mapping
- [ ] `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` - covers APPL-01

## Sources

### Primary (HIGH confidence)
- Repository sources:
  - `.planning/phases/02-schedule-publishing/02-CONTEXT.md` - locked scope and decisions
  - `.planning/codebase/ARCHITECTURE.md` - layer responsibilities and dependency direction
  - `.planning/codebase/CONVENTIONS.md` - placement, naming, testing, and server-first rules
  - `package.json`, `vitest.config.ts`, `src/**/*` - current runtime stack and implementation patterns
- Next.js Forms guide - https://nextjs.org/docs/app/guides/forms
- Supabase Next.js tutorial / SSR client guidance - https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- Supabase RLS guide - https://supabase.com/docs/guides/database/postgres/row-level-security
- PostgreSQL partial indexes - https://www.postgresql.org/docs/current/indexes-partial.html

### Secondary (MEDIUM confidence)
- TanStack Query React overview - https://tanstack.com/query/latest/docs/framework/react/overview
- Project skill references:
  - `.agents/skills/supabase-postgres-best-practices/references/query-missing-indexes.md`
  - `.agents/skills/supabase-postgres-best-practices/references/query-partial-indexes.md`
  - `.agents/skills/supabase-postgres-best-practices/references/schema-constraints.md`
  - `.agents/skills/supabase-postgres-best-practices/references/schema-foreign-key-indexes.md`
  - `.agents/skills/supabase-postgres-best-practices/references/security-rls-basics.md`
  - `.agents/skills/next-best-practices/data-patterns.md`

### Tertiary (LOW confidence)
- None. Remaining uncertainty is about product choices, not unverified technical claims.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - derived from installed repo versions and official framework/database docs
- Architecture: HIGH - repo constraints are explicit and existing code already follows the pattern
- Pitfalls: MEDIUM - several are strongly evidenced by official docs, but product-specific failure modes still need implementation-time validation

**Research date:** 2026-03-31
**Valid until:** 2026-04-30
