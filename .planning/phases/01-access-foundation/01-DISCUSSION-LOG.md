# Phase 1: Access Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 01-access-foundation
**Areas discussed:** Invite Policy, Admin Bootstrap, Post-Login Routing, Rate Storage

---

## Invite Policy

| Option | Description | Selected |
|--------|-------------|----------|
| 엄격 | 이메일 고정 + invite 토큰 필요 + 만료일 있음 + 관리자 철회 가능 | |
| 중간 | 이메일 고정 + invite 토큰 필요 + 철회 가능, 만료일 없음 | |
| 느슨함 | 토큰만 있으면 가입 가능, 이메일 일치 검증은 안 함 | ✓ |

**User's choice:** 토큰만 있으면 가입 가능, 이메일 일치 검증 없음
**Notes:** invite 수락은 token possession 기반으로 두고, 이메일 일치 검증은 Phase 1의 필수 보안 규칙으로 두지 않음.

---

## Admin Bootstrap

| Option | Description | Selected |
|--------|-------------|----------|
| 수동 부트스트랩 | 초기 1명은 DB/seed로 admin 지정, 이후부터는 관리자만 초대 생성 | ✓ |
| 특정 이메일 자동 관리자 | 미리 정한 Google 이메일로 처음 로그인하면 admin 부여 | |
| 첫 가입자 관리자 | 제일 먼저 가입한 사용자를 자동 admin으로 승격 | |

**User's choice:** 수동 부트스트랩
**Notes:** 첫 관리자는 seed 또는 DB 초기화 절차에서 지정하고, 이후 운영은 관리자 초대로 이어감.

---

## Post-Login Routing

| Option | Description | Selected |
|--------|-------------|----------|
| 역할별 홈으로 즉시 이동 | admin은 `/admin`, worker는 `/worker`, 권한 없으면 `/unauthorized` | |
| 공통 홈 후 내부 분기 | 모든 사용자가 `/`로 오고, 거기서 역할에 따라 다시 이동 | ✓ |
| 마지막 방문 페이지 우선 | 이전에 보던 페이지가 있으면 거기로, 없으면 역할별 홈 | |

**User's choice:** 공통 홈 후 내부 분기
**Notes:** callback 직후에는 공통 진입점을 두고, root에서 역할별 페이지로 이동시키는 UX를 선호함.

---

## Rate Storage

| Option | Description | Selected |
|--------|-------------|----------|
| 현재값만 저장 | `worker_rates`는 1인 1현재값 + `updated_by`, `updated_at`만 둠 | ✓ |
| 현재값 + 변경 이력 | 현재값 테이블과 별도 history/event 테이블을 같이 만듦 | |
| 이력 전용 | 모든 변경을 append-only로 저장하고 현재값은 계산해서 조회 | |

**User's choice:** 현재값만 저장
**Notes:** Phase 1에서는 단순 current-value 모델만 필요하며 변경 이력 전용 구조는 뒤로 미룸.

## the agent's Discretion

- invite token의 길이, 해시, 만료 기본 정책
- 공통 홈(`/`)에서 역할 분기 구현 방식
- 관리자 시급 관리 UI의 세부 컴포넌트 구성

## Deferred Ideas

- invite email-match enforcement and stricter identity binding
- worker-rate history / append-only compensation event log
- resume-last-page routing after login
