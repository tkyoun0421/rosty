# Phase 11: Admin Scheduling Surface Completion - Research

**Researched:** 2026-04-06
**Domain:** Next.js App Router admin scheduling surface completion for schedule creation, saved schedule management, schedule detail review, and operations drill-down
**Confidence:** HIGH

<user_constraints>
## User Constraints (from ROADMAP.md, PROJECT.md, and current STATE.md)

### Locked Decisions
### Scope stays on shipped admin scheduling behavior
- **D-01:** Phase 11 must polish the existing admin scheduling workflow only. Do not add new staffing states, auto-assignment, notification flows, or new business breadth.
- **D-02:** `/admin` stays the workspace landing shell introduced in Phase 10. Scheduling work stays under `/admin/schedules` and `/admin/operations`.
- **D-03:** Keep draft-save and final confirm as separate interactions. The list page cannot directly publish a schedule to `confirmed`.

### Structural rules
- **D-04:** Keep `src/app` routes thin and keep auth, data loading, and flow composition inside `src/flows`.
- **D-05:** Preserve the existing query and action contracts: `submitSchedule`, `submitScheduleStatus`, `submitScheduleAssignmentDraft`, `submitScheduleAssignmentConfirm`, `listAdminSchedules`, `getAdminScheduleAssignmentDetail`, `getAdminScheduleAttendanceDetail`, and `listAdminOperationsDashboardSchedules`.
- **D-06:** Reuse existing shared UI primitives (`Card`, `Badge`, `Alert`, `Button`). Add new shared primitives only if they are genuinely generic and clearly reduce repeated form styling.

### Product-quality expectations
- **D-07:** Replace mojibake copy, raw table defaults, and large inline-style blocks on the primary admin scheduling routes.
- **D-08:** Admin scheduling surfaces must explain current state, next action, and result feedback in place instead of relying on implicit route refreshes or developer-facing scaffolds.
- **D-09:** The operations dashboard must remain summary-first and must hand off into the existing schedule detail route rather than editing inline.

### the agent's Discretion
- Whether the saved-schedules surface stays table-based on desktop with a mobile fallback, or moves fully to card/list presentation.
- Whether form controls are styled locally in flow components or promoted into small shared `Input`/`Select`/`Label` primitives.
- Whether dashboard polish focuses only on information hierarchy, or also adds stronger CTAs back into `/admin/schedules`.

### Deferred Ideas (OUT OF SCOPE)
- Automatic assignment suggestions or recommendation logic.
- Full calendar-grid scheduling UI beyond the existing date/time form inputs.
- New worker-facing recruiting or confirmed-work redesigns. Those belong to Phase 12.
- Changes to the underlying schedule, assignment, attendance, or dashboard data models unless surface work exposes a blocking contract gap.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMINUI-01 | Admin can create a schedule from a readable form with clear date, time, and role-slot editing controls. | Rebuild `CreateScheduleForm.tsx` around readable form sections, labels, role-slot controls, and clear primary actions without changing `submitSchedule`. |
| ADMINUI-02 | Admin can scan saved schedules and understand status, time, and staffing summary without relying on raw-table defaults. | Replace the current bare `ScheduleTable.tsx` and mojibake `AdminSchedulesPage.tsx` copy with a readable list or card presentation driven by the existing admin schedule DTO. |
| ADMINUI-03 | Admin can open schedule detail, manage draft/confirm assignment actions, and understand action results from inline feedback. | Keep the existing detail DTOs and submit wrappers, but rebuild the detail surface around clearer hierarchy, summaries, and feedback. |
| ADMINUI-04 | Admin can use the operations dashboard as a readable entry point into schedule drill-down work. | Keep the existing dashboard read model and route handoff, but align the header, empty state, and card presentation with the broader admin scheduling workspace. |
</phase_requirements>

## Summary

Phase 11 is a surface-completion phase over already-working admin scheduling behavior. The backend and query/mutation contracts already exist:

- `/admin/schedules` already reads from `listAdminSchedules()` and writes through `submitSchedule` and `submitScheduleStatus`.
- `/admin/schedules/[scheduleId]` already loads assignment and attendance detail through `getAdminScheduleAssignmentDetail()` and `getAdminScheduleAttendanceDetail()`, then writes through `submitScheduleAssignmentDraft()` and `submitScheduleAssignmentConfirm()`.
- `/admin/operations` already renders a dashboard from `listAdminOperationsDashboardSchedules()` and drills into the same detail route.

The remaining gap is not missing capability but weak product presentation:

