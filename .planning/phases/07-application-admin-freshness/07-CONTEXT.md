# Phase 07: application-admin-freshness - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Revalidate admin schedule-detail and operations-dashboard reads after worker application writes so admin-facing applicant state stays fresh. This phase improves freshness for existing admin reads. It does not add a new applicant-management surface, new dashboard controls, or live notification features.

</domain>

<decisions>
## Implementation Decisions

### Admin freshness contract
- **D-01:** After a worker submits an application, the next admin render or navigation to the existing schedule detail flow must show the updated applicant state.
- **D-02:** After a worker submits an application, the next admin render or navigation to the operations dashboard must show updated applicant-derived counts and anomaly context.

### Invalidation strategy
- **D-03:** Freshness should be handled through the existing tag-based invalidation pattern triggered from the worker application submit action.
- **D-04:** This phase should refresh only the admin reads affected by worker applications, centered on admin schedule detail and admin operations dashboard. It should not expand into unrelated route or path-level invalidation.

### UX scope
- **D-05:** Admin review stays inside the existing schedule-centric detail flow and summary-first operations dashboard. This phase does not introduce a separate admin inbox or a new applicant review surface.
- **D-06:** This phase does not add polling, websocket/live push, manual refresh UI, or "new applicant" notification UI. Freshness is required on the next render/navigation, not as a real-time session sync feature.

### the agent's Discretion
- Whether the application submit action invalidates only the specific affected admin read tags or also broad parent tags that are already part of the same cache namespace.
- Exact test coverage split between mutation-action tests and admin read regression tests.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - Product scope, single-venue constraint, and admin/worker operating model.
- `.planning/REQUIREMENTS.md` - Source of truth for `APPL-02`, `APPL-03`, and `DASH-02`.
- `.planning/ROADMAP.md` - Phase 07 goal, dependency position, and freshness gap closure framing.
- `.planning/STATE.md` - Current milestone state and locked decisions carried into Phase 07.

### Prior phase decisions
- `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md` - Admin schedule-detail review model and applicant/assignment detail expectations.
- `.planning/phases/04-attendance-check-in/04-CONTEXT.md` - Admin review remains schedule-centric, not a separate operations surface.
- `.planning/phases/05-operations-dashboard/05-CONTEXT.md` - Dashboard remains summary-first and drills into schedule detail.

### Freshness touchpoints
- `src/mutations/application/actions/submitScheduleApplication.ts` - Current worker application write path and existing revalidation scope.
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts` - Cached admin schedule-detail applicant read model.
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts` - Cached admin dashboard read model that summarizes applicant counts.
- `src/shared/config/cacheTags.ts` - Source of truth for cache tag names used by admin and worker read models.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` - Existing admin schedule-detail entry that composes assignment and attendance reads.
- `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.tsx` - Existing admin dashboard entry for the freshness target.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/mutations/application/actions/submitScheduleApplication.ts`: Already centralizes worker application submission and current revalidation behavior.
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts`: Already exposes a cached admin applicant/detail read keyed by schedule ID.
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts`: Already exposes a cached admin dashboard summary read backed by schedule, application, assignment, and attendance data.
- `src/shared/config/cacheTags.ts`: Already defines stable cache namespaces for applications, assignments, schedules, attendance, and dashboard reads.

### Established Patterns
- Admin pages enforce access at the flow entry and rely on server-first read functions.
- Cached server reads use `unstable_cache` plus tag-based invalidation rather than path revalidation.
- The codebase keeps write orchestration in `mutations/*/actions` and read caching in `queries/*/dal`.
- Admin review is schedule-centric: the dashboard summarizes, and detail review happens on the existing schedule page.

### Integration Points
- Phase 07 should extend the worker application submit path so it invalidates the admin schedule-detail read model consumed by `AdminScheduleAssignmentPage`.
- Phase 07 should also invalidate the dashboard read model consumed by `AdminOperationsDashboardPage`.
- Worker-facing recruiting list and applied-state invalidation already exist and should remain intact while adding the missing admin freshness hooks.

</code_context>

<specifics>
## Specific Ideas

- "Fresh" means the next admin render/navigation reflects the new application without adding a new refresh control.
- Real-time session sync is intentionally out of scope for this phase.

</specifics>

<deferred>
## Deferred Ideas

- Live push or websocket-driven admin updates.
- Polling-based auto-refresh for open admin pages.
- Dedicated "new applicant" notification badges or inbox-style surfaces.

</deferred>

---

*Phase: 07-application-admin-freshness*
*Context gathered: 2026-04-03*
