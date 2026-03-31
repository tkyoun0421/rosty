# Phase 04: Attendance Check-In - Research

**Researched:** 2026-03-31
**Domain:** location-based attendance check-in on a Next.js 16 + Supabase stack
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Claude's Discretion

The agent may decide the following details while planning and implementation:
- precise distance-calculation utility and unit handling
- empty-state and failure-state copy
- exact admin attendance layout within the schedule detail experience
- whether worker check-in availability is surfaced as a badge, CTA state, helper copy, or a combination

### Deferred Ideas (OUT OF SCOPE)

- operations-wide dashboard summaries
- multi-location venue validation
- re-submission or admin override approval workflows
- downstream payroll finalization beyond attendance status signals
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ATTD-01 | 근무자는 자신의 확정 근무에 대해 위치 기반 출근 체크를 제출할 수 있다. | Worker-side attendance mutation slice, secure-context geolocation capture, server-side confirmed-assignment validation, single-shot unique constraint, existing worker confirmed-assignment page extension |
| ATTD-02 | 시스템은 출근 체크 시점의 위치 정보를 저장해 현장 출근 검증에 활용할 수 있다. | Attendance table design, persisted lat/lng plus validation snapshot columns, server-side distance calculation, RLS-backed worker insert path |
| ATTD-03 | 관리자는 근무자별 출근 상태와 지각 여부를 확인할 수 있다. | Schedule-centric admin attendance read model, left-join from confirmed assignments to attendance records, derived lateness field, admin schedule detail extension |
</phase_requirements>

## Summary

Phase 04 should be planned as an extension of the existing assignment surfaces, not as a new product area. The worker experience should stay on the confirmed-assignment page, and the admin experience should stay on the existing schedule detail page. The codebase already has the right seams for this: worker confirmed-assignment reads in `queries/assignment`, admin schedule detail reads in `queries/assignment`, worker-owned write patterns through the authenticated Supabase server client, and tag-based cache invalidation in mutation actions.

The main planning risk is data shape, not UI. Current schema supports confirmed assignments, but it does not yet expose an explicit source for the first-ceremony timing rule or for the venue geofence snapshot. For Phase 4 v1, the product decision is now locked: `schedules.starts_at` is the canonical first-ceremony timestamp, and the team should not introduce a second schedule clock field in this phase. The remaining data-shape work is therefore limited to the single venue latitude/longitude/radius source and attendance persistence contract.

**Primary recommendation:** Add a dedicated `attendance` query/mutation slice, store attendance per confirmed assignment with a unique `schedule_assignment_id`, validate time and distance on the server, and extend the existing worker/admin assignment pages instead of creating new routes.

## Project Constraints (from CLAUDE.md)

