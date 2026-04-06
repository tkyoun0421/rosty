---
phase: 10-entry-and-shared-shell-surface
plan: 01
subsystem: ui
tags: [nextjs, ui, auth, entry-surface, google-oauth]
requires:
  - phase: 01-access-foundation
    provides: invite-backed Google sign-in flow and token-aware auth callback wiring
provides:
  - shared entry-surface frame for single-column auth and onboarding states
  - readable sign-in page with a styled Google primary action
  - invite-acceptance page with invite-specific copy and CTA labeling
affects: [phase-10, onboarding, auth-shell, invite-routing]
tech-stack:
  added: []
  patterns:
    - shared card-based entry surfaces for auth-facing routes
    - pending-aware Google CTA using the shared Button primitive
key-files:
  created:
    - src/flows/auth-shell/components/EntrySurfaceFrame.tsx
    - src/flows/auth-shell/components/SignInPage.test.tsx
    - src/app/invite/[token]/page.test.tsx
  modified:
    - src/flows/auth-shell/components/SignInPage.tsx
    - src/mutations/auth/components/GoogleSignInButton.tsx
    - src/mutations/auth/components/GoogleSignInButton.test.tsx
    - src/app/invite/[token]/page.tsx
key-decisions:
  - "Built a reusable EntrySurfaceFrame so sign-in, invite, onboarding, unauthorized, and error states can share one layout language."
  - "Kept the existing startGoogleSignIn contract untouched and limited this plan to surface and CTA treatment."
patterns-established:
  - "Primary entry routes should use the EntrySurfaceFrame card pattern instead of raw <main> scaffolds."
  - "Google sign-in actions should use the shared Button primitive and expose pending state copy."
requirements-completed: [ENTRY-01, ENTRY-02]
duration: 4min
completed: 2026-04-06
---

# Phase 10 Plan 01: Entry And Shared Shell Surface Summary

**Shared entry-card framing now powers sign-in and invite acceptance, with a styled Google CTA and invite-specific copy that makes the auth flow readable**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-06T19:46:00+09:00
- **Completed:** 2026-04-06T19:50:00+09:00
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created `EntrySurfaceFrame` so auth-facing pages can share one centered card layout, badge, title, and description pattern.
- Rebuilt `/sign-in` around readable copy and a pending-aware Google CTA that still calls `startGoogleSignIn(window.location.origin, inviteToken)`.
- Rebuilt `/invite/[token]` so invited users see invite-specific heading and CTA copy instead of generic sign-in scaffolding.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the shared entry frame and rebuild the sign-in surface** - `3e26fa0` (feat)
2. **Task 2: Rebuild the invite acceptance route on the shared entry pattern** - `3a439fb` (feat)

## Files Created/Modified

- `src/flows/auth-shell/components/EntrySurfaceFrame.tsx` - Shared card-based entry shell for auth-facing routes.
- `src/flows/auth-shell/components/SignInPage.tsx` - Polished sign-in surface with clear CTA and guidance copy.
- `src/flows/auth-shell/components/SignInPage.test.tsx` - Render regression for sign-in heading, copy, and CTA.
- `src/mutations/auth/components/GoogleSignInButton.tsx` - Button-based Google CTA with pending state copy.
- `src/mutations/auth/components/GoogleSignInButton.test.tsx` - Confirms the token-aware auth action still fires on click.
- `src/app/invite/[token]/page.tsx` - Invite-specific entry surface with token-preserving CTA.
- `src/app/invite/[token]/page.test.tsx` - Render regression for invite heading, copy, and CTA label.

## Decisions Made

- Extracted a reusable auth-shell frame first so the rest of Phase 10 can reuse the same layout instead of creating separate one-off wrappers.
- Kept the Google auth callback contract and invite token forwarding unchanged to avoid widening scope into auth logic.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 can reuse `EntrySurfaceFrame` for onboarding, unauthorized, loading, and error states.
- Plan 03 can align `/`, `/worker`, and `/admin` around the same product-language baseline without revisiting auth CTA logic.

## Self-Check: PASSED

---
*Phase: 10-entry-and-shared-shell-surface*
*Completed: 2026-04-06*
