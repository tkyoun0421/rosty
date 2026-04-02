# Phase 07: Application Admin Freshness - Research

**Researched:** 2026-04-03
**Domain:** Next.js server-action cache invalidation for admin applicant freshness
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Admin freshness contract
- **D-01:** After a worker submits an application, the next admin render or navigation to the existing schedule detail flow must show the updated applicant state.
- **D-02:** After a worker submits an application, the next admin render or navigation to the operations dashboard must show updated applicant-derived counts and anomaly context.

### Invalidation strategy
- **D-03:** Freshness should be handled through the existing tag-based invalidation pattern triggered from the worker application submit action.
- **D-04:** Refresh only the admin reads affected by worker applications, centered on admin schedule detail and admin operations dashboard. Do not widen into route-level invalidation.

### UX scope
- **D-05:** Admin review stays inside the existing schedule-centric detail flow and summary-first operations dashboard.
- **D-06:** Do not add polling, websocket/live push, manual refresh UI, or "new applicant" notification UI.

### the agent's Discretion
- Whether to invalidate only schedule-specific admin detail tags or also broader parent tags already attached to the same cache entries.
- Exact regression coverage split between the worker submit action and admin read-model tests.

### Deferred Ideas (OUT OF SCOPE)
- Live push or websocket-driven admin updates.
- Polling-based auto-refresh for open admin pages.
- Dedicated "new applicant" notification badges or inbox-style surfaces.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APPL-02 | Workers can submit schedule applications. | Keep the existing worker submit flow intact while tightening its success-path invalidation behavior. |
| APPL-03 | Admins can review application state in schedule context. | Revalidate the cached admin schedule-detail read keyed by schedule ID after a successful application write. |
| DASH-02 | Admins can see application, assignment, and attendance status together from the dashboard. | Revalidate the cached admin operations dashboard read after a successful application write. |
</phase_requirements>

## Summary

Phase 07 is a narrow freshness gap closure, not a new feature slice. The worker write path already exists in `src/mutations/application/actions/submitScheduleApplication.ts`, and both admin read targets already exist and are cached:

- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts`
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts`

The real gap is that the worker submit action currently revalidates only worker-facing tags:

- `cacheTags.applications.all`
- `cacheTags.applications.workerScheduleIds`
- `cacheTags.schedules.recruitingList`

It does **not** revalidate the admin schedule-detail cache or the admin dashboard cache. That means an application write can succeed while admin reads remain stale until some unrelated mutation or cache expiry happens.

The safest implementation is to keep the phase centered on the submit wrapper action and add explicit admin freshness invalidation there. The schedule-detail read already has a schedule-scoped tag via `cacheTags.assignments.detail(scheduleId)`, and the dashboard read already has dedicated dashboard tags via `cacheTags.dashboard.all` and `cacheTags.dashboard.adminOperations`.

**Primary recommendation:** split the phase into a failing-first regression plan and an implementation plan:

1. Add a new `submitScheduleApplication` action test that proves a successful application must invalidate the admin schedule-detail and dashboard tags, while a duplicate/no-op submission does not.
2. Update `submitScheduleApplication.ts` to parse once, call `createScheduleApplication`, and revalidate the worker tags plus `cacheTags.assignments.detail(parsed.scheduleId)`, `cacheTags.dashboard.all`, and `cacheTags.dashboard.adminOperations` only when `result.status === "applied"`.

## Project Constraints (from CLAUDE.md and codebase conventions)

- Keep route files thin and keep business logic below `src/app`.
- Use `#` absolute imports only.
- Prefer tag-based invalidation over `revalidatePath`.
- Keep write orchestration in `mutations/*/actions`.
- Do not widen this phase into new UI or real-time sync.
- Repository text files must stay UTF-8 without BOM and LF line endings.

## Standard Stack

### Core
| Library | Version Source | Purpose | Why Standard |
|---------|----------------|---------|--------------|
| Next.js App Router | repo `package.json` | Server actions plus `revalidateTag` invalidation | Current write paths already use server actions and tag invalidation. |
| React / server components | repo `package.json` | Existing admin and worker flows | No client cache layer is needed for this freshness gap. |
| Supabase SSR + admin client | existing query slices | Cached admin reads over schedule/application data | The admin read models already exist and should be refreshed, not replaced. |
| Vitest | existing test suite | Action and DAL regression coverage | Current repo uses colocated Vitest tests for actions and queries. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Action-level tag invalidation | `revalidatePath("/admin")` or `revalidatePath("/admin/schedules/[id]")` | Broader, less explicit, and against repo conventions. |
| Success-only invalidation | Always revalidate even on duplicate/no-op submissions | Simpler wrapper logic, but it masks the distinction between a write and a no-op. |
| Existing cached admin reads | New application-specific admin read model | Unnecessary scope increase; the current admin detail and dashboard reads already contain the needed application data. |

## Architecture Patterns