- Start work through a GSD workflow; do not make direct repo edits outside it unless explicitly asked.
- Commit and push only when explicitly requested.
- Repository text files must use UTF-8 without BOM and LF line endings, except `*.ps1` may use UTF-8 BOM.
- Do not write repo-tracked files with raw PowerShell `Set-Content` or `Out-File`.
- Runtime code must follow `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared`.
- Active code structure and workflow rules are defined in `.planning/codebase/CONVENTIONS.md` and `.planning/codebase/ARCHITECTURE.md`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | Installed `16.0.0`; latest `16.2.1` published 2026-03-20 | App Router routes, Server Components, server actions, cache tags | Already the repo runtime; current attendance work should follow the existing App Router + server action model |
| `react` | Installed `19.1.1` | UI rendering and client interactivity | Already the repo runtime; attendance UI is incremental client interaction inside existing pages |
| `@supabase/ssr` | Installed `0.7.0` | Authenticated server client in Next.js | Existing worker-owned read/write path already depends on it |
| `@supabase/supabase-js` | Installed `2.56.1`; latest `2.101.0` published 2026-03-30 | Database access, auth context, service-role admin client | Existing DAL and auth boundary already use it; attendance should not introduce another data client |
| `zod` | Installed `4.1.5` | Parsing and normalization of mutation input | Matches repo convention that action files orchestrate only |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-query` | Installed `5.90.6`; latest `5.95.2` published 2026-03-23 | Client cache and sync | Only if attendance UX needs client refetch beyond server render and tag revalidation |
| `react-hook-form` | Installed `7.62.0` | Form state | Optional; likely unnecessary for a single button + geolocation submit, but still the project standard for forms |
| `shadcn` / Radix primitives | Installed `4.1.1`; latest `4.1.2` published 2026-03-26 | UI primitives for cards, badges, dialogs, alerts, tables | Required by the UI contract and current phase conventions |
| `vitest` | Installed `3.2.4`; latest `4.1.2` published 2026-03-26 | Unit and component tests | Existing test framework and config already in repo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server-side haversine utility | PostGIS / geospatial extensions | More powerful, but unnecessary for one coordinate + one radius and adds scope the phase does not need |
| Worker assignment page extension | New `/worker/attendance` route | Breaks the locked integration decision and duplicates assignment context |
| Admin schedule detail extension | Worker-centric attendance dashboard | Conflicts with the locked schedule-centric admin review requirement |

**Installation:**
```bash
# No new runtime package is required for Phase 04.
```

**Version verification:** Verified on 2026-03-31 with local registry commands:
```bash
npm.cmd view next version time --json
npm.cmd view @supabase/supabase-js version time --json
npm.cmd view @tanstack/react-query version time --json
npm.cmd view vitest version time --json
```

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── mutations/
│   └── attendance/
│       ├── actions/          # server actions and thin submit wrappers
│       ├── dal/              # worker-owned insert/query helpers
│       ├── schemas/          # zod parsing for check-in payloads
│       └── utils/            # distance/time calculation helpers
├── queries/
│   └── attendance/
│       ├── dal/              # worker/admin attendance read models
│       ├── types/            # read model contracts
│       └── utils/            # status mapping and summary helpers
├── flows/
│   ├── worker-assignment-preview/components/
│   │   └── AttendanceCheckInCard.tsx
│   └── admin-schedule-assignment/components/
│       └── AttendanceReviewPanel.tsx
└── shared/
    └── config/
        └── cacheTags.ts      # add attendance tag factory
```

### Pattern 1: Worker Attendance Is a Mutation Slice Attached to Confirmed Assignments
**What:** The worker check-in button should live on the confirmed-assignment page, but the write path belongs in `mutations/attendance`.
**When to use:** For a worker-owned submit that depends on auth context, confirmed assignment state, and cache invalidation.
**Example:**
```ts
"use server";

import { revalidateTag } from "next/cache";

import { createAttendanceCheckIn } from "#mutations/attendance/dal/attendanceDal";
import { parseAttendanceCheckIn } from "#mutations/attendance/schemas/attendanceCheckIn";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { cacheTags } from "#shared/config/cacheTags";

export async function submitAttendanceCheckIn(input: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "worker") throw new Error("FORBIDDEN");

  const parsed = parseAttendanceCheckIn(input);
  const result = await createAttendanceCheckIn({ ...parsed, workerUserId: currentUser.id });

  revalidateTag(cacheTags.attendance.scheduleDetail(result.scheduleId), "max");
  revalidateTag(cacheTags.attendance.workerAssignments(currentUser.id), "max");
}
```
Source: adapted from `src/mutations/assignment/actions/confirmScheduleAssignments.ts` and Next.js cache-tag docs: https://nextjs.org/docs/app/building-your-application/data-fetching/caching

### Pattern 2: Validate Time and Distance on the Server, Not in the Client
**What:** The browser captures coordinates, but the server must decide whether the check-in is accepted, whether it is within radius, and whether it is late.
**When to use:** Always. Client geolocation is untrusted input.
**Example:**
```ts
export function calculateDistanceMeters(input: {
  venueLatitude: number;
  venueLongitude: number;
  workerLatitude: number;
  workerLongitude: number;
}) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const dLat = toRadians(input.workerLatitude - input.venueLatitude);
  const dLon = toRadians(input.workerLongitude - input.venueLongitude);
  const lat1 = toRadians(input.venueLatitude);
  const lat2 = toRadians(input.workerLatitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```
Source: implementation recommendation derived from the locked single-point geofence rule; browser capture uses MDN Geolocation API: https://developer.mozilla.org/docs/Web/API/Geolocation

