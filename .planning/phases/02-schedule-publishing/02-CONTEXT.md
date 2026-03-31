# Phase 2: Schedule Publishing - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

관리자가 근무 스케줄을 만들고 모집 상태를 운영하며, 근무자가 모집 중인 스케줄을 보고 신청할 수 있는 흐름을 만든다. 이 단계는 스케줄 생성, 역할별 모집 인원 설정, 상태 운영, 근무자용 모집 목록, 신청 제출까지를 포함한다. 신청 검토, 역할 배정, 배정 확정, 예상 급여 계산은 Phase 3 범위다.

</domain>

<decisions>
## Implementation Decisions

### Schedule Unit
- **D-01:** 하나의 근무 스케줄은 하나의 근무일/타임블록을 나타낸다.
- **D-02:** 각 스케줄 안에 여러 역할 슬롯과 역할별 모집 인원을 둔다.
- **D-03:** 같은 날짜와 시간대라도 역할별로 별도 스케줄을 쪼개지 않는다.

### Application Unit
- **D-04:** 근무자는 역할 슬롯이 아니라 스케줄 전체에 신청한다.
- **D-05:** 신청 단계에서 역할을 확정하지 않고, 실제 역할 배정은 이후 단계에서 관리자가 결정한다.
- **D-06:** Phase 2의 신청 모델은 “이 근무에 참여 의사가 있다”는 제출을 표현해야 한다.

### Status Transition
- **D-07:** 상태 전환은 부분 자동화로 간다.
- **D-08:** 스케줄 생성 직후 기본 상태는 `recruiting`이다.
- **D-09:** 관리자는 필요 시 상태를 `assigning`, `confirmed`로 변경할 수 있다.
- **D-10:** 시스템은 명백히 잘못된 상태값이나 전환만 막고 운영 판단 자체를 과하게 강제하지 않는다.

### Worker Visibility
- **D-11:** 근무자 모집 목록은 간단 목록으로 제공한다.
- **D-12:** 목록에는 날짜, 시간, 모집 가능 여부 정도의 최소 정보만 우선 노출한다.
- **D-13:** 상세 정보는 별도 화면이나 이후 단계로 넘기고 목록은 가볍게 유지한다.

### Codebase Contract
- **D-14:** 런타임 코드는 `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared` 구조를 따른다.
- **D-15:** 의존 방향은 `app -> flows -> mutations -> queries -> shared`로 고정한다.
- **D-16:** `app`는 thin route layer이며, 한 route는 하나의 flow에 대응한다.
- **D-17:** UI 컴포넌트는 도메인 로직을 직접 소유하지 않는다. 도메인 로직은 해당 도메인 폴더 아래에 두고, 공통 로직은 `shared` 아래에 둔다.
- **D-18:** 일반 파일명은 `camelCase`, React 컴포넌트 파일명은 `PascalCase`를 사용한다.
- **D-19:** server action은 `mutations/*/actions`에만 둔다.
- **D-20:** 작은 UI라도 단일 write action에 강하게 결합돼 있으면 `mutations/{domain}/components`에 둘 수 있다.
- **D-21:** read DAL은 `queries/*/dal`, write DAL은 `mutations/*/dal`에 둔다.
- **D-22:** 내부 alias는 `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, `#shared/*`만 사용한다.
- **D-23:** 테스트는 구현 파일 옆에 colocated로 둔다.

### the agent's Discretion
- 상태 enum 이름과 transition helper 형태
- 관리자 스케줄 생성 form의 상세 레이아웃
- 근무자 모집 목록의 카드/테이블 표현 방식
- 신청 제출 후 피드백 메시지와 refresh 방식

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/CONVENTIONS.md`
- `CLAUDE.md`
- `.planning/phases/01-access-foundation/01-CONTEXT.md`

</canonical_refs>

<code_context>
## Existing Code Insights

- Phase 1 already provides Google sign-in, invite onboarding, role-based access reads, admin/worker shell routes, and worker-rate management baseline.
- Phase 2 should add schedule publishing on top of the existing access model rather than redefining auth or role boundaries.
- `queries/*` should own read-side schedule and application queries.
- `mutations/*` should own schedule creation, status update, and application submission commands.
- `flows/*` should own route-level composed UI for admin schedule management and worker recruitment browsing.
- `supabase/migrations/*` should introduce schedule, role-slot, and application persistence needed by this phase.

</code_context>

<specifics>
## Specific Ideas

- 관리자 입장에서는 하나의 스케줄 안에서 여러 역할과 모집 인원을 같이 관리해야 한다.
- 근무자 신청은 역할 지정 없이 스케줄 참여 의사 제출로 시작하고, 실제 역할 결정은 다음 phase에서 한다.
- 스케줄은 생성 직후 모집 가능한 상태로 들어가는 기본 흐름이 자연스럽다.
- 근무자 목록은 빠르게 훑을 수 있어야 하므로 최소 정보 중심으로 유지한다.

</specifics>

<deferred>
## Deferred Ideas

- 역할 슬롯별 직접 신청 및 선호 역할 선택
- 목록에서 상세 정보 대량 노출
- 더 엄격한 상태 전환 정책 강제

</deferred>

---
*Phase: 02-schedule-publishing*
*Context gathered: 2026-03-31*