- `AdminSchedulesPage.tsx` still renders mojibake copy and a bare `<main>`.
- `CreateScheduleForm.tsx` uses raw fieldsets, raw buttons, and no readable hierarchy.
- `ScheduleTable.tsx` is still a bare table using raw browser defaults, even though Phase 11 explicitly targets relief from raw-table UX.
- `ScheduleStatusForm.tsx` still uses an unstyled `<select>` and submit button with no product framing.
- `ApplicantAssignmentPanel.tsx`, `AssignmentSummaryCard.tsx`, and `ConfirmAssignmentsDialog.tsx` still rely heavily on inline styles from the original Phase 03 delivery.
- `AttendanceReviewPanel.tsx` is already closer to the Phase 10/Phase 11 visual language, so the detail route should build around it instead of replacing the data flow.
- `AdminOperationsDashboardPage.tsx` is readable now, but `ADMINUI-04` remains open because the dashboard still behaves like an isolated triage view rather than a clearly connected entry into schedule management.

**Primary recommendation:** split the phase into three execution plans:

1. Rebuild `/admin/schedules` so schedule creation and the saved-schedules surface feel like one coherent management screen.
2. Rebuild `/admin/schedules/[scheduleId]` so assignment review, attendance context, draft-save, and final confirm feel like one usable detail workflow.
3. Align `/admin/operations` with the admin scheduling workspace so dashboard triage and drill-down handoff are visually and navigationally coherent.

## Current Codebase Findings

### Existing routes and flow ownership

| Route | Current owner | Current quality | Notes |
|------|---------------|-----------------|-------|
| `/admin/schedules` | `src/flows/admin-schedules/components/AdminSchedulesPage.tsx` | scaffold | Server read exists, but page copy is mojibake and layout is a bare vertical stack. |
| `/admin/schedules/[scheduleId]` | `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | partially polished | The route is thin and the data flow is correct, but the main applicant/confirm UI still uses large inline-style blocks. |
| `/admin/operations` | `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.tsx` | readable baseline | Card-based already, but still not fully aligned with the scheduling workspace language from Phase 10 and the planned `/admin/schedules` refresh. |

### Existing automated coverage

| File | What it proves | Relevance |
|------|----------------|-----------|
| `src/mutations/schedule/actions/createSchedule.test.ts` | Admin-only schedule creation and recruiting default | backend baseline for ADMINUI-01 |
| `src/mutations/schedule/actions/submitSchedule.test.ts` | Schedule writes refresh schedule and dashboard tags | backend baseline for ADMINUI-01 and ADMINUI-04 |
| `src/mutations/schedule/actions/updateScheduleStatus.test.ts` | Inline list-page status transitions stay limited to `recruiting` and `assigning` | guardrail for ADMINUI-02 |
| `src/queries/schedule/dal/listAdminSchedules.test.ts` | Admin schedule list DTO and cache behavior | read baseline for ADMINUI-02 |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` | Draft save, separate confirm, detail hierarchy, and list-page handoff | strong baseline for ADMINUI-03 |
| `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` | Dashboard ordering, metrics, anomaly labels, and drill-down hrefs | strong baseline for ADMINUI-04 |

### Coverage gaps to close in this phase

- No `AdminSchedulesPage.test.tsx` currently verifies the `/admin/schedules` page shell, empty state, or saved-schedule presentation.
- No `CreateScheduleForm.test.tsx` currently verifies the rebuilt schedule creation surface, role-slot controls, or submit labels.
- No tests currently assert the Phase 11 schedule-management CTA language on the operations dashboard.

### Existing patterns to preserve

- `src/app/*` route files stay thin and delegate to matching flow components.
- Admin route guards stay inside the flow entry (`requireAdminUser()` or `getCurrentUser()` in the flow layer), not in the route file.
- Schedule write actions own cache-tag invalidation after success.
- Detail review already uses two read models: one for assignment data and one for attendance data. Surface work should not collapse them into a new combined DAL without a strong reason.

## Project Constraints (from CONVENTIONS.md and Next.js best practices)

- Use `#` alias imports only.
- Keep `src/app` route files thin and async `params` handling in route files only when required by App Router.
- Keep server reads in server components and mutation submit handlers in `mutations/*/actions`.
- Prefer extending the current server-first page pattern instead of introducing client-side data fetching for these admin routes.
- Use colocated Vitest + Testing Library tests beside the flow/component files that change.
- Repository text files must stay UTF-8 without BOM and LF line endings.

## Standard Stack

### Core

