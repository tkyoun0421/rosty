# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 - MVP

**Shipped:** 2026-04-06
**Phases:** 9 | **Plans:** 25 | **Sessions:** n/a

### What Was Built
- Invite-backed access, admin/worker route separation, and worker-rate management for the single-venue staffing model.
- Admin schedule publishing, applicant review, draft/confirm assignment flows, worker confirmed-work views, attendance review, and operations dashboard coverage.
- Cache freshness repairs, admin invite hardening, and reconciled milestone evidence for a clean v1 archive state.

### What Worked
- Narrow phase scopes plus failing-first tests kept auth and freshness fixes precise.
- Query/action separation kept RLS, cache-tag, and UI responsibilities local enough to evolve safely.
- Phase summaries and verification artifacts made the late milestone audit repair tractable instead of forcing implementation archaeology.

### What Was Inefficient
- Manual-only verification stayed open too long, which left the final audit at `tech_debt` instead of `passed`.
- Tooling friction around encoding noise and edit fallbacks created avoidable overhead during planning-heavy phases.

### Patterns Established
- Thin app routes delegate to guarded flow components.
- Successful submit wrappers own cache invalidation; DAL writes stay focused on persistence and authorization.
- Verification debt can be archived as tech debt only after requirements and integration evidence are already satisfied.

### Key Lessons
1. Run live/manual UAT close to the phase that introduces the behavior; deferring it to closeout turns simple checks into milestone-wide debt.
2. Test freshness contracts at the mutation boundary rather than inferring them from route renders or path revalidation.
3. Repair top-level requirement traceability continuously so the milestone audit stays a verification exercise, not a documentation rescue.

### Cost Observations
- Model mix: Not captured in repository artifacts.
- Sessions: Not captured in repository artifacts.
- Notable: 25 plan summaries with explicit verification notes were enough to reconstruct and close a stalled milestone audit without reopening the implementation scope.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | n/a | 9 | Established the GSD-driven phase, summary, and verification loop for the project baseline. |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 151 passing tests at archive time | n/a | n/a |

### Top Lessons (Verified Across Milestones)

1. Keep manual verification close to implementation to prevent milestone-close audit debt.
2. Prefer dedicated cache-tag contracts over broad route invalidation when freshness matters.
3. Keep top-level planning docs aligned continuously so milestone archival stays lightweight.
