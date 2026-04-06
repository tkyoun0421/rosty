---
phase: 10-entry-and-shared-shell-surface
verified: 2026-04-06T20:03:24.0003783+09:00
status: human_needed
score: 4/4 must-haves verified
human_verification:
  - test: "Google OAuth round-trip from /sign-in"
    expected: "Clicking the Google CTA on /sign-in begins provider auth and returns the user to the expected post-auth path."
    why_human: "Vitest proves the action call, but not the live provider redirect and callback loop."
  - test: "Invite acceptance flow keeps invite context through auth"
    expected: "Starting sign-in from /invite/<token> preserves invite context and finishes the invite-specific path instead of falling back to generic sign-in."
    why_human: "Automated coverage proves token forwarding only, not the real browser callback path."
  - test: "Admin and worker landing shells feel coherent after the route handoff"
    expected: "Signed-in users can move through /, /worker, and /admin without confusion, and admins reach the dashboard through /admin/operations as intended."
    why_human: "The tests prove links and guards, but not the perceived navigation clarity."
  - test: "Loading and recovery surfaces appear during slow or failed entry reads"
    expected: "Slow or failed entry-route loads show the new loading and recovery copy instead of blank or raw framework fallbacks."
    why_human: "Runtime suspense and error-boundary presentation are best confirmed in a live browser."
---

# Phase 10: Entry And Shared Shell Surface Verification Report

**Phase Goal:** Replace raw or placeholder-looking entry routes with a coherent sign-in, invite, onboarding, unauthorized, loading, recoverable-error, and role-aware home-shell experience.
**Verified:** 2026-04-06T20:03:24.0003783+09:00
**Status:** human_needed
**Re-verification:** Yes - phase-level verification included a full-suite regression after the `/admin` route handoff.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Sign-in, invite acceptance, onboarding, unauthorized, loading, and recoverable error routes now share one readable entry-surface language instead of raw scaffolds. | VERIFIED | `EntrySurfaceFrame.tsx` now anchors the single-column card layout, and `SignInPage.tsx`, `src/app/invite/[token]/page.tsx`, `ProfileOnboardingPage.tsx`, `src/app/unauthorized/page.tsx`, `src/app/loading.tsx`, and `src/app/error.tsx` all use the same product framing. |
| 2 | The Google sign-in contract stayed intact while the CTA became a production-grade primary action with pending state and invite-token support. | VERIFIED | `GoogleSignInButton.tsx` still calls `startGoogleSignIn(window.location.origin, inviteToken)`, and the sign-in plus invite regression tests passed after the surface rewrite. |
| 3 | Signed-in users now get role-aware landing shells from `/`, `/worker`, and `/admin`, and the existing admin operations dashboard remains reachable through `/admin/operations`. | VERIFIED | `RootRedirectPage.tsx`, `WorkerShellPage.tsx`, and `AdminShellPage.tsx` now render card-based next-step navigation, while `src/app/admin/page.tsx` delegates to the admin shell and `src/app/admin/operations/page.tsx` preserves the thin dashboard route. |
| 4 | Phase 10 closes its automated regression loop with targeted route tests plus a green full Vitest suite across the repository. | VERIFIED | The phase-specific route and flow tests passed, the legacy dashboard thin-route coverage was realigned to `/admin/operations`, and `pnpm exec vitest run` finished green with 57 files and 158 tests passed. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/flows/auth-shell/components/EntrySurfaceFrame.tsx` | Shared layout for auth-facing and entry-state routes | VERIFIED | Exists and is used by the sign-in, invite, onboarding, unauthorized, loading, and error surfaces added in Phase 10. |
| `src/flows/auth-shell/components/SignInPage.tsx` | Readable sign-in surface with clear Google CTA | VERIFIED | Exists, imports `EntrySurfaceFrame`, and renders `Continue with Google`. |
| `src/app/invite/[token]/page.tsx` | Invite-specific entry surface | VERIFIED | Exists, imports `EntrySurfaceFrame`, and passes `inviteToken={token}` to the shared Google CTA. |
| `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx` | Readable onboarding shell with existing redirects preserved | VERIFIED | Exists, imports `EntrySurfaceFrame`, and keeps the existing sign-in and root redirect branches. |
| `src/mutations/auth/components/ProfileOnboardingForm.tsx` | Polished onboarding form with clearer feedback | VERIFIED | Exists, still calls `submitProfileOnboarding(formData)`, and now uses `Alert`, `Button`, and image preview feedback. |
| `src/app/unauthorized/page.tsx` | Recovery surface for blocked access | VERIFIED | Exists and now routes users back toward `/` and `/sign-in`. |
| `src/app/loading.tsx` and route `loading.tsx` files | Explicit loading surfaces for entry routes | VERIFIED | Root, onboarding, worker, and admin loading files all exist and render product copy. |
| `src/app/error.tsx` | Recoverable root error boundary | VERIFIED | Exists as a client component and exposes retry via `reset()`. |
| `src/flows/auth-shell/components/RootRedirectPage.tsx` | Role-aware common home | VERIFIED | Exists, keeps the redirect rules, and now renders clearer role-scoped copy and navigation. |
| `src/flows/worker-shell/components/WorkerShellPage.tsx` | Worker landing shell | VERIFIED | Exists and renders the worker workspace cards for recruiting schedules and confirmed work. |
| `src/flows/admin-shell/components/AdminShellPage.tsx` | Admin landing shell | VERIFIED | Exists and renders schedules, operations, invites, and worker-rate destinations behind the existing admin guard. |
| `src/app/admin/operations/page.tsx` | Thin dashboard route after `/admin` handoff | VERIFIED | Exists and delegates directly to `AdminOperationsDashboardPage()`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/flows/auth-shell/components/SignInPage.tsx` | `src/mutations/auth/components/GoogleSignInButton.tsx` | Shared sign-in CTA | WIRED | The sign-in surface renders the shared button with the production label `Continue with Google`. |
| `src/app/invite/[token]/page.tsx` | `src/mutations/auth/components/GoogleSignInButton.tsx` | Invite-token handoff | WIRED | The invite route resolves `token` and passes it into the shared CTA as `inviteToken={token}`. |
| `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx` | `src/mutations/auth/components/ProfileOnboardingForm.tsx` | Onboarding form composition | WIRED | The page keeps server-side access logic and renders the rebuilt form inside the shared entry shell. |
| `src/app/admin/page.tsx` | `src/flows/admin-shell/components/AdminShellPage.tsx` | Live `/admin` route handoff | WIRED | `/admin` now renders the admin shell instead of bypassing it into the dashboard. |
| `src/app/admin/operations/page.tsx` | `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.tsx` | Thin child route | WIRED | The existing dashboard stays directly reachable without duplicating flow logic. |
| `src/flows/auth-shell/components/RootRedirectPage.tsx` | `/worker` and `/admin` routes | Role-aware next-step navigation | WIRED | Workers see recruiting/confirmed-work paths, and admins see the admin workspace handoff. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Sign-in and invite surface bundle | `pnpm exec vitest run src/flows/auth-shell/components/SignInPage.test.tsx src/app/invite/[token]/page.test.tsx src/mutations/auth/components/GoogleSignInButton.test.tsx` | 3 files passed | PASS |
| Role-aware shell bundle | `pnpm exec vitest run src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx` | 3 files passed | PASS |
| Onboarding and unauthorized bundle | `pnpm exec vitest run src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx src/app/unauthorized/page.test.tsx` | 2 files passed | PASS |
| Full regression gate | `pnpm exec vitest run` | 57 files passed, 158 tests passed | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `ENTRY-01` | `10-01-PLAN.md` | User can open a sign-in screen with a clear primary Google action and readable next-step copy. | SATISFIED | `SignInPage.tsx` and `GoogleSignInButton.tsx` now provide the shared entry shell, readable copy, and pending-aware CTA while preserving the auth contract. |
| `ENTRY-02` | `10-01-PLAN.md` | Invited user can understand they are accepting an invite and see the right CTA. | SATISFIED | `src/app/invite/[token]/page.tsx` now renders invite-specific copy and keeps token-aware sign-in through the shared CTA. |
| `ENTRY-03` | `10-03-PLAN.md` | Signed-in user can land on a role-aware home shell with obvious destinations. | SATISFIED | `RootRedirectPage.tsx`, `WorkerShellPage.tsx`, and `AdminShellPage.tsx` now expose explicit worker/admin next-step cards, and `/admin` now points at the real admin shell. |
| `ENTRY-04` | `10-02-PLAN.md`, `10-03-PLAN.md` | Primary entry routes show readable loading, unauthorized, empty, and failure states. | SATISFIED | Onboarding, unauthorized, loading, and error surfaces were rebuilt around the shared entry pattern, and the `/admin` thin-route coverage was updated to the new child-route ownership. |

