# Phase 3: Assignment And Pay Preview - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

관리자가 스케줄별 신청자 목록을 검토하고 역할 슬롯별 배정을 저장한 뒤 명시적으로 확정할 수 있게 한다. 근무자는 자신에게 확정된 근무 일정, 역할, 그리고 그 근무를 기준으로 계산된 예상 급여를 확인할 수 있어야 한다. 이 단계는 신청 검토, 역할별 배정, 배정 확정, 예상 급여 계산과 표시까지를 포함하며, 위치 기반 출근 체크와 운영 대시보드는 포함하지 않는다.

</domain>

<decisions>
## Implementation Decisions

### Applicant Review
- **D-01:** 관리자는 스케줄 상세 화면 안에서 신청자 목록과 신청 상태를 검토한다.
- **D-02:** 신청자 검토는 별도 inbox형 화면이 아니라 스케줄 중심 흐름으로 유지한다.
- **D-03:** Phase 3의 admin read model은 스케줄 상세에서 신청자 검토와 배정 판단이 가능하도록 확장된다.

### Assignment Unit
- **D-04:** 실제 배정은 역할 슬롯별로 수행한다.
- **D-05:** 근무자 신청은 스케줄 단위로 유지하지만, 관리자는 신청자를 각 역할 슬롯에 배치해야 한다.
- **D-06:** 역할이 없는 스케줄 전체 확정 모델은 Phase 3의 기본 흐름으로 두지 않는다.

### Confirmation Rule
- **D-07:** 배정 저장과 최종 확정을 분리한다.
- **D-08:** 관리자는 배정안을 저장한 뒤 별도의 명시적 확정 액션으로 최종 반영한다.
- **D-09:** 자동 확정이나 저장 즉시 확정은 기본 동작으로 두지 않는다.

### Pay Preview
- **D-10:** 근무자는 확정된 근무 기준으로 예상 급여 총액을 확인할 수 있어야 한다.
- **D-11:** 예상 급여 화면에는 총액뿐 아니라 계산 근거 요약도 함께 보여준다.
- **D-12:** 계산 근거에는 근무 시간, 적용 시급, 연장 계산 반영 여부가 포함되어야 한다.
- **D-13:** 9시간 초과분은 기본 시급의 1.5배를 적용하는 규칙을 Phase 3에서 계산 로직으로 반영한다.

### Codebase Contract
- **D-14:** 런타임 코드는 `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared` 구조를 따른다.
- **D-15:** 의존 방향은 `app -> flows -> mutations -> queries -> shared`로 고정한다.
- **D-16:** `app`는 thin route layer이며 한 route는 하나의 flow에 대응한다.
- **D-17:** UI 컴포넌트는 도메인 로직을 직접 소유하지 않는다. 도메인 로직은 해당 도메인 폴더 아래에 두고 공통 로직은 `shared` 아래에 둔다.
- **D-18:** action 파일은 orchestration only로 유지하고 schema/정규화 로직은 `schemas/`로 분리한다.
- **D-19:** invalidation은 특별한 사유가 없으면 tag 기반을 우선한다.
- **D-20:** 순수 helper 함수는 component 파일이 아니라 각 도메인의 `utils/` 또는 `shared`에 둔다.
- **D-21:** 내부 import는 `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, `#shared/*` 절대 경로만 사용한다.

### the agent's Discretion
- 신청자 상태 라벨의 정확한 naming
- 배정 편집 UI의 세부 레이아웃과 interaction
- 예상 급여 화면에서 총액과 계산 근거를 어떤 density로 배치할지
- 저장 후 확정 전 draft 상태를 어떤 표현으로 보여줄지

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` — 제품 목표와 프로젝트 제약
- `.planning/REQUIREMENTS.md` — Phase 3 요구사항 `APPL-03`, `ASGN-01`, `ASGN-02`, `ASGN-03`, `PAY-02`, `PAY-03`, `PAY-04`
- `.planning/ROADMAP.md` — Phase 3 goal, dependency, success boundary
- `.planning/STATE.md` — 현재 phase 상태와 누적 결정

### Prior phase decisions
- `.planning/phases/01-access-foundation/01-CONTEXT.md` — 인증, 역할, 시급 저장 기준
- `.planning/phases/02-schedule-publishing/02-CONTEXT.md` — 스케줄 단위, 신청 단위, 상태 운영 기준
- `.planning/phases/02-schedule-publishing/02-RESEARCH.md` — Phase 2 persistence and RLS shape reused by Phase 3

### Codebase contract
- `.planning/codebase/CONVENTIONS.md` — 구조, import, action/schema, helper placement rules
- `.planning/codebase/ARCHITECTURE.md` — 현재 layered architecture와 read/write boundary
- `.planning/codebase/STRUCTURE.md` — 실제 디렉터리 구조와 배치 규칙
- `CLAUDE.md` — 저장소 workflow 및 current project guardrails

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/queries/schedule/dal/listAdminSchedules.ts` — admin schedule read 패턴과 tagged server cache 사용 예시
- `src/mutations/application/actions/createScheduleApplication.ts` — worker application mutation result shape와 session/RLS 경계 예시
- `src/shared/config/cacheTags.ts` — tag 기반 invalidation naming source of truth
- `src/shared/model/access.ts` — worker rate record 등 payroll preview가 참조할 primitive model 위치

### Established Patterns
- Admin/worker route는 thin server-rendered app routes + flow components 구조를 따른다.
- Read path는 query slice, write path는 mutation slice, invalidate는 tag 우선 규칙을 따른다.
- form-bound server action은 `FormData -> Promise<void>` submit action과 domain action을 분리하는 패턴을 사용한다.
- 현재 Phase 2 모델은 schedule-level application + role-slot capacity 구조다.

### Integration Points
- Admin schedule 상세/배정 화면은 기존 admin schedule 흐름을 확장하는 쪽이 자연스럽다.
- Assignment write path는 `mutations` 쪽에 새 domain slice 또는 schedule/application 확장으로 붙을 가능성이 높다.
- Worker 확정 근무 및 pay preview는 worker-side flow와 query slice를 추가해 연결해야 한다.
- Supabase schema는 기존 `schedules`, `schedule_role_slots`, `schedule_applications`, `worker_rates` 위에 assignment/confirmation/pay preview 구조를 확장해야 한다.

</code_context>

<specifics>
## Specific Ideas

- 신청 검토는 별도 inbox보다 스케줄 상세형이 맞다.
- 신청은 스케줄 단위지만 실제 운영은 역할 슬롯별 배정으로 닫아야 한다.
- 운영 실수를 줄이기 위해 배정 저장과 최종 확정을 분리한다.
- 예상 급여는 단순 총액만이 아니라 계산 근거까지 보여줘야 신뢰를 줄 수 있다.

</specifics>

<deferred>
## Deferred Ideas

- 자동 확정 조건형 워크플로
- 역할 없는 스케줄 전체 확정 모델
- 출근 데이터 연동 급여 보정
- 운영 알림/통지 기능

</deferred>

---
*Phase: 03-assignment-and-pay-preview*
*Context gathered: 2026-03-31*