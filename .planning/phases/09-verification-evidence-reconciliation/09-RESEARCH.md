# Phase 09: Verification Evidence Reconciliation - Research

**Researched:** 2026-04-05
**Domain:** Phase verification recovery, stale-evidence reconciliation, and milestone audit closure
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Create a real `02-VERIFICATION.md` from current code and current tests rather than reusing plan summaries as pseudo-evidence.
- **D-02:** Refresh stale Phase 04 evidence and any linked validation commands that still misstate the current code.
- **D-03:** Keep the scope narrow to audit blockers and materially stale evidence instead of rewriting historical docs wholesale.
- **D-04:** Treat current code and fresh test runs as the source of truth.
- **D-05:** Use direct `pnpm exec vitest run ...` commands for evidence instead of stale `pnpm test -- ...` or unsupported flags.
- **D-06:** If fresh verification finds a real mismatch, record it honestly as a product gap instead of papering over it with documentation edits.
- **D-07:** Keep manual/live checks explicit in verification artifacts.
- **D-08:** Do not absorb unrelated manual-UAT files into Phase 09.
- **D-09:** Re-run milestone-level reconciliation after refreshed phase evidence exists, then sync top-level docs to the new truth.
- **D-10:** Phase 09 must primarily reconcile `SCHD-01`, `SCHD-02`, `SCHD-03`, and `APPL-01`.

### the agent's Discretion
- Exact plan split.
- Whether any small code fix is required after fresh verification.
- Exact wording of truths, artifact tables, and audit summaries.

### Deferred Ideas (OUT OF SCOPE)
- Broad mojibake cleanup outside the audit blocker path.
- Repo-wide refresh of stale codebase maps unless Phase 09 proves they directly block truthful verification.
- Consolidating all manual UAT into one master checklist.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHD-01 | Admin can create schedules with date and time information. | Rebuild Phase 02 verification from current schedule creation action, DAL, and summary evidence. |
| SCHD-02 | Admin can define needed role slots and headcounts for a schedule. | Rebuild Phase 02 verification from current schedule DAL and create-flow evidence. |
| SCHD-03 | Admin can manage recruiting and assigning schedule states. | Rebuild Phase 02 verification from current status-action and DAL evidence. |
| APPL-01 | Workers can see recruiting schedules. | Rebuild Phase 02 verification from current recruiting-list query and worker page evidence. |
</phase_requirements>

## Summary

Phase 09 is an evidence-recovery phase, not a feature-delivery phase. The work is successful only if a fresh reader can trace milestone claims back to present-day code, present-day tests, and explicit human-only checks without relying on stale summaries or outdated audit language.

The original milestone audit correctly identified two classes of evidence debt: Phase 02 had no `02-VERIFICATION.md`, and Phase 04 still claimed a bug that the current code now fixes. Fresh code inspection confirmed the old Phase 04 blocker is no longer true: `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` now filters schedule assignments to `status === "confirmed"` before summary mapping, and `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` has an explicit regression covering draft-assignment exclusion.

Research also found an additional audit-closure prerequisite that is not yet captured in the Phase 09 context: completed phases 06 and 07 have UAT and summaries but no `06-VERIFICATION.md` or `07-VERIFICATION.md`. A fresh milestone audit that reads every current phase would still treat those phases as unverified work. That means Phase 09 cannot stop at Phase 02 plus stale Phase 04 cleanup if the goal is an honest, current milestone audit.

**Primary recommendation:** split Phase 09 into two plans:
1. Rebuild phase-level evidence: create the missing Phase 02, 06, and 07 verification artifacts and refresh stale Phase 04 verification/validation docs from current code and tests.
2. Re-run milestone reconciliation from the refreshed artifacts and sync top-level planning docs to the resulting truth.

## Key Findings

### 1. Phase 02 is the main missing-artifact blocker
- `.planning/phases/02-schedule-publishing/` has context, research, validation, and all three execution summaries, but no `02-VERIFICATION.md`.
- Current test coverage already exists for the core Phase 02 claims:
  - `src/mutations/schedule/actions/createSchedule.test.ts`
  - `src/mutations/schedule/dal/scheduleDal.test.ts`
  - `src/mutations/schedule/actions/updateScheduleStatus.test.ts`
  - `src/queries/schedule/dal/listRecruitingSchedules.test.ts`
  - `src/mutations/application/actions/createScheduleApplication.test.ts`
  - `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx`
