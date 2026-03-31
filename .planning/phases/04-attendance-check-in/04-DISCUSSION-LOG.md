# Phase 4 Discussion Log

## Session
- Date: 2026-03-31
- Mode: interactive discuss-phase

## Topics And Decisions

1. Check-in timing
- User rejected a generic shift-relative time window.
- User specified a venue first-meal-based rule.
- Locked result:
  - if first meal is `10:00`, check-in opens at `08:20`
  - if first meal is `11:00` or later, check-in opens `1 hour 50 minutes before first meal`

2. Location validation
- Chosen option: one venue coordinate plus one allowed radius.

3. Duplicate submissions
- Chosen option: single submission only.
- Re-submission is not allowed in Phase 4.

4. Admin attendance view
- Chosen option: schedule-based attendance review.
- Admins review worker attendance and lateness inside the schedule context.

## Follow-up
- Next workflow step: `$gsd-plan-phase 4`