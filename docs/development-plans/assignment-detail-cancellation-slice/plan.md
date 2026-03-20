# Assignment Detail And Cancellation Slice

## Summary

Add the first employee-facing `Assignment Detail` route with per-position cancellation requests. The route opens from grouped `My Assignments` cards but still operates on individual assignment rows under the hood.

## Scope

- Add a protected employee `Assignment Detail` route keyed by schedule context.
- Show grouped schedule details with the underlying position assignments and their current statuses.
- Add the tracked `cancellation_requests` schema plus a limited employee RPC for creating cancellation requests.
- Allow cancellation requests only for the employee's own `confirmed` assignments on or before the event date cutoff rule.

Out of scope:

- Manager or admin cancellation review UI
- Assignment edit or reassignment features
- Schedule creation or slot editing features
- Notification generation for cancellation events

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the assignment-detail and cancellation slice.
2. Add the tracked cancellation-request migration and limited employee request RPC.
3. Implement the assignment-detail query path and employee route with live reads plus safe fallback.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New assignments detail files under `src/features/assignments/`
- New Supabase migration under `supabase/migrations/`
- Updated auth-route access rules, My Assignments navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active employees can open `Assignment Detail` from grouped `My Assignments` cards.
- A cancellation request can be created only for valid `confirmed` assignments.
- The repo verification baseline still passes.

Known gaps:

- Manager or admin approval and rejection flows remain a later slice.
- Live cancellation requests still depend on applying the new migration to the real Supabase project.

## Done Criteria

- The app contains an employee assignment-detail route with per-position cancellation requests.
- Cancellation writes use a limited RPC path instead of broad direct updates.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
