# 라비에벨 웨딩홀 근무자 관리 웹 앱

## What This Is

라비에벨 웨딩홀 전용 근무 운영 웹 애플리케이션이다. 관리자와 근무자가 같은 계정 체계를 쓰되 역할로 권한을 나누고, 웨딩홀 근무 스케줄 생성부터 신청, 역할 배정, 출근 체크, 예상 급여 확인까지의 운영 흐름을 한 곳에서 처리한다.

이 제품은 웨딩홀 근무 운영에서 반복적으로 발생하는 일정 공지, 신청 취합, 배정 확정, 출근 확인, 지각 파악을 자동화해 운영 부담을 줄이는 것이 목적이다.

## Core Value

관리자가 웨딩홀 근무를 빠르게 확정하고 근무자는 자신의 확정 근무, 역할, 예상 급여를 신뢰할 수 있게 확인할 수 있어야 한다.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 관리자가 근무일과 근무 스케줄을 생성할 수 있어야 한다.
- [ ] 근무자가 오픈된 근무일을 보고 근무를 신청할 수 있어야 한다.
- [ ] 관리자가 신청자를 바탕으로 역할과 근무를 배정하고 확정할 수 있어야 한다.
- [ ] 근무자가 확정된 근무의 역할과 예상 급여를 확인할 수 있어야 한다.
- [ ] 근무자가 위치 기반 기능으로 출근 체크를 할 수 있어야 한다.
- [ ] 관리자가 근무자별 시급을 관리할 수 있어야 한다.
- [ ] 관리자가 지각 여부 등 운영 현황을 대시보드에서 확인할 수 있어야 한다.

### Out of Scope

- 실제 급여 정산 및 지급 처리 — v1의 핵심 운영 흐름은 예상 급여 확인이며, 정산 시스템까지 확장하면 범위가 과도하게 커진다.
- 다지점/다중 웨딩홀 운영 — 현재는 라비에벨 웨딩홀 전용 운영 도구로 시작한다.
- 별도 관리자/근무자 계정 체계 분리 — 동일 계정 체계에서 역할 기반 권한으로 충분하다.

## Context

- 이 제품은 웨딩홀 근무 운영에서 스케줄 생성, 신청 취합, 역할 분배, 확정 알림, 출근 체크를 일관된 흐름으로 묶는 내부 운영 도구다.
- 사용자 유형은 관리자와 근무자이며, 계정은 동일 구조를 쓰고 권한만 역할로 구분한다.
- 가입은 초대 기반으로 제한하고 로그인은 Google 로그인을 사용한다.
- 근무자 흐름은 오픈된 근무일 확인, 근무 신청, 확정된 역할 확인, 예상 급여 확인, 위치 기반 출근 체크 순서다.
- 관리자 흐름은 근무 스케줄 생성, 역할/인원 설정, 신청자 확인, 자동 추천 또는 자동 배정 검토, 확정 알림, 운영 현황 확인 순서다.
- 급여는 근무자별 개별 시급을 기준으로 계산하며, 9시간 초과 근무분은 기존 시급의 1.5배로 계산한다.
- 지각 여부를 포함한 운영 데이터는 관리자 대시보드에서 확인 가능해야 한다.

## Constraints

- **Scope**: 라비에벨 웨딩홀 전용 — 다지점 일반화보다 현장 운영 효율 개선이 우선이다.
- **Auth**: 초대 기반 가입 + Google 로그인 — 내부 인력만 접근하도록 제한해야 한다.
- **Roles**: 단일 계정 체계에서 역할 기반 권한 분리 — 사용자 모델을 단순하게 유지하기 위해서다.
- **Payroll**: 예상 급여만 제공 — 실제 정산/지급 시스템은 v1 범위 밖이다.
- **Attendance**: 위치 기반 출근 체크 필요 — 현장 출근 검증이 운영상 필수다.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 라비에벨 웨딩홀 전용으로 시작 | 다지점 범위를 열면 데이터 모델과 운영 복잡도가 불필요하게 커진다 | — Pending |
| 관리자와 근무자는 동일 계정 체계 + 역할 기반 권한 | 가입/권한 모델을 단순하게 유지하면서 운영 역할만 구분할 수 있다 | — Pending |
| 가입은 초대 기반, 로그인은 Google 로그인 사용 | 내부 도구 접근을 통제하고 로그인 마찰을 줄이기 위해서다 | — Pending |
| 급여는 근무자별 시급과 연장수당 규칙으로 예상 금액만 제공 | 근무자에게 필요한 투명성을 제공하면서 정산 시스템 범위는 피한다 | — Pending |
| 출근 체크는 위치 기반으로 처리 | 실제 현장 출근 여부를 검증하는 운영 요구가 있다 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