| Library | Version Source | Purpose | Why Standard |
|---------|----------------|---------|--------------|
| Next.js App Router | `package.json` | route files, server components, loading/error contracts, async params | Admin routes already live in App Router and should stay thin. |
| React 19 | `package.json` | client-side draft/confirm editing and dynamic role-slot controls | Existing admin create/detail surfaces already use client components for interaction. |
| Tailwind utility classes | existing components | visual polish and consistent layout treatment | Shared primitives already assume Tailwind utility styling. |
| Vitest + Testing Library | existing test suite | admin flow and component regression coverage | Current admin detail and dashboard tests already use this stack. |
| Existing schedule/assignment server actions | current codebase | write-side orchestration and tag invalidation | Phase 11 should preserve these contracts instead of rewriting them. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Keeping the current server-action form contracts | Full react-hook-form migration for admin schedule creation | Higher scope and higher behavior risk for a phase that is primarily about surface completion, not form architecture. |
| Rebuilding list/detail/dashboard separately with their own visual language | Extending the Phase 10 card-and-workspace language | Separate visual languages would make the admin workspace feel fragmented. |
| Editing inline from the dashboard | Keeping the dashboard summary-first and drilling into detail | Inline dashboard editing would blur the existing route ownership and widen scope beyond Phase 11. |

## Architecture Patterns

### Pattern 1: Server-first admin route, client-side mutation island
**What:** Keep the route entry and data read server-side, then hand interactive controls to the smallest possible client component.

**When to use:** `/admin/schedules`, `/admin/schedules/[scheduleId]`, and the dashboard CTA/action regions.

**Why:** This matches the current repo structure and preserves auth/read guarantees close to the data source.

### Pattern 2: Shared scheduling workspace language
**What:** Use the Phase 10 admin shell and existing dashboard card treatment as the baseline visual language for create, list, detail, and triage surfaces.

**When to use:** Every primary admin scheduling screen in Phase 11.

**Why:** The goal is coherence across admin scheduling, not three isolated UI rewrites.

### Pattern 3: Detail routes keep summary, controls, and confirm feedback distinct
**What:** Keep attendance review, assignment summary, applicant controls, and final confirmation as distinct UI regions.

**When to use:** `AdminScheduleAssignmentPage.tsx` and its child components.

**Why:** The current backend model already separates draft-save from final confirm, so the UI should make that distinction more legible, not less.

### Pattern 4: Dashboard stays summary-first but points back into schedule management
**What:** Keep `/admin/operations` as a triage view with CTA handoffs into `/admin/schedules` and `/admin/schedules/[scheduleId]`.

**When to use:** Dashboard header, empty state, and card footer presentation.

**Why:** `ADMINUI-04` is about making the dashboard a readable entry point into schedule drill-down work, not turning it into a second editing surface.

### Anti-Patterns to Avoid

- Rewriting the schedule, assignment, attendance, or dashboard DAL just to support visual polish.
- Re-introducing direct `confirmed` status changes from the list page.
- Leaving large inline-style objects in the detail editor after Phase 11.
- Fixing only text while keeping raw tables, unstyled controls, and weak empty states.
- Moving business logic into `src/app/admin/*` route files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Primary actions | Bare `<button>` styling in each component | `Button` from `src/shared/ui/button.tsx` | Keeps size, focus, disabled, and visual hierarchy consistent. |
| Screen framing | One-off `<main><h1>...` stacks | `Card`, `Badge`, `Alert`, and the Phase 10 workspace pattern | Aligns admin scheduling with the new Phase 10 shell language. |
| Dashboard/detail drill-down | New route or duplicate editor state in dashboard cards | Existing `/admin/schedules/[scheduleId]` route | Keeps route ownership clear. |

## Common Pitfalls

### Pitfall 1: Polishing only `/admin/schedules` and leaving detail/dashboard mismatched
**What goes wrong:** The list page becomes polished, but the detail route and dashboard still feel like separate generations of UI.
**How to avoid:** Treat the phase as one admin scheduling workspace and carry the same status, summary, and CTA language across plans.

### Pitfall 2: Overwriting good data contracts while chasing UI polish
**What goes wrong:** A surface phase becomes a DAL rewrite and introduces backend regressions.
**How to avoid:** Explicitly preserve current queries/actions in the plan text and focus modifications in `flows/*/components`.

### Pitfall 3: Hiding important publishing rules
**What goes wrong:** The polished UI obscures the rule that draft save and final confirm are separate.
**How to avoid:** Keep distinct controls, summaries, and confirmation copy for draft and final publish.

### Pitfall 4: Treating the dashboard as finished because it already has cards
**What goes wrong:** `ADMINUI-04` remains practically incomplete because the dashboard still lacks stronger handoff into the refreshed scheduling workspace.
**How to avoid:** Add explicit schedule-management CTAs and shared language in the dashboard plan rather than assuming earlier polish closed the requirement.

## Environment Availability

