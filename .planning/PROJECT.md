# 라비에벨 웨딩홀 근무자 관리 웹 앱

## What This Is

라비에벨 웨딩홀 단일 현장을 위한 내부 근무 운영 웹 앱이다. 관리자는 근무 스케줄을 생성하고 모집, 신청 확인, 배정, 출근 체크, 예상 급여 확인까지 운영 흐름을 한곳에서 관리한다. 근무자는 자신이 신청 가능한 근무를 보고, 확정된 근무와 역할, 예상 급여를 신뢰할 수 있게 확인한다.

이 프로젝트의 목적은 웨딩홀 운영에서 반복적으로 발생하는 스케줄 공지, 신청 수집, 배정 확정, 출근 확인, 운영 이상 징후 파악을 한 흐름으로 연결해 운영 부담을 줄이는 것이다.

## Core Value

관리자가 웨딩홀 근무를 빠르게 확정하고 근무자는 자신의 확정 근무, 역할, 예상 급여를 신뢰할 수 있게 확인할 수 있어야 한다.

## Requirements

### Validated

- Phase 1 validated: 초대 기반 인증, Google 로그인, 역할 기반 접근 제어, 관리자 시급 관리 기반
- Phase 2 validated: 스케줄 생성, 모집 상태 관리, 근무자 신청 흐름
- Phase 3 validated: 신청자 검토, 역할별 배정/확정, 근무자 예상 급여 미리보기

- Phase 6 validated: admin invite route guard for `/admin/invites` (AUTH-01, AUTH-03)
- Phase 7 validated: worker application submits refresh admin schedule detail and dashboard freshness after real writes (APPL-02, APPL-03, DASH-02)
- Phase 8 validated: admin worker-rate writes refresh worker pay preview through dedicated pay-preview cache tags (PAY-01, PAY-02, PAY-04)

### Active

- [ ] Complete the live Phase 08 freshness checks recorded in `.planning/phases/08-pay-preview-freshness/08-HUMAN-UAT.md`.
- [ ] Reconcile missing and stale verification evidence in Phase 09.

### Out of Scope

- 실제 급여 정산 및 지급 처리
- 다지점 및 다중 웨딩홀 운영
- 별도 관리자/근무자 계정 체계 분리

## Context

- 단일 venue 내부 운영 도구로 시작한다.
- 동일 계정 체계 안에서 역할 기반 권한으로 관리자와 근무자를 구분한다.
- 가입과 로그인은 Google OAuth 기반으로 처리한다.
- 관리자의 주요 흐름은 스케줄 생성, 모집 운영, 신청 검토, 배정 확정, 출근 상태 확인이다.
- 근무자의 주요 흐름은 모집 중인 근무 조회, 신청, 확정 근무 확인, 예상 급여 확인, 출근 체크 제출이다.
- 예상 급여는 확정된 근무와 시급 정보를 바탕으로 계산하되, 실제 정산은 v1 범위 밖이다.

## Constraints

- Scope: 라비에벨 웨딩홀 단일 현장 운영 최적화가 우선이다.
- Auth: 초대 기반 접근과 Google 로그인으로 내부 인력만 접근하도록 제한한다.
- Roles: 동일 계정 체계 안에서 역할 기반 권한만으로 운영한다.
- Payroll: v1에서는 예상 급여만 제공하고 실제 지급/정산은 하지 않는다.
- Attendance: 위치 기반 출근 체크는 현장 출근 검증을 위한 최소 기능으로 시작한다.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 단일 웨딩홀 내부 도구로 시작 | 초기 범위를 좁혀 운영 흐름을 먼저 안정화한다 | Accepted |
| 동일 계정 + 역할 기반 권한 | 운영과 온보딩을 단순하게 유지한다 | Accepted |
| Google 로그인 + 초대 기반 온보딩 | 내부 인력 접근을 통제하고 로그인 마찰을 줄인다 | Accepted |
| 시급은 현재값 중심으로 관리 | v1에서는 payroll audit보다 운영 속도가 우선이다 | Accepted |

## Evolution

이 문서는 phase 전환과 milestone 경계에서 갱신한다.

- 새 phase가 시작되면 현재 focus와 validated/active 상태를 다시 정리한다.
- 요구사항이 범위를 벗어나면 out of scope 또는 backlog로 이동한다.
- 주요 제품 판단이 고정되면 key decisions에 누적한다.

*Last updated: 2026-04-05 after Phase 08 completion*
