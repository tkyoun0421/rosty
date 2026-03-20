# Cancellation Queue Review Slice

## Summary

Add the first manager/admin `Cancellation Queue` workflow so managers and admins can review employee cancellation requests and approve or reject them through a limited RPC path.

## Scope

- Add a protected `Cancellation Queue` route for active manager and admin users.
- Show requested cancellation rows with the linked schedule, requester, positions, and reason.
- Add a limited manager/admin review RPC that approves or rejects requests and synchronizes the linked assignment status.
- Add live reads plus seeded fallback until the shared scheduling/cancellation migrations are applied remotely.

Out of scope:

- Notification generation for cancellation events
- Manager/admin assignment reallocation after approval
- Additional analytics or queue filtering beyond the first useful list
- Employee-facing cancellation history redesign

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the cancellation-queue review slice.
2. Add the manager/admin review RPC migration for approving or rejecting cancellation requests.
3. Implement the queue query, review mutation, route, and UI with live reads plus safe fallback.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New cancellation queue files under `src/features/assignments/`
- New review migration under `supabase/migrations/`
- Updated auth-route access rules, manager home navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active manager/admin users can open the queue route.
- Approve sets the linked assignment to `cancelled` and reject restores it to `confirmed`.
- The repo verification baseline still passes.

Known gaps:

- The live queue and review flow still depend on applying the scheduling and cancellation migrations to the real Supabase project.

## Done Criteria

- The app contains a manager/admin cancellation queue with approve/reject actions.
- Review writes use a limited RPC path.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