### Pattern 3: Admin Attendance Read Model Should Join Confirmed Assignments to Attendance
**What:** Admin review is schedule-centric, so the read model should start from confirmed assignments for one schedule and left-join attendance records.
**When to use:** For the admin schedule detail extension.
**Example:**
```ts
type AdminAttendanceStatus = "checked_in" | "late" | "not_checked_in";

interface AdminScheduleAttendanceRow {
  workerUserId: string;
  workerName: string | null;
  roleCode: string;
  checkedInAt: string | null;
  isLate: boolean | null;
}

function mapAttendanceStatus(row: AdminScheduleAttendanceRow): AdminAttendanceStatus {
  if (!row.checkedInAt) return "not_checked_in";
  return row.isLate ? "late" : "checked_in";
}
```
Source: structure adapted from `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts`

### Anti-Patterns to Avoid
- **Client-only geofence enforcement:** The browser can supply fake or stale coordinates. Server-side validation is mandatory.
- **New attendance routes:** The phase explicitly extends existing worker/admin assignment flows.
- **Action files with inline parsing math:** Keep parsing in `schemas/` and pure helpers in `utils/`.
- **Path-only cache invalidation:** The repo standard is tag-based invalidation unless there is no viable tag strategy.

## Data Model Recommendation

### Required table
Use a dedicated `attendance_check_ins` table keyed by confirmed assignment:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `schedule_assignment_id` | `uuid` | `unique`, FK to `schedule_assignments(id)` |
| `schedule_id` | `uuid` | denormalized for admin schedule reads and indexing |
| `worker_user_id` | `uuid` | denormalized for worker reads and RLS |
| `checked_in_at` | `timestamptz` | server-generated submit timestamp |
| `submitted_latitude` | `double precision` | stored worker location snapshot |
| `submitted_longitude` | `double precision` | stored worker location snapshot |
| `accuracy_meters` | `double precision null` | optional browser-reported accuracy |
| `distance_meters` | `double precision` | server-computed distance to venue reference point |
| `allowed_radius_meters` | `integer` | snapshot of business rule used at submit time |
| `within_allowed_radius` | `boolean` | server validation result |
| `is_late` | `boolean` | server-derived lateness result |
| `created_at` | `timestamptz` | default UTC now |

### Required indexes and constraints
- Unique on `schedule_assignment_id` for single-shot enforcement.
- Index on `(schedule_id, worker_user_id)` for admin and worker reads.
- Optional partial index on `(schedule_id)` where attendance exists if admin review becomes large.

### RLS direction
- Worker insert/select should use the authenticated server client and RLS, following the `schedule_applications` pattern.
- Admin schedule review can continue to use the existing service-role admin client read path.

### Strong recommendation
Do not store only a pass/fail boolean. Persist the submitted coordinates and the computed distance/radius snapshot so ATTD-02 is satisfied and later audits are possible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cache refresh after attendance submit | Manual page redirects or ad-hoc refresh state | Next.js tag invalidation | Existing repo pattern; keeps worker and admin views coherent |
| Worker auth/ownership checks | Client-side role gating only | `getCurrentUser()` + RLS-backed insert path | Attendance is security-sensitive |
| Schedule-centric attendance review | Component-level joins and status math | Query-slice read model with mapped status fields | Keeps admin UI thin and testable |
| Single-point geofence | PostGIS or multi-shape geometry system | Small tested haversine utility + stored snapshot | Scope only needs one coordinate and one radius |

**Key insight:** This phase looks UI-heavy, but the hard part is the invariant boundary: one confirmed assignment, one server-validated check-in, one admin schedule view. Keep that boundary explicit in the schema and query/mutation slices.

## Common Pitfalls

### Pitfall 1: Forgetting that Phase 4 v1 locks first ceremony to `schedules.starts_at`
**What goes wrong:** Implementation adds a second ceremony-time source or diverges from the v1 assumption, creating inconsistent attendance window logic across worker and admin flows.
**Why it happens:** The business rule is venue-specific, and the term can be misunderstood as meal time or generic shift time.
**How to avoid:** Keep all Phase 4 timing and lateness logic on `schedules.starts_at`, explicitly described as the first-ceremony timestamp for v1.
**Warning signs:** Tasks introduce `first_meal_*`, `first_ceremony_*`, or a second schedule clock field in Phase 4.

