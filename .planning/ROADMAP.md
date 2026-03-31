# Roadmap: 라비에벨 웨딩홀 근무자 관리 웹 앱

## Overview

이 로드맵은 라비에벨 웨딩홀 단일 현장을 위한 내부 근무 운영 웹 앱의 v1 구현 순서를 정리한다. 핵심 목표는 관리자가 근무 스케줄을 빠르게 생성하고 모집, 신청 검토, 역할 배정, 출근 체크, 운영 현황 확인까지 한 흐름으로 관리할 수 있게 만드는 것이다. 근무자는 자신이 신청 가능한 근무, 확정된 근무와 역할, 예상 급여를 신뢰할 수 있게 확인해야 한다.

v1은 인증과 역할 분리, 스케줄 게시와 신청, 배정과 예상 급여, 출근 체크, 운영 대시보드까지를 포함한다. 실제 급여 정산과 지급, 다지점 운영, 별도 계정 체계 분리는 범위 밖이다.

## Phases

- [x] **Phase 1: Access Foundation**
- [x] **Phase 2: Schedule Publishing**
- [x] **Phase 3: Assignment And Pay Preview**
- [ ] **Phase 4: Attendance Check-In**
- [ ] **Phase 5: Operations Dashboard**

## Phase Details

### Phase 1: Access Foundation
**Goal**: 초대 기반 접근, Google 로그인, 역할 기반 접근 제어, 관리자 시급 관리 기반을 구축한다.
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, PAY-01
**Success Criteria**:
1. 관리자는 초대 링크를 발급하고 근무자는 Google 로그인으로 초대를 수락할 수 있다.
2. 시스템은 로그인 후 사용자 역할에 따라 관리자와 근무자 경로를 구분한다.
3. 관리자는 근무자별 시급을 등록하고 수정할 수 있다.
4. 인증과 권한 판단은 DB 기준으로 일관되게 동작한다.
**Plans**: 4
**Status**: Complete

### Phase 2: Schedule Publishing
**Goal**: 관리자가 날짜, 시간, 역할/인원을 포함한 근무 스케줄을 생성하고 모집 상태를 운영하며, 근무자는 모집 중인 근무를 보고 신청할 수 있게 한다.
**Depends on**: Phase 1
**Requirements**: SCHD-01, SCHD-02, SCHD-03, APPL-01, APPL-02
**Success Criteria**:
1. 관리자는 근무일, 시작 시각, 종료 시각, 역할별 모집 인원을 포함한 스케줄을 생성할 수 있다.
2. 관리자는 스케줄 상태를 모집 중, 배정 중, 확정 완료로 관리할 수 있다.
3. 근무자는 모집 중인 스케줄 목록을 확인할 수 있다.
4. 근무자는 스케줄 단위로 신청을 제출할 수 있고 중복 신청은 방지된다.
**Plans**: 3
**Status**: Complete

### Phase 3: Assignment And Pay Preview
**Goal**: 관리자가 신청자를 검토하고 역할 슬롯별로 배정 및 확정할 수 있게 하며, 근무자는 확정된 근무와 예상 급여를 확인할 수 있게 한다.
**Depends on**: Phase 2
**Requirements**: APPL-03, ASGN-01, ASGN-02, ASGN-03, PAY-02, PAY-03, PAY-04
**Plans**: 4
**Status**: Complete

### Phase 4: Attendance Check-In
**Goal**: 근무자가 위치 기반 출근 체크를 제출하고, 관리자가 근무자별 출근 상태와 지각 여부를 확인할 수 있게 한다.
**Depends on**: Phase 3
**Requirements**: ATTD-01, ATTD-02, ATTD-03
**Plans**: 2
**Status**: Pending

### Phase 5: Operations Dashboard
**Goal**: 관리자가 당일 및 예정 근무, 신청/배정/출근 상태, 운영 이상 징후를 한 화면에서 빠르게 확인할 수 있게 한다.
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03
**Plans**: 2
**Status**: Pending

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Access Foundation | 4/4 | Complete | 2026-03-31 |
| 2. Schedule Publishing | 3/3 | Complete | 2026-03-31 |
| 3. Assignment And Pay Preview | 4/4 | Complete | 2026-03-31 |
| 4. Attendance Check-In | 0/2 | Not started | - |
| 5. Operations Dashboard | 0/2 | Not started | - |

---
*Last updated: 2026-03-31 after Phase 3 execution*
