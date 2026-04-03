# Phase 08: pay-preview-freshness - Discussion Log

> Audit trail only. Do not use as input to planning, research, or execution agents.
> Decisions are captured in `08-CONTEXT.md`.

**Date:** 2026-04-04T04:40:48.4012697+09:00
**Phase:** 08-pay-preview-freshness
**Mode:** execute-mode fallback
**Areas discussed:** Worker freshness contract, Invalidation strategy, Scope boundaries

---

This session ran in execute-mode fallback, so interactive menu questions were not available.
Reasonable defaults were selected from the codebase and roadmap context to keep `gsd-next`
moving without pausing for manual phase discussion.

## Worker freshness contract

| Option | Description | Selected |
|--------|-------------|----------|
| Next worker render shows updated pay preview | Refresh existing worker preview flow after admin rate writes | yes |
| Add manual refresh UX | Require worker interaction to see updated totals | |
| Realtime session sync | Push updates into already-open worker sessions | |

**Chosen default:** Refresh the existing worker pay-preview flow on the next render or navigation after a successful admin rate write.
**Why:** Matches the established freshness contract from Phase 07 and avoids expanding scope into live-sync UX.

## Invalidation strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Success-gated tag invalidation in submit wrapper | Keep orchestration in `submitWorkerRate` and invalidate only after real writes | yes |
| DAL-layer invalidation | Put cache logic inside persistence helpers | |
| Path-level refresh | Use route refresh or path revalidation instead of tags | |

**Chosen default:** Reuse the server-action wrapper plus tag invalidation pattern.
**Why:** It aligns with `submitScheduleApplication` and `confirmScheduleAssignments`, and keeps persistence logic separate from cache orchestration.

## Scope boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| Freshness-only fix | Keep current admin and worker UIs and close the cache gap only | yes |
| Add new pay-preview controls | Extend the worker page with refresh controls or new notices | |
| Expand into payroll workflows | Add payout, export, or reporting behavior | |

**Chosen default:** Keep the phase narrowly scoped to freshness for existing pages.
**Why:** The roadmap frames Phase 08 as a freshness gap closure, not a new product slice.

## Corrections Made

No user corrections were required in this fallback run.

## Deferred Ideas

- Live push updates for already-open worker sessions.
- Bulk worker-rate editing and richer admin pay-preview surfaces.
- Payroll settlement or reporting flows.
