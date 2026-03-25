# Remaining Roadmap Summary

## Goal

Create one canonical document that states what is actually left after the currently shipped repo slices, without relying on stale follow-up notes from older archived summaries.

## Snapshot

As of 2026-03-25, the repo already contains:

- auth state routing and Google OAuth callback handling
- profile setup, approval waiting, suspended/deactivated lockout, settings update/deactivation
- invitations, pay policy, members management, and bulk members actions
- schedules, availability, assignment workspace, cancellation flows, work time, and payroll views
- notifications inbox plus multiple notification-generating events
- search, list filters, assignment filters, and payroll filters/export helpers

The largest remaining work is no longer “add basic screens.” It is:

- real Supabase rollout and live QA
- native Google OAuth QA on a dev build
- push registration and delivery
- selective hardening and polish of admin, staffing, search, and payroll flows

## Current Priority

Recommended order:

1. Real backend rollout and first admin bootstrap.
2. Native Google OAuth QA on a dev build.
3. Push registration and delivery if dependency approval is available.
4. Repo-only hardening slices such as server-side batch member actions.

## Notes

- Older archived slice summaries can still mention follow-up items that have already been completed later.
- This roadmap should be treated as the canonical remaining-work view until a newer roadmap snapshot replaces it.
