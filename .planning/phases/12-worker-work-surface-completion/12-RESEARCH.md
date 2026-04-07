# Phase 12: Worker Work Surface Completion - Research

**Researched:** 2026-04-07
**Domain:** Next.js App Router 기반 worker recruiting / confirmed-work / pay-preview / attendance surface 완성
**Confidence:** HIGH

<user_constraints>
## User Constraints (from ROADMAP.md, PROJECT.md, STATE.md, and 12-CONTEXT.md)

### Locked Decisions
### 범위는 기존 worker 흐름의 표면 완성에 한정
- **D-01:** 이번 Phase는 기존 `/worker/schedules` 와 `/worker/assignments` 를 읽기 쉽고 자기설명적인 화면으로 만드는 작업이다. 새 worker 라우트, 알림, payroll 기능, 실시간 동기화는 범위 밖이다.
- **D-02:** `/worker/schedules` 는 여전히 한 화면에서 모집 중 스케줄과 지원 상태를 이해하는 흐름이어야 한다. 별도 상세 라우트나 다단계 지원 플로우를 추가하지 않는다.
- **D-03:** `/worker/assignments` 는 확정 근무, 예상 급여, 출근 체크인 맥락을 함께 보여주는 단일 허브로 유지한다.

### 구조 규칙
- **D-04:** `src/app` 라우트는 얇게 유지하고, 데이터 읽기와 화면 조합은 `src/flows` 와 `src/queries` 아래에 둔다.
- **D-05:** 지원 쓰기 경로는 `submitScheduleApplication`, 출근 쓰기 경로는 `submitAttendanceCheckIn` 을 계속 사용한다.
- **D-06:** 가능한 한 기존 shared primitive (`Card`, `Badge`, `Alert`, `Button`) 와 Phase 10/11에서 정착한 surface language 를 재사용한다.

### 제품 품질 기대치
- **D-07:** worker recruiting 화면에서 현재 apply / applied 상태와 열린 역할 정보를 첫 화면에서 바로 이해할 수 있어야 한다.
- **D-08:** confirmed-work 화면은 급여 총액만 보여주는 화면이 아니라, 왜 그 금액이 나왔는지와 체크인 가능 여부를 함께 설명해야 한다.
- **D-09:** 빈 상태와 unavailable 상태는 서로 구분되어야 하며, 항상 다음 행동을 안내해야 한다.

### the agent's Discretion
- 모집 카드의 정보 밀도와 stat tile 배치
- role-slot summary 를 한 줄 텍스트로 보여줄지, 여러 badge 로 보여줄지
- pay-unavailable 상태를 별도 카드로 둘지, assignment 카드 내부 섹션으로 둘지

### Deferred Ideas (OUT OF SCOPE)
- 확정/체크인 시점 알림
- worker schedule detail / history 라우트
- 실시간 새로고침, polling, push 상태 동기화
- payroll settlement / payout / export
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WORKUI-01 | Worker can understand recruiting schedule items and current apply/applied state at a glance. | 모집 카드가 시간, 역할 요약, 지원 상태, 다음 행동을 한 번에 보여주도록 query 와 surface 를 함께 확장해야 한다. |
| WORKUI-02 | Worker can understand confirmed work, expected pay, and attendance state from the confirmed-work surface. | 확정 근무 DTO 는 pay-ready / pay-unavailable 상태를 구분해야 하고, 화면은 근무 정보, 급여 근거, 체크인 상태를 같은 계층 안에서 설명해야 한다. |
| WORKUI-03 | Worker sees clear empty and unavailable states that explain what to do next instead of raw blanks. | 모집 없음, 이미 지원 후 대기, 확정 근무 없음, 급여 정보 미정 상태를 서로 다른 branch 로 설계하고 CTA 를 넣어야 한다. |
</phase_requirements>

## Summary

Phase 12는 새 도메인 기능을 추가하는 단계가 아니라, 이미 존재하는 worker 흐름을 제품 수준의 표면으로 끌어올리는 단계다.

현재 기반은 이미 충분하다.

- `/worker/schedules` 는 server-first flow 로 현재 worker 의 지원 이력과 모집 스케줄을 합쳐 렌더링한다.
- `/worker/assignments` 는 확정 근무, pay preview, attendance status 를 읽어오는 기본 경로를 이미 갖고 있다.
- `AttendanceCheckInCard` 는 체크인 상태와 제출 동작을 이미 담고 있다.

