---
phase: 10-entry-and-shared-shell-surface
plan: 02
subsystem: ui
tags: [nextjs, ui, onboarding, error-boundary, loading-state]
requires:
  - phase: 10-entry-and-shared-shell-surface
    provides: EntrySurfaceFrame and polished auth entry surfaces from Plan 01
provides:
  - polished onboarding page and form with readable error feedback
  - unauthorized recovery surface with clear next actions
  - root, admin, worker, and onboarding loading surfaces plus a root error boundary
affects: [phase-10, onboarding, route-states, unauthorized]
tech-stack:
  added: []
  patterns:
    - shared entry surface reused for onboarding, unauthorized, loading, and error states
    - route-level loading and error surfaces for primary entry segments
key-files:
  created:
    - src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx
    - src/app/unauthorized/page.test.tsx
    - src/app/loading.tsx
    - src/app/error.tsx
    - src/app/onboarding/loading.tsx
    - src/app/worker/loading.tsx
    - src/app/admin/loading.tsx
  modified:
    - src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx
    - src/mutations/auth/components/ProfileOnboardingForm.tsx
    - src/app/unauthorized/page.tsx
key-decisions:
  - "Kept onboarding redirects server-side and limited this plan to surface, feedback, and route-state improvements."
  - "Used next/image with unoptimized preview rendering so profile preview works for both existing URLs and object URLs without adding remote image config."
patterns-established:
  - "Primary entry states should reuse EntrySurfaceFrame instead of custom loading or error markup."
  - "Onboarding errors should surface through Alert rather than raw paragraph text."
requirements-completed: [ENTRY-04]
duration: 8min
completed: 2026-04-06
---

# Phase 10 Plan 02: Entry And Shared Shell Surface Summary

**Onboarding, unauthorized, loading, and recoverable error routes now share the same entry-surface language, and the onboarding form exposes readable validation and preview feedback**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-06T19:55:00+09:00
- **Completed:** 2026-04-06T20:03:00+09:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Rebuilt the onboarding page and form around the shared entry surface, clearer field labels, alert-based errors, and profile image preview.
- Replaced the placeholder unauthorized route with a recovery surface that links users back to home and sign-in.
- Added explicit loading surfaces for the root, onboarding, worker, and admin routes plus a root-level recoverable error boundary.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild onboarding around the shared entry surface and readable feedback** - `13a8ea2` (feat)
2. **Task 2: Add readable unauthorized, loading, and recoverable error surfaces for entry routes** - `41ca8ee` (feat)

## Files Created/Modified

- `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx` - Onboarding shell using EntrySurfaceFrame with readable guidance.
- `src/mutations/auth/components/ProfileOnboardingForm.tsx` - Polished onboarding form with Alert-based errors, Button CTA, and image preview.
- `src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx` - Redirect and active-state coverage for onboarding.
- `src/app/unauthorized/page.tsx` - Recovery-focused unauthorized surface.
- `src/app/unauthorized/page.test.tsx` - Verifies the unauthorized heading and recovery links.
- `src/app/loading.tsx` - Default workspace loading surface.
- `src/app/error.tsx` - Root client error boundary with retry and recovery links.
- `src/app/onboarding/loading.tsx` - Onboarding loading surface.
- `src/app/worker/loading.tsx` - Worker workspace loading surface.
- `src/app/admin/loading.tsx` - Admin workspace loading surface.

## Decisions Made

- Preserved the existing `submitProfileOnboarding(formData)` and redirect flow so this plan stayed focused on surface quality instead of changing onboarding behavior.
- Used the same entry surface for route states so sign-in, onboarding, unauthorized, loading, and error screens read as one product family.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adjusted onboarding redirects to return in test environments**
- **Found during:** Task 1 verification
- **Issue:** The test mock for `redirect()` does not throw like the real Next.js runtime, so execution continued into `profile.isProfileComplete` and failed on `null`.
- **Fix:** Changed the onboarding route to `return redirect(...)` for both redirect branches.
- **Files modified:** `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx`
- **Verification:** `pnpm exec vitest run src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx src/app/unauthorized/page.test.tsx`
- **Committed in:** `13a8ea2`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The redirect behavior now matches both the real runtime intent and the Vitest mock environment. No scope creep.

## Issues Encountered

- `pnpm exec tsc --noEmit` is not a clean repository-wide gate right now. It fails on pre-existing unrelated issues including Vitest matcher typings, existing action typings, and unrelated DAL/model type errors outside Phase 10.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 03 can now align the common home, worker route, and admin route around the same surface language without revisiting onboarding or state handling.
- After Plan 03 lands, Phase 10 should move into phase-level verification and live browser review for Google OAuth and runtime loading/error behavior.

## Self-Check: PASSED

---
*Phase: 10-entry-and-shared-shell-surface*
*Completed: 2026-04-06*
