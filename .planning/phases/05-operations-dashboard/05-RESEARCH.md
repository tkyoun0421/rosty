# Phase 05: Operations Dashboard - Research

**Researched:** 2026-04-01
**Domain:** Next.js admin dashboard read model over scheduling, assignment, and attendance data
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Claude's Discretion
- Exact card grouping, badge language, and dashboard section ordering.
- Whether today's schedules and upcoming schedules appear as separate sections or as one ordered list with clear subheaders.

### Deferred Ideas (OUT OF SCOPE)
- Worker-centric operational dashboards are out of scope for this phase.
- Inline full-detail editing inside dashboard cards is deferred; this phase uses summary plus drill-down.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Admins can view today and nearby upcoming schedules from one dashboard. | Use a server-rendered admin route at `/admin` backed by one dashboard query slice and explicit `Today` / `Upcoming` grouping. |
| DASH-02 | Admins can see schedule-level application, assignment, and attendance status together. | Build one schedule-card view model containing applicant counts, confirmed staffing counts, check-in counts, and drill-down links. |
| DASH-03 | Admins can quickly spot operational anomalies including lateness. | Compute anomaly priority in a pure query-slice util and avoid caching time-derived status outputs. |
</phase_requirements>

## Summary

This phase should be implemented as a new server-first read flow for `/admin`, not as a client-heavy dashboard and not by looping over existing per-schedule detail queries. The codebase already has the right primitives: admin gating via `requireAdminUser`, thin route files, `unstable_cache` plus tag invalidation for read slices, and schedule-detail drill-down at `/admin/schedules/[scheduleId]`.

The core planning decision is to create one dedicated dashboard query slice that fetches all schedules in the dashboard window with nested role slots, applications, assignments, and attendance rows in a single Supabase query, then derives card summaries in pure utilities. That avoids N+1 fan-out, keeps the route thin, and preserves the repo's `app -> flows -> queries -> shared` contract.

The biggest technical trap is time-derived anomaly staleness. Missing-check-in and late-state logic depends on the current time, but the repo's existing cache pattern uses tag invalidation only. For this phase, cache raw dashboard rows if needed, but compute time-sensitive anomaly classification outside the cached function on each request, or use a short revalidation policy. Do not cache a fully computed anomaly state indefinitely.

**Primary recommendation:** Build a dedicated `queries/operations-dashboard` read model and a new `flows/admin-operations-dashboard` page, then render it directly from `src/app/admin/page.tsx`.

## Project Constraints (from CLAUDE.md)

- Start file-changing work through a GSD workflow; this request already does that through phase research.
- Runtime code must follow `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared`.
- Route files stay thin.
- Use `#` absolute imports only; relative imports are forbidden.
- Action files orchestrate only; schema and normalization logic stay in `schemas/`.
- Prefer tag-based invalidation over `revalidatePath`.
- Pure helpers belong in domain `utils/` or `shared`, not inside components.
- Repository text files must use UTF-8 without BOM and LF line endings.
- Do not write repo-tracked files with raw PowerShell `Set-Content` or `Out-File`.
- `pnpm encoding:check` must pass before commit.
- Commit and push only when explicitly requested.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | `16.0.0` in repo | App Router server-rendered admin route | Matches the current route model and server-first read pattern already in use. |
| React | `19.1.1` in repo | Server and client component composition | Required by current Next stack; dashboard can stay mostly server-rendered with small client islands only if needed. |
| `@supabase/supabase-js` | `2.56.1` in repo | Nested relational read query for schedules, slots, applications, assignments, and check-ins | Existing DAL already uses Supabase nested selects for admin read models. |
| shadcn/ui primitives | `shadcn` `4.1.1` in repo | Card, badge, button, alert primitives for dashboard cards | Required by the UI contract and already aligned with the project's admin UI direction. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-query` | `5.90.6` in repo | Client cache and refetching | Only if this dashboard later needs live refresh or client-side polling; not required for the initial server-rendered page. |
| Vitest | `3.2.4` in repo | DAL, util, and page-level tests | Use for all new phase tests; the suite is already established and passing. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| One dashboard read model | Compose existing assignment and attendance detail queries per schedule | Simpler to start, but creates N+1 queries and duplicates time-sensitive logic. |
| Server-rendered page | Client-only React Query dashboard | Easier manual refresh, but contradicts the repo's server-first read pattern and adds hydration complexity. |
| Dedicated dashboard tags | Reusing only existing schedule/assignment/attendance tags | Works partially, but makes dashboard invalidation implicit and easy to miss in future mutations. |

**Installation:**
```bash
pnpm install
```