### Anti-Patterns Found

None.

### Human Verification Required

### 1. Google OAuth round-trip from `/sign-in`

**Test:** Open `/sign-in`, click `Continue with Google`, and complete the provider round-trip.
**Expected:** The browser begins Google auth and returns the user to the expected onboarding or signed-in route.
**Why human:** Automated tests only prove the action wiring.

### 2. Invite acceptance flow keeps invite context through auth

**Test:** Open `/invite/<token>`, click `Accept invite with Google`, and complete the provider round-trip.
**Expected:** Invite context survives the auth loop and returns the user into the invite-specific onboarding path.
**Why human:** The browser callback behavior cannot be validated by the current route tests alone.

### 3. Admin and worker landing routes feel coherent after the route handoff

**Test:** Sign in as both a worker and an admin, move through `/`, `/worker`, `/admin`, and `/admin/operations`.
**Expected:** The next destination is obvious for each role, and the admin dashboard feels like a child workspace rather than the only landing page.
**Why human:** Navigation clarity is a product-quality check, not just a link-presence check.

### 4. Loading and recovery surfaces appear during slow or failed entry reads

**Test:** Introduce a slow or failed profile/session fetch on entry routes.
**Expected:** The user sees the new loading or recovery copy instead of a blank screen or raw framework fallback.
**Why human:** Real suspense and runtime error presentation need a live browser pass.

### Gaps Summary

No automated implementation gaps remain against the Phase 10 goal. The shared entry frame, rewritten sign-in/invite/onboarding/unauthorized surfaces, explicit loading and error states, and role-aware home shells all landed and the full Vitest suite passed after one follow-up test realignment for the `/admin` to `/admin/operations` dashboard handoff. Remaining work is manual browser verification for live OAuth, invite continuity, navigation feel, and runtime route-state presentation.

---

_Verified: 2026-04-06T20:03:24.0003783+09:00_
_Verifier: Codex (inline Phase 10 execution)_