하지만 현재 UI 품질에는 명확한 결함이 있다.

- `WorkerSchedulesPage.tsx` 와 `WorkerScheduleList.tsx` 는 아직도 최소 리스트 수준이며 mojibake 성격의 텍스트가 남아 있다.
- `listRecruitingSchedules.ts` 는 role-slot summary 를 전혀 제공하지 않아, 카드형 surface 로 바꿔도 "무슨 역할이 열려 있는지"를 즉시 말해주지 못한다.
- `ApplyToScheduleButton.tsx` 는 기능은 맞지만 현재 presentation 이 너무 약해서 surface 의 일관성을 깨뜨린다.
- `listConfirmedWorkerAssignments.ts` 는 worker rate 가 보이지 않으면 `[]` 를 반환해 버리므로, 실제로 확정 근무가 있어도 worker 화면에서는 "근무 없음"처럼 보일 수 있다.
- `listWorkerAttendanceStatuses.ts` 는 `listConfirmedWorkerAssignments()` 위에 쌓여 있으므로, 급여 정보가 빠진 경우 attendance context 도 같이 사라질 수 있다.
- `WorkerAssignmentPreviewPage.tsx` 는 현재 check-in 중심 헤더가 강하고, "확정 근무 화면"으로서의 의미 구조가 아직 약하다.

**Primary recommendation:** 이 Phase는 2개의 실행 계획으로 나누는 것이 가장 적절하다.

1. `/worker/schedules` 를 모집 일정 카드 surface 로 재구성하면서, query DTO 자체를 카드 친화적으로 확장한다.
2. `/worker/assignments` 를 확정 근무 허브로 재구성하면서, "rate 미설정" 상태에서도 근무와 체크인 맥락은 유지되도록 read contract 를 확장한다.

## Current Codebase Findings

### Existing routes and flow ownership

| Route | Current owner | Current quality | Notes |
|------|---------------|-----------------|-------|
| `/worker` | `src/flows/worker-shell/components/WorkerShellPage.tsx` | readable baseline | Worker workspace 언어와 두 개의 primary destination link 는 이미 양호하다. |
| `/worker/schedules` | `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` | scaffold | server data flow 는 맞지만 bare list + placeholder text 상태다. |
| `/worker/assignments` | `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | partial baseline | 카드형 구조는 있으나 check-in 중심이고 pay-unavailable 분기가 없다. |

### Existing data contracts

| File | Current behavior | Planning implication |
|------|------------------|----------------------|
| `src/queries/schedule/dal/listRecruitingSchedules.ts` | `id`, `startsAt`, `endsAt`, `status` 만 반환 | role-slot summary 가 필요하면 query 자체를 확장해야 한다. |
| `src/queries/application/dal/listMyScheduleApplicationIds.ts` | 현재 worker 가 지원한 schedule ID 목록만 반환 | apply / applied 상태 merge 용으로 충분하며 그대로 유지해도 된다. |
| `src/mutations/application/actions/submitScheduleApplication.ts` | 성공 시 worker/admin/dashboard tag 를 재검증 | recruiting surface 개편 시에도 이 submit wrapper 를 유지하는 편이 안전하다. |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | rate 가 없으면 빈 배열 반환 | Phase 12에서 가장 큰 contract gap 이다. |
| `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` | confirmed assignments 배열을 기반으로 상태 생성 | assignment query 가 assignment visibility 를 유지해야 attendance UI 도 유지된다. |

### Existing automated coverage

| File | What it proves | Relevance |
|------|----------------|-----------|
| `src/flows/worker-shell/components/WorkerShellPage.test.tsx` | worker home shell 과 주요 링크 | Phase 12 surface language 의 baseline |
| `src/queries/schedule/dal/listRecruitingSchedules.test.ts` | recruiting query 최소 필드와 정렬 | Plan 01에서 role-slot summary 추가 후 확장 필요 |
| `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | worker recruiting page 가 schedule + applied state 를 합친다는 사실 | Plan 01에서 readable shell 과 empty/apply state 검증으로 확장 필요 |
| `src/mutations/application/actions/submitScheduleApplication.test.ts` | 지원 성공 시 tag invalidation 범위 | Plan 01에서 유지되어야 하는 write contract |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` | pay preview 계산과 confirmed filtering | Plan 02에서 missing-rate visibility contract 추가 필요 |
| `src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts` | check-in opensAt / submitted state 계산 | Plan 02에서 pay-unavailable 상태에서도 attendance context 유지 여부 검증 필요 |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | current confirmed-work render 와 check-in states | Plan 02에서 empty / unavailable / confirmed-work hierarchy 검증으로 확장 필요 |

### Coverage gaps to close in this phase

- 현재 recruiting surface 가 role-slot summary 를 보여준다는 자동화 증거가 없다.
- 현재 worker recruiting empty state 와 next-step CTA 를 검증하는 테스트가 없다.
- rate 미설정이어도 confirmed assignment 가 보인다는 자동화 증거가 없다.
- pay-unavailable state 를 별도로 렌더링한다는 자동화 증거가 없다.

### Existing patterns to preserve

- worker route 는 server component flow 가 current user 와 여러 query slice 를 합쳐 렌더링하는 구조를 유지한다.
- apply UI 는 mutation slice 안에 두고, recruiting 화면은 그것을 조합만 한다.
- attendance interaction 은 assignment 카드 내부에 붙어 있어야 한다.
- cache invalidation 은 기존 submit wrapper 에 남기고, surface 개편 때문에 path-level refresh 로 후퇴하지 않는다.

## Project Constraints (from CONVENTIONS.md, ARCHITECTURE.md, and current code)

- `#` alias import 만 사용한다.
- `src/app/*` route 는 thin entry 로 유지한다.
- server read 는 `queries/*/dal`, write orchestration 은 `mutations/*/actions` 에 둔다.
- surface 개선 때문에 `shared` 에 domain-aware UI 를 밀어 넣지 않는다.
- test 는 현재 codebase 현실에 맞게 source 옆 Vitest 파일을 확장한다.

