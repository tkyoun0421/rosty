# Phase 4: Attendance Check-In - Context

## Gathered
- Date: 2026-03-31
- Source: interactive discuss-phase decisions
- Phase slug: `attendance-check-in`

## Domain Boundary

Phase 4 covers worker check-in submission for confirmed assignments and admin review of attendance and lateness by schedule. It does not include broader operations dashboards or anomaly-management workflows beyond attendance confirmation.

## Locked Decisions

### D-01. Check-in timing uses the venue first-ceremony rule
The check-in eligibility threshold is not derived from a generic shift-relative window. It is derived from the venue's first ceremony start time.

### D-02. If the first ceremony starts at 10:00, check-in opens at 08:20
This is a fixed business rule.

### D-03. If the first ceremony starts at 11:00 or later, check-in opens 1 hour 50 minutes before the first ceremony
This is the default calculation path for later first-ceremony start times.

### D-03a. For Phase 4 v1, the first-ceremony timestamp is `schedules.starts_at`
This phase does not introduce a separate schedule clock field. The attendance window and lateness logic use `schedules.starts_at` as the canonical first-ceremony time source for v1.

### D-04. Location validation uses one venue coordinate plus one allowed radius
Attendance validation should compare the worker's submitted location against a single venue reference point and a single distance threshold.

### D-05. Check-in submission is single-shot
Workers may submit attendance once per confirmed assignment.

### D-06. Re-submission is not allowed
Once attendance is recorded, later retries or corrections are not part of Phase 4.

### D-07. Admin review is schedule-centric
Admin attendance review should follow the existing schedule/detail management flow, not a worker-centric dashboard.

### D-08. Admin attendance detail shows worker attendance and lateness status
Inside a schedule context, admins should be able to see which assigned workers checked in and whether each check-in is late.

## Agent Discretion

The agent may decide the following details while planning and implementation:
- precise distance-calculation utility and unit handling
- empty-state and failure-state copy
- exact admin attendance layout within the schedule detail experience
- whether worker check-in availability is surfaced as a badge, CTA state, helper copy, or a combination

## Canonical References

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/02-schedule-publishing/02-CONTEXT.md`
- `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md`

## Code Context

### Reusable assets
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx`
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx`
- `src/queries/access/dal/requireAdminUser.ts`

### Established patterns to preserve
- `app -> flows -> mutations -> queries -> shared`
- thin `app` routes and route-level composition in `flows`
- write orchestration in `mutations/*/actions`
- query reads in `queries/*/dal` and related hooks/utilities
- DB-backed guards and RLS as the security baseline
- tag-based invalidation preferred over `revalidatePath`

### Integration expectations
- worker attendance should attach to the confirmed-assignment experience, not a separate discovery surface
- admin attendance review should extend the existing admin schedule detail pattern

## Deferred From This Phase

- operations-wide dashboard summaries
- multi-location venue validation
- re-submission or admin override approval workflows
- downstream payroll finalization beyond attendance status signals
