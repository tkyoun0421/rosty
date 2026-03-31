# Phase 1: Access Foundation - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

내부 인력만 접근 가능한 인증 체계와 관리자/근무자 권한 구분, 초대 기반 온보딩, 그리고 관리자용 시급 관리 기반을 만든다. 이 단계는 Google 로그인, 초대 처리 규칙, 역할 분기, 초기 관리자 부트스트랩, 시급 저장 모델을 고정하는 단계이며 스케줄 생성이나 실제 급여 계산 기능은 포함하지 않는다.

</domain>

<decisions>
## Implementation Decisions

### Invite Policy
- **D-01:** 초대 수락은 이메일 고정 검증 없이 invite 토큰만으로 허용한다.
- **D-02:** invite 링크를 가진 사용자는 Google 로그인 후 토큰이 유효하면 온보딩을 완료할 수 있다.
- **D-03:** invite 기반 접근 제어는 토큰의 유효성에 의존하며, 이메일 일치 여부는 Phase 1의 차단 조건으로 두지 않는다.

### Admin Bootstrap
- **D-04:** 첫 관리자는 자동 승격이 아니라 수동 부트스트랩으로 생성한다.
- **D-05:** 초기 1명 admin은 seed 또는 DB 초기화 절차에서 지정하고, 그 이후 초대 생성 권한은 관리자에게만 부여한다.

### Post-Login Routing
- **D-06:** 사용자는 로그인 완료 후 공통 홈(`/`)으로 먼저 진입하고, 그 지점에서 역할에 따라 내부 분기를 수행한다.
- **D-07:** 권한이 없는 사용자는 `/unauthorized`로 보낸다.
- **D-08:** `proxy.ts`는 과도한 권한 결정을 하지 않고 공통 홈 진입과 coarse routing만 담당하며, 실제 권한 검증은 DAL/guard 계층에서 수행한다.

### Rate Storage
- **D-09:** Phase 1의 시급 저장은 현재값만 관리한다.
- **D-10:** `worker_rates`는 1인 1현재값 구조로 두고 `updated_by`, `updated_at` audit column만 포함한다.
- **D-11:** 시급 변경 이력 전용 테이블이나 append-only ledger는 Phase 1 범위에 넣지 않고, 필요하면 이후 phase에서 확장한다.

### Codebase Contract
- **D-12:** 런타임 코드는 `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared` 구조를 따른다.
- **D-13:** 의존 방향은 `app -> flows -> mutations -> queries -> shared`로 고정한다.
- **D-14:** `app`는 thin route layer이며, 한 route는 하나의 flow에 대응한다.
- **D-15:** server action은 `mutations/*/actions`에만 둔다.
- **D-16:** read DAL은 `queries/*/dal`, write DAL은 `mutations/*/dal`에 둔다.
- **D-17:** 테스트는 root `tests/`가 아니라 구현 파일 옆에 colocated로 둔다.
- **D-18:** 내부 alias는 `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, `#shared/*`만 사용한다.
- **D-19:** UI 컴포넌트는 도메인 로직을 직접 소유하지 않는다. 도메인 로직은 해당 도메인 폴더 아래에 두고, 공통 로직은 `shared` 아래에 둔다.
- **D-20:** 일반 파일명은 `kebab-case`가 아니라 `camelCase`를 사용한다.

### the agent's Discretion
- invite token의 길이, 해시 방식, 만료 기본값
- 공통 홈(`/`)에서의 역할 분기 구현 방식
- admin worker-rate UI의 정확한 form layout과 component composition

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase planning artifacts
- `.planning/PROJECT.md` — product constraints and non-negotiable project-level decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirement definitions for `AUTH-01`, `AUTH-02`, `AUTH-03`, `PAY-01`
- `.planning/ROADMAP.md` — Phase 1 boundary, goal, and success criteria
- `.planning/phases/01-access-foundation/01-RESEARCH.md` — researched auth, invite, RBAC, and worker-rate implementation guidance
- `.planning/phases/01-access-foundation/01-VALIDATION.md` — validation contract and Wave 0 verification map
- `.planning/codebase/ARCHITECTURE.md` — current application layer model
- `.planning/codebase/CONVENTIONS.md` — enforced naming, alias, test, and dependency rules
- `CLAUDE.md` — project workflow and implementation guardrails

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No trusted app-layer reusable assets exist yet. The repository is effectively being restarted from scratch for this phase.
- The reliable source of truth is the planning set plus the refreshed codebase documents, not legacy runtime code.

### Established Patterns
- The application structure is now fixed to `src/app`, `src/flows`, `src/mutations`, `src/queries`, and `src/shared`.
- `app` stays thin, route structure follows real page structure, and one route maps to one flow.
- `queries` own read-side DAL and dual server/client read APIs.
- `mutations` own write-side DAL and all server actions.
- Shared code is limited to `shared/ui`, `shared/lib`, `shared/model`, and `shared/config`.

### Integration Points
- `src/shared/lib/supabase/*` will own low-level Supabase client setup.
- `src/queries/access/*` will own session-backed current-user reads and secure role lookups.
- `src/mutations/invite/*` will own invite creation, revocation, and acceptance actions plus DAL.
- `src/mutations/worker-rate/*` will own worker-rate mutations and validation.
- `src/flows/*` will own route-level composed UI for sign-in, root routing, admin invite management, and admin worker-rate management.
- `supabase/migrations/*` and `supabase/seed.sql` will anchor schema, role claims, and initial admin bootstrap.

</code_context>

<specifics>
## Specific Ideas

- Invite acceptance is intentionally token-based rather than email-locked, even though the earlier research recommended token + email matching.
- The first successful login should not decide admin privileges; admin bootstrap remains an explicit setup action.
- Role-based landing should happen from a common root entrypoint instead of sending users directly to role-specific pages from the callback.
- Worker hourly rate storage should stay simple in Phase 1: current value plus audit metadata only.
- Planning and implementation must follow the refreshed codebase contract, not the stale `src/lib/*` and root `tests/*` references from older drafts.

</specifics>

<deferred>
## Deferred Ideas

- Invite acceptance with email-match enforcement or stronger identity binding — future security hardening if token-only access proves too weak.
- Full worker-rate change history or append-only compensation events — later phase if payroll auditability becomes necessary.
- More advanced post-login routing such as resume-last-page behavior — later UX refinement phase.

</deferred>

---
*Phase: 01-access-foundation*
*Context gathered: 2026-03-31*
