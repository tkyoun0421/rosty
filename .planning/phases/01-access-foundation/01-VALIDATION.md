---
phase: 01
slug: access-foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-31
---

# Phase 01 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01, AUTH-02, AUTH-03, PAY-01 | unit/integration | `pnpm exec vitest run src/shared/config/auth-config.test.ts src/shared/model/access.test.ts` | Wave 0 target | pending |
| 01-01-02 | 01 | 1 | AUTH-01, AUTH-02, AUTH-03, PAY-01 | unit/integration | `pnpm exec vitest run src/shared/config/auth-config.test.ts src/shared/model/access.test.ts` | after 01-01-01 | pending |
| 01-02-01 | 02 | 2 | AUTH-02, AUTH-03 | integration | `pnpm exec vitest run src/queries/access/dal/get-current-user.test.ts src/flows/auth-shell/components/RootRedirectPage.test.tsx` | after 01-01 | pending |
| 01-02-02 | 02 | 2 | AUTH-02 | integration | `pnpm exec vitest run src/mutations/auth/actions/start-google-sign-in.test.ts src/app/auth/callback/route.test.ts` | after 01-01 | pending |
| 01-03-01 | 03 | 3 | AUTH-01, AUTH-03 | integration | `pnpm exec vitest run src/mutations/invite/actions/create-invite.test.ts src/mutations/invite/actions/accept-invite.test.ts src/queries/access/dal/get-current-user.test.ts` | after 01-02 | pending |
| 01-03-02 | 03 | 3 | AUTH-03 | integration | `pnpm exec vitest run src/flows/admin-shell/components/AdminShellPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx` | after 01-03-01 | pending |
| 01-04-01 | 04 | 4 | PAY-01 | integration | `pnpm exec vitest run src/mutations/worker-rate/schemas/worker-rate.test.ts src/mutations/worker-rate/actions/upsert-worker-rate.test.ts src/flows/admin-worker-rates/components/AdminWorkerRatesPage.test.tsx` | after 01-03 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/shared/config/auth-config.test.ts` - route and env contract coverage for AUTH-02 and AUTH-03
- [ ] `src/shared/model/access.test.ts` - role, invite, and worker-rate primitive contract coverage for AUTH-01 and PAY-01
- [ ] `src/queries/access/dal/get-current-user.test.ts` - current-user read and role DTO coverage for AUTH-03
- [ ] `src/mutations/invite/actions/accept-invite.test.ts` - token-based invite acceptance contract for AUTH-01
- [ ] `src/mutations/worker-rate/schemas/worker-rate.test.ts` - current-value worker-rate validation coverage for PAY-01
- [ ] Supabase verification path decision - use a linked CLI workflow or a hosted dev project before executing schema, auth hook, and RLS work

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth redirect and callback session creation | AUTH-02 | Real provider handshake cannot be fully trusted from local mocks alone | Start app, open sign-in, complete Google login in a configured Supabase dev project, confirm redirect lands on the common root `/` with a valid session, then verify internal role-based routing proceeds from there. |
| Invite acceptance with valid token after authenticated session | AUTH-01 | Requires real auth identity and invite token lifecycle | Create invite as admin, open invite link, sign in with a Google account, verify onboarding succeeds when the token is valid and the invite is active; repeat with an invalid, revoked, or expired token and confirm access is blocked. Do not require email-match enforcement in this phase. |
| Admin-only hourly rate management in UI | PAY-01 | Role boundary and UX confirmation need end-to-end check | Sign in as admin and worker separately, confirm only admin can open rate management surface and submit updates. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
