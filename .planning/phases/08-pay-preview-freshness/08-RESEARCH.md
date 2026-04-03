# Phase 08: Pay Preview Freshness - Research

**Researched:** 2026-04-04
**Domain:** Next.js server-action cache invalidation for worker pay-preview freshness after admin rate writes
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Worker freshness contract
- **D-01:** After an admin saves a worker rate, the next worker render or navigation to the confirmed-assignment/pay-preview flow must show totals recalculated from the latest hourly rate.
- **D-02:** Freshness should stay scoped to the affected worker's pay-preview reads. Unrelated admin pages and other workers should not be revalidated by default.

### Invalidation strategy
- **D-03:** Reuse the existing server-action plus tag-based invalidation pattern instead of adding client refresh logic or path-level revalidation.
- **D-04:** Keep cache orchestration in the admin rate submit wrapper and gate it on successful writes so failed submissions do not churn worker-facing caches.
- **D-05:** If the worker pay-preview read lacks a dedicated freshness tag, add one to the cached query rather than widening invalidation to broad assignment namespaces.

### Scope boundaries
- **D-06:** Preserve the current worker assignment-preview page structure and the admin worker-rate management surface. This phase fixes freshness only.
- **D-07:** Do not add polling, websocket push, manual refresh controls, or payroll settlement behavior.

### the agent's Discretion
- Exact split between `cacheTags.assignments.workerConfirmed(workerUserId)` and `cacheTags.assignments.workerPayPreview(workerUserId)` after auditing the worker pay-preview query.
- Exact regression coverage mix between action-level invalidation tests and worker pay-preview query or page tests.

### Deferred Ideas (OUT OF SCOPE)
- Live cross-session worker pay-preview updates while the page remains open.
- Bulk rate editing workflows or admin-side pay-preview drilldowns.
- Payroll settlement, payouts, or export/reporting behavior.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAY-01 | Admins can register and update worker hourly rates. | Keep the existing admin worker-rate write flow intact while adding freshness orchestration around it. |
| PAY-02 | The system calculates expected pay from confirmed assignments and worker rates. | Refresh the cached worker assignment/pay-preview query whenever the affected worker's rate changes. |
| PAY-04 | Workers can review their own confirmed work and expected pay. | Preserve the existing worker preview page and make its next render reflect the updated rate. |
</phase_requirements>

## Summary

Phase 08 is another narrow freshness gap closure, not a new payroll feature. The admin rate write path already exists in `src/mutations/worker-rate/actions/submitWorkerRate.ts`, and the worker pay-preview read already exists in `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts`.

The gap is twofold:

- `submitWorkerRate.ts` currently performs no `revalidateTag(...)` calls after a successful rate write.
- `listConfirmedWorkerAssignments.ts` computes pay preview totals, but its cached read uses only `cacheTags.assignments.all` and `cacheTags.assignments.workerConfirmed(workerUserId)`. The dedicated `cacheTags.assignments.workerPayPreview(workerUserId)` tag exists in `src/shared/config/cacheTags.ts` but is not attached to this cached query today.

That means a rate update can succeed while the worker's expected pay stays stale until some unrelated assignment mutation refreshes the cache.

**Primary recommendation:** split the phase into a failing-first regression plan and an implementation plan:

1. Add a new `submitWorkerRate` action regression that proves a successful admin rate write invalidates only the affected worker pay-preview tag, while invalid inputs do not trigger invalidation.
2. Add a cache-contract regression in `listConfirmedWorkerAssignments.test.ts` that proves the worker pay-preview query attaches `cacheTags.assignments.workerPayPreview(workerUserId)` in addition to its existing tags.
3. Update `submitWorkerRate.ts` to revalidate `cacheTags.assignments.workerPayPreview(userId)` only after `upsertWorkerRate(...)` succeeds, and update `listConfirmedWorkerAssignments.ts` to include the dedicated pay-preview tag in its cache contract.

