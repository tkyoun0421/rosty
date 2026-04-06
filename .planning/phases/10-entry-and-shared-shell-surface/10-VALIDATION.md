---
phase: 10-entry-and-shared-shell-surface
slug: entry-and-shared-shell-surface
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-06
---

# Phase 10 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest run src/mutations/auth/components/GoogleSignInButton.test.tsx src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-specific targeted test command from the table below.
- **After every plan wave:** Run `pnpm exec vitest run src/mutations/auth/components/GoogleSignInButton.test.tsx src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | ENTRY-01 | component | `pnpm exec vitest run src/flows/auth-shell/components/SignInPage.test.tsx src/mutations/auth/components/GoogleSignInButton.test.tsx` | partial | pending |
| 10-01-02 | 01 | 1 | ENTRY-02 | route + component | `pnpm exec vitest run src/app/invite/[token]/page.test.tsx src/mutations/auth/components/GoogleSignInButton.test.tsx` | W0 | pending |
| 10-02-01 | 02 | 2 | ENTRY-04 | flow | `pnpm exec vitest run src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx` | W0 | pending |
| 10-02-02 | 02 | 2 | ENTRY-04 | route | `pnpm exec vitest run src/app/unauthorized/page.test.tsx` | W0 | pending |
| 10-03-01 | 03 | 1 | ENTRY-03 | flow | `pnpm exec vitest run src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx` | partial | pending |
| 10-03-02 | 03 | 1 | ENTRY-03, ENTRY-04 | route + flow | `pnpm exec vitest run src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx` | partial | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/flows/auth-shell/components/SignInPage.test.tsx` - verifies sign-in heading, supporting copy, and primary Google CTA label
- [ ] `src/app/invite/[token]/page.test.tsx` - verifies invite-specific copy and token-aware CTA label
- [ ] `src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx` - verifies onboarding redirect rules and readable shell copy
- [ ] `src/app/unauthorized/page.test.tsx` - verifies unauthorized recovery messaging and navigation

*Existing root, worker, admin-shell, and Google-sign-in tests provide the initial regression baseline once assertions are expanded to match the new surfaces.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth round-trip from `/sign-in` starts and returns correctly | ENTRY-01 | Unit tests only prove the action call, not the live provider redirect | Open `/sign-in`, click the Google CTA, and confirm the provider handoff begins and the app returns to the expected post-auth flow. |
| Invite acceptance flow keeps invite context through auth | ENTRY-02 | The live callback and invite-token return path still need a browser check | Open `/invite/<token>`, start Google sign-in, and confirm the invite flow completes instead of dropping into generic sign-in. |
| Admin and worker landing routes feel coherent after the route handoff | ENTRY-03 | Final shell clarity depends on real navigation and perceived structure | Sign in as worker and admin accounts, navigate through `/`, `/worker`, and `/admin`, and confirm the next destinations are obvious. |
| Loading and failure surfaces appear during slow or failed profile fetches | ENTRY-04 | Runtime suspense and error boundaries are easier to verify live | Introduce a slow or failed profile/session fetch and confirm the route shows readable loading or recovery copy rather than a blank or raw framework fallback. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
