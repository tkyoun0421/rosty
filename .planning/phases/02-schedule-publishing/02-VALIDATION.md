---
phase: 02
slug: schedule-publishing
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-31
---

# Phase 02 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- <path-to-test-file>` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- <changed-test-file>`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SCHD-01 | unit/action | `pnpm test -- src/mutations/schedule/actions/createSchedule.test.ts` | Wave 0 | pending |
| 02-01-02 | 01 | 1 | SCHD-02 | unit/dal | `pnpm test -- src/mutations/schedule/dal/scheduleDal.test.ts` | Wave 0 | pending |
| 02-01-03 | 01 | 1 | SCHD-03 | unit/action | `pnpm test -- src/mutations/schedule/actions/updateScheduleStatus.test.ts` | Wave 0 | pending |
| 02-02-01 | 02 | 2 | APPL-01 | component/query | `pnpm test -- src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | Wave 0 | pending |
| 02-03-01 | 03 | 3 | APPL-02 | unit/action | `pnpm test -- src/mutations/application/actions/createScheduleApplication.test.ts` | Wave 0 | pending |

---

## Wave 0 Requirements

- [ ] `src/mutations/schedule/schemas/schedule.test.ts` - validates form parsing and role-slot constraints
- [ ] `src/mutations/schedule/actions/createSchedule.test.ts` - covers SCHD-01
- [ ] `src/mutations/schedule/actions/updateScheduleStatus.test.ts` - covers SCHD-03
- [ ] `src/mutations/application/actions/createScheduleApplication.test.ts` - covers APPL-02
- [ ] `src/queries/schedule/dal/listRecruitingSchedules.test.ts` - covers recruiting read model mapping
- [ ] `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` - covers APPL-01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin creates a schedule and immediately sees recruiting status in UI | SCHD-01, SCHD-03 | Requires full app + Supabase integration | Create a schedule in `/admin/schedules`, verify persisted row and default `recruiting` status |
| Worker sees recruiting schedule and can apply exactly once | APPL-01, APPL-02 | Requires session-backed RLS path against real Supabase project | Sign in as worker, open recruiting list, apply once, verify duplicate apply is rejected |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-31