### Pitfall 2: Treating Lateness as Implicit
**What goes wrong:** Admin review shows checked-in/not-checked-in, but cannot explain or consistently compute late status.
**Why it happens:** The context locks that admins see lateness, but it does not lock the lateness cutoff.
**How to avoid:** Make the lateness threshold an explicit planning decision. For Phase 4 v1, use `checked_in_at > schedule.starts_at` because `schedules.starts_at` is the locked first-ceremony timestamp.
**Warning signs:** UI copy references `Late` but there is no corresponding DAL field or test expectation.

### Pitfall 3: Relying on Client Coordinates Alone
**What goes wrong:** Users can bypass geofence validation or submit stale positions.
**Why it happens:** `navigator.geolocation` runs in the browser and is permission- and device-dependent.
**How to avoid:** Accept coordinates from the client, but compute `distance_meters`, `within_allowed_radius`, and `is_late` on the server before insert.
**Warning signs:** The action stores raw form values without a server-side distance calculation.

### Pitfall 4: Forgetting Secure-Context Geolocation Rules
**What goes wrong:** Worker check-in appears broken on non-HTTPS previews or denied-permission devices.
**Why it happens:** Browser geolocation is restricted to secure contexts and explicit user permission.
**How to avoid:** Plan denied-permission, unavailable, and timeout states as first-class UI states.
**Warning signs:** The design assumes location is always immediately available.

## Code Examples

Verified or repo-aligned patterns to reuse:

### Browser Geolocation Capture
```ts
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    // submit to server action
  },
  (error) => {
    // show blocked, denied, or timeout copy
  },
  {
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 0,
  },
);
```
Source: https://developer.mozilla.org/docs/Web/API/Geolocation

### Worker-Owned Insert Pattern
```ts
const supabase = await getServerSupabaseClient();
const { data, error } = await supabase
  .from("attendance_check_ins")
  .insert({
    schedule_assignment_id: input.scheduleAssignmentId,
    schedule_id: input.scheduleId,
    worker_user_id: input.workerUserId,
    submitted_latitude: input.latitude,
    submitted_longitude: input.longitude,
  })
  .select("*")
  .single();

if (error?.code === "23505") {
  throw new Error("ALREADY_CHECKED_IN");
}
```
Source: pattern adapted from `src/mutations/application/dal/scheduleApplicationDal.ts`

### Tag-Based Invalidation After Mutation
```ts
revalidateTag(cacheTags.attendance.scheduleDetail(scheduleId), "max");
revalidateTag(cacheTags.attendance.workerAssignments(workerUserId), "max");
```
Source: repo pattern in `src/mutations/assignment/actions/confirmScheduleAssignments.ts` and Next.js docs: https://nextjs.org/docs/app/building-your-application/data-fetching/caching

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Worker discovers attendance on a separate page | Worker acts from existing confirmed-assignment flow | Locked in Phase 04 context on 2026-03-31 | Keep route count low and reuse assignment context |
| Admin monitors attendance from a global dashboard | Admin reviews attendance inside schedule detail | Locked in Phase 04 context on 2026-03-31 | Read model should be schedule-first |
| Generic “X minutes before shift” rule | First-ceremony business-rule window using `schedules.starts_at` in v1 | Locked in Phase 04 context on 2026-03-31 | Keeps Phase 4 scoped while matching the venue rule |
| Ad-hoc route refresh after writes | Cache tags with `revalidateTag` | Already established in earlier phases | Mutation tasks should include tag updates, not page redirects |

**Deprecated/outdated:**
- Worker-centric attendance dashboards for this phase: out of scope and contradict locked decisions.
- Multi-location geofencing: explicitly deferred.
- Resubmission/edit workflows: explicitly deferred.

## Open Questions

1. **What is the lateness cutoff?**
   - What we know: Admins must see lateness status.
   - What's unclear: No locked decision defines the threshold.
   - Recommendation: For Phase 4 v1, use `checked_in_at > schedules.starts_at`, because `schedules.starts_at` is the locked first-ceremony timestamp.

2. **Where should the single venue geofence be configured?**
   - What we know: The phase uses exactly one venue coordinate and one allowed radius.
   - What's unclear: Current repo has no attendance config source.
   - Recommendation: For Phase 04, use a server-side config source in `shared/config` backed by env values, and snapshot the effective radius into each attendance record. Do not add an admin config UI in this phase.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build/test scripts | ✓ | `v22.22.1` | — |
