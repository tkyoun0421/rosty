# Phase 5: Operations Dashboard - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide an admin-only operations dashboard that summarizes today's and upcoming work, shows schedule-level application, assignment, and attendance status in one place, and surfaces operational anomalies such as unfilled slots, missing check-ins, and lateness. This phase adds operational visibility, not new scheduling, assignment, or attendance capabilities.

</domain>

<decisions>
## Implementation Decisions

### Dashboard unit
- **D-01:** The dashboard is schedule-card-centric, not worker-centric or table-first.
- **D-02:** Each dashboard card summarizes a single schedule and groups application, assignment, and attendance signals together.

### Anomaly prioritization
- **D-03:** Operational anomaly priority is `unfilled slots > missing check-ins > lateness`.
- **D-04:** The dashboard should visually elevate the highest-priority anomaly first so admins can triage staffing gaps before attendance cleanup.

### Time window
- **D-05:** The dashboard covers `today + nearby upcoming schedules`, not only today and not the full week.
- **D-06:** The default view should favor immediate operations while still previewing the next upcoming workload.

### Drill-down behavior
- **D-07:** The dashboard stays summary-first and does not duplicate full schedule-detail controls inline.
- **D-08:** Detailed review and correction continue through the existing admin schedule detail screen.

### the agent's Discretion
- Exact card grouping, badge language, and dashboard section ordering.
- Whether today's schedules and upcoming schedules appear as separate sections or as one ordered list with clear subheaders.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - product scope, single-venue constraint, and admin/worker operating model.
- `.planning/REQUIREMENTS.md` - source of truth for `DASH-01`, `DASH-02`, and `DASH-03`.
- `.planning/ROADMAP.md` - Phase 5 goal, dependency position, and success framing.
- `.planning/STATE.md` - current milestone state and previously locked implementation decisions.

### Prior phase context
- `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md` - assignment confirmation and worker pay preview decisions that shape dashboard status inputs.
- `.planning/phases/04-attendance-check-in/04-CONTEXT.md` - attendance timing, one-shot check-in, and schedule-centric admin attendance review decisions.
- `.planning/phases/04-attendance-check-in/04-UI-SPEC.md` - latest admin attendance UI contract and shadcn-based visual direction.

### Existing admin implementation
- `src/flows/admin-schedules/components/AdminSchedulesPage.tsx` - current admin schedule list pattern.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` - current schedule detail composition for assignment and attendance review.
- `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx` - current admin attendance summary slice.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/flows/admin-schedules/components/AdminSchedulesPage.tsx` already presents admin schedule summaries and can inform schedule-card content shape.
- `src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx` and `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx` already expose assignment and attendance summary language that can be adapted into dashboard cards.
- `src/shared/config/cacheTags.ts` and the query/mutation slice structure already support summary read models plus tag-based invalidation.

### Established Patterns
- Admin UX is schedule-centric and drill-downs go through existing schedule detail routes.
- `app -> flows -> mutations -> queries -> shared` remains strict; dashboard aggregation belongs in a new admin flow plus query slices, not in `app`.
- Presentation components stay logic-light; pure summarization helpers belong in slice `utils/` files.

### Integration Points
- New admin dashboard route should plug into the existing admin shell at `src/app/admin/page.tsx`.
- Dashboard cards should link into the existing `src/app/admin/schedules/[scheduleId]/page.tsx` detail route for full review.
- Dashboard read models will likely aggregate from schedules, schedule_role_slots, schedule_applications, schedule_assignments, and attendance_check_ins.

</code_context>

<specifics>
## Specific Ideas

- The dashboard should feel like an operational triage surface, not a second full management console.
- The highest-value outcome is letting an admin immediately spot which schedule needs intervention first.

</specifics>

<deferred>
## Deferred Ideas

- Worker-centric operational dashboards are out of scope for this phase.
- Inline full-detail editing inside dashboard cards is deferred; this phase uses summary plus drill-down.

</deferred>

---

*Phase: 05-operations-dashboard*
*Context gathered: 2026-04-01*