### Recommended Project Structure
```text
src/
+-- mutations/
|   +-- application/
|       +-- actions/
|           +-- submitScheduleApplication.ts
|           `-- submitScheduleApplication.test.ts
+-- queries/
|   +-- assignment/
|   |   `-- dal/getAdminScheduleAssignmentDetail.ts
|   `-- operations-dashboard/
|       `-- dal/listAdminOperationsDashboardSchedules.ts
`-- shared/
    `-- config/cacheTags.ts
```

### Pattern 1: Worker write wrapper owns cache invalidation
**What:** `submitScheduleApplication.ts` should remain the single place that converts a worker application write result into cache invalidation.

**When to use:** Always for this phase. Do not move freshness logic into the DAL or UI components.

**Why:** The repo keeps write orchestration in `mutations/*/actions`, and other mutations already follow this pattern for schedule, assignment, and attendance freshness.

### Pattern 2: Use schedule-scoped admin detail invalidation
**What:** Revalidate `cacheTags.assignments.detail(parsed.scheduleId)`.

**When to use:** After a successful application write.

**Why:** `getAdminScheduleAssignmentDetail(scheduleId)` caches by schedule and already declares both `cacheTags.assignments.all` and `cacheTags.assignments.detail(scheduleId)`. Using the schedule-specific tag stays aligned with the user's request not to broaden invalidation beyond the affected admin read.

### Pattern 3: Use dedicated dashboard tags for dashboard freshness
**What:** Revalidate `cacheTags.dashboard.all` and `cacheTags.dashboard.adminOperations`.

**When to use:** After a successful application write.

**Why:** The dashboard read model is already cached with those tags, and other mutations already refresh them. Phase 07 should bring the worker application write path up to the same standard.

### Pattern 4: Revalidate only on a real write
**What:** Gate revalidation behind `result.status === "applied"`.

**When to use:** In the submit wrapper after `createScheduleApplication`.

**Why:** `createScheduleApplication` explicitly returns `{ status: "already_applied" }` for duplicate submissions. That result is a no-op, and `submitAttendanceCheckIn.ts` already demonstrates the repo pattern of conditionally revalidating only on success.

### Anti-Patterns to Avoid
- Revalidating `/admin` or schedule detail by path instead of by tag.
- Adding dashboard polling or websocket work to solve a server-cache invalidation gap.
- Moving invalidation into `createScheduleApplication.ts`; that action is domain-write logic, not submit-wrapper orchestration.
- Revalidating only `cacheTags.applications.*` and assuming admin reads will refresh transitively; they will not.
- Widening the phase into changes for admin list pages that do not currently surface applicant freshness requirements.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin freshness trigger | Client-side refresh button or `router.refresh()` UI work | `revalidateTag(...)` from the server action | The phase is about next-render freshness without new UI. |
| Admin detail targeting | New application-detail cache namespace | `cacheTags.assignments.detail(scheduleId)` | The existing admin schedule-detail read already uses this cache contract. |
| Dashboard targeting | New application-dashboard cache namespace | `cacheTags.dashboard.all` and `cacheTags.dashboard.adminOperations` | The existing dashboard read already uses dedicated tags. |

**Key insight:** the codebase already has the right admin read models and cache tags. Phase 07 is mostly about making the worker application submit wrapper participate in the same freshness contract as schedule, assignment, and attendance mutations.

## Common Pitfalls

### Pitfall 1: Treating duplicate submissions as writes
**What goes wrong:** `submitScheduleApplication` revalidates admin caches even when `createScheduleApplication` returns `already_applied`.
**Why it happens:** The current wrapper ignores the returned status and always revalidates.
**How to avoid:** Capture the result and gate revalidation on `status === "applied"`.
**Warning signs:** Duplicate-apply tests still show `revalidateTag(...)` calls.

### Pitfall 2: Refreshing only the dashboard or only the detail page
**What goes wrong:** One admin surface updates while the other remains stale.
**Why it happens:** The phase goal explicitly mentions both schedule detail and dashboard reads, but it is easy to implement only one.
**How to avoid:** Add explicit acceptance criteria and tests for both the schedule-detail tag and dashboard tags.
**Warning signs:** Action tests assert only `dashboard` or only `assignments:detail:*`.

### Pitfall 3: Using broad invalidation when a scoped tag already exists
**What goes wrong:** The implementation revalidates `cacheTags.assignments.all` instead of the schedule-specific tag.
**Why it happens:** The cached query declares both tags.
**How to avoid:** Prefer `cacheTags.assignments.detail(parsed.scheduleId)` for this phase because the affected admin read is schedule-specific.
**Warning signs:** Planner language says "refresh assignment caches" without naming the exact tag.

### Pitfall 4: Adding new read-model work that the phase does not need
**What goes wrong:** The plan starts editing `getAdminScheduleAssignmentDetail.ts` or `listAdminOperationsDashboardSchedules.ts` even though their data mapping already includes applications.
**Why it happens:** It feels natural to touch the admin reads involved in the bug.
**How to avoid:** Keep the phase centered on the write path unless a missing test or tag contract proves otherwise.
**Warning signs:** The file list expands into DAL refactors without a concrete freshness gap.