| pnpm | Package scripts and Vitest execution | ✓ | `10.32.1` | `npm.cmd` for registry lookups only |
| Vitest | Unit/component validation | ✓ | `3.2.4` | — |
| Supabase CLI | Applying migrations locally | ✗ | — | Commit SQL migration file; apply via dashboard or existing DB workflow |

**Missing dependencies with no fallback:**
- None for planning.

**Missing dependencies with fallback:**
- `supabase` CLI is not installed locally. Migration authoring can still proceed, but local apply/preview steps need a manual or existing team workflow.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest` `3.2.4` |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm exec vitest path/to/test-file.test.ts -x` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ATTD-01 | Worker can submit one location-based check-in for a confirmed assignment only once | unit + DAL + component | `pnpm exec vitest src/mutations/attendance/actions/createAttendanceCheckIn.test.ts src/mutations/attendance/dal/attendanceDal.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx -x` | ❌ Wave 0 |
| ATTD-02 | Server stores location snapshot and validation result from check-in time | DAL + schema | `pnpm exec vitest src/mutations/attendance/dal/attendanceDal.test.ts src/mutations/attendance/schemas/attendanceCheckIn.test.ts -x` | ❌ Wave 0 |
| ATTD-03 | Admin sees worker attendance and lateness by schedule | query DAL + component | `pnpm exec vitest src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm exec vitest <affected test files> -x`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/mutations/attendance/dal/attendanceDal.test.ts` - covers single-shot insert, confirmed-assignment enforcement, radius and lateness persistence
- [ ] `src/mutations/attendance/actions/createAttendanceCheckIn.test.ts` - covers worker auth and cache invalidation
- [ ] `src/mutations/attendance/schemas/attendanceCheckIn.test.ts` - covers payload parsing and invalid coordinate handling
- [ ] `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` - covers schedule-centric admin review and late/not-checked-in mapping
- [ ] `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` update - covers worker attendance availability, blocked states, and post-check-in rendering
- [ ] `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` update - covers attendance review panel ordering and status labels

## Sources

### Primary (HIGH confidence)
- Repo code and phase artifacts:
  - `.planning/phases/04-attendance-check-in/04-CONTEXT.md`
  - `.planning/phases/04-attendance-check-in/04-UI-SPEC.md`
  - `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx`
  - `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx`
  - `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts`
  - `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts`
  - `src/mutations/application/dal/scheduleApplicationDal.ts`
  - `src/mutations/assignment/actions/confirmScheduleAssignments.ts`
  - `supabase/migrations/20260401_phase2_schedule_publishing.sql`
  - `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql`
- Next.js caching and tag revalidation docs: https://nextjs.org/docs/app/building-your-application/data-fetching/caching
- MDN Geolocation API docs: https://developer.mozilla.org/docs/Web/API/Geolocation
- Supabase extensions overview: https://supabase.com/docs/guides/database/extensions

### Secondary (MEDIUM confidence)
- Supabase Auth overview for JWT/RLS integration context: https://supabase.com/docs/guides/auth
- Local npm registry verification on 2026-03-31:
  - `next` latest `16.2.1`
  - `@supabase/supabase-js` latest `2.101.0`
  - `@tanstack/react-query` latest `5.95.2`
  - `vitest` latest `4.1.2`

### Tertiary (LOW confidence)
- Recommendation to keep geofence math in a small haversine utility instead of enabling PostGIS for this phase. This is an implementation inference from the locked single-point scope, not a hard vendor requirement.
- Default lateness cutoff of `checked_in_at > schedules.starts_at` if product clarification is unavailable. This is an inference, not a locked business rule.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against installed repo dependencies and current npm registry responses on 2026-03-31
- Architecture: HIGH - directly grounded in current phase context, architecture docs, and existing Phase 2/3 code seams
- Pitfalls: MEDIUM - main technical risks are clear, but only venue geofence config remains open; the first-ceremony source is now explicitly locked to `schedules.starts_at` for Phase 4 v1

**Research date:** 2026-03-31
**Valid until:** 2026-04-14