This keeps the phase centered on the rate write wrapper plus the cached pay-preview read and avoids widening invalidation into unrelated admin or worker surfaces.

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
| Supabase SSR + admin client | existing query and mutation slices | Worker rate persistence plus cached assignment reads | The read/write surfaces already exist and should be refreshed, not replaced. |
| Vitest | existing test suite | Action and query regression coverage | Current repo uses colocated Vitest tests for actions and queries. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dedicated pay-preview tag on the cached query | Revalidate `cacheTags.assignments.workerConfirmed(workerUserId)` only | Works because the current query already uses that tag, but it keeps the dedicated pay-preview namespace meaningless and couples rate freshness to assignment-confirmation semantics. |
| Action-level tag invalidation | `revalidatePath(...)` or client-side `router.refresh()` | Broader, less explicit, and against repo conventions. |
| Existing worker preview read | Separate pay-preview-only read model | Unnecessary scope increase; the current worker query already computes and returns pay totals. |

## Architecture Patterns

### Recommended Project Structure
```text
src/
+-- mutations/
|   `-- worker-rate/
|       `-- actions/
|           +-- submitWorkerRate.ts
|           `-- submitWorkerRate.test.ts
+-- queries/
|   `-- assignment/
|       `-- dal/
|           `-- listConfirmedWorkerAssignments.ts
`-- shared/
    `-- config/cacheTags.ts
```

### Pattern 1: Admin write wrapper owns cache invalidation
**What:** `submitWorkerRate.ts` should remain the single place that converts an admin rate write into cache invalidation.

**When to use:** Always for this phase. Do not move freshness logic into `upsertWorkerRate.ts`, the DAL, or the UI form.

**Why:** The repo keeps write orchestration in `mutations/*/actions`, and Phase 07 already established that freshness fixes belong in the submit wrapper rather than the persistence helper.

### Pattern 2: Make the dedicated pay-preview tag real
**What:** Add `cacheTags.assignments.workerPayPreview(workerUserId)` to the cached `listConfirmedWorkerAssignments(...)` query.

**When to use:** In the cached branch of `listConfirmedWorkerAssignments.ts`.

**Why:** The query is the source of worker pay-preview totals, and the repo already has a dedicated tag name for this freshness boundary. Attaching the tag to the query makes future invalidation precise and self-explanatory.

### Pattern 3: Revalidate only the affected worker preview tag
**What:** Revalidate `cacheTags.assignments.workerPayPreview(parsed.userId)` after `upsertWorkerRate(...)` succeeds.

**When to use:** After a successful admin rate write.

**Why:** The phase is scoped to worker pay-preview freshness, not all assignments, all schedules, or all workers. The write path already knows the affected worker user ID.

### Pattern 4: Use a cache-contract regression for the query
**What:** Follow the existing dashboard read-model test pattern by asserting the exact tag array passed to `unstable_cache(...)`.

**When to use:** In `listConfirmedWorkerAssignments.test.ts`, in a non-`VITEST` cached branch similar to `listAdminOperationsDashboardSchedules.test.ts`.

**Why:** The query currently bypasses caching when `process.env.VITEST` is truthy, so freshness coverage needs one targeted caching-contract test to prove the dedicated tag is actually attached.

### Anti-Patterns to Avoid
- Revalidating `cacheTags.assignments.all` for a single worker rate change.
- Adding manual refresh UI or notification copy to the worker preview page.
- Moving invalidation into `upsertWorkerRate.ts`; that action is domain-write logic, not submit-wrapper orchestration.
- Leaving `workerPayPreview` unused while continuing to rely only on `workerConfirmed` for pay-refresh semantics.
- Expanding the phase into admin rate table caching or payroll export/reporting work without a concrete freshness requirement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Worker pay freshness trigger | Manual refresh button or client `router.refresh()` flow | `revalidateTag(...)` from the server action | The phase is about next-render freshness without new UI. |
| Worker pay-preview cache scope | Broad `assignments.all` invalidation | `cacheTags.assignments.workerPayPreview(workerUserId)` | The dedicated tag already exists and matches the actual freshness boundary. |
| Query separation | New pay-preview-only DAL slice | Existing `listConfirmedWorkerAssignments(...)` query | The current query already computes the pay breakdown and powers the worker preview page. |

