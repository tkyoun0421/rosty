# Notifications Filter and Search Slice

## Summary

Add category chips and local search to `Notifications` on top of the existing unread/all tabs.

## Scope

- Add view-layer notification category filters for `all / access / schedule / assignment / cancellation`.
- Add local search over notification title and body.
- Keep the existing notifications query and mark-as-read mutation unchanged.
- Refresh worklog archive references.

Out of scope:

- Server-side notification search
- Saved inbox filters
- Notification settings
- Push delivery

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the notifications filter/search slice.
2. Extend the notifications model helpers and regression coverage with category and query filtering.
3. Update `Notifications` with type chips, a local search field, and adjusted empty states.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated notification model helpers under `src/features/notifications/model/`
- Updated `Notifications` UI under `src/features/notifications/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Notifications` can narrow the current inbox by category chip and local query.
- Existing unread/all tabs keep working with the new controls.
- Mark-as-read navigation remains unchanged.

Known gaps:

- This is still local client-side filtering on the loaded inbox snapshot.

## Done Criteria

- `Notifications` supports type chips and local search.
- The slice is committed and pushed after verification.
