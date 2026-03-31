# Phase 03: Assignment And Pay Preview - Research

**Researched:** 2026-03-31
**Domain:** Next.js App Router + Supabase/Postgres assignment workflow and payroll preview
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 관리자는 스케줄 상세 화면 안에서 신청자 목록과 신청 상태를 검토한다.
- **D-02:** 신청자 검토는 별도 inbox형 화면이 아니라 스케줄 중심 흐름으로 유지한다.
- **D-03:** Phase 3의 admin read model은 스케줄 상세에서 신청자 검토와 배정 판단이 가능하도록 확장된다.
- **D-04:** 실제 배정은 역할 슬롯별로 수행한다.
- **D-05:** 근무자 신청은 스케줄 단위로 유지하지만, 관리자는 신청자를 각 역할 슬롯에 배치해야 한다.
- **D-06:** 역할이 없는 스케줄 전체 확정 모델은 Phase 3의 기본 흐름으로 두지 않는다.
- **D-07:** 배정 저장과 최종 확정을 분리한다.
- **D-08:** 관리자는 배정안을 저장한 뒤 별도의 명시적 확정 액션으로 최종 반영한다.
- **D-09:** 자동 확정이나 저장 즉시 확정은 기본 동작으로 두지 않는다.
- **D-10:** 근무자는 확정된 근무 기준으로 예상 급여 총액을 확인할 수 있어야 한다.
- **D-11:** 예상 급여 화면에는 총액뿐 아니라 계산 근거 요약도 함께 보여준다.
- **D-12:** 계산 근거에는 근무 시간, 적용 시급, 연장 계산 반영 여부가 포함되어야 한다.
- **D-13:** 9시간 초과분은 기본 시급의 1.5배를 적용하는 규칙을 Phase 3에서 계산 로직으로 반영한다.
- **D-14:** 런타임 코드는 `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared` 구조를 따른다.
- **D-15:** 의존 방향은 `app -> flows -> mutations -> queries -> shared`로 고정한다.
- **D-16:** `app`는 thin route layer이며 한 route는 하나의 flow에 대응한다.
- **D-17:** UI 컴포넌트는 도메인 로직을 직접 소유하지 않는다. 도메인 로직은 해당 도메인 폴더 아래에 두고 공통 로직은 `shared` 아래에 둔다.
- **D-18:** action 파일은 orchestration only로 유지하고 schema/정규화 로직은 `schemas/`로 분리한다.
- **D-19:** invalidation은 특별한 사유가 없으면 tag 기반을 우선한다.
- **D-20:** 순수 helper 함수는 component 파일이 아니라 각 도메인의 `utils/` 또는 `shared`에 둔다.
- **D-21:** 내부 import는 `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, `#shared/*` 절대 경로만 사용한다.

### Claude's Discretion
- 신청자 상태 라벨의 정확한 naming
- 배정 편집 UI의 세부 레이아웃과 interaction
- 예상 급여 화면에서 총액과 계산 근거를 어떤 density로 배치할지
- 저장 후 확정 전 draft 상태를 어떤 표현으로 보여줄지

