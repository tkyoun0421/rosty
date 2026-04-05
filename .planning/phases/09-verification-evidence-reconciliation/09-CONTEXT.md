# Phase 09: verification-evidence-reconciliation - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild missing and stale milestone evidence so the v1.0 audit reflects the current codebase honestly. This phase creates or refreshes verification artifacts and related planning evidence for schedule publishing and stale attendance verification. It does not add new schedule, application, attendance, or dashboard features unless fresh verification proves a real product gap still exists.

</domain>

<decisions>
## Implementation Decisions

### Evidence scope
- **D-01:** Create a real `02-VERIFICATION.md` for Phase 02 from current code, current tests, and explicitly documented human-only checks rather than relying on plan summaries alone.
- **D-02:** Refresh stale evidence that still reports already-fixed attendance behavior, centered on Phase 04 verification and any directly linked validation commands or milestone notes that would mislead a re-audit.
- **D-03:** Keep the reconciliation narrow to audit blockers and materially stale evidence. Do not rewrite every historical planning artifact just because it is old.

### Verification method
- **D-04:** Treat current code and fresh test runs as the source of truth. Older summaries, audit claims, and validation docs are inputs to inspect, not truths to copy forward.
- **D-05:** Prefer directly runnable targeted commands using `pnpm exec vitest run ...` plus one current full-suite command when recording automated evidence. If an older validation doc uses stale command forms, correct the artifact instead of preserving a broken command.
- **D-06:** If refreshed verification uncovers a real behavior mismatch, record it honestly as a gap and let planning decide whether the phase needs a small code fix. Do not resolve evidence drift with doc-only edits when the product is actually wrong.

### Manual verification handling
- **D-07:** Keep human-only checks explicit inside verification artifacts whenever automated evidence cannot honestly prove the behavior.
- **D-08:** Existing manual-UAT files from other phases stay separate by default. Link them when relevant, but do not absorb unrelated manual work into Phase 09 scope.

### Audit closure
- **D-09:** Finish the phase by rerunning milestone-level audit or equivalent reconciliation after the refreshed phase artifacts exist, then sync `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md` only where the new evidence changes their claims.
- **D-10:** Align the new work primarily to the roadmap requirements for this phase: `SCHD-01`, `SCHD-02`, `SCHD-03`, and `APPL-01`. Any `APPL-02` cross-phase traceability should be handled as supporting context only if the re-audit still needs it.

### the agent's Discretion
- Whether Phase 09 is best split into one plan or two plans once the exact file set is confirmed.
- Whether any code change is required after fresh verification, or whether the phase can close with evidence and doc reconciliation only.
- The exact wording and grouping of truths, artifact tables, and human-needed sections inside the regenerated verification reports.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and audit source
- `.planning/PROJECT.md` - Current product scope, active Phase 09 goal, and audit-related active work.
- `.planning/REQUIREMENTS.md` - Requirement source of truth, including the Phase 09 requirement IDs.
- `.planning/ROADMAP.md` - Phase 09 boundary, dependency position, and gap-closure framing.
- `.planning/STATE.md` - Current milestone status, pending manual UAT note, and audit blocker notes.
- `.planning/v1.0-MILESTONE-AUDIT.md` - Exact missing and stale evidence gaps that Phase 09 must reconcile.

### Phase 02 source artifacts
- `.planning/phases/02-schedule-publishing/02-CONTEXT.md` - Original scope decisions for schedule creation, schedule status management, and worker recruiting visibility.
- `.planning/phases/02-schedule-publishing/02-RESEARCH.md` - Original research-backed architecture and validation expectations for Phase 02.
- `.planning/phases/02-schedule-publishing/02-VALIDATION.md` - Original Phase 02 verification map and manual checks that must be reconciled to current commands.
- `.planning/phases/02-schedule-publishing/02-schedule-publishing-01-SUMMARY.md` - Implemented schedule creation scope.
- `.planning/phases/02-schedule-publishing/02-schedule-publishing-02-SUMMARY.md` - Implemented admin schedule status-management scope.
- `.planning/phases/02-schedule-publishing/02-schedule-publishing-03-SUMMARY.md` - Implemented worker recruiting list and apply flow scope.