## Standard Stack

### Core

| Library | Purpose | Why Standard Here |
|---------|---------|-------------------|
| Next.js App Router | thin route + server component reads | worker routes가 이미 이 패턴 위에 있다. |
| React 19 | interaction islands | apply / check-in UI 가 이미 React client component 로 존재한다. |
| Tailwind utility classes | surface hierarchy and spacing | Phase 10/11 surface 와 동일한 visual language 를 재사용할 수 있다. |
| Vitest + Testing Library | flow, query, action regression coverage | existing worker tests가 모두 이 스택을 사용한다. |
| Existing schedule/application/attendance actions | write-side orchestration | surface-only 단계에서 write contract 재작성은 불필요하다. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Query DTO 확장 | client-side guessed summaries | UI 는 빨라지지만 source of truth 가 흐려지고 tests 도 약해진다. |
| Existing submit wrappers 유지 | 새로운 worker-specific action layer 추가 | surface phase 에 비해 범위가 과해진다. |
| Nullable pay contract 도입 | rate missing 시 계속 빈 배열 반환 | 구현은 단순하지만 WORKUI-02 / WORKUI-03 를 정직하게 충족시키지 못한다. |

## Architecture Patterns

### Pattern 1: Card-ready server DTO for first-screen clarity
**What:** UI 가 첫 화면에서 보여줘야 하는 summary 정보는 query contract 에 직접 담는다.

**When to use:** recruiting schedules 의 role-slot summary, confirmed assignments 의 pay availability state.

**Why:** worker surface 는 client-side 조합보다 server-first summary 가 더 단순하고 테스트 가능하다.

### Pattern 2: One worker destination per job to be done
**What:** 모집 확인은 `/worker/schedules`, 확정 근무와 체크인은 `/worker/assignments` 에 남긴다.

**When to use:** route ownership 과 CTA 설계.

**Why:** worker shell 에 이미 두 개의 목적지가 정착되어 있고, Phase 12는 이를 더 명확하게 만드는 단계다.

### Pattern 3: Preserve assignment visibility even when pay metadata is incomplete
**What:** pay 정보가 빠져도 confirmed assignment 자체는 숨기지 않는다. 대신 pay status 를 explicit state 로 노출한다.

**When to use:** confirmed-work query 와 page rendering.

**Why:** 실제 근무가 있는데 화면에서 사라지는 것이 가장 큰 UX 왜곡이기 때문이다.

### Pattern 4: Attendance stays attached to the assignment card
**What:** open / submitted / blocked check-in 설명과 CTA 를 assignment 문맥 안에서 유지한다.

