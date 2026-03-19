# Admin Invite Sharing Summary

## Goal

Let admins distribute usable employee invitation links directly from the Invitation screen instead of copying raw tokens by hand.

## Shipped

- Added a shared invitation-link helper so the admin UI builds one canonical `login?invite=...` URL and share payload.
- Added direct copy and native share actions for freshly issued or reissued invitation links.
- Added the same copy and share actions to active invitation cards while keeping used, expired, and disabled history read-only.
- Updated the admin invitation screen to show the full login URL alongside the raw token for active and fresh links.
- Locked the admin invite sharing behavior in the PRD, screen IA, and invitation state-table notes.
- Added unit coverage for the invitation share helper output and mocked `expo-clipboard` for Jest.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- Shared links still depend on the deep-link host resolved by `expo-linking`, so the final URL shape varies by runtime build configuration.
- Real invite usability still depends on the `invitation_links` table and matching RLS policies existing in Supabase.
- Native share behavior is covered by static tests only; device-level QA is still needed to confirm platform-specific share sheet copy.

## Follow-up

- Verify the invite URL and share sheet behavior on a device or simulator build with the real deep-link scheme.
- Consider whether invite claim and profile creation should move into a server-enforced transactional path.