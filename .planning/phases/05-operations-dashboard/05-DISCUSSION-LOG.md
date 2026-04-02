# Phase 5: Operations Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md; this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 05-operations-dashboard
**Areas discussed:** dashboard unit, anomaly prioritization, time window, drill-down behavior

---

## Dashboard unit

| Option | Description | Selected |
|--------|-------------|----------|
| Schedule-card-centric | Summarize today's and upcoming schedules as cards with grouped operational signals. | Yes |
| Table-centric | Show one row per schedule in a dense operations table. | |
| Hybrid | Combine top summary cards with a lower detailed table. | |

**User's choice:** Schedule-card-centric
**Notes:** Keep the dashboard aligned with the existing schedule-centric admin flow.

---

## Anomaly prioritization

| Option | Description | Selected |
|--------|-------------|----------|
| Unfilled slots > missing check-ins > lateness | Prioritize staffing gaps first, then attendance gaps, then lateness. | Yes |
| Missing check-ins > lateness > unfilled slots | Prioritize same-day attendance operations over staffing shortages. | |
| Lateness > missing check-ins > unfilled slots | Make late arrivals the most visible alert. | |

**User's choice:** Unfilled slots > missing check-ins > lateness
**Notes:** Staffing risk should be surfaced before downstream attendance cleanup.

---

## Time window

| Option | Description | Selected |
|--------|-------------|----------|
| Today + nearby upcoming schedules | Focus on current operations while previewing the next incoming workload. | Yes |
| Today only | Treat the dashboard as a same-day operations board. | |
| Full week | Use a broader planning-style operations overview. | |

**User's choice:** Today + nearby upcoming schedules
**Notes:** The dashboard should support immediate action without becoming a weekly planning screen.

---

## Drill-down behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Summary then detail route | Keep the dashboard summary-first and send detailed work to existing schedule detail pages. | Yes |
| Mostly inline | Solve most operations directly inside expanded dashboard cards. | |
| Hybrid | Handle some anomalies inline and route the rest to detail views. | |

**User's choice:** Summary then detail route
**Notes:** Avoid duplicating full schedule-detail UI inside the dashboard.

---

## the agent's Discretion

- Exact card layout and section naming.
- Whether the dashboard separates `today` and `upcoming` into visually distinct blocks.

## Deferred Ideas

- Full inline editing from the dashboard.
- Worker-centric operational dashboard variants.