- The missing artifact is therefore a verification packaging problem, not a missing-implementation problem.

### 2. Phase 04 evidence is stale, but the code truth is healthier than the audit says
- The old `04-VERIFICATION.md` still claims admin attendance review includes draft assignments.
- Current code contradicts that claim by filtering to confirmed assignments before deriving worker rows.
- Current tests also include a direct regression proving draft rows are excluded.
- `04-VALIDATION.md` still contains obsolete quick-run guidance and must be aligned to current `vitest` command forms.

### 3. Phase 06 and Phase 07 are currently missing verification artifacts
- `.planning/phases/06-admin-invite-route-guard/06-UAT.md` is complete.
- `.planning/phases/07-application-admin-freshness/07-UAT.md` is complete.
- Phase 06 and 07 execution summaries plus colocated tests are sufficient to create first-class verification reports now.
- If Phase 09 ignores these missing artifacts, any fresh milestone audit across phases 01-08 will remain blocked on "missing verification" even if Phase 02 and Phase 04 are repaired.

### 4. `human_needed` is non-blocking evidence debt, but missing verification is blocking
- Existing milestone evidence already treats phases with satisfied requirements plus pending manual checks as usable evidence, not as critical blockers.
- The actual blockers are:
  - missing verification artifacts
  - `gaps_found` artifacts with unresolved failed truths
  - stale audit claims that no longer match the code
- Phase 09 should preserve `human_needed` where honest, not try to convert every artifact to `passed`.

### 5. Direct Vitest commands are the reliable verification contract in this repo
- Recent phase work demonstrated that `pnpm test -- <file>` can route through the package script in ways that are broader or less predictable than intended.
- The current reliable verification pattern is `pnpm exec vitest run ...`.
- Refreshed validation docs should use direct Vitest commands consistently.

## Recommended Plan Split

### Plan 01: Rebuild phase-level evidence
- Create `02-VERIFICATION.md`.
- Refresh `02-VALIDATION.md` command forms.
- Refresh `04-VERIFICATION.md` to remove the resolved blocker and keep the real human-only checks.
- Refresh `04-VALIDATION.md` command forms.
- Create `06-VERIFICATION.md` from current tests, summaries, and complete UAT.
- Create `07-VERIFICATION.md` from current tests, summaries, and complete UAT.

### Plan 02: Re-run milestone reconciliation and sync top-level docs
- Refresh `.planning/v1.0-MILESTONE-AUDIT.md` from the current verification set.
- Remove obsolete blocker claims about missing Phase 02 verification and the resolved Phase 04 bug.
- Update `.planning/ROADMAP.md` and `.planning/STATE.md` to reflect planned Phase 09 execution.
- Update `.planning/PROJECT.md` and `.planning/REQUIREMENTS.md` only where the refreshed audit materially changes their claims.

## Validation Architecture

Recommended automated verification for this phase:
- `pnpm exec vitest run src/mutations/schedule/dal/scheduleDal.test.ts src/mutations/schedule/actions/createSchedule.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts`
- `pnpm exec vitest run src/queries/schedule/dal/listRecruitingSchedules.test.ts src/mutations/application/actions/createScheduleApplication.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx`
- `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts`
- `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx`
- `pnpm exec vitest run src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts`
- `pnpm exec vitest run` as the final regression gate after plan wave 2

Recommended non-test verification:
- Use `rg` or `Select-String` checks to prove stale blocker strings are removed from refreshed docs.
- Use explicit file-existence checks for the newly created verification artifacts.

Recommended manual verification to preserve, not erase:
- Phase 02 live admin-create and worker-apply checks.
- Any already-open manual checks from Phase 08 remain pending in their owning phase.

## Risks And Pitfalls

- **False audit pass risk:** refreshing markdown without checking for other missing verification artifacts would produce a misleading milestone audit.
- **Over-scoping risk:** trying to rewrite every stale historical document would turn a focused evidence phase into a general doc-cleanup phase.
- **Traceability drift risk:** reintroducing `APPL-02` as a Phase 02-owned requirement would fight current roadmap traceability. If `APPL-02` must appear, it should be explained as later freshness evidence owned by Phase 07.
- **Command drift risk:** preserving `pnpm test -- ...` or obsolete Vitest flags in refreshed validation docs would recreate the same evidence debt later.

---
*Phase 09 research refreshed on 2026-04-05*
