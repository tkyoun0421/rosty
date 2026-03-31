# Phase 2 Discussion Log

**Date:** 2026-03-31
**Phase:** 02 - Schedule Publishing

## Topics Discussed

### 1. Schedule Unit
- Decision: `단일 스케줄 + 역할 슬롯들`
- Outcome: 하나의 근무 스케줄 안에 여러 역할과 모집 인원을 담는다.

### 2. Application Unit
- Decision: `스케줄 전체 기준 신청`
- Outcome: 근무자는 특정 역할 슬롯이 아니라 스케줄 자체에 신청한다. 역할 확정은 이후 단계에서 관리자가 한다.

### 3. Status Transition
- Decision: `부분 자동화`
- Outcome: 생성 직후 기본 상태는 `recruiting`, 이후 상태 변경은 관리자가 운영하되 시스템은 기본 검증만 수행한다.

### 4. Worker Visibility
- Decision: `간단 목록`
- Outcome: 근무자 모집 목록은 날짜, 시간, 모집 가능 여부 정도의 최소 정보 위주로 노출한다.

## Next Step

- Create Phase 2 plans with `$gsd-plan-phase 2`.