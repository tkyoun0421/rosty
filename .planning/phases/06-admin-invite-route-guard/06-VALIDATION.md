---
phase: 06
slug: admin-invite-route-guard
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-02
---

# Phase 06 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest@4.1.2` with `@testing-library/react` and `jsdom` |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | AUTH-01, AUTH-03 | flow/page unit | `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` | W0 | pending |
| 06-01-02 | 01 | 1 | AUTH-01, AUTH-03 | route thin-entry regression | `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` | W0 | pending |

*Status: pending -> green -> red -> flaky*

---

## Wave 0 Requirements

- [ ] `src/flows/admin-invites/components/AdminInvitesPage.test.tsx` - covers admin success path and denied access path.
- [ ] Route import coverage in the same test file or a sibling page test - proves `src/app/admin/invites/page.tsx` stays thin and still renders through the guarded flow.
- [ ] Explicit assertion that invite creation CTA is absent for denied access.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Signed-in worker denial UX on `/admin/invites` | AUTH-03 | Unit tests can prove the route does not render privileged UI, but a real browser confirms the actual forbidden-copy experience and that no admin controls leak visually. | Sign in as a worker, open `/admin/invites`, and confirm the page does not expose invite-management controls and shows the expected denied-access experience. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
