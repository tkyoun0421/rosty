# Schedule Response And Admin Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add employee assignment response handling plus admin-side realtime refresh, filtering, and sorting without breaking the current mock-backed schedule request flow.

**Architecture:** Keep the current `schedule request` record as the mock source of truth, but separate manager review state from employee response state with new top-level response fields and append-only history events. Implement employee response as its own mutation path, surface the state in both employee and admin view models, and add admin list controls plus periodic refetch on read hooks.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, TanStack Query 5, React Hook Form 7, Zod 3, Vitest, React Testing Library

---

### Task 1: Extend the request model for employee responses

**Files:**
- Modify: `src/queries/schedule-request/types/scheduleRequest.ts`
- Modify: `src/queries/schedule-request/dal/scheduleRequest.ts`
- Modify: `src/queries/schedule-request/schemas/scheduleRequest.ts`
- Test: `tests/queries/schedule-request/schemas/scheduleRequest.test.ts`

- [ ] Add response status and response metadata to the request types and record types.
- [ ] Extend history event types with employee-side `accepted` and `declined`.
- [ ] Update schema parsing tests to cover the new response fields and history events.

### Task 2: Add API support for employee assignment responses

**Files:**
- Modify: `src/app/api/dev/schedule-requests/route.ts`
- Modify: `src/app/api/dev/lib/scheduleData.ts`
- Test: `tests/app/api/dev/schedule-requests/route.test.ts`

- [ ] Keep admin review on `PATCH`, but initialize employee response state when an approval is created.
- [ ] Add an employee response write path that accepts or declines only approved, unanswered assignments.
- [ ] Append response events into history and mirror them into top-level response fields.
- [ ] Add route tests for approve-initializes-response, accept, decline, and re-response rejection.

### Task 3: Add employee response mutation and assigned view behavior

**Files:**
- Create: `src/mutations/schedule-request/schemas/respondScheduleAssignment.ts`
- Create: `src/mutations/schedule-request/dal/submitScheduleAssignmentResponse.ts`
- Create: `src/mutations/schedule-request/actions/respondScheduleAssignment.ts`
- Create: `src/mutations/schedule-request/hooks/useRespondScheduleAssignment.ts`
- Modify: `src/flows/employee-assigned-schedule/types/employeeAssignedScheduleView.ts`
- Modify: `src/flows/employee-assigned-schedule/hooks/useEmployeeAssignedSchedule.ts`
- Modify: `src/flows/employee-assigned-schedule/components/EmployeeAssignedScheduleView.client.tsx`
- Test: `tests/flows/employee-assigned-schedule/EmployeeAssignedSchedule.client.test.tsx`

- [ ] Write failing tests for approved assignments that are awaiting employee response.
- [ ] Implement the employee response mutation and invalidate schedule request queries.
- [ ] Show response status, action buttons, and response notes in the assigned schedule screen.
- [ ] Disable actions once a response has been submitted and keep the timeline visible.

### Task 4: Add admin filtering, sorting, response visibility, and realtime refresh

**Files:**
- Modify: `src/queries/schedule-request/hooks/useAdminScheduleRequests.ts`
- Modify: `src/queries/work/hooks/useCurrentWork.ts`
- Modify: `src/flows/admin-schedule-review/types/adminScheduleReviewView.ts`
- Modify: `src/flows/admin-schedule-review/hooks/useAdminScheduleReview.ts`
- Modify: `src/flows/admin-schedule-review/components/AdminScheduleReviewView.client.tsx`
- Test: `tests/flows/admin-schedule-review/AdminScheduleReview.client.test.tsx`

- [ ] Add admin list controls for manager-review status, employee-response status, and sort order.
- [ ] Enable periodic refetch on admin request and current work queries.
- [ ] Surface employee response details in the admin detail panel and list summaries.
- [ ] Add tests that prove filtering, sorting, realtime refresh behavior, and response visibility.

### Task 5: Validate and document completion

**Files:**
- Modify: `docs/work-log.md`

- [ ] Run focused Vitest coverage for the touched schedule slices.
- [ ] Run full `pnpm test`.
- [ ] Update the work log with the completed slice and the next follow-up.
- [ ] Commit and push once the tree is green.
