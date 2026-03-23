# Schedule List Filter Slice

## Summary

Add the shared `top tab + chip` filtering structure to `Schedule List`.

## Scope

- Add view-layer schedule list filters for `all / collecting / assigned / closed`.
- Add collection chips for `all / open / locked`.
- Keep the existing fetch/query shape unchanged and filter only on the current snapshot.
- Refresh worklog archive references.

Out of scope:

- Date-range filters
- Search inside the schedule list
- Saved filter presets
- New schedule list route variants

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-list-filter slice.
2. Add schedule list filter helpers and focused regression coverage.
3. Update `Schedule List` with tabs, chips, and filtered empty states.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated schedule model helpers under `src/features/schedules/model/`
- Updated `Schedule List` UI under `src/features/schedules/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Schedule List` supports the new top tabs and collection chips.
- Filtered views show consistent counts and empty states.
- Existing schedule detail navigation remains unchanged.

Known gaps:

- Live behavior still depends on the tracked scheduling schema being applied to the real Supabase project.

## Done Criteria

- `Schedule List` uses the shared filter pattern.
- The slice is committed and pushed after verification.