### Deferred Ideas (OUT OF SCOPE)
- 자동 확정 조건형 워크플로
- 역할 없는 스케줄 전체 확정 모델
- 출근 데이터 연동 급여 보정
- 운영 알림/통지 기능
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APPL-03 | 관리자는 각 근무 스케줄에 대한 신청자 목록과 신청 상태를 확인할 수 있다. | Admin schedule-detail read model with applicants, current assignment state, and derived applicant status labels |
| ASGN-01 | 관리자는 신청자를 바탕으로 역할별 근무자를 배정할 수 있다. | Role-slot-based assignment table, whole-schedule draft-save mutation, slot-capacity and application validation |
| ASGN-02 | 관리자는 배정 결과를 확정해 근무자에게 최종 근무 정보를 제공할 수 있다. | Separate confirm mutation that freezes draft rows as confirmed rows and sets schedule status to `confirmed` |
| ASGN-03 | 근무자는 자신에게 확정된 근무 일정과 역할을 확인할 수 있다. | Worker confirmed-assignment query and worker-side assignment flow/route |
| PAY-02 | 시스템은 확정된 근무 정보를 기준으로 근무자별 예상 급여를 계산할 수 있다. | Centralized pay-preview calculation from confirmed assignment + schedule window + worker rate |
| PAY-03 | 시스템은 9시간 초과 근무분에 대해 기본 시급의 1.5배를 적용해 예상 급여를 계산할 수 있다. | Overtime formula using regular/overtime hour split in a single helper/read model |
| PAY-04 | 근무자는 자신의 확정 근무에 대한 예상 급여를 확인할 수 있다. | Worker pay-preview page/query with total plus calculation basis summary |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Single-venue internal tool only. Do not plan multi-venue abstractions in this phase.
- Keep one account system with role-based access; do not introduce separate auth systems.
- v1 payroll scope is preview only. Do not plan settlement or payout logic.
- Attendance remains a later phase; do not couple payroll preview to check-in data.
- Runtime code must follow `.planning/codebase/CONVENTIONS.md` and `.planning/codebase/ARCHITECTURE.md`.
- Use the existing GSD workflow for edits; commit only if the user explicitly asks.

## Summary

Phase 3 should extend the existing Phase 2 schedule model rather than replace it. The clean path is to keep worker applications schedule-level, add a new assignment layer that maps workers to specific role slots, and represent the admin workflow as `draft save -> explicit confirm`. That matches the locked decisions and avoids forcing role choice into the application step.

The highest-value design choice is to make assignment writes whole-schedule and transactional. Saving one row at a time makes it easy to overfill slots, assign the same worker twice, or leave the schedule in a half-updated state. A replace-the-draft mutation or RPC is the safest shape because it can validate slot capacity, ensure every assigned worker actually applied, and keep draft state coherent before confirmation.

For payroll preview, keep one canonical calculation path. Use confirmed assignments plus the existing `worker_rates` table and schedule timestamps to derive regular hours, overtime hours, effective hourly rate, and total cents. Do not compute pay separately in multiple components or ad hoc queries. Centralizing the formula is the main planning decision that prevents later drift.

**Primary recommendation:** Add a `schedule_assignments` table with `draft/confirmed` state, save assignment drafts transactionally per schedule, confirm them with a separate action that also sets `schedules.status = 'confirmed'`, and expose worker-facing confirmed assignment/pay queries from one shared calculation path.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.1` verified, workspace `16.0.0` | App Router routes, Server Actions, cache tags | Existing app framework and official mutation/caching model |
| `react` / `react-dom` | `19.2.4` verified, workspace `19.1.1` | UI runtime | Required by Next 16 and already in use |
| `@supabase/supabase-js` | `2.101.0` verified, workspace `2.56.1` | DB/Auth client | Existing persistence/auth boundary |
| `@supabase/ssr` | `0.10.0` verified, workspace `0.7.0` | Cookie-backed SSR client wiring | Official Supabase SSR approach for Next.js |
| `zod` | `4.3.6` verified, workspace `4.1.5` | Input parsing and normalization | Existing mutation schema standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-query` | `5.95.2` verified, workspace `5.90.6` | Client cache only where live client sync is needed | Keep optional; server-first reads remain default |
| `react-hook-form` | `7.72.0` verified, workspace `7.62.0` | Complex admin assignment form state | Use for admin draft editor if plain `<form>` becomes too awkward |
| `vitest` | `4.1.2` verified, workspace `3.2.4` | Colocated tests | Existing test runner in repo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions for admin assignment writes | Route Handlers | Route Handlers only help if an external API is needed; this phase is internal UI mutation work |
| Single `schedule_assignments` table with state | Separate draft and confirmed tables | Two tables add migration/query overhead without solving a current requirement |
| TypeScript pay-preview utility in query slice | SQL view with `security_invoker = true` | A view is viable if reuse expands later, but it adds RLS/view-policy complexity immediately |

