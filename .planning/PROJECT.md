# Rosty Staffing Tool

## What This Is

Rosty is a single-venue internal staffing tool. Admins can create schedules, recruit workers, review applicants, confirm assignments, review attendance, and keep expected-pay visibility accurate from one workflow. Workers can discover recruiting schedules, apply once, review confirmed work, check in, and verify expected pay from their own role-scoped routes.

The product focus is operational clarity: reduce the friction between schedule publishing, application intake, assignment confirmation, attendance review, and pay-preview trust without expanding into full payroll or multi-venue management.

## Core Value

Admins should be able to confirm venue staffing quickly, and workers should be able to review their confirmed work, role context, and expected pay clearly.

## Current State

- `v1.0 MVP` shipped on 2026-04-06.
- The archived milestone covers invite-backed access, schedule publishing, worker applications, assignment confirmation, attendance review, operations triage, admin route hardening, and freshness fixes for the highest-risk reads.
- The archived audit has no remaining requirement or integration blockers. The only open debt is manual-only verification recorded in the archived v1.0 audit and phase artifacts.

## Next Milestone Goals

- Decide whether to close the accepted manual v1 verification debt before expanding product scope.
- If scope expands, prioritize the next milestone around smarter assignment support and clearer worker/admin communication loops.

## Requirements

### Validated

- Single-venue staffing workflow from invite onboarding through schedule publishing, worker applications, assignment confirmation, attendance review, and expected-pay preview shipped in `v1.0`.
- DB-backed admin authorization now protects privileged invite and admin read flows, including `/admin/invites`.
- Cache-tag freshness contracts keep worker apply events and admin worker-rate writes synchronized with the affected admin and worker reads.
- Milestone evidence, requirement traceability, and the v1.0 audit were reconciled against the current codebase before archive.

### Active

- [ ] Decide whether the accepted manual verification debt from the archived v1.0 audit should be closed before broader rollout or carried forward intentionally.
- [ ] Define the next milestone scope after v1.0, likely centered on assignment intelligence and communication follow-ups if those still match operator needs.

### Out of Scope

- Full payroll settlement and payout processing - v1 exposes expected pay and current operational context, not a payroll engine.
- Multi-venue scheduling and operations management - the shipped product is still optimized for one venue.
- Separate admin and worker account systems - one account system plus role-backed access remains the simpler operating model.

## Context

- `v1.0 MVP` shipped across 9 phases, 25 plans, and 43 summary-counted tasks.
- Application code under `src/` is 9,664 lines of TypeScript/TSX at milestone archive time.
- The Phase 09 reconciliation finished with a green `pnpm exec vitest run` covering 53 files and 151 tests.
- The archived v1.0 audit records no unsatisfied requirements or integration gaps, only manual-only follow-up checks for phases 02, 03, 04, 05, and 08.

## Constraints

- Scope: optimize for one venue first.
- Auth: invite-backed access with Google sign-in.
- Roles: enforce admin versus worker access through role-backed rules.
- Payroll: expected-pay visibility only; no real payout workflow in v1.
- Attendance: location-based check-in is the minimal venue-presence proof, not a full workforce-tracking system.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start as a single-venue internal tool | Keeps the initial workflow narrow and operationally coherent | Accepted |
| Use one account system with role-based permissions | Simpler auth and lower coordination cost | Accepted |
| Use Google sign-in plus invite onboarding | Minimizes bespoke credential management | Accepted |
| Treat pay as preview/read transparency in v1 | Staffing operations matter before payroll settlement complexity | Accepted |
| Guard admin read flows inside server-side flow components | Keeps `src/app` routes thin while enforcing DB-backed authorization close to the privileged JSX | Accepted |
| Keep freshness invalidation in submit wrappers, not DAL writes | Preserves narrow persistence helpers and keeps cache policy tied to successful writes | Accepted |
| Revalidate dedicated cache tags instead of broad route invalidation | Makes freshness guarantees explicit and testable at the mutation boundary | Accepted |
| Treat `human_needed` verification as non-blocking tech debt only after requirements and integration evidence pass | Prevents manual-only checks from hiding real implementation regressions while still keeping the milestone audit honest | Accepted |

## Evolution

Update this document at major phase boundaries so the active work, validated scope, and constraints stay aligned with the actual codebase and verification set.

- When a phase completes, move its proven outcomes into `Validated`.
- When verification or audit work changes the practical next step, update `Active`.
- When a requested feature exceeds v1 scope, move it to backlog or future planning rather than silently expanding this document.

*Last updated: 2026-04-06 after v1.0 milestone archival*