## Code Examples

### Current gap site
```ts
export async function submitScheduleApplication(formData: FormData) {
  await createScheduleApplication(parseSubmitScheduleApplicationFormData(formData));
  revalidateTag(cacheTags.applications.all, "max");
  revalidateTag(cacheTags.applications.workerScheduleIds, "max");
  revalidateTag(cacheTags.schedules.recruitingList, "max");
}
```

### Recommended direction
```ts
export async function submitScheduleApplication(formData: FormData) {
  const parsed = parseSubmitScheduleApplicationFormData(formData);
  const result = await createScheduleApplication(parsed);

  if (result.status === "applied") {
    revalidateTag(cacheTags.applications.all, "max");
    revalidateTag(cacheTags.applications.workerScheduleIds, "max");
    revalidateTag(cacheTags.schedules.recruitingList, "max");
    revalidateTag(cacheTags.assignments.detail(parsed.scheduleId), "max");
    revalidateTag(cacheTags.dashboard.all, "max");
    revalidateTag(cacheTags.dashboard.adminOperations, "max");
  }

  return result;
}
```

This keeps the worker-facing behavior intact, adds the missing admin freshness hooks, and avoids no-op invalidation on duplicate applies.

## Open Questions

1. **Should `cacheTags.assignments.all` also be revalidated?**
   - What we know: the admin detail query includes both `assignments.all` and `assignments.detail(scheduleId)`.
   - What's unclear: whether broader assignment caches elsewhere depend on application writes.
   - Recommendation: use `cacheTags.assignments.detail(parsed.scheduleId)` only for the phase default, because the locked context asks for narrowly targeted admin freshness.

2. **Should query tests be extended in addition to the action test?**
   - What we know: existing query tests already prove the admin detail mapper and dashboard mapper consume application rows.
   - What's unclear: whether the team wants explicit cache-tag contract assertions on the admin detail DAL as extra future-proofing.
   - Recommendation: make the new action test mandatory; expand query tests only if checker feedback says the cache contract needs stronger evidence.

## Environment Availability

| Dependency | Required By | Available | Evidence |
|------------|------------|-----------|----------|
| Node.js | GSD tooling and Vitest | yes | existing local workflow execution |
| pnpm | test commands | yes | repo scripts and prior phase artifacts |
| Vitest | action regression coverage | yes | colocated test suite already present |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| APPL-02 | Worker apply submit wrapper preserves the current worker-facing invalidation and returns success/no-op semantics correctly. | action | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts` | no - Wave 0 |
| APPL-03 | A successful worker application invalidates the admin schedule-detail cache for the affected schedule. | action | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts` | no - Wave 0 |
| DASH-02 | A successful worker application invalidates the admin operations dashboard cache. | action + existing DAL regression | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` | partial - Wave 0 for action |

### Sampling Rate
- **Per task commit:** `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts`
- **Per wave merge:** `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts`
- **Phase gate:** `pnpm test`

### Wave 0 Gaps
- [ ] `src/mutations/application/actions/submitScheduleApplication.test.ts` - verifies success-path admin cache invalidation and no-op duplicate behavior.

### Manual-Only Checks
| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| An admin sees the newly applied worker on the existing schedule detail page after a worker applies. | APPL-03 | Automated action tests prove invalidation, but not the full server-render handoff in a running app. | Open a recruiting schedule as admin, submit an application from a worker session, then navigate back to the schedule detail page and confirm the applicant appears without manual cache clearing. |
| The operations dashboard applicant count reflects the new application after the worker apply. | DASH-02 | Existing DAL tests cover mapping, but not the real server-cache cycle in browser navigation. | Open `/admin`, note applicant count, submit a worker application, then revisit `/admin` and confirm the count increments on the affected schedule card. |

## Sources

### Local Codebase Inspection
- `.planning/phases/07-application-admin-freshness/07-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `src/mutations/application/actions/submitScheduleApplication.ts`
- `src/mutations/application/actions/createScheduleApplication.ts`
- `src/mutations/application/actions/createScheduleApplication.test.ts`
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts`
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts`
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts`
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts`
- `src/shared/config/cacheTags.ts`
- `src/mutations/assignment/actions/confirmScheduleAssignments.ts`
- `src/mutations/attendance/actions/submitAttendanceCheckIn.ts`

## Metadata

**Confidence breakdown:**
- Gap identification: HIGH - direct inspection shows the worker submit action does not invalidate admin freshness tags.
- Architecture: HIGH - the required admin read tags already exist and are used by adjacent mutation flows.
- Plan decomposition: HIGH - this is a small TDD-friendly gap closure similar in shape to Phase 06.

**Research date:** 2026-04-03
**Valid until:** 2026-04-17