**Installation:**
```bash
# No new packages are required if Phase 3 stays on the current stack.
# If the workspace is upgraded to the latest verified versions:
pnpm add next@16.2.1 react@19.2.4 react-dom@19.2.4 @supabase/supabase-js@2.101.0 @supabase/ssr@0.10.0 zod@4.3.6 @tanstack/react-query@5.95.2 react-hook-form@7.72.0
pnpm add -D vitest@4.1.2
```

**Version verification:** npm registry checks on 2026-03-31:
- `next@16.2.1` modified `2026-03-30T23:33:35.648Z`
- `react@19.2.4` modified `2026-03-30T16:35:07.390Z`
- `@supabase/supabase-js@2.101.0` modified `2026-03-30T15:18:29.540Z`
- `@supabase/ssr@0.10.0` modified `2026-03-30T12:57:40.859Z`
- `zod@4.3.6` modified `2026-01-25T21:51:57.252Z`
- `react-hook-form@7.72.0` modified `2026-03-22T01:02:38.068Z`
- `@tanstack/react-query@5.95.2` modified `2026-03-23T15:35:40.641Z`
- `vitest@4.1.2` modified `2026-03-26T14:36:51.783Z`

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/
│   ├── admin/schedules/[scheduleId]/page.tsx   # Thin admin schedule-detail route
│   └── worker/assignments/page.tsx             # Thin worker confirmed-work/pay route
├── flows/
│   ├── admin-schedule-assignment/              # Admin review + draft/confirm page flow
│   └── worker-assignment-preview/              # Worker confirmed assignment/pay page flow
├── mutations/
│   └── assignment/
│       ├── actions/
│       ├── dal/
│       ├── schemas/
│       └── utils/
├── queries/
│   └── assignment/
│       ├── dal/
│       ├── schemas/
│       ├── types/
│       └── utils/
└── shared/
    └── config/                                 # Extend cache tag constants only
```

### Pattern 1: Schedule-Centered Admin Detail Read Model
**What:** Build one admin query that returns schedule info, role slots, applicants, existing draft/confirmed assignments, and derived applicant status labels for a single schedule detail page.
**When to use:** For APPL-03 and the admin review/assignment UI.
**Example:**
```typescript
// Source basis: existing repo query slices + Supabase nested select patterns
type AdminScheduleAssignmentDetail = {
  schedule: { id: string; startsAt: string; endsAt: string; status: "recruiting" | "assigning" | "confirmed" };
  roleSlots: Array<{ id: string; roleCode: string; headcount: number; assignedCount: number }>;
  applicants: Array<{
    workerUserId: string;
    workerName: string | null;
    appliedAt: string;
    assignmentStatus: "unassigned" | "draft_assigned" | "confirmed_assigned";
    assignedRoleCode: string | null;
  }>;
};
```

### Pattern 2: Whole-Schedule Draft Save
**What:** Accept the full intended assignment state for one schedule in a single mutation, validate it, and replace existing draft rows atomically.
**When to use:** For ASGN-01 draft saving.
**Example:**
```typescript
// Source: Next.js Server Functions guidance + current repo action/schema split
"use server";

export async function saveScheduleAssignmentDraft(formData: FormData) {
  await requireAdminUser();
  const input = parseSaveAssignmentDraftFormData(formData);
  await replaceScheduleAssignmentDraft(input);
  revalidateTag(cacheTags.assignments.detail(input.scheduleId), "max");
}
```

### Pattern 3: Confirmed-Only Worker Read Model With Derived Pay
**What:** Query only confirmed assignment rows for the signed-in worker, then derive pay preview in one utility from assignment + schedule + worker rate.
**When to use:** For ASGN-03, PAY-02, PAY-03, PAY-04.
**Example:**
```typescript
// Source basis: PostgreSQL CASE/GREATEST docs for the overtime split formula
export function calculatePayPreview(hoursWorked: number, hourlyRateCents: number) {
  const regularHours = Math.min(hoursWorked, 9);
  const overtimeHours = Math.max(hoursWorked - 9, 0);
  const regularPayCents = Math.round(regularHours * hourlyRateCents);
  const overtimePayCents = Math.round(overtimeHours * hourlyRateCents * 1.5);

  return {
    regularHours,
    overtimeHours,
    overtimeApplied: overtimeHours > 0,
    totalPayCents: regularPayCents + overtimePayCents,
  };
}
```

### Recommended Persistence Shape
```sql
create type public.assignment_status as enum ('draft', 'confirmed');