**When to use:** `AttendanceCheckInCard` 와 confirmed-work 화면 레이아웃.

**Why:** worker 는 근무 하나를 기준으로 출근할지 판단하므로, 별도 패널보다 assignment adjacency 가 더 자연스럽다.

## Anti-Patterns to Avoid

- recruiting surface 를 화려하게 만들기 위해 별도 schedule detail route 를 새로 도입하는 것
- pay preview 문제를 해결한다며 payroll 도메인으로 범위를 넓히는 것
- rate missing 상태를 계속 빈 배열로 숨겨서 "근무 없음"으로 보이게 만드는 것
- `src/app/worker/*` route 파일 안에 business logic 를 집어넣는 것
- `ApplyToScheduleButton` 의 제출 경로를 surface 편의 때문에 우회하는 것

## Common Pitfalls

### Pitfall 1: Recruiting cards are prettier but still vague
**What goes wrong:** 카드만 생기고 어떤 역할이 열려 있는지, 이미 지원했는지, 무엇을 눌러야 하는지 여전히 불분명하다.
**How to avoid:** `roleSlotSummary`, explicit apply state label, next-step copy 를 query + surface 에 함께 넣는다.

### Pitfall 2: Confirmed-work page remains check-in-first
**What goes wrong:** worker 는 이 화면이 "출근 화면"인지 "확정 근무 화면"인지 헷갈린다.
**How to avoid:** page header 와 summary hierarchy 를 confirmed-work 중심으로 바꾸고, attendance 는 assignment context 안의 행동으로 남긴다.

### Pitfall 3: Missing rate still erases the assignment
**What goes wrong:** admin rate 데이터 지연이 worker UI 에서는 근무 자체가 없는 것처럼 보인다.
**How to avoid:** `payStatus` 같은 explicit contract 를 추가해 assignment visibility 를 유지한다.

### Pitfall 4: Empty and unavailable states collapse into one message
**What goes wrong:** worker 가 지금 할 일이 없는지, 이미 지원 후 대기 중인지, admin 쪽 rate setup 이 덜 끝난 것인지 구분하지 못한다.
**How to avoid:** empty / applied-waiting / pay-unavailable branch 를 명시적으로 분리한다.

## Environment Availability

