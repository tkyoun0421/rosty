# Rosty Staffing Tool

## What This Is

Rosty is a single-venue internal staffing tool. Admins create schedules, recruit workers, review applications, confirm assignments, review attendance, and manage expected-pay visibility from one workflow. Workers see recruiting opportunities, apply, review confirmed work, check in, and verify expected pay from their own role-scoped routes.

The product focus is operational clarity: reduce the friction between schedule publishing, application intake, assignment confirmation, attendance review, and pay-preview trust without expanding into full payroll or multi-venue management.

## Core Value

Admins should be able to confirm venue staffing quickly, and workers should be able to review their confirmed work, role context, and expected pay clearly.

## Requirements

### Validated

- Phase 1 validated: Google sign-in flow, invite onboarding base, role-aware routing, and worker-rate baseline.
- Phase 2 validated: schedule creation, lightweight publishing-state management, and worker recruiting visibility.
- Phase 3 validated: applicant review, draft/confirm assignment flow, confirmed-work visibility, and overtime-aware pay preview.
- Phase 4 validated: worker attendance check-in and confirmed-only admin attendance review.
- Phase 5 validated: admin operations dashboard summary, anomaly triage, and schedule-detail drill-down.
- Phase 6 validated: admin invite route guard for `/admin/invites` (AUTH-01, AUTH-03).
- Phase 7 validated: worker application submits refresh admin schedule detail and dashboard freshness after real writes (APPL-02, APPL-03, DASH-02).
- Phase 8 validated: admin worker-rate writes refresh worker pay preview through dedicated pay-preview cache tags (PAY-01, PAY-02, PAY-04).
- Phase 9 completed: verification evidence, top-level traceability, and milestone audit were reconciled against the current codebase and current tests.

### Active

- [ ] Complete the remaining human verification recorded in `02-VERIFICATION.md`, `03-VERIFICATION.md`, `04-VERIFICATION.md`, `05-VERIFICATION.md`, and `08-HUMAN-UAT.md`.
- [ ] Review the refreshed `.planning/v1.0-MILESTONE-AUDIT.md` and decide whether to accept the remaining manual-only tech debt before milestone completion.

### Out of Scope

- Full payroll settlement and payout processing
- Multi-venue scheduling and operations management
- Separate admin and worker account systems

## Context

- Start from a single-venue internal operations workflow.
- Use one account system with role-based permissions instead of separate user silos.
- Use Google OAuth plus invite onboarding for access.
- Admin workflows cover schedule creation, recruiting management, applicant review, assignment confirmation, attendance review, and worker-rate updates.
- Worker workflows cover recruiting discovery, application submit, confirmed-work review, attendance submit, and expected-pay review.
- Expected pay is a transparency feature in v1, not a payroll engine.

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

## Evolution

Update this document at major phase boundaries so the active work, validated scope, and constraints stay aligned with the actual codebase and verification set.

- When a phase completes, move its proven outcomes into `Validated`.
- When verification or audit work changes the practical next step, update `Active`.
- When a requested feature exceeds v1 scope, move it to backlog or future planning rather than silently expanding this document.

*Last updated: 2026-04-05 after Phase 09 completion*