create table public.schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  schedule_role_slot_id uuid not null references public.schedule_role_slots (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (id) on delete cascade,
  status public.assignment_status not null default 'draft',
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index schedule_assignments_one_worker_per_schedule_idx
  on public.schedule_assignments (schedule_id, worker_user_id);

create index schedule_assignments_slot_status_idx
  on public.schedule_assignments (schedule_role_slot_id, status);

create index schedule_assignments_worker_confirmed_idx
  on public.schedule_assignments (worker_user_id, schedule_id)
  where status = 'confirmed';
```

**Why this shape:** `schedule_id` is intentionally duplicated even though it is derivable from the slot. That makes schedule-level uniqueness and worker reads enforceable with plain indexes instead of complex joins or fragile app-side checks.

### Anti-Patterns to Avoid
- **Row-at-a-time assignment patching:** It makes capacity validation and “one worker per schedule” enforcement race-prone. Replace the whole schedule draft in one transaction.
- **Slot-only assignment rows without `schedule_id`:** You lose a simple unique constraint for “one worker, one assignment per schedule”.
- **Worker reads through the service-role client:** This bypasses the RLS boundary already used in Phase 2.
- **Computing pay inside React components:** Keep the formula in one utility or one DB read model so totals and breakdowns cannot drift.
- **Confirming by only changing `schedules.status`:** Worker visibility must depend on confirmed assignment rows, not just the schedule enum.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Internal mutation transport | Custom REST endpoints for every admin form | Next.js Server Actions | This phase is internal UI mutation work and the repo already follows this pattern |
| Auth/session plumbing | Ad hoc cookie parsing or client-only auth checks | `@supabase/ssr` server/browser clients + DB-backed role checks | Existing repo already uses this safely |
| Assignment consistency | Manual per-click slot counters in UI only | Transactional DAL/RPC validation + DB indexes | Capacity and uniqueness are data-integrity problems |
| Pay formula reuse | Copying the overtime calculation into multiple pages | One query utility or DB read model | Prevents mismatched totals and explanations |
| Cache refresh | Broad `revalidatePath` usage everywhere | Tag-based invalidation keyed to assignment/pay queries | Matches current repo contract and scales better |

**Key insight:** The deceptively hard part of this phase is not rendering tables. It is preserving consistent assignment state across slot capacity, schedule status, worker visibility, and pay calculation. Put those rules in one transactional write path and one canonical read/calculation path.

## Common Pitfalls

### Pitfall 1: Double-assigning the same worker inside one schedule
**What goes wrong:** A worker appears in two role slots for the same schedule.
**Why it happens:** Applications are schedule-level, so slot-level uniqueness is not enough.
**How to avoid:** Add a unique index on `(schedule_id, worker_user_id)` and validate the full draft payload before writing.
**Warning signs:** The UI allows the same applicant to remain selectable after assignment to another slot.

### Pitfall 2: Overfilling a role slot
**What goes wrong:** Admin saves more assigned workers than `headcount`.
**Why it happens:** UI-only counters drift or multiple per-row writes interleave.
**How to avoid:** Validate slot counts transactionally in the write path before replacing draft rows.
**Warning signs:** Headcount is enforced visually but not at persistence time.

### Pitfall 3: Worker pay preview leaks draft state
**What goes wrong:** Workers see assignments or pay based on draft rows before explicit confirmation.
**Why it happens:** Worker queries read “latest assignment” instead of `status = 'confirmed'`.
**How to avoid:** Make worker reads filter strictly to confirmed assignment rows.
**Warning signs:** A saved draft immediately appears in worker-facing UI.

### Pitfall 4: RLS and view mistakes cause data leaks or slow queries
**What goes wrong:** Worker-facing queries either expose too much data or become slow on growth.
**Why it happens:** Missing RLS, non-indexed policy columns, or views created without `security_invoker = true`.
**How to avoid:** Enable RLS on new tables, index policy/filter columns, and only use views with `security_invoker = true` if you introduce them.
**Warning signs:** Policies use raw `auth.uid()` repeatedly, or worker reads require service-role access.

### Pitfall 5: Schedule confirmation is not tied to assignment confirmation
**What goes wrong:** A schedule becomes `confirmed` while assignment rows remain draft or incomplete.
**Why it happens:** The existing Phase 2 status mutation is reused as-is without a Phase 3 confirm workflow.
**How to avoid:** Treat Phase 3 confirmation as a dedicated mutation that updates both assignment state and schedule status in one transaction.
**Warning signs:** Admin can mark `confirmed` from the list page without any assignment-specific validation.

## Code Examples

Verified patterns from official sources:

### Server Action Mutation Entry
```typescript
// Source: https://nextjs.org/docs/app/getting-started/updating-data
"use server";

export async function confirmScheduleAssignments(formData: FormData) {
  const input = parseConfirmAssignmentsFormData(formData);
  await confirmAssignments(input);
  revalidateTag(cacheTags.assignments.detail(input.scheduleId), "max");
  revalidateTag(cacheTags.assignments.workerConfirmed(input.workerUserId), "max");
}
```

### Overtime Split in SQL
```sql
-- Source basis: https://www.postgresql.org/docs/current/functions-conditional.html
select
  least(total_hours, 9) as regular_hours,
  greatest(total_hours - 9, 0) as overtime_hours,
  case
    when total_hours > 9
      then (9 * hourly_rate_cents) + ((total_hours - 9) * hourly_rate_cents * 1.5)
    else total_hours * hourly_rate_cents
  end as total_pay_cents
from pay_basis;
```

### Worker-Facing Confirmed Assignment Filter
```sql
-- Source basis: https://supabase.com/docs/guides/database/postgres/row-level-security
create policy "workers_select_confirmed_assignments"
on public.schedule_assignments
for select
to authenticated
using (
  (select auth.uid()) = worker_user_id
  and status = 'confirmed'
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` naming in Next.js | `proxy.ts` in Next.js 16+ | Current docs in 2026 | Keep auth/session interception aligned with current Next conventions |
| Supabase Auth Helpers | `@supabase/ssr` cookie-backed clients | Current Supabase guidance | Matches the repo’s existing SSR setup |
| Broad route invalidation after writes | Tag-based invalidation with `revalidateTag` / `updateTag` | Current Next caching docs | Better fit for query-slice reads and multiple consumers |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Supabase docs now direct Next.js SSR setups to `@supabase/ssr`.
- Building internal mutation APIs by default: Next.js App Router guidance prefers Server Actions for internal mutations.

## Open Questions

1. **Can admins confirm a partially filled schedule?**
   - What we know: Locked decisions require explicit confirm, but they do not require every slot to be filled first.
   - What's unclear: Whether business rules want “confirmed with gaps” to be valid.
   - Recommendation: Plan for partial confirmation to remain allowed unless the user explicitly tightens the rule.

2. **Can a confirmed schedule be reopened and reassigned in Phase 3?**
   - What we know: Separate draft and confirm is required.
   - What's unclear: Whether post-confirm edits are in scope.
   - Recommendation: Treat confirmation as one-way for Phase 3 planning unless the user asks for reopen/edit behavior.

3. **Should worker pay preview live on `/worker/schedules` or a dedicated page?**
   - What we know: Phase 2 already uses `/worker/schedules` for recruiting.
   - What's unclear: Whether confirmed work and recruiting should coexist in one route.
   - Recommendation: Plan a dedicated `/worker/assignments` route so recruiting and confirmed payroll concerns stay separate.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime, test execution | ✓ | `v22.22.1` | — |
| pnpm | Package/scripts workflow | ✓ | `10.32.1` | `npm.cmd` for registry inspection only |
| Next.js local CLI | App version verification | ✓ | `16.2.1` | Read from `package.json` if binary unavailable |
| Vitest local CLI | Phase validation | ✓ | `3.2.4` | `pnpm test` |
| Supabase CLI | Local migration/apply workflow | ✗ | — | Edit SQL migrations and apply through Supabase dashboard or installed DB tooling |

**Missing dependencies with no fallback:**
- None for planning-only work.

**Missing dependencies with fallback:**
- `supabase` CLI: local migration rehearsal is unavailable, but migration files can still be authored and reviewed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest` `3.2.4` in workspace |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| APPL-03 | Admin sees applicants plus assignment status in schedule detail | unit | `pnpm test -- src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts` | ❌ Wave 0 |
| ASGN-01 | Admin saves valid role-slot draft assignments | unit | `pnpm test -- src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts` | ❌ Wave 0 |
| ASGN-02 | Admin confirms draft assignments and schedule status together | unit | `pnpm test -- src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` | ❌ Wave 0 |
| ASGN-03 | Worker sees only confirmed work and assigned role | unit | `pnpm test -- src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` | ❌ Wave 0 |
| PAY-02 | System calculates confirmed-work pay preview | unit | `pnpm test -- src/queries/assignment/utils/calculatePayPreview.test.ts` | ❌ Wave 0 |
| PAY-03 | 9-hour overtime rule applies at 1.5x | unit | `pnpm test -- src/queries/assignment/utils/calculatePayPreview.test.ts` | ❌ Wave 0 |
| PAY-04 | Worker page shows total plus calculation basis summary | component | `pnpm test -- src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- <touched test file>`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/mutations/assignment/schemas/saveScheduleAssignmentDraft.test.ts` — validates whole-schedule payload normalization
- [ ] `src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts` — covers ASGN-01
- [ ] `src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` — covers ASGN-02
- [ ] `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts` — covers APPL-03
- [ ] `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` — covers ASGN-03 and PAY-04 read boundary
- [ ] `src/queries/assignment/utils/calculatePayPreview.test.ts` — covers PAY-02 and PAY-03
- [ ] `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` — covers PAY-04 rendering

## Sources

### Primary (HIGH confidence)
- Local repo files:
  - `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md` - locked decisions and phase boundary
  - `supabase/migrations/20260331_phase1_access_foundation.sql` - existing roles and `worker_rates`
  - `supabase/migrations/20260401_phase2_schedule_publishing.sql` - existing schedules, role slots, applications, and RLS shape
  - `src/queries/schedule/dal/listAdminSchedules.ts` - admin schedule read pattern
  - `src/mutations/application/actions/createScheduleApplication.ts` - worker mutation and RLS boundary pattern
  - `src/shared/lib/supabase/serverClient.ts` / `src/shared/lib/supabase/adminClient.ts` - SSR vs service-role client split
- Next.js docs:
  - https://nextjs.org/docs/app/getting-started/updating-data - Server Functions / Server Actions and form handling
  - https://nextjs.org/docs/app/getting-started/caching-and-revalidating - cache invalidation guidance
- Supabase docs:
  - https://supabase.com/docs/guides/auth/server-side/nextjs - SSR cookie client and proxy guidance
  - https://supabase.com/docs/guides/database/postgres/row-level-security - RLS, performance, and view security guidance
- PostgreSQL docs:
  - https://www.postgresql.org/docs/current/functions-conditional.html - `CASE`, `GREATEST`, `LEAST`
  - https://www.postgresql.org/docs/current/indexes-partial.html - partial indexes

### Secondary (MEDIUM confidence)
- `.planning/phases/02-schedule-publishing/02-RESEARCH.md` - prior persistence and boundary assumptions reused here
- `.agents/skills/next-best-practices/data-patterns.md` - local project guidance aligned with current Next.js docs
- `.agents/skills/supabase-postgres-best-practices/references/security-rls-performance.md` - local project guidance aligned with Supabase docs
- `.agents/skills/supabase-postgres-best-practices/references/query-partial-indexes.md` - local project guidance aligned with PostgreSQL docs

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against local binaries and npm registry on 2026-03-31
- Architecture: HIGH - grounded in locked phase decisions, existing repo slices, and current official framework/database guidance
- Pitfalls: HIGH - directly supported by existing schema gaps plus official Supabase/Postgres guidance

**Research date:** 2026-03-31
**Valid until:** 2026-04-30
