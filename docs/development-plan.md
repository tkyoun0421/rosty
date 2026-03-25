# Development Master Plan

## Purpose

This is the single active plan for the repo.

Do not create a new per-slice active plan folder or file while this document is in use. Historical slice plans under `docs/development-plans/` remain as archive only.

## Current Strategy

We will work from one ordered plan and close items one by one.

Priority rules:

1. Prefer work that removes blockers for live validation.
2. Separate `blocked by environment` from `ready in repo`.
3. Keep only one active plan document: this file.
4. Update this file as items are completed instead of spawning new active plan folders.

## Status Legend

- `in_progress`: currently locked
- `ready`: can be implemented in-repo now
- `blocked`: depends on external rollout, secrets, or device QA
- `optional`: useful polish but not required to continue the core roadmap

## Ordered Plan

### 1. Real Backend Rollout

Status: `blocked`

- Apply the tracked scheduling/payroll migrations to the real Supabase project.
- Apply the tracked settings, availability, assignment, cancellation, and notifications migrations to the real Supabase project.
- Bootstrap the first persistent admin against the intended auth user.
- Re-run the core app flows against live data instead of seeded fallbacks.

Exit:

- Live routes stop depending on seeded fallback snapshots.
- First admin exists in the real project.

### 2. Native Google OAuth QA

Status: `blocked`

- Validate the full Google OAuth round-trip on a dev build or standalone build.
- Confirm `rosty://auth/callback` works on a real device or emulator.

Exit:

- Native login works end-to-end outside Expo Go.

### 3. Push Registration and Delivery

Status: `blocked by dependency approval`

- Add `device_tokens` schema and app registration flow.
- Add real push permission/status handling.
- Attempt push delivery for existing notification events.
- Replace the current Settings placeholder with real push state.

Exit:

- Signed-in users can register tokens.
- Core inbox events also attempt push delivery.

### 4. Members Backend Hardening

Status: `ready`

- Replace current client-driven sequential bulk member actions with limited batch RPCs if needed.
- Decide whether bulk approve/status/role updates need atomicity or partial-failure reporting.

Exit:

- Bulk member actions are intentionally hardened instead of best-effort loops only.

### 5. Members Admin Polish

Status: `ready`

- Richer audit history beyond the current inline created/approved detail.
- Optional bulk role-change confirmation or post-action summary UX.

Exit:

- Admins can review enough member lifecycle history without leaving the product flow.

### 6. Search and Discovery Polish

Status: `ready`

- Improve search ranking and result depth.
- Consider saved search state or chip persistence.

Exit:

- Search feels stable for repeated operational use, not just first-pass lookup.

### 7. Scheduling and Staffing Polish

Status: `ready`

- Slot preset management flow for admins.
- Optional assignment/workspace ergonomics beyond the current first slice.
- Optional queue/search polish where operationally useful.

Exit:

- Operators can maintain the slot preset baseline and remove the highest-friction staffing steps inside the app.

### 8. Payroll Polish

Status: `ready`

- Download-style export beyond clipboard copy.
- Optional saved period presets or richer operator summary views.

Exit:

- Payroll handoff works in the preferred export format without manual paste workflows.

## Next Recommended Ready Item

`Members Backend Hardening`

Reason:

- It improves recently shipped bulk flows immediately.
- It does not require external rollout or device QA.
- It keeps the current repo direction coherent instead of opening another unrelated lane.

## Historical Note

- `docs/development-plans/` is now archive-only for completed slices.
- This file is the canonical active plan until explicitly replaced.