**Version verification:** Registry state checked on 2026-04-01 with `npm.cmd view`.
- `next`: repo `16.0.0`, latest `16.2.2`, published `2026-04-01T00:14:36Z`
- `@supabase/supabase-js`: repo `2.56.1`, latest `2.101.1`, published `2026-03-31T16:25:28Z`
- `@tanstack/react-query`: repo `5.90.6`, latest `5.96.0`, published `2026-03-31T10:46:43Z`
- `shadcn`: repo `4.1.1`, latest `4.1.2`, published `2026-03-26T14:36:51Z`
- `vitest`: repo `3.2.4`, latest `4.1.2`, published `2026-03-31T18:28:21Z`

For this phase, stay on repo versions. Upgrading framework packages is unrelated scope.

## Architecture Patterns

### Recommended Project Structure
```text
src/
|- app/admin/page.tsx                                  # Thin route entry for the dashboard
|- flows/admin-operations-dashboard/
|  |- components/
|  |  |- AdminOperationsDashboardPage.tsx             # Page composition
|  |  |- OperationsDashboardCard.tsx                  # Single schedule card
|  |  `- OperationsDashboardSection.tsx               # Today / Upcoming section wrapper
|  `- utils/                                          # Presentation-only formatting if needed
|- queries/operations-dashboard/
|  |- dal/listAdminOperationsDashboardSchedules.ts    # Single dashboard read query
|  |- types/operationsDashboard.ts                    # Read-model output types
|  `- utils/operationsDashboard.ts                    # Pure anomaly and grouping helpers
`- shared/config/cacheTags.ts                         # New dashboard cache tags
```

### Pattern 1: Single Dashboard Read Model
**What:** Fetch the dashboard window in one query slice and map it to schedule-card summaries in the same slice.
**When to use:** Always for `/admin`; the page is summary-oriented and spans multiple related tables.
**Example:**
```typescript
// Source basis: https://nextjs.org/docs/14/app/api-reference/functions/unstable_cache
// and https://supabase.com/docs/reference/javascript/v1/filter
import "server-only";

import { unstable_cache } from "next/cache";

import { cacheTags } from "#shared/config/cacheTags";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { mapDashboardSchedules } from "#queries/operations-dashboard/utils/operationsDashboard";

async function runListAdminOperationsDashboardSchedules(windowStart: string, windowEnd: string) {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select([
      "id",
      "starts_at",
      "ends_at",
      "status",
      "schedule_role_slots(id, role_code, headcount, schedule_assignments(id, status, worker_user_id))",
      "schedule_applications(worker_user_id, created_at)",
      "schedule_assignments(id, status, worker_user_id, schedule_role_slot_id, attendance_check_ins(checked_in_at, is_late))",
    ].join(", "))
    .gte("starts_at", windowStart)
    .lt("starts_at", windowEnd)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return mapDashboardSchedules(data ?? []);
}

export async function listAdminOperationsDashboardSchedules(windowStart: string, windowEnd: string) {
  const cached = unstable_cache(
    async () => await runListAdminOperationsDashboardSchedules(windowStart, windowEnd),
    ["queries:operations-dashboard:list", windowStart, windowEnd],
    { tags: [cacheTags.dashboard.all, cacheTags.dashboard.adminOperations] },
  );

  return await cached();
}
```

### Pattern 2: Time-Sensitive Anomaly Classification Outside Persistent Cache
**What:** Separate raw counts from `now`-dependent anomaly labeling.
**When to use:** Always for missing-check-in and lateness signals.
**Example:**
```typescript
// Source basis: https://nextjs.org/docs/14/app/api-reference/functions/unstable_cache
export const anomalyPriority = {
  unfilled_slots: 3,
  missing_check_ins: 2,
  late_arrivals: 1,
  on_track: 0,
} as const;

export function getTopAnomaly(input: {
  startsAt: string;
  opensAt: string;
  headcount: number;
  confirmedCount: number;
  checkedInCount: number;
  lateCount: number;
  now: Date;
}) {
  const unfilledCount = Math.max(input.headcount - input.confirmedCount, 0);
  if (unfilledCount > 0) return { kind: "unfilled_slots", count: unfilledCount };

  const opensAtMs = new Date(input.opensAt).getTime();
  if (input.now.getTime() >= opensAtMs) {
    const missingCount = Math.max(input.confirmedCount - input.checkedInCount - input.lateCount, 0);
    if (missingCount > 0) return { kind: "missing_check_ins", count: missingCount };
  }

  if (input.lateCount > 0) return { kind: "late_arrivals", count: input.lateCount };
  return { kind: "on_track", count: 0 };
}
```