| Capability | Status | Notes |
|------------|--------|-------|
| Worker recruiting route and server flow | Available | Existing route and page flow already exist. |
| Worker confirmed-work route | Available | Existing assignment preview page already exists. |
| Shared card/badge/button primitives | Available | Phase 10/11 surface language reuse 가능. |
| Worker query/action tests | Available | 확장하면 충분한 baseline 이 있다. |
| UI-SPEC for Phase 12 | Missing | 사용자가 지금 바로 한국어 plan-phase 를 요청했기 때문에 이번 planning run 은 UI-SPEC 없이 계속 진행한다. |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm exec vitest run src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` |
| Full suite command | `pnpm exec vitest run` |
| Estimated runtime | ~30 seconds |

### Phase Requirements -> Test Map

| Requirement | Proof Target | Test Type | Command | Notes |
|-------------|--------------|-----------|---------|-------|
| WORKUI-01 | recruiting query + worker recruiting surface + apply state | query + flow + action | `pnpm exec vitest run src/queries/schedule/dal/listRecruitingSchedules.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/mutations/application/actions/submitScheduleApplication.test.ts` | role-slot summary 와 apply/apply-submitted copy 를 함께 검증해야 한다. |
| WORKUI-02 | confirmed-work visibility, pay preview hierarchy, attendance state | query + flow + attendance | `pnpm exec vitest run src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | missing-rate 상태에서도 confirmed assignment 와 attendance 가 남는지 검증해야 한다. |
| WORKUI-03 | empty states, unavailable states, next-step CTA | flow | `pnpm exec vitest run src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | recruiting empty, confirmed empty, pay-unavailable state 를 각각 확인해야 한다. |

### Sampling Rate

- **After every task commit:** 해당 task 의 targeted command 를 실행한다.
- **After every plan wave:** `pnpm exec vitest run src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx`
- **Before `$gsd-verify-work`:** full suite must be green
- **Max feedback latency:** 30 seconds

### Wave 0 Gaps

기존 test infrastructure 와 test file baseline 이 이미 존재하므로 별도 Wave 0 파일 생성은 필수가 아니다. 다만 기존 tests 를 확장할 때 아래 증거는 반드시 추가되어야 한다.

- `WorkerSchedulesPage.test.tsx` 에 role-slot summary, apply state, recruiting empty-state CTA 검증 추가
- `WorkerAssignmentPreviewPage.test.tsx` 에 pay-unavailable branch 와 confirmed empty-state CTA 검증 추가

### Manual-Only Checks

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 실제 worker 계정으로 모집 일정 지원 | WORKUI-01 | 자동화는 submit contract 와 cache invalidation 은 증명하지만 live browser flow feel 은 증명하지 못함 | `/worker/schedules` 에서 하나의 모집 일정에 지원하고, 즉시 applied state 와 next-step copy 가 이해되는지 확인한다. |
| rate 미설정 상태의 confirmed-work 화면 | WORKUI-02 / WORKUI-03 | DB 데이터를 live 로 조절해야 해서 브라우저 수동 점검이 더 현실적임 | 확정 근무는 있지만 worker rate 가 없는 계정으로 `/worker/assignments` 를 열어, 근무 정보는 보이고 pay-unavailable 안내가 명확한지 확인한다. |
| 실기기 또는 secure browser 환경의 geolocation check-in | WORKUI-02 | 테스트는 state transition 을 증명하지만 브라우저 권한/HTTPS/위치 오차 체감은 수동 검증 필요 | 체크인 오픈 상태 assignment 로 접근해 권한 허용, secure context, 성공/거부 상태 copy 를 실제로 확인한다. |

## Sources

### Local Codebase Inspection
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/12-worker-work-surface-completion/12-CONTEXT.md`
- `.planning/phases/02-schedule-publishing/02-CONTEXT.md`
- `.planning/phases/02-schedule-publishing/02-schedule-publishing-03-SUMMARY.md`
- `.planning/phases/03-assignment-and-pay-preview/03-CONTEXT.md`
- `.planning/phases/04-attendance-check-in/04-CONTEXT.md`
- `.planning/phases/08-pay-preview-freshness/08-CONTEXT.md`
- `.planning/codebase/CONVENTIONS.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STRUCTURE.md`
- `src/app/worker/page.tsx`
- `src/app/worker/schedules/page.tsx`
- `src/app/worker/assignments/page.tsx`
- `src/app/worker/loading.tsx`
- `src/flows/worker-shell/components/WorkerShellPage.tsx`
- `src/flows/worker-shell/components/WorkerShellPage.test.tsx`
- `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx`
- `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx`
- `src/flows/worker-schedules/components/WorkerScheduleList.tsx`
- `src/flows/worker-schedules/utils/formatSchedule.ts`
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx`
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx`
- `src/flows/worker-assignment-preview/components/PayPreviewTotalCard.tsx`
- `src/flows/worker-assignment-preview/utils/workerAssignmentPreview.ts`
- `src/queries/schedule/dal/listRecruitingSchedules.ts`
- `src/queries/schedule/dal/listRecruitingSchedules.test.ts`
- `src/queries/application/dal/listMyScheduleApplicationIds.ts`
- `src/mutations/application/components/ApplyToScheduleButton.tsx`
- `src/mutations/application/actions/submitScheduleApplication.ts`
- `src/mutations/application/actions/submitScheduleApplication.test.ts`
- `src/queries/assignment/types/workerAssignmentPreview.ts`
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts`
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts`
- `src/queries/attendance/types/workerAttendanceStatus.ts`
- `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts`
- `src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts`
- `src/mutations/attendance/components/AttendanceCheckInCard.tsx`
- `src/mutations/attendance/utils/attendanceCheckIn.ts`
- `src/shared/config/cacheTags.ts`
- `src/shared/ui/card.tsx`
- `src/shared/ui/badge.tsx`
- `src/shared/ui/alert.tsx`
- `src/shared/ui/button.tsx`

## Metadata

- Research mode: local fallback after subagent hang during MCP wait
- Context mode: Phase 12 CONTEXT.md 사용
- UI contract mode: UI-SPEC 없이 계속 진행 (사용자 요청에 따른 planning continuation)
- Scope: worker recruiting surface, confirmed-work surface, pay-preview clarity, attendance status guidance
- Recommended plan count: 2
