# Phase 07: application-admin-freshness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-04-03T05:34:06.8693609+09:00
**Phase:** 07-application-admin-freshness
**Areas discussed:** Admin freshness model

---

## Admin freshness model

| Option | Description | Selected |
|--------|-------------|----------|
| Automatic freshness on next admin render/navigation | Keep the existing schedule-detail and dashboard UX, and use cache invalidation so updated applicant state appears on the next load. | Yes |
| Polling or live push updates | Add polling, websocket, or other real-time sync so open admin pages update immediately without a new navigation. | No |
| New admin freshness UI | Add manual refresh affordances, inbox behavior, or new-applicant notification UI to make freshness explicit. | No |

**User's choice:** Proceed with automatic freshness on next admin render/navigation.
**Notes:** The user accepted the recommended default after reviewing the narrowed phase boundary. The phase stays focused on invalidation and read freshness rather than new applicant-management capabilities.

---

## the agent's Discretion

- Exact cache tag set added to the worker application submit path.
- Exact regression coverage shape for the freshness fix.

## Deferred Ideas

- Polling-based admin auto-refresh.
- Websocket/live push freshness.
- New-applicant notification UI or inbox surfaces.
