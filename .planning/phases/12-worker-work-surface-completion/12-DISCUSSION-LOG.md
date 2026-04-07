# Phase 12: Worker Work Surface Completion - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `12-CONTEXT.md`; this log preserves the alternatives considered during the non-interactive `gsd-next` run.

**Date:** 2026-04-07
**Phase:** 12-worker-work-surface-completion
**Mode:** auto defaults via `$gsd-next`
**Areas discussed:** Recruiting surface, confirmed work composition, attendance status guidance, empty and unavailable states

---

## Recruiting surface

| Option | Description | Selected |
|--------|-------------|----------|
| Card-based recruiting surface | Show schedule window, recruiting state, role-slot summary, and inline apply state in worker-facing cards. | Yes |
| Minimal list | Keep the Phase 02 lightweight list and only clean up copy. | |
| Detail-first flow | Add a separate schedule detail step before applying. | |

**User's choice:** Auto-selected the recommended default: card-based recruiting surface.
**Notes:** The current `WorkerSchedulesPage` and `WorkerScheduleList` are still minimal and placeholder-like, while the worker shell and Phase 11 admin pages already use card-based product surfaces. Staying inline also preserves the Phase 02 one-list recruiting flow.

---

## Confirmed work composition

| Option | Description | Selected |
|--------|-------------|----------|
| Single confirmed-work hub | Keep pay preview, confirmed assignments, and attendance context on `/worker/assignments`. | Yes |
| Split page sections harder | Separate pay preview and attendance into disconnected top-level sections within the page. | |
| Separate routes | Create dedicated worker pages for pay preview or attendance. | |

**User's choice:** Auto-selected the recommended default: single confirmed-work hub.
**Notes:** Phase 04 and Phase 08 already tie attendance and pay preview to the confirmed-assignment flow. The current `WorkerAssignmentPreviewPage` is the strongest base shell and only needs clarity improvements, not route expansion.

---

## Attendance status guidance

| Option | Description | Selected |
|--------|-------------|----------|
| Embedded per-assignment guidance | Keep the check-in card on each confirmed assignment and explain blocked states in place. | Yes |
| Top-level attendance panel | Move check-in guidance to one shared page-level panel. | |
| Separate attendance screen | Send workers to a dedicated check-in surface. | |

**User's choice:** Auto-selected the recommended default: embedded per-assignment guidance.
**Notes:** The current `AttendanceCheckInCard` already encodes the Phase 04 timing and submission rules. Embedding it beside the assignment details keeps the worker's action and context together.

---

## Empty and unavailable states

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit state-specific guidance | Differentiate no recruiting work, applied-waiting state, no confirmed work, and pay-unavailable cases with next-step copy. | Yes |
| Generic empty states | Use one broad empty message for most missing-data cases. | |
| Hide unavailable data | Suppress partial states and show only fully ready work. | |

**User's choice:** Auto-selected the recommended default: explicit state-specific guidance.
**Notes:** `WORKUI-03` requires readable empty and unavailable states. The current confirmed-work query returns an empty list when worker rate data is missing, so Phase 12 should expose a separate unavailable state instead of pretending no confirmed work exists.

---

## the agent's Discretion

- Exact visual density of the recruiting and confirmed-work cards.
- Whether summary metrics appear above the content, in a sidebar, or both.
- Exact badge variants and microcopy as long as the state model remains explicit.

## Deferred Ideas

- Worker notifications for confirmation and check-in readiness.
- Separate worker detail or history routes.
- Live refresh or realtime status delivery.
- Payroll settlement or payout workflows.