| Capability | Status | Notes |
|------------|--------|-------|
| Admin schedule create/list/detail/dashboard routes | Available | All routes and flows already exist. |
| Shared UI primitives (`Button`, `Card`, `Alert`, `Badge`) | Available | Enough to support Phase 11 without a new component library. |
| Admin scheduling action tests | Available | Existing action and DAL tests already guard backend behavior. |
| UI-SPEC for Phase 11 | Missing | Planning is proceeding without a UI design contract by local override because the user asked to continue planning directly. |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm exec vitest run src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` |
| Full suite command | `pnpm exec vitest run` |
| Estimated runtime | ~35 seconds |

### Phase Requirements -> Test Map

| Requirement | Proof Target | Test Type | Command | Notes |
|-------------|--------------|-----------|---------|-------|
| ADMINUI-01 | schedule creation surface and role-slot editor | component + action | `pnpm exec vitest run src/flows/admin-schedules/components/CreateScheduleForm.test.tsx src/mutations/schedule/actions/createSchedule.test.ts src/mutations/schedule/actions/submitSchedule.test.ts` | `CreateScheduleForm.test.tsx` should be added in this phase. |
| ADMINUI-02 | admin saved-schedules surface, status controls, and empty state | flow + DAL + action | `pnpm exec vitest run src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx src/queries/schedule/dal/listAdminSchedules.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts` | `AdminSchedulesPage.test.tsx` should be added in this phase. |
| ADMINUI-03 | admin schedule detail review, draft-save, confirm, and attendance context | flow + query + action | `pnpm exec vitest run src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` | Existing page test should be expanded rather than replaced. |
| ADMINUI-04 | operations dashboard triage and drill-down into schedule detail | flow + DAL + utils | `pnpm exec vitest run src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts src/queries/operations-dashboard/utils/operationsDashboard.test.ts` | Existing dashboard tests should be expanded with the new Phase 11 CTA and empty-state expectations. |

### Sampling Rate

- **After every task commit:** Run the task-specific verification command.
- **After every plan wave:** Run `pnpm exec vitest run src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 35 seconds.

### Wave 0 Gaps

- [ ] `src/flows/admin-schedules/components/CreateScheduleForm.test.tsx` - verifies the rebuilt creation surface, role-slot controls, and primary action text
- [ ] `src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx` - verifies admin gate, saved-schedules empty state, schedule row/card content, and inline status control behavior

*Existing detail and dashboard tests already provide strong baseline coverage once their assertions are expanded to match the refreshed surfaces.*

### Manual-Only Checks

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real admin schedule creation from `/admin/schedules` | ADMINUI-01 | Automated tests prove action contracts, not the live browser form feel | Create a schedule with multiple role slots and confirm the saved schedule reappears in the refreshed list with readable details. |
| Real draft-save and final-confirm UX on the detail page | ADMINUI-03 | Product quality depends on actual interaction flow, not just action invocation | Open `/admin/schedules/[scheduleId]`, edit assignments, save a draft, then confirm and verify the feedback states make sense in sequence. |
| Dashboard-to-detail handoff after live schedule changes | ADMINUI-04 | Browser navigation and freshness feel are best validated live | Create or update a schedule, open `/admin/operations`, and confirm the dashboard surfaces the schedule and drills into the refreshed detail page cleanly. |

## Sources

### Local Codebase Inspection
- `src/app/admin/schedules/page.tsx`
- `src/app/admin/schedules/[scheduleId]/page.tsx`
- `src/app/admin/operations/page.tsx`
- `src/flows/admin-schedules/components/AdminSchedulesPage.tsx`
- `src/flows/admin-schedules/components/CreateScheduleForm.tsx`
- `src/flows/admin-schedules/components/ScheduleTable.tsx`
- `src/flows/admin-schedules/components/ScheduleStatusForm.tsx`
- `src/flows/admin-schedules/utils/formatSchedule.ts`
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx`
- `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx`
- `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx`
- `src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx`
- `src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx`
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx`
- `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.tsx`
- `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardSection.tsx`
- `src/flows/admin-operations-dashboard/components/OperationsDashboardCard.tsx`
- `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx`
- `src/queries/schedule/dal/listAdminSchedules.ts`
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts`
- `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts`
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts`
- `src/mutations/schedule/actions/submitSchedule.ts`
- `src/mutations/schedule/actions/submitScheduleStatus.ts`
- `src/mutations/schedule/schemas/schedule.ts`
- `src/mutations/schedule/schemas/updateScheduleStatus.ts`
- `src/shared/ui/button.tsx`
- `src/shared/ui/card.tsx`
- `src/shared/ui/alert.tsx`
- `src/shared/ui/badge.tsx`

## Metadata

- Research mode: local fallback; no subagents used for this planning run
- Context mode: continued without `CONTEXT.md` and without `UI-SPEC.md` to preserve momentum on the user-requested planning step
- Scope: admin schedule creation, saved schedule management, schedule detail review, and operations drill-down surface completion
- Recommended plan count: 3
