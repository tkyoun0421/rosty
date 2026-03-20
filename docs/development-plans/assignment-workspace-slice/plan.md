# Assignment Workspace Slice

## Summary

Add the first manager/admin `Assignment Workspace` workflow so operators can save slot-level draft assignments, clear them, and confirm the schedule as assigned from a dedicated screen.

## Scope

- Add a protected `Assignment Workspace` route for active manager/admin users.
- Reuse the tracked scheduling, availability, and assignment schema with safe seeded fallback until the real migrations are applied.
- Allow draft assignment save/replace/clear at the slot level for either an employee assignee or a guest name.
- Add a limited schedule-confirm RPC that turns the current schedule assignments into the confirmed assigned state.

Out of scope:

- Advanced balancing/recommendation logic
- Bulk auto-assignment
- Work-time editing
- Reassignment after cancellation approval

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the Assignment Workspace slice.
2. Add the schedule-confirm RPC migration needed for the first whole-schedule confirmation flow.
3. Implement workspace query/mutation paths, route, and manager/admin entry points with safe seeded fallback.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New workspace files under `src/features/assignments/`
- New migration under `supabase/migrations/`
- Updated auth-route access, schedule detail/overview navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active manager/admin users can open the workspace route.
- Slot-level drafts can be created, replaced, or cleared.
- Confirming the schedule updates the schedule/assignment state through the limited RPC.
- The repo verification baseline still passes.

Known gaps:

- Live workspace writes still depend on applying the shared scheduling migration and the new confirm RPC migration to the real Supabase project.

## Done Criteria

- The app contains the first manager/admin assignment workspace route with draft save/clear plus schedule confirm.
- Confirmation uses a limited RPC path.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
