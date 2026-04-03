# Phase 08: pay-preview-freshness - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Refresh worker confirmed-assignment and pay-preview reads after admin worker-rate writes so workers see the latest hourly rate in their existing preview flow. This phase closes a freshness gap in the current admin rate-management and worker pay-preview surfaces. It does not add new payroll workflows, new admin dashboards, or realtime sync features.

</domain>

<decisions>
## Implementation Decisions

### Worker freshness contract
- **D-01:** After an admin saves a worker rate, the next worker render or navigation to the confirmed-assignment/pay-preview flow must show totals recalculated from the latest hourly rate.
- **D-02:** Freshness should stay scoped to the affected worker's pay-preview reads. Unrelated admin pages and other workers should not be revalidated by default.

### Invalidation strategy
- **D-03:** Reuse the existing server-action plus tag-based invalidation pattern instead of adding client refresh logic or path-level revalidation.
- **D-04:** Keep cache orchestration in the admin rate submit wrapper and gate it on real writes so failed or no-op submissions do not churn worker-facing caches.
- **D-05:** If the worker pay-preview read lacks a dedicated freshness tag, add one to the cached query rather than widening invalidation to broad assignment namespaces.

### Scope boundaries
- **D-06:** Preserve the current worker assignment-preview page structure and the admin worker-rate management surface. This phase fixes freshness only.
- **D-07:** Do not add polling, websocket push, manual refresh controls, or payroll settlement behavior. Freshness is required on the next render or navigation only.

### the agent's Discretion
- Exact split between `cacheTags.assignments.workerConfirmed(workerUserId)` and `cacheTags.assignments.workerPayPreview(workerUserId)` after auditing the worker pay-preview query.
- Exact regression coverage mix between action-level invalidation tests and worker pay-preview query or page tests.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - Product scope, single-venue constraint, and worker pay-visibility expectations.
- `.planning/REQUIREMENTS.md` - Source of truth for `PAY-01`, `PAY-02`, and `PAY-04`.
- `.planning/ROADMAP.md` - Phase 08 goal, dependency position, and freshness-gap framing.
- `.planning/STATE.md` - Current milestone state and recent freshness decisions.

### Prior phase decisions
- `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md` - Original worker pay-preview scope and assignment confirmation rules.
- `.planning/phases/07-application-admin-freshness/07-CONTEXT.md` - Latest freshness pattern and narrow invalidation constraints.

### Rate and preview touchpoints
- `src/mutations/worker-rate/actions/submitWorkerRate.ts` - Admin rate write wrapper that currently performs no invalidation.
- `src/mutations/worker-rate/actions/upsertWorkerRate.ts` - Domain write path for worker-rate persistence.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` - Cached worker assignment and pay-preview query that reads hourly rates.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` - Worker page that consumes confirmed assignments and pay-preview totals.
- `src/mutations/assignment/actions/confirmScheduleAssignments.ts` - Existing worker pay-preview invalidation pattern after assignment confirmation.
- `src/shared/config/cacheTags.ts` - Cache tag source of truth, including the worker pay-preview namespace.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/mutations/worker-rate/actions/submitWorkerRate.ts`: Existing admin-facing submit wrapper for rate updates; currently a minimal pass-through.
- `src/mutations/worker-rate/actions/upsertWorkerRate.ts`: Existing admin authorization, schema parsing, and persistence flow for worker rates.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts`: Existing cached worker read that combines confirmed assignments with `worker_rates` and computes pay preview totals.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx`: Existing worker UI that already renders assignment breakdowns and total pay preview.
- `src/shared/config/cacheTags.ts`: Existing tag namespace that already defines both `workerConfirmed` and `workerPayPreview`.

### Established Patterns
- Write orchestration stays in `mutations/*/actions`, while database persistence stays in DAL helpers.
- Cached server reads use `unstable_cache` plus tag-based invalidation rather than `revalidatePath`.
- Freshness fixes in this repo prefer narrow, schedule- or worker-scoped invalidation triggered only after successful writes.
- Assignment confirmation already invalidates both confirmed-assignment and worker pay-preview tags for affected workers.

### Integration Points
- Phase 08 should extend `submitWorkerRate` so a successful admin rate write invalidates the worker-facing pay-preview read.
- Phase 08 likely needs the cached worker pay-preview query to consume a dedicated pay-preview tag if it does not already.
- The worker assignment preview page should refresh through its existing query inputs, not through new client-side refresh controls.

</code_context>

<specifics>
## Specific Ideas

- Reuse the success-gated invalidation shape from Phase 07, but aim it at worker pay preview instead of admin freshness reads.
- Prefer making the dedicated `workerPayPreview` tag meaningful rather than broadening invalidation to `assignments.all`.

</specifics>

<deferred>
## Deferred Ideas

- Live cross-session worker pay-preview updates while the page remains open.
- Bulk rate editing workflows or admin-side pay-preview drilldowns.
- Payroll settlement, payouts, or export/reporting behavior.

</deferred>

---
*Phase: 08-pay-preview-freshness*
*Context gathered: 2026-04-04*