**Key insight:** the codebase already has the correct worker-facing read model and a dedicated pay-preview tag name. Phase 08 is mostly about making the admin worker-rate submit wrapper participate in that freshness contract and making the cached query actually expose the dedicated tag.

## Common Pitfalls

### Pitfall 1: Revalidating the wrong tag
**What goes wrong:** The implementation revalidates `cacheTags.assignments.all` or `cacheTags.assignments.workerConfirmed(userId)` only.
**Why it happens:** `listConfirmedWorkerAssignments(...)` currently uses `workerConfirmed`, while `workerPayPreview` exists but is unused.
**How to avoid:** Attach `workerPayPreview` to the cached query, then revalidate that exact tag from `submitWorkerRate.ts`.
**Warning signs:** The action test mentions only `assignments` or `workerConfirmed`, or the query test still asserts two tags instead of three.

### Pitfall 2: Forgetting the query-side cache contract
**What goes wrong:** The submit wrapper revalidates `workerPayPreview`, but the cached query never subscribed to that tag, so freshness still fails.
**Why it happens:** The dedicated tag already exists in `cacheTags.ts`, which can make it look "done" even though no read uses it.
**How to avoid:** Add a dedicated cache-contract test for `listConfirmedWorkerAssignments(...)` and make the query attach the tag explicitly.
**Warning signs:** `submitWorkerRate.test.ts` passes, but no test checks the `unstable_cache` tag array in the worker pay-preview query.

### Pitfall 3: Expanding into unrelated admin caching
**What goes wrong:** The phase starts invalidating `listWorkerRates()` or admin pages because they are nearby code.
**Why it happens:** The write originates in the admin worker-rate page.
**How to avoid:** Keep the phase centered on the worker-facing freshness contract described in the roadmap and context.
**Warning signs:** The file list expands into admin worker-rate query refactors without a worker freshness reason.

### Pitfall 4: Relying on the worker page test for cache coverage
**What goes wrong:** The worker page test remains green, but it still mocks `listConfirmedWorkerAssignments(...)`, so cache freshness is never proved.
**Why it happens:** UI tests are the most obvious place to look for worker preview behavior.
**How to avoid:** Use the action test plus a cached-query contract test as the automated proof, and leave the page navigation cycle as manual UAT.
**Warning signs:** The plan mentions only `WorkerAssignmentPreviewPage.test.tsx` for freshness verification.

## Code Examples

### Current gap site
```ts
export async function submitWorkerRate(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const hourlyRateCents = Number(formData.get("hourlyRateCents"));

  await upsertWorkerRate({ userId, hourlyRateCents });
}
```

```ts
const cachedQuery = unstable_cache(
  async () => await runListConfirmedWorkerAssignments(workerUserId),
  ["queries:assignment:listConfirmedWorkerAssignments", workerUserId],
  {
    tags: [cacheTags.assignments.all, cacheTags.assignments.workerConfirmed(workerUserId)],
  },
);
```

### Recommended direction
```ts
export async function submitWorkerRate(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const hourlyRateCents = Number(formData.get("hourlyRateCents"));

  await upsertWorkerRate({ userId, hourlyRateCents });
  revalidateTag(cacheTags.assignments.workerPayPreview(userId), "max");
}
```

```ts
const cachedQuery = unstable_cache(
  async () => await runListConfirmedWorkerAssignments(workerUserId),
  ["queries:assignment:listConfirmedWorkerAssignments", workerUserId],
  {
    tags: [
      cacheTags.assignments.all,
      cacheTags.assignments.workerConfirmed(workerUserId),
      cacheTags.assignments.workerPayPreview(workerUserId),
    ],
  },
);
```

