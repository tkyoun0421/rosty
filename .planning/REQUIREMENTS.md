# Requirements: Rosty Staffing Tool

**Defined:** 2026-04-06
**Core Value:** Admins should be able to confirm venue staffing quickly, and workers should be able to review their confirmed work, role context, and expected pay clearly.

## v1.1 Requirements

### Entry Experience

- [x] **ENTRY-01**: User can open a sign-in screen with a clear primary Google sign-in action and readable explanation of what happens next.
- [x] **ENTRY-02**: Invited user can understand that they are accepting an invite and see the appropriate sign-in call to action from the invite entry surface.
- [x] **ENTRY-03**: Signed-in user can land on a role-aware home shell that makes the next available destinations obvious.
- [x] **ENTRY-04**: User sees readable loading, unauthorized, empty, and failure states on the primary entry surfaces instead of placeholder copy.

### Admin Surface

- [ ] **ADMINUI-01**: Admin can create a schedule from a readable form with clear date, time, and role-slot editing controls.
- [ ] **ADMINUI-02**: Admin can scan saved schedules and understand status, time, and staffing summary without relying on raw-table defaults.
- [ ] **ADMINUI-03**: Admin can open schedule detail, manage draft/confirm assignment actions, and understand action results from inline feedback.
- [ ] **ADMINUI-04**: Admin can use the operations dashboard as a readable entry point into schedule drill-down work.

### Worker Surface

- [ ] **WORKUI-01**: Worker can understand recruiting schedule items and current apply/applied state at a glance.
- [ ] **WORKUI-02**: Worker can understand confirmed work, expected pay, and attendance state from the confirmed-work surface.
- [ ] **WORKUI-03**: Worker sees clear empty and unavailable states that explain what to do next instead of raw blanks.

## Future Requirements

### Assignment Intelligence

- **AINT-01**: System can recommend assignment candidates based on application history and role fit.

### Communication

- **COMM-01**: System can deliver assignment confirmations and changes through clearer notification flows.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New staffing domain capabilities beyond the shipped v1 workflow | v1.1 is focused on making the current product usable before expanding breadth. |
| Full payroll settlement and payout processing | The product still treats pay as preview transparency, not payroll execution. |
| Multi-venue scheduling and operations management | The product remains optimized for one venue. |
| A full redesign of every secondary/admin utility screen in this milestone | v1.1 should prioritize the highest-traffic entry, scheduling, and worker work surfaces first. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENTRY-01 | Phase 10 | Complete |
| ENTRY-02 | Phase 10 | Complete |
| ENTRY-03 | Phase 10 | Complete |
| ENTRY-04 | Phase 10 | Complete |
| ADMINUI-01 | Phase 11 | Pending |
| ADMINUI-02 | Phase 11 | Pending |
| ADMINUI-03 | Phase 11 | Pending |
| ADMINUI-04 | Phase 11 | Pending |
| WORKUI-01 | Phase 12 | Pending |
| WORKUI-02 | Phase 12 | Pending |
| WORKUI-03 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after Phase 10 execution*
