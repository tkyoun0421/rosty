# Deactivated Members Slice

## Summary

Surface deactivated accounts as a dedicated read-only section inside `Members`.

## Scope

- Add explicit `deactivated` grouping to the members model.
- Keep deactivated accounts visible in a dedicated section instead of mixing them into generic fallback states.
- Disable role changes for deactivated rows so they remain read-only in the admin UI.
- Refresh IA/worklog archive references.

Out of scope:

- Admin reactivation for deactivated users
- Bulk member actions
- Audit log UI
- Dedicated deactivated member detail route

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the deactivated-members slice.
2. Add deactivated grouping and read-only role/action guards with focused model coverage.
3. Update `Members` to show a dedicated deactivated section and summary card.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated member-management helpers under `src/features/members/model/`
- Updated `Members` UI under `src/features/members/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Deactivated accounts render in a dedicated section.
- Role chips stay read-only for deactivated accounts.
- Other member-state sections remain unchanged.

Known gaps:

- There is still no admin-side reactivation path for deactivated users.

## Done Criteria

- `Members` shows deactivated accounts as their own section.
- Deactivated rows are clearly read-only.
- The slice is committed and pushed after verification.