### Stale evidence targets
- `.planning/phases/04-attendance-check-in/04-CONTEXT.md` - Original attendance-review boundary and confirmed-assignment expectations.
- `.planning/phases/04-attendance-check-in/04-VALIDATION.md` - Existing validation commands that still need current-tooling reconciliation.
- `.planning/phases/04-attendance-check-in/04-VERIFICATION.md` - Stale verification report that still claims an attendance gap now covered by the current code and tests.
- `.planning/phases/08-pay-preview-freshness/08-HUMAN-UAT.md` - Example of a manual-UAT artifact that should stay separate rather than being silently folded into Phase 09.

### Current code truth
- `src/mutations/schedule/dal/scheduleDal.test.ts` - Current evidence for atomic schedule creation and restricted status transitions.
- `src/mutations/schedule/actions/createSchedule.test.ts` - Current admin schedule-creation action evidence.
- `src/mutations/schedule/actions/updateScheduleStatus.test.ts` - Current admin status-transition action evidence.
- `src/queries/schedule/dal/listRecruitingSchedules.test.ts` - Current recruiting-list query evidence.
- `src/mutations/application/actions/createScheduleApplication.test.ts` - Current worker apply mutation evidence.
- `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` - Current worker recruiting list render and applied-state evidence.
- `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` - Current attendance DAL now filtering to confirmed assignments before summary mapping.
- `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` - Current regression proof that draft assignments are excluded from admin attendance review.

### Repo contracts
- `.planning/codebase/CONVENTIONS.md` - Current repo text-encoding, layering, and commit expectations.
- `.planning/codebase/ARCHITECTURE.md` - Current app/flows/mutations/queries/shared architecture contract.
- `.planning/codebase/TESTING.md` - Historical testing map that may itself be stale and must not override current checked-in tests.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The Phase 02 summaries already separate schedule creation, admin status management, and worker recruiting/apply work into stable implementation slices that can be re-verified independently.
- The current checked-in tests for schedule creation, status transitions, recruiting reads, worker apply, and worker recruiting page rendering provide a ready-made evidence bundle for `02-VERIFICATION.md`.
- The current attendance DAL and regression tests already prove the specific stale Phase 04 gap called out by the milestone audit is no longer true.
- Existing verification reports such as Phase 03, Phase 05, and Phase 08 provide the target structure for truths, artifact tables, wiring tables, requirements coverage, and human-needed sections.

### Established Patterns
- Phase verification in this repo is file-based: each phase should have a substantive `XX-VERIFICATION.md` that ties current code to requirement IDs and test commands.
- Fresh verification should cite current runnable commands, not historical intent. Older validation files are supporting artifacts and may need updates.
- Manual verification remains explicit when needed; this repo already uses `human_needed` status and separate human-UAT files instead of pretending full automation.
- Planning docs should be reconciled after phase-level truth is updated, not before.

### Integration Points
- Phase 09 will likely touch `.planning/phases/02-schedule-publishing/02-VERIFICATION.md`, `.planning/phases/04-attendance-check-in/04-VERIFICATION.md`, and at least one top-level audit-facing planning document.
- The implementation work depends on current source tests under `src/mutations/schedule`, `src/queries/schedule`, `src/mutations/application`, `src/flows/worker-schedules`, and `src/queries/attendance`.
- A milestone re-audit or equivalent reconciliation step should happen only after the refreshed phase artifacts are in place.

</code_context>

<specifics>
## Specific Ideas

- Prefer one honest verification artifact per affected phase over a single catch-all milestone note.
- When older audit text conflicts with current code, refresh the evidence from code and tests instead of editing around the contradiction.
- Keep pending live checks visible. Manual work that still matters should remain visible as pending, not be erased to make the audit look cleaner.

</specifics>

<deferred>
## Deferred Ideas

- Broad cleanup of unrelated historical mojibake across planning docs that are not part of the audit blocker path.
- Full refresh of stale codebase maps such as `.planning/codebase/TESTING.md` unless the Phase 09 work proves they directly block truthful verification.
- Consolidating all phase-level manual UAT into one central checklist.

</deferred>

---
*Phase: 09-verification-evidence-reconciliation*
*Context gathered: 2026-04-05*
