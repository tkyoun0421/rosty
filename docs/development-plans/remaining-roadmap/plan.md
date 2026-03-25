# Remaining Roadmap

## Summary

This document is the canonical remaining-work roadmap after the currently shipped auth, staffing, scheduling, payroll, notifications, search, and admin management slices.

Use this roadmap instead of older archived slice summaries when deciding what is still left. Older summaries can be historically accurate for their own slice while still being stale about later follow-up work.

## Status Legend

- `ready`: can be implemented in-repo now without external secrets, device setup, or dependency approval.
- `blocked`: depends on real Supabase rollout, real auth users, device QA, or another external prerequisite.
- `optional`: useful follow-up but not required to call the current V1 repo surface functionally broad.

## Remaining Lanes

### 1. Real Backend Rollout

Status: `blocked`

Scope:

- Apply the tracked scheduling/payroll migrations to the real Supabase project.
- Apply the tracked settings, availability, assignment, cancellation, and notifications migrations to the real Supabase project.
- Run the first persistent admin bootstrap against the intended auth user.
- Re-run real route QA against live Supabase data instead of seeded fallbacks.

Why it remains:

- Many routes are already present in the app shell but still fall back to local seeded snapshots until the real project is migrated.

Exit criteria:

- `pnpm supabase:migrations:apply` succeeds against the target project.
- First admin exists in the real project.
- The app can read/write the main staffing flows against live Supabase rows.

### 2. Native Google OAuth QA

Status: `blocked`

Scope:

- Validate the live Google OAuth round-trip on a dev build or standalone build.
- Confirm `rosty://auth/callback` returns to the app correctly on a real device or emulator.

Why it remains:

- Expo Go cannot validate the native callback path.

Exit criteria:

- Login works end-to-end on a dev build.
- The callback route processes the real redirect without browser dead-end errors.

### 3. Push Registration and Delivery

Status: `ready`, but requires explicit dependency approval before implementation.

Scope:

- Add the `device_tokens` schema lane.
- Add client permission/status handling and token registration.
- Add delivery attempts for the existing notification events.
- Reflect real push status inside `Settings`.

Why it remains:

- The app currently has in-app inbox coverage but no device token registration or push delivery path.

Exit criteria:

- A signed-in user can register a device token.
- Core notification events attempt push delivery as well as inbox row creation.
- `Settings` shows real push status instead of a placeholder message.

### 4. Members Backend Hardening

Status: `ready`

Scope:

- Replace current client-driven sequential bulk member actions with limited batch RPCs if needed.
- Decide whether role-change and status bulk actions need server-side atomicity or partial-failure reporting.

Why it remains:

- The current bulk actions are usable, but they are still sequential client-side loops.

Exit criteria:

- Bulk member actions either stay intentionally sequential with documented tradeoffs or move behind a hardened server-side batch path.

### 5. Members Admin Polish

Status: `ready`

Scope:

- Richer audit history than the current inline created/approved detail.
- Possibly add bulk role confirmations or action summaries.

Why it remains:

- The current `Members` surface is broad, but still uses inline metadata rather than a richer audit flow.

Exit criteria:

- Admins can review enough member lifecycle history without leaving the product flow.

### 6. Search and Discovery Polish

Status: `ready`

Scope:

- Improve search ranking and result depth.
- Consider saved search state or query-to-chip persistence.

Why it remains:

- `Global Search` is already broad, but still uses simple client-side section filtering on top of the loaded snapshot.

Exit criteria:

- Search feels stable for repeated operational use and not just first-pass discovery.

### 7. Scheduling and Staffing Polish

Status: `ready`

Scope:

- Slot preset management flow for admins.
- Optional assignment/workspace ergonomics beyond the current first slice.
- Optional queue/search polish where operationally useful.

Why it remains:

- Core scheduling/staffing flows exist, but some management affordances are still baseline only.

Exit criteria:

- Operators can maintain the slot preset baseline and any high-friction staffing workflows inside the app.

### 8. Payroll Polish

Status: `ready`

Scope:

- Download-style export flow beyond clipboard copy.
- Optional saved period presets or richer summary views.

Why it remains:

- Payroll now supports breakdowns, view filters, period chips, and copy export, but still stops short of downloadable operator reports.

Exit criteria:

- Operators can hand off payroll views in the preferred export form without manual paste workflows.

## Recommended Execution Order

1. Real backend rollout and first admin bootstrap.
2. Native Google OAuth QA on a dev build.
3. Push registration and delivery, if dependency approval is granted.
4. Members backend hardening for bulk actions.
5. Scheduling/staffing or payroll polish based on the next highest pain point.

## Next Recommended Repo-Only Slice

If the next task must stay inside the repo and avoid external blockers, the best next slice is:

- `Members` batch hardening for bulk actions.

Reason:

- It directly improves recently shipped bulk flows.
- It does not require device QA.
- It does not depend on live Supabase rollout for implementation.