### Pattern 3: Summary-First Flow With Drill-Down Link
**What:** Keep dashboard cards compact and route deeper review to `/admin/schedules/[scheduleId]`.
**When to use:** For every schedule card; do not inline assignment forms or attendance controls.
**Example:**
```tsx
// Source basis: https://ui.shadcn.com/docs/components/base/card
import Link from "next/link";

import { Badge } from "#shared/ui/badge";
import { Button } from "#shared/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "#shared/ui/card";

export function OperationsDashboardCard({ schedule }: { schedule: DashboardScheduleCard }) {
  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <CardTitle>{schedule.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{schedule.startsAtLabel}</p>
          </div>
          <Badge>{schedule.topAnomaly.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <div><strong>{schedule.applicantCount}</strong> Applicants</div>
        <div><strong>{schedule.confirmedCount}</strong> Confirmed</div>
        <div><strong>{schedule.checkedInCount}</strong> Checked in</div>
        <div><strong>{schedule.unfilledCount}</strong> Unfilled slots</div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/admin/schedules/${schedule.id}`}>Review schedule</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Anti-Patterns to Avoid
- **Calling `getAdminScheduleAssignmentDetail` and `getAdminScheduleAttendanceDetail` inside a loop:** too many queries and duplicated mapping work.
- **Caching anomaly labels that depend on `now`:** dashboard goes stale when the check-in window opens even if no mutation runs.
- **Counting draft assignments as staffed coverage:** draft work is not an operationally safe assignment signal for this phase.
- **Putting anomaly logic inside card components:** breaks the repo rule that pure summarization helpers live in `utils/`.
- **Overloading `AdminShellPage` with domain logic:** keep route-to-flow mapping explicit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-table schedule summary | Per-card ad hoc fetch composition | One Supabase nested select in `queries/operations-dashboard/dal` | Reduces query count and keeps the view model coherent. |
| Cache invalidation | Route-level `revalidatePath("/admin")` only | Dedicated dashboard cache tags plus existing schedule/assignment/attendance tags | Matches repo conventions and is easier to maintain. |
| Dashboard UI primitives | Custom card/badge/button implementations | Existing shadcn primitives in `#shared/ui/*` | UI contract already requires shadcn-only primitives. |
| Anomaly ordering | Badge sorting embedded in JSX | One pure `getTopAnomaly` helper | Keeps the D-03 priority rule testable and reusable. |

**Key insight:** the hard part in this phase is not rendering cards; it is getting one correct, testable read model that combines staffing and attendance semantics without time-based cache bugs.

## Common Pitfalls

### Pitfall 1: N+1 Dashboard Fan-Out
**What goes wrong:** The page loads the schedule list, then calls assignment and attendance detail queries once per schedule.
**Why it happens:** Those read functions already exist and look reusable.
**How to avoid:** Add a dedicated dashboard DAL that fetches the whole window once.
**Warning signs:** Planner proposes `Promise.all(schedules.map(...))` from the page or flow layer.

### Pitfall 2: False Missing-Check-In Alerts Before The Window Opens
**What goes wrong:** Upcoming schedules get flagged as missing check-ins before `opensAt`.
**Why it happens:** The attendance query already exposes `not_open_yet`, but a new dashboard mapper may collapse it incorrectly.
**How to avoid:** Preserve the existing open-time rule and only evaluate missing check-ins when `now >= opensAt`.
**Warning signs:** Cards in `Upcoming` immediately show attendance problems for schedules later today or tomorrow.

### Pitfall 3: Treating Draft Assignments As Filled Staffing
**What goes wrong:** A schedule appears staffed because draft assignments exist, even though nothing is confirmed.
**Why it happens:** Existing assignment detail counts role-slot assignments for editing purposes.
**How to avoid:** Use confirmed assignments for operational staffing counts. This is an implementation inference from the operational dashboard goal, not an explicitly written schema rule.
**Warning signs:** A schedule with only draft assignments shows `On track`.

### Pitfall 4: Cache Drift Across Time Boundaries
**What goes wrong:** A schedule stays `Not open yet` or `On track` after the check-in window opens.
**Why it happens:** `unstable_cache` plus tag invalidation handles writes, not wall-clock transitions.
**How to avoid:** Keep time-sensitive classification out of long-lived cached output, or use a bounded revalidation interval.
**Warning signs:** Refreshing the page after an open-time boundary still shows the old anomaly state.

### Pitfall 5: Missing Dashboard Tag Revalidation
**What goes wrong:** Assignment confirmations, schedule status changes, or attendance submissions do not refresh the dashboard.
**Why it happens:** The current mutations do not know about dashboard-specific tags yet.
**How to avoid:** Add `cacheTags.dashboard.*` and revalidate them from schedule, assignment, and attendance mutations that affect dashboard cards.
**Warning signs:** Schedule detail updates are correct, but `/admin` remains stale until a deploy or manual cache clear.

## Code Examples

Verified patterns from official sources and current repo contracts:

### Admin-Gated Server Page
```tsx
// Source basis: https://nextjs.org/docs/app/getting-started/server-and-client-components
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { AdminOperationsDashboardPage } from "#flows/admin-operations-dashboard/components/AdminOperationsDashboardPage";

export default async function AdminPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  return await AdminOperationsDashboardPage();
}
```

### Dashboard Window Recommendation
```typescript
// Source basis: repo time handling in queries/attendance/dal/getAdminScheduleAttendanceDetail.ts
export function getDashboardWindow(now: Date) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfUpcoming = new Date(startOfToday);
  endOfUpcoming.setDate(endOfUpcoming.getDate() + 3);

  return {
    start: startOfToday.toISOString(),
    end: endOfUpcoming.toISOString(),
  };
}
```

Recommended product default: `Today` = local calendar day, `Upcoming` = schedules after today's end and before `today + 72h`. This is a recommendation for Claude's discretion, not a locked user choice.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-first dashboard fetch after mount | Server-rendered App Router page with small client islands only when needed | Next.js App Router era | Faster first paint and less client complexity for admin summary pages. |
| Path-based page revalidation | Tag-based data invalidation | Current repo convention as of 2026-03-31 | Dashboard should add its own tags instead of relying on route invalidation. |
| Per-feature isolated summary queries | Purpose-built read models per page | Current repo query slice pattern | Planner should budget a dashboard-specific query slice, not only reuse existing detail queries. |

**Deprecated/outdated:**
- Full client-only admin summary pages as the default pattern: outdated for this repo and unnecessary here.
- Inline relative imports: forbidden by project convention.
- Route-layer business logic: outdated for this codebase.

## Open Questions

1. **Exact nearby upcoming window**
   - What we know: It must be more than today and less than a full week.
   - What's unclear: Exact duration or max card count is not user-locked.
   - Recommendation: Plan for `72 hours` beyond start of today, with sorted cards and no arbitrary cap unless implementation review shows layout pressure.

2. **Whether the placeholder `AdminShellPage` should survive**
   - What we know: `src/app/admin/page.tsx` currently delegates to `AdminShellPage`, which is only a placeholder.
   - What's unclear: Whether to keep it as a wrapper or replace it with the dashboard flow import.
   - Recommendation: Prefer a direct route-to-flow import for the dashboard to preserve the "one route maps to one flow" rule.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build/test commands | yes | `v22.22.1` | none |
| pnpm | Package scripts and test runner entrypoint | yes | `10.32.1` | `npm` is possible but not repo-standard |
| Vitest | Phase validation | yes | `3.2.4` | none |

**Missing dependencies with no fallback:**
- None.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts src/queries/operations-dashboard/utils/operationsDashboard.test.ts src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | `/admin` shows `Today` and `Upcoming` schedule groups for admins | component integration | `pnpm test -- src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` | no - Wave 0 |
| DASH-02 | Each schedule card shows application, assignment, and attendance summary together and links to detail | DAL + component | `pnpm test -- src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` | no - Wave 0 |
| DASH-03 | Highest anomaly follows `unfilled > missing check-ins > late` and does not misfire before open time | pure util | `pnpm test -- src/queries/operations-dashboard/utils/operationsDashboard.test.ts` | no - Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts src/queries/operations-dashboard/utils/operationsDashboard.test.ts src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` - verifies window filter, nested aggregation, and confirmed-vs-draft staffing semantics
- [ ] `src/queries/operations-dashboard/utils/operationsDashboard.test.ts` - verifies anomaly priority and open-window logic
- [ ] `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` - verifies admin-only render, section ordering, and drill-down links

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/getting-started/server-and-client-components - server-first page guidance for App Router
- https://nextjs.org/docs/14/app/api-reference/functions/unstable_cache - current official behavior for `unstable_cache` and tag-based cache design
- https://supabase.com/docs/guides/database/query-optimization - index and query-shape guidance for Postgres-backed reads
- https://supabase.com/docs/reference/javascript/v1/filter - official Supabase nested resource filtering/select behavior reference
- npm registry metadata queried on 2026-04-01 via `npm.cmd view` for `next`, `@supabase/supabase-js`, `@tanstack/react-query`, `shadcn`, and `vitest`

### Secondary (MEDIUM confidence)
- https://ui.shadcn.com/docs/components/base/card - official card primitive guidance consistent with the UI contract

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from repo `package.json` and npm registry metadata on 2026-04-01
- Architecture: HIGH - strongly constrained by existing code, phase context, and codebase conventions
- Pitfalls: MEDIUM - based on official cache behavior plus repo-specific inference about time-derived anomaly state and confirmed staffing semantics

**Research date:** 2026-04-01
**Valid until:** 2026-04-15
