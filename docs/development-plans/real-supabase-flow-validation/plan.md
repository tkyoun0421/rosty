# Real Supabase Flow Validation

## Summary

Validate the first live app flows against the migrated Supabase project, capture reproducible pass or fail evidence for each targeted flow, and fix any repo-tracked defects that block the locked behavior without expanding product scope.

## Scope

- Reconfirm the repo verification baseline with lint, typecheck, and unit tests before live validation.
- Validate the real Supabase-backed login prerequisites and the reachable auth flow entry points from the current app build.
- Validate employee invitation onboarding, admin member actions, admin invitation actions, and admin pay-policy actions against the real Supabase project using the most reproducible path available in the current Windows environment.
- Record explicit pass, fail, or not-run outcomes plus residual risk for each targeted flow.
- Apply minimal code, doc, or test fixes only when validation reveals a defect in already locked behavior.

Out of scope:

- New product behavior, schema cleanup, or feature expansion beyond the already locked flows
- iOS validation on Windows
- Creating a broad new E2E suite unless a narrow regression test is needed for a defect fixed in this task
- Inventing a first-admin bootstrap path that is not already documented or supported

## Implementation Steps

1. Create this plan and update `WORKLOG.md` so the active task points to the live validation work.
2. Re-run the repo baseline commands and confirm the local runtime or rollout configuration is non-placeholder for the real Supabase project.
3. Execute the reachable live validation paths for login, employee invite onboarding, admin member actions, admin invitation actions, and admin pay-policy actions; capture pass, fail, or not-run evidence plus blockers.
4. If validation exposes a defect in locked behavior, implement the smallest viable fix, add or update focused coverage when appropriate, and rerun the relevant verification.
5. Update the final validation record, archive the task artifacts, update `WORKLOG.md`, and end the task with commit and push.

## Data / Interface Impact

- New active plan document under `docs/development-plans/`
- Updated `WORKLOG.md` session pointer before and after the validation task
- Possible targeted app or test updates under `src/` and `tests/` if live validation exposes defects
- Validation evidence to archive with the final task summary

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Run the most direct real-environment validation path available for each targeted flow in the current Windows setup

Expected pass criteria:

- Local config is sufficient to target the real Supabase project without placeholder values.
- Each targeted flow is classified as pass, fail, or not run with a reproducible note instead of an implicit assumption.
- Any defect fixed during this task has matching verification evidence and does not regress the baseline test suite.

Known gaps:

- Real Google OAuth still requires an interactive browser or device path that may limit full automation from this shell.
- Android device or emulator validation depends on local native tooling and artifacts that may not already exist.
- The first admin account still depends on the documented out-of-band seed or manual promotion path.
- iOS validation remains unavailable on Windows even if the rest of the task succeeds.

## Done Criteria

- `WORKLOG.md` points to this task while it is active and later points to the archived result or next task.
- The live validation result for login, employee invite onboarding, admin members, admin invitations, and admin pay-policy is explicit.
- Any scoped defect found during validation is fixed, reverified, and documented.
- The task ends with archived plan artifacts, updated `WORKLOG.md`, commit, and push.
