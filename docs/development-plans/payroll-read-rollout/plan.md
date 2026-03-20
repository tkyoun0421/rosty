# Payroll Read Rollout

## Summary

Add the missing tracked scheduling and payroll read schema needed for the `Team Payroll` route, then replace the seeded snapshot with a real Supabase query path that falls back safely until the new migration is applied.

## Scope

- Add the tracked enums and tables needed for the current payroll read path: `slot_presets`, `schedules`, `schedule_slots`, `assignments`, and `schedule_time_records`.
- Add the minimum RLS needed for the documented read matrix and future manager or admin writes.
- Replace the current seeded `Team Payroll` query with a live Supabase read path plus a safe local fallback when the schema is not yet rolled out.
- Keep the shipped `Team Payroll` UI read-only.

Out of scope:

- Scheduling creation or editing UI
- `availability_submissions` and `cancellation_requests`
- `My Payroll`
- Payroll export, settlement, tax, or payslip features

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the payroll read rollout.
2. Add the tracked migration for the current payroll read tables and read-side RLS.
3. Update the `Team Payroll` query to use real Supabase reads when available and fall back to the seeded snapshot when the schema is still missing.
4. Add focused regression coverage, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New Supabase migration under `supabase/migrations/`
- Updated payroll query logic under `src/features/payroll/api/`
- Possible small Team Payroll UI copy update to show live vs fallback source
- Updated docs and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- The repo contains the tracked schema needed for the Team Payroll read path.
- The app uses live Supabase payroll reads when the tables exist and falls back safely when they do not.
- The repo verification baseline still passes.

Known gaps:

- The migration still has to be applied to the real Supabase project before live payroll reads work there.
- `My Payroll` remains a follow-up.

## Done Criteria

- The tracked schema needed by Team Payroll exists in repo migrations.
- The Team Payroll query can consume real Supabase rows without breaking the current app when the migration has not yet been applied.
- `WORKLOG.md` reflects the completed rollout and the next follow-up.
