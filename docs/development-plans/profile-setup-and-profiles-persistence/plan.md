# Profile Setup And Profiles Persistence

## Summary

Replace the real-session placeholder on `Profile Setup` with the first actual profile form. This task adds validated profile input, writes to the Supabase `profiles` table, transitions the user from `profile_incomplete` to `pending_approval`, and refreshes the auth shell from the stored profile row.

## Scope

- Add a validated profile setup form for real Supabase sessions.
- Upsert the signed-in user's `profiles` row with `full_name`, `phone_number`, `gender`, safe default `role`, and `pending_approval` status.
- Refresh the auth shell after a successful submission so routing leaves `Profile Setup` automatically.
- Keep the existing demo transitions for local fallback mode.
- Remove the unused GitHub PAT example from `.env.example` because it is not referenced by the app.
- Add focused tests for profile validation and submission-state logic.

Out of scope:

- Invitation link validation
- Self-selected role requests for manager or admin
- Admin approval UI
- Suspended or deactivated management flows
- Schedule, assignment, payroll, or notifications implementation

## Implementation Steps

1. Lock the profile input contract and validation rules from the current PRD and schema.
2. Add the Supabase profile upsert API and a TanStack Query mutation for submission plus auth refresh.
3. Replace the real-session placeholder on `Profile Setup` with the actual form while preserving demo-only controls.
4. Add tests, run lint/typecheck/unit tests, then update `WORKLOG.md` before commit plus push.

## Data / Interface Impact

- New profile setup validation and submission code under `src/features/auth/`
- Updated `Profile Setup` screen in the auth shell
- Updated `.env.example` cleanup for unused app settings

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Real signed-in users can submit the required profile fields without TypeScript or lint errors.
- Successful submission writes the profile and routes the user to `Approval Waiting`.
- Validation blocks empty or malformed required fields.

Known gaps:

- Real success still depends on the `profiles` table and matching RLS policies existing in Supabase.
- Invitation-link rules and admin approval remain separate follow-up features.

## Done Criteria

- Real `profile_incomplete` users see an actual form instead of a placeholder notice.
- Successful submission persists the profile and updates auth routing to `pending_approval`.
- Demo profile transitions still work in local fallback mode.
- The task ends with updated tests, `WORKLOG.md`, commit, and push.
