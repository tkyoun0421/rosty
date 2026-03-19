# Admin Invite Sharing

## Summary

Add the missing admin affordances for distributing employee invite links after issuance. This task will let admins copy a generated invitation URL directly, open the native share sheet for the same link, and keep the invite message format consistent across the success card and active invitation history.

## Scope

- Add a shared helper that builds the employee login invite URL and the admin-facing share message from an invitation token.
- Add direct copy and native share actions for newly issued or reissued links.
- Add the same copy and share actions to active invitation cards in the admin invitation screen.
- Add focused tests for the invite-link helper output.

Out of scope:

- Bulk invite delivery or multi-recipient share flows
- SMS, Kakao, email, or server-delivered invitation channels
- Changes to invitation expiry, target role, or consumption rules
- Transactional backend enforcement beyond the existing invitation flow

## Implementation Steps

1. Lock the invite sharing scope in product docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add a helper for invite login URLs and share messages, then cover it with unit tests.
3. Update the admin invitation screen to expose copy and share actions for fresh and active invitation links, including local success feedback.
4. Add the minimal clipboard dependency if needed, run lint or typecheck or unit tests, and record the verification plus fallback edit notes.

## Data / Interface Impact

- Updated admin invitation UI under `src/features/invitations/ui/`
- New invitation sharing helper under `src/features/invitations/model/`
- Product docs updated for admin invitation distribution behavior
- New dependency for clipboard support if no existing project utility is available

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Admin can copy a full employee invite login URL from a fresh or active invitation link.
- Admin can open the platform share sheet with the same invite payload.
- Both action surfaces use the same URL and message format.
- Existing invitation issue, reissue, disable, and employee join validation behavior stays intact.

Known gaps:

- Shared URLs still depend on the runtime deep-link host returned by `expo-linking`, which is stable only for the current build configuration.
- Clipboard support requires adding `expo-clipboard`; if dependency installation is blocked, only share affordances can ship in this task.
- Real invite usability still depends on the `invitation_links` table and matching RLS policies in Supabase.

## Done Criteria

- The admin invitation screen exposes direct copy and share actions for usable employee invite links.
- Freshly issued or reissued invites show the same shareable URL format as active invitation cards.
- Helper tests lock the deep-link and share-message output.
- The task ends with updated docs, verification evidence, `WORKLOG.md`, commit, and push.