This keeps the worker assignment preview query intact, gives the dedicated pay-preview tag real effect, and lets the admin write wrapper refresh only the affected worker's pay preview.

## Open Questions

1. **Should `submitWorkerRate.ts` also revalidate `workerConfirmed(userId)`?**
   - What we know: the worker preview page currently consumes one query that returns both confirmed assignments and pay totals.
   - What's unclear: whether any other worker-facing cached read should refresh on a rate change.
   - Recommendation: default to revalidating `workerPayPreview(userId)` only after the query subscribes to that tag. Expand only if execution reveals another read depends on rate updates.

2. **Should the wrapper return the parsed rate payload?**
   - What we know: the current action returns `void`, unlike `submitScheduleApplication(...)`.
   - What's unclear: whether the extra return value is useful beyond testing.
   - Recommendation: keep the phase minimal unless the action regression is materially simpler with an explicit return value.

## Environment Availability

| Capability | Status | Notes |
|------------|--------|-------|
| Local unit tests | Available | Repo already runs Vitest for action, query, schema, and page tests. |
| Service-role cached query path | Available in tests | Existing dashboard tests prove the repo pattern for `unstable_cache` tag assertions when `SUPABASE_SERVICE_ROLE_KEY` is set and `VITEST` is cleared. |
| Browser-level live freshness proof | Manual | Requires an admin rate update followed by a worker revisit to the existing preview page. |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` |
| Full suite command | `pnpm test` |
| Estimated runtime | ~20 seconds |

### Phase Requirements -> Test Map

| Requirement | Proof Target | Test Type | Command | Notes |
|-------------|--------------|-----------|---------|-------|
| PAY-01 | `submitWorkerRate.ts` keeps the admin rate write path intact and admin-only | action | `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts` | Extend the wrapper-level test without changing the existing domain action responsibility. |
| PAY-02 | Worker pay-preview cache refreshes after a successful rate write | action + cached query contract | `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` | Action proves invalidation; query proves the dedicated tag is attached. |
| PAY-04 | Worker preview flow shows updated totals on the next render/navigation | manual UAT + existing page smoke coverage | `pnpm test -- src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | Page test remains a rendering smoke check; live freshness still needs manual verification. |

### Sampling Rate

- **After every task commit:** Run `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts`
- **After every plan wave:** Run `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

### Wave 0 Gaps

- [ ] `src/mutations/worker-rate/actions/submitWorkerRate.test.ts` - failing-first regression for success-path worker pay-preview invalidation and invalid-input non-invalidation
- [ ] `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - cached tag contract includes `cacheTags.assignments.workerPayPreview(workerUserId)`

### Manual-Only Checks

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Worker pay preview total reflects an updated hourly rate | PAY-02, PAY-04 | Automated tests can prove invalidation and cache-tag wiring, but not the full live navigation cycle between admin rate writes and worker preview rendering | As an admin, update a worker's hourly rate. Then revisit the worker confirmed-assignment/pay-preview page and confirm the expected total and hourly-rate breakdown reflect the new rate without manual cache clearing. |
| Unrelated workers stay unchanged after another worker's rate update | PAY-04 | Scope correctness is easiest to observe through a live multi-user check | Update worker A's rate, then open worker B's preview page and confirm worker B's expected pay is unchanged. |

## Sources

### Local Codebase Inspection
- `src/mutations/worker-rate/actions/submitWorkerRate.ts`
- `src/mutations/worker-rate/actions/upsertWorkerRate.ts`
- `src/mutations/worker-rate/actions/upsertWorkerRate.test.ts`
- `src/mutations/worker-rate/dal/workerRateDal.ts`
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts`
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts`
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx`
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx`
- `src/mutations/assignment/actions/confirmScheduleAssignments.ts`
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts`
- `src/shared/config/cacheTags.ts`

## Metadata

- Research mode: local fallback due repeated `gsd-phase-researcher` agent hangs on Windows session
- Scope: freshness-only gap closure for Phase 08
- Recommended plan count: 2
