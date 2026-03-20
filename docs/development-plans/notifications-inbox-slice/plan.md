# Notifications Inbox Slice

## Summary

Add the first active-user `Notifications` workflow so users can read in-app notifications from a dedicated route, and wire the current cancellation request and review RPCs to create the first real notification rows.

## Scope

- Add the tracked `notifications` table and RLS policies.
- Add a protected `Notifications` route for all active users.
- Patch the employee cancellation request RPC and the manager/admin cancellation review RPC so they enqueue in-app notification rows.
- Add a live notifications query with safe seeded fallback plus a basic mark-as-read mutation.

Out of scope:

- Push delivery
- Notification generation for product areas beyond the current cancellation flow
- Bulk read actions or advanced filtering beyond unread/all
- Notification deep-link analytics

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the notifications inbox slice.
2. Add the notifications schema and patch the current cancellation RPCs to create notification rows.
3. Implement the notifications query, mark-as-read mutation, route, and home entry points with safe fallback.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- New notifications files under `src/features/notifications/`
- New route under `src/app/`
- Updated auth-route access rules, home navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active users can open the notifications route.
- Cancellation request and review RPCs create notification rows in the tracked schema.
- The repo verification baseline still passes.

Known gaps:

- Push delivery remains a later follow-up.
- Live notifications still depend on applying the new migrations to the real Supabase project.

## Done Criteria

- The app contains an active-user notifications inbox route.
- The current cancellation flows enqueue in-app notification rows.
- `WORKLOG.md` reflects the completed inbox slice and the next follow-up.
