# Roadmap: Single-Venue Internal Staffing Tool

## Milestones

- [x] **v1.0 MVP** - Phases 1-9 (shipped 2026-04-06)
- [ ] **v1.1 UI Surface Completion** - Phases 10-12 (active)

## Archived Milestones

<details>
<summary>[x] v1.0 MVP (Phases 1-9) - SHIPPED 2026-04-06</summary>

Archive files:

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md`

Closeout notes:

- All 9 phases and all 25 plans are complete.
- The archived audit accepted manual-only verification debt from phases 02, 03, 04, 05, and 08 after requirement and integration coverage passed.
- Raw phase execution history remains in `.planning/phases/` and can be archived later with `$gsd-cleanup`.

</details>

## Current Milestone: v1.1 UI Surface Completion

**Goal:** Turn the shipped v1 staffing flows into usable product surfaces so entry, scheduling, and worker-facing screens feel coherent and operable without expanding domain scope.

**Milestone focus:**
- Make sign-in, invite acceptance, onboarding, and the home shell feel like a real product entry flow.
- Make admin schedule creation, saved schedules, detail review, and dashboard drill-down readable and actionable.
- Make worker recruiting, confirmed work, pay preview, and attendance surfaces understandable at a glance.

## Phases

- [x] **Phase 10: Entry And Shared Shell Surface**
- [x] **Phase 11: Admin Scheduling Surface Completion** (completed 2026-04-06)
- [ ] **Phase 12: Worker Work Surface Completion**

## Phase Details

### Phase 10: Entry And Shared Shell Surface
**Goal**: Replace raw or placeholder-looking entry routes with a coherent sign-in, invite, onboarding, and role-aware home-shell experience.
**Depends on**: Phase 09 / archived v1.0 baseline
**Requirements**: ENTRY-01, ENTRY-02, ENTRY-03, ENTRY-04
**Success Criteria**:
1. Signed-out users land on a readable sign-in screen with a clear Google sign-in primary action.
2. Invite acceptance surfaces explain that the user is completing an invite-specific entry flow rather than a generic sign-in.
3. Signed-in users see a role-aware home shell that makes the next destinations obvious for admin and worker roles.
4. Primary entry routes show readable loading, unauthorized, empty, and failure states instead of placeholder copy or raw scaffolds.
**Plans**: 3
Plans:
- [x] 10-01-PLAN.md - shared entry-frame, sign-in surface, and invite-acceptance surface with token-aware Google CTA.
- [x] 10-02-PLAN.md - onboarding rebuild plus readable unauthorized, loading, and recoverable error surfaces.
- [x] 10-03-PLAN.md - root, worker, and admin landing shells, including the `/admin` route handoff to a real admin home.
**Status**: Complete (2026-04-06)

### Phase 11: Admin Scheduling Surface Completion
**Goal**: Turn admin schedule creation, saved schedules, schedule detail, and dashboard drill-down into a usable management surface.
**Depends on**: Phase 10
**Requirements**: ADMINUI-01, ADMINUI-02, ADMINUI-03, ADMINUI-04
**Success Criteria**:
1. Admins can create schedules from a readable form with clear date/time inputs and role-slot editing controls.
2. Admins can scan saved schedules and understand time, staffing summary, and status without relying on raw-table defaults.
3. Admin schedule detail makes draft-save, confirmation, attendance review, and status/result feedback understandable in place.
4. The operations dashboard reads as the visual entry point into schedule drill-down work rather than a developer-facing scaffold.
**Plans**: 3
Plans:
- [x] 11-01-PLAN.md - rebuild `/admin/schedules` so schedule creation and saved schedule review feel like one coherent management screen.
- [x] 11-02-PLAN.md - rebuild `/admin/schedules/[scheduleId]` so attendance, assignment review, draft-save, and final confirm read as one usable detail workflow.
- [x] 11-03-PLAN.md - align `/admin/operations` with the scheduling workspace so dashboard triage and drill-down handoff feel coherent.
**Status**: Complete (2026-04-06)

### Phase 12: Worker Work Surface Completion
**Goal**: Make worker recruiting, confirmed-work, pay-preview, and attendance surfaces readable and self-explanatory.
**Depends on**: Phase 11
**Requirements**: WORKUI-01, WORKUI-02, WORKUI-03
**Success Criteria**:
1. Workers can understand recruiting schedules and current apply/applied state from the recruiting surface at a glance.
2. Workers can understand confirmed work, expected pay, and attendance context from a readable confirmed-work screen.
3. Worker-facing surfaces explain empty states, unavailable states, and next steps without raw blanks or confusing placeholder text.
**Plans**: 2
**Status**: Planned

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. Entry And Shared Shell Surface | v1.1 | 3/3 | Complete | 2026-04-06 |
| 11. Admin Scheduling Surface Completion | v1.1 | 3/3 | Complete    | 2026-04-06 |
| 12. Worker Work Surface Completion | v1.1 | 0/2 | Not started | - |

---
*Last updated: 2026-04-06 after Phase 11 execution*
