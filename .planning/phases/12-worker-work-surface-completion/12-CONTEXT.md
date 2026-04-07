# Phase 12: Worker Work Surface Completion - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the existing worker recruiting and confirmed-work routes readable and self-explanatory so workers can understand open schedules, applied state, confirmed assignments, expected pay, and attendance availability without decoding placeholder UI or blank states. This phase reshapes the existing `/worker/schedules` and `/worker/assignments` surfaces only; it does not add new worker capabilities, new routes, notifications, or payroll workflows.

</domain>

<decisions>
## Implementation Decisions

### Recruiting surface
- **D-01:** `/worker/schedules` should move from a minimal list to a card-based worker surface that matches the product language already established in the worker shell and Phase 11 admin pages.
- **D-02:** Each recruiting schedule card should expose the schedule window, recruiting status, role-slot summary, and current application state at first glance. If the current recruiting DTO is too thin, Phase 12 should expand it rather than forcing the UI to stay vague.
- **D-03:** The apply action should stay inline on the recruiting card. Phase 12 should not add a separate worker detail route, modal, or multi-step apply flow.

### Confirmed work composition
- **D-04:** `/worker/assignments` remains the single confirmed-work hub that combines confirmed shifts, pay preview, and attendance context instead of splitting those concerns into separate worker routes.
- **D-05:** The page should lead with confirmed-work clarity first and pay transparency second. Totals and calculation-basis summaries should support the assignment list rather than turning the page into a standalone payroll screen.
- **D-06:** Each confirmed assignment card should keep the role, schedule window, hourly rate, regular and overtime breakdown, and expected pay together so workers can understand why the total looks the way it does.

### Attendance status guidance
- **D-07:** Attendance status stays embedded per confirmed assignment and continues to follow the Phase 04 single-shot, location-based check-in contract.
- **D-08:** The attendance card should explain open, not-open-yet, submitted, and late states in plain language while keeping the primary check-in CTA on the assignment card itself.
- **D-09:** When check-in is unavailable, the worker should see the specific blocker in context, such as waiting for the window, needing HTTPS, allowing location access, or contacting an admin.

### Empty and unavailable states
- **D-10:** Worker surfaces must distinguish between "no recruiting schedules right now", "already applied and waiting for confirmation", "no confirmed assignments yet", and "confirmed work exists but pay details are unavailable" instead of collapsing them into one generic empty state.
- **D-11:** If the current confirmed-work read model cannot distinguish missing pay-rate data from no confirmed work, Phase 12 should extend that read model so the UI can show an explicit unavailable state rather than hiding the shift entirely.
- **D-12:** Empty states should always point to the next useful worker action, primarily cross-linking between `/worker/schedules`, `/worker/assignments`, and `/worker`.

### Scope boundaries
- **D-13:** Phase 12 improves the presentation and clarity of existing worker work flows only. Do not add notifications, real-time sync, separate schedule-detail routes, or payroll settlement behavior as part of this phase.

### the agent's Discretion
- Exact card density, stat-tile arrangement, and badge variants.
- Whether recruiting cards show one-line or multi-line role-slot summaries.
- Whether summary metrics live above the list, in a sidebar, or both, as long as first-screen clarity improves.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope and active milestone
- `.planning/PROJECT.md` - Product scope, single-venue constraint, and the v1.1 goal to make worker surfaces usable.
- `.planning/REQUIREMENTS.md` - Source of truth for `WORKUI-01`, `WORKUI-02`, and `WORKUI-03`.
- `.planning/ROADMAP.md` - Phase 12 goal, dependency position, and success criteria.
- `.planning/STATE.md` - Current milestone status and the fact that Phase 12 is the next unfinished worker-facing phase.

### Prior phase decisions that constrain this work
- `.planning/phases/02-schedule-publishing/02-CONTEXT.md` - Recruiting-schedule and worker-application scope boundaries from the original worker recruiting flow.
- `.planning/phases/02-schedule-publishing/02-schedule-publishing-03-SUMMARY.md` - Current minimal `/worker/schedules` implementation and established server-first apply flow.
- `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md` - Original confirmed-assignment and pay-preview expectations, including transparency around calculation basis.
- `.planning/phases/04-attendance-check-in/04-CONTEXT.md` - Locked attendance timing, venue-location, and single-shot submission rules.
- `.planning/phases/08-pay-preview-freshness/08-CONTEXT.md` - Freshness constraints for worker pay-preview reads and the decision to keep pay preview inside the existing confirmed-work flow.

### Codebase contracts
- `.planning/codebase/CONVENTIONS.md` - Layering, import, UI placement, and repo text-file rules.
- `.planning/codebase/ARCHITECTURE.md` - Thin `app` routes, route-to-flow mapping, and server-first read architecture.
- `.planning/codebase/STRUCTURE.md` - Expected placement for `app`, `flows`, `mutations`, `queries`, and `shared`.

### Worker recruiting touchpoints
- `src/app/worker/schedules/page.tsx` - Thin worker recruiting route entry.
- `src/flows/worker-shell/components/WorkerShellPage.tsx` - Worker workspace language and current home-shell CTA pattern.
- `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` - Current worker recruiting page that still uses placeholder-level composition.
- `src/flows/worker-schedules/components/WorkerScheduleList.tsx` - Minimal recruiting list UI that Phase 12 is expected to replace or heavily evolve.
- `src/flows/worker-schedules/utils/formatSchedule.ts` - Current worker schedule formatting helper.
- `src/queries/schedule/dal/listRecruitingSchedules.ts` - Current recruiting DTO and likely expansion point for richer at-a-glance schedule cards.
- `src/queries/application/dal/listMyScheduleApplicationIds.ts` - Current worker applied-state lookup.
- `src/mutations/application/components/ApplyToScheduleButton.tsx` - Current inline apply control and applied-state touchpoint.
- `src/mutations/application/actions/submitScheduleApplication.ts` - Current worker apply wrapper and freshness behavior after apply.

### Worker confirmed-work and attendance touchpoints
- `src/app/worker/assignments/page.tsx` - Thin confirmed-work route entry.
- `src/app/worker/loading.tsx` - Worker loading surface language for shared route-state presentation.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` - Current combined confirmed-work, pay-preview, and attendance page.
- `src/flows/worker-assignment-preview/components/PayPreviewTotalCard.tsx` - Existing pay-total summary component.
- `src/flows/worker-assignment-preview/utils/workerAssignmentPreview.ts` - Current schedule-window, currency, and assignment-breakdown formatting helpers.
- `src/mutations/attendance/components/AttendanceCheckInCard.tsx` - Existing embedded check-in card and CTA placement.
- `src/mutations/attendance/utils/attendanceCheckIn.ts` - Existing worker-facing attendance state labels and helper copy.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` - Current confirmed-work and pay-preview read model, including the missing-rate edge case where no rows are returned.
- `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` - Current attendance-status read model layered on top of confirmed assignments.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/flows/worker-shell/components/WorkerShellPage.tsx`: already defines the current worker workspace badge, header, and two-destination navigation language.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx`: already has the strongest worker-facing layout in the codebase and can serve as the base shell for Phase 12 confirmed-work polish.
- `src/flows/worker-assignment-preview/components/PayPreviewTotalCard.tsx`: reusable summary card for expected-pay totals.
- `src/mutations/attendance/components/AttendanceCheckInCard.tsx`: reusable attendance-status and check-in interaction surface that should stay attached to each confirmed assignment.
- `src/shared/ui/card.tsx`, `src/shared/ui/badge.tsx`, `src/shared/ui/alert.tsx`, and `src/shared/ui/button.tsx`: the shared primitives already used across the Phase 10 and Phase 11 surfaces.

### Established Patterns
- Worker pages are server-first flows that read the current user, merge multiple query slices, and render route-level composition from `flows/*`.
- Inline worker apply UI lives in the mutation slice and should remain colocated with the application action rather than moving into `shared`.
- Cached worker reads already use dedicated tags for recruiting schedules, confirmed assignments, pay preview, and attendance; Phase 12 should preserve these data boundaries even if read DTOs expand.
- v1.1 product surfaces now use consistent badge plus heading plus supporting-copy headers, card-based sections, and explicit empty-state guidance instead of raw tables or placeholder text.

### Integration Points
- `/worker/schedules` likely needs a richer recruiting read model so schedule cards can show role-slot summary and clearer application state without inventing client-side guesses.
- `/worker/assignments` should stay the worker's confirmed-work destination, but its read model may need an explicit unavailable-state signal when confirmed assignments exist without visible pay-rate data.
- Cross-linking between `/worker`, `/worker/schedules`, and `/worker/assignments` should be used to keep next-step guidance obvious without adding new routes.

</code_context>

<specifics>
## Specific Ideas

- Reuse the badge, heading, supporting-copy, and card-section language already present in `WorkerShellPage`, `AdminSchedulesPage`, and `AdminOperationsDashboardPage` so worker surfaces feel like the same product family.
- Keep the worker recruiting surface action-oriented: workers should understand "apply", "already applied", or "wait for confirmation" from the first screenful.
- Keep pay preview transparent by showing both the total and the reason behind the total on the confirmed-work surface.
- If confirmed work exists but pay information is unavailable, explain that explicitly instead of falling back to the same copy used for having no confirmed work at all.

</specifics>

<deferred>
## Deferred Ideas

- Worker notifications when an application is accepted, a shift is confirmed, or a check-in window opens.
- Separate worker schedule-detail or work-history routes.
- Real-time refresh, polling, or push updates for pay preview or attendance state.
- Payroll settlement, payout, export, or worker earnings-history features.

</deferred>

---
*Phase: 12-worker-work-surface-completion*
*Context gathered: 2026-04-07*
