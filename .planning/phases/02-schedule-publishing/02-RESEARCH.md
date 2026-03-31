# Phase 02: Schedule Publishing - Research

**Researched:** 2026-03-31
**Domain:** Next.js App Router + Supabase/Postgres schedule publishing and worker applications
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 하나의 근무 스케줄은 하나의 근무일/타임블록을 나타낸다.
- **D-02:** 각 스케줄 안에 여러 역할 슬롯과 역할별 모집 인원을 둔다.
- **D-03:** 같은 날짜와 시간대라도 역할별로 별도 스케줄을 쪼개지 않는다.
- **D-04:** 근무자는 역할 슬롯이 아니라 스케줄 전체에 신청한다.
- **D-05:** 신청 단계에서 역할을 확정하지 않고, 실제 역할 배정은 이후 단계에서 관리자가 결정한다.
- **D-06:** Phase 2의 신청 모델은 “이 근무에 참여 의사가 있다”는 제출을 표현해야 한다.
- **D-07:** 상태 전환은 부분 자동화로 간다.
- **D-08:** 스케줄 생성 직후 기본 상태는 `recruiting`이다.
- **D-09:** 관리자는 필요 시 상태를 `assigning`, `confirmed`로 변경할 수 있다.
- **D-10:** 시스템은 명백히 잘못된 상태값이나 전환만 막고 운영 판단 자체를 과하게 강제하지 않는다.
- **D-11:** 근무자 모집 목록은 간단 목록으로 제공한다.
- **D-12:** 목록에는 날짜, 시간, 모집 가능 여부 정도의 최소 정보만 우선 노출한다.
- **D-13:** 상세 정보는 별도 화면이나 이후 단계로 넘기고 목록은 가볍게 유지한다.
- **D-14 ~ D-23:** 코드베이스 구조, alias, thin app, owner-layer logic, action/DAL/test 배치는 현재 codebase contract를 따른다.

### Claude's Discretion
- 상태 enum 이름과 transition helper 형태
- 관리자 스케줄 생성 form의 상세 레이아웃
- 근무자 모집 목록의 카드/테이블 표현 방식
- 신청 제출 후 피드백 메시지와 refresh 방식

### Deferred Ideas (OUT OF SCOPE)
- 역할 슬롯별 직접 신청 및 선호 역할 선택
- 목록에서 상세 정보 대량 노출
- 더 엄격한 상태 전환 정책 강제
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHD-01 | 관리자는 근무일의 날짜, 시작 시각, 종료 시각을 포함한 근무 스케줄을 생성할 수 있다. | Schedule table shape, server action form flow, atomic create guidance, admin route boundaries |
| SCHD-02 | 관리자는 근무 스케줄별로 필요한 역할과 모집 인원을 설정할 수 있다. | Role-slot child table, uniqueness/headcount constraints, atomic multi-table write guidance |
| SCHD-03 | 관리자는 모집 중, 배정 중, 확정 완료 등 근무 스케줄 상태를 관리할 수 있다. | `schedule_status` enum, lightweight transition helper, admin status mutation placement |
| APPL-01 | 근무자는 모집 중인 근무 스케줄 목록을 확인할 수 있다. | Worker query slice, server-first list rendering, recruiting-only visibility, indexing/RLS guidance |
| APPL-02 | 근무자는 특정 근무 스케줄에 근무 신청을 제출할 수 있다. | Minimal application model, uniqueness constraint, worker-only insert path, feedback/revalidation strategy |
</phase_requirements>

## Summary

Phase 02 should stay intentionally narrow: create a schedule, attach role-slot headcounts, expose a lightweight recruiting list to workers, and record a single schedule-level application per worker. Do not leak Phase 3 concerns into this phase. In particular, do not model role assignment, applicant review workflow, or rich schedule detail screens yet.

The repository already has the right architectural shape for this work. Admin and worker pages should remain thin server-rendered routes under `src/app`, page composition should live in `src/flows`, writes should be server actions in `src/mutations`, and read models should live in `src/queries`. Existing code shows a simple pattern of server-rendered pages plus form actions, which matches current Next.js guidance for internal mutations.

The highest-risk planning decision is persistence shape. The cleanest Phase 02 model is three tables: `schedules`, `schedule_role_slots`, and `schedule_applications`. Keep application rows minimal and schedule-level. Enforce uniqueness and validity in Postgres, not only in UI code. For worker-facing reads and writes, prefer a session-bound Supabase server client plus RLS; using the service-role admin client for worker paths would bypass the safety boundary that this repository will need as worker features expand.

**Primary recommendation:** Use a minimal three-table schedule model, server-first reads, server actions for writes, and RLS-backed worker paths so Phase 03 can extend the model without redoing Phase 02.

## Standard Stack

- `next@16.2.1` with App Router
- `react@19.2.4` / `react-dom@19.2.4`
- `@supabase/supabase-js@2.x`
- `@supabase/ssr@0.10.x`
- `zod` for schema validation
- optional `react-hook-form` for richer form UX

## Architecture Recommendations

### Persistence Shape
- `schedules`
  - `id`, `starts_at`, `ends_at`, `status`, `created_by`, timestamps
- `schedule_role_slots`
  - `id`, `schedule_id`, `role_code`, `headcount`
- `schedule_applications`
  - `id`, `schedule_id`, `worker_user_id`, timestamps
  - unique constraint on `(schedule_id, worker_user_id)`

### Read / Write Placement
- Admin creation and status updates belong in `mutations/schedule/*`.
- Worker application submission belongs in `mutations/application/*`.
- Admin schedule listing belongs in `queries/schedule/*`.
- Worker recruiting list belongs in `queries/schedule/*` with a worker-facing DTO.
- Route-level composed UI belongs in `flows/admin-schedules/*` and `flows/worker-schedules/*`.

### Security Boundary
- Admin write paths should use strict DB-backed role guards.
- Worker reads and writes should use session-bound server clients with RLS.
- Do not use service-role clients for worker mutation paths.

## Validation Architecture

Recommended automated verification for this phase:
- `src/mutations/schedule/schemas/schedule.test.ts`
- `src/mutations/schedule/actions/createSchedule.test.ts`
- `src/mutations/schedule/actions/updateScheduleStatus.test.ts`
- `src/queries/schedule/dal/listRecruitingSchedules.test.ts`
- `src/mutations/application/actions/createScheduleApplication.test.ts`
- `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx`

Recommended manual verification:
- Admin creates a schedule and sees default `recruiting` status.
- Worker sees recruiting schedule list and can apply exactly once.

## Risks And Pitfalls

- Over-designing Phase 2 around assignment concerns will slow down Phase 3 instead of helping it.
- Using role-slot-level applications now will complicate later assignment decisions without a requirement-level benefit.
- Using path-based invalidation too broadly can hide stale data coupling; tagged reads/writes scale better as the app grows.
- Bypassing RLS with overly privileged clients on worker paths will make later authorization bugs harder to detect.

---
*Phase 02 research refreshed in UTF-8 for planning reuse on 2026-03-31*