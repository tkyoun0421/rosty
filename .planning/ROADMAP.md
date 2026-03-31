# Roadmap: 라비에벨 웨딩홀 근무자 관리 웹 앱

## Overview

이 프로젝트는 웨딩홀 근무 운영 흐름을 디지털화해 관리자와 근무자가 같은 정보를 신뢰할 수 있게 만드는 v1 내부 운영 도구다. Phase 1에서는 인증과 권한, 시급 관리 기반을 만들었고, 이후 스케줄 게시, 신청, 배정, 예상 급여, 출근 체크, 운영 대시보드 순서로 확장한다.

## Phases

- [x] **Phase 1: Access Foundation**
- [ ] **Phase 2: Schedule Publishing**
- [ ] **Phase 3: Assignment And Pay Preview**
- [ ] **Phase 4: Attendance Check-In**
- [ ] **Phase 5: Operations Dashboard**

## Phase Details

### Phase 1: Access Foundation
**Goal**: 내부 인력 인증, 관리자/근무자 권한 분리, 초대 기반 온보딩, 관리자 시급 관리 기반 구축
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, PAY-01
**Success Criteria**:
1. 관리자는 초대 기반으로 근무자 계정을 생성하거나 초대 링크를 발급할 수 있다.
2. 사용자는 Google 로그인을 통해 가입 및 로그인할 수 있다.
3. 관리자와 근무자는 역할에 따라 접근 권한이 구분된다.
4. 관리자는 근무자별 시급을 등록하고 수정할 수 있다.
**Plans**: 4
**Status**: Complete

### Phase 2: Schedule Publishing
**Goal**: 관리자가 스케줄을 게시하고 근무자가 모집 중인 스케줄을 보고 신청할 수 있게 한다.
**Depends on**: Phase 1
**Requirements**: SCHD-01, SCHD-02, SCHD-03, APPL-01, APPL-02
**Success Criteria**:
1. 관리자는 날짜, 시작 시각, 종료 시각, 역할별 모집 인원을 포함한 근무 스케줄을 생성할 수 있다.
2. 관리자는 스케줄 상태를 모집 중, 배정 중, 확정 완료로 운영할 수 있다.
3. 근무자는 모집 중인 근무 스케줄 목록을 확인할 수 있다.
4. 근무자는 특정 스케줄에 근무 신청을 제출할 수 있다.
**Plans**: 3
Plans:
- [ ] 02-01-PLAN.md - Minimal schedule persistence, atomic admin creation path, and create-first admin route
- [ ] 02-02-PLAN.md - Admin schedule listing and lightweight status management
- [ ] 02-03-PLAN.md - Worker recruiting list and one-application-per-schedule submit flow
**Status**: Context gathered, planning next

### Phase 3: Assignment And Pay Preview
**Goal**: 신청 검토, 역할별 배정, 배정 확정, 예상 급여 계산과 근무자 확인 흐름 제공
**Depends on**: Phase 2
**Requirements**: APPL-03, ASGN-01, ASGN-02, ASGN-03, PAY-02, PAY-03, PAY-04
**Plans**: 3
**Status**: Pending

### Phase 4: Attendance Check-In
**Goal**: 위치 기반 출근 체크 제출과 관리자 출근 상태 확인 흐름 제공
**Depends on**: Phase 3
**Requirements**: ATTD-01, ATTD-02, ATTD-03
**Plans**: 2
**Status**: Pending

### Phase 5: Operations Dashboard
**Goal**: 당일 및 예정 근무, 이상 징후, 배정/출근 현황을 한 화면에서 확인하는 관리자 대시보드 제공
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03
**Plans**: 2
**Status**: Pending

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Access Foundation | 4/4 | Complete | 2026-03-31 |
| 2. Schedule Publishing | 0/3 | Context gathered | - |
| 3. Assignment And Pay Preview | 0/3 | Not started | - |
| 4. Attendance Check-In | 0/2 | Not started | - |
| 5. Operations Dashboard | 0/2 | Not started | - |

---
*Last updated: 2026-03-31 after Phase 1 completion and Phase 2 discussion*
