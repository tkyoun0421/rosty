# Availability Overview Slice

## Summary

Add the first manager/admin `Availability Overview` workflow so managers and admins can review slot-by-slot candidate coverage from the tracked scheduling and availability schema.

## Scope

- Add a protected `Availability Overview` route for active manager/admin users.
- Reuse the tracked scheduling and availability schema with safe seeded fallback until the migrations are applied remotely.
- Show available candidates in the primary section and unavailable/not-responded candidates in a support section, filtered by slot gender requirements.
- Link the route from `Schedule Detail`.

Out of scope:

- Availability submission writes for managers/admins
- Assignment workspace integration
- Schedule creation/editing
- Advanced filtering/sorting beyond the first useful slot view

## Implementation Steps

1. Add the availability overview query and grouping model with live reads plus safe fallback.
2. Add the protected route and wire it from manager/admin `Schedule Detail`.
3. Add focused tests for candidate grouping and route access.
4. Re-run verification and update `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New overview files under `src/features/availability/`
- Updated auth-route access, schedule detail UI, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

## Done Criteria

- Manager/admin users can open `Availability Overview`.
- Slot-level available/support candidate grouping matches the product rules.
- `WORKLOG.md` reflects the shipped overview and the next follow-up.
