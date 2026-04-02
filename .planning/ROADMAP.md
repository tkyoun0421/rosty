# Roadmap: 라비에벨 웨딩홀 근무자 관리 웹 앱

## Overview

이 로드맵은 라비에벨 웨딩홀 단일 현장을 위한 내부 근무 운영 웹 앱의 v1 구현 순서를 정리한다. 핵심 목표는 관리자가 근무 스케줄을 빠르게 생성하고 모집, 신청 검토, 역할 배정, 출근 체크, 운영 현황 확인까지 한 흐름으로 관리할 수 있게 만드는 것이다. 근무자는 자신이 신청 가능한 근무, 확정된 근무와 역할, 예상 급여를 신뢰할 수 있게 확인해야 한다.

v1은 인증과 역할 분리, 스케줄 게시와 신청, 배정과 예상 급여, 출근 체크, 운영 대시보드, 관리자 초대 라우트 보호, freshness gap closure, 검증 증빙 정합화까지를 포함한다. 실제 급여 정산과 지급, 다지점 운영, 별도 계정 체계 분리는 범위 밖이다.

## Phases

- [x] **Phase 1: Access Foundation**
- [x] **Phase 2: Schedule Publishing**
- [x] **Phase 3: Assignment And Pay Preview**
- [x] **Phase 4: Attendance Check-In**
- [x] **Phase 5: Operations Dashboard**
- [x] **Phase 6: Admin Invite Route Guard**
- [ ] **Phase 7: Application Admin Freshness**
- [ ] **Phase 8: Pay Preview Freshness**
- [ ] **Phase 9: Verification Evidence Reconciliation**

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
**Plans**: 3
Plans:
- [x] 04-01-PLAN.md - 출근 체크 백엔드 계약, 시간 규칙, 지오펜스 검증 기준을 고정한다.
- [x] 04-02-PLAN.md - 근무자 확정 근무 화면에 출근 상태와 위치 제출 UI를 추가한다.
- [x] 04-03-PLAN.md - 기존 관리자 스케줄 상세 흐름에 스케줄 중심 출근/지각 검토를 확장한다.
**Status**: Complete

### Phase 5: Operations Dashboard
**Goal**: 관리자가 당일 및 예정 근무, 신청/배정/출근 상태, 운영 이상 징후를 한 화면에서 빠르게 확인할 수 있게 한다.
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03
**Plans**: 3
Plans:
- [x] 05-01-PLAN.md - 대시보드 읽기 계약, anomaly helper, cache tag, 집계 admin query slice를 정의한다.
- [x] 05-02-PLAN.md - `/admin` 운영 대시보드 흐름, 스케줄 카드, 라우트 연결을 구현한다.
- [x] 05-03-PLAN.md - 스케줄, 배정, 출근 mutation에서 대시보드 cache tag를 revalidate한다.
**Status**: Complete

### Phase 6: Admin Invite Route Guard
**Goal**: 관리자 초대 진입점을 route-level admin authorization 뒤로 옮겨 non-admin 세션이 초대 관리를 열 수 없게 한다.
**Depends on**: Phase 5
**Requirements**: AUTH-01, AUTH-03
**Gap Closure**: `/admin/invites` 인증 하드닝 감사 갭을 닫는다.
**Plans**: 2
Plans:
- [x] 06-01-PLAN.md - admin allow, worker deny, thin-route wiring에 대한 failing-first 회귀 테스트를 만든다.
- [x] 06-02-PLAN.md - `/admin/invites`에 `requireAdminUser`를 적용하고 thin route가 guarded flow를 await 하도록 바꾼다.
**Status**: Complete

### Phase 7: Application Admin Freshness
**Goal**: 작업자 지원(write) 이후 관리자 스케줄 상세와 운영 대시보드 읽기가 최신 지원 상태를 반영하도록 revalidate한다.
**Depends on**: Phase 5
**Requirements**: APPL-02, APPL-03, DASH-02
**Gap Closure**: worker apply flow와 admin read 사이의 freshness audit gap을 닫는다.
**Plans**: 2
Plans:
- [ ] 07-01-PLAN.md - `submitScheduleApplication`의 admin freshness regression을 failing-first로 고정한다.
- [ ] 07-02-PLAN.md - 성공한 apply에만 admin detail/dashboard tag invalidation이 일어나도록 submit wrapper를 수정한다.
**Status**: Planned

### Phase 8: Pay Preview Freshness
**Goal**: 관리자 시급 변경(write) 이후 근무자 확정 근무/예상 급여 읽기가 최신 값을 반영하도록 revalidate한다.
**Depends on**: Phase 5
**Requirements**: PAY-01, PAY-02, PAY-04
**Gap Closure**: admin rate update와 worker pay preview 사이의 freshness audit gap을 닫는다.
**Plans**: 0
**Status**: Planned

### Phase 9: Verification Evidence Reconciliation
**Goal**: 누락된 verification artifact를 보강하고 오래된 milestone evidence를 현재 코드베이스 기준으로 다시 맞춘다.
**Depends on**: Phase 8
**Requirements**: SCHD-01, SCHD-02, SCHD-03, APPL-01
**Gap Closure**: milestone audit에서 지적된 Phase 02 verification 누락과 stale evidence 문제를 정리한다.
**Plans**: 0
**Status**: Planned

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Access Foundation | 4/4 | Complete | 2026-03-31 |
| 2. Schedule Publishing | 3/3 | Complete | 2026-03-31 |
| 3. Assignment And Pay Preview | 4/4 | Complete | 2026-03-31 |
| 4. Attendance Check-In | 3/3 | Complete | 2026-04-02 |
| 5. Operations Dashboard | 3/3 | Complete | 2026-04-01 |
| 6. Admin Invite Route Guard | 2/2 | Complete | 2026-04-02 |
| 7. Application Admin Freshness | 0/2 | Planned | - |
| 8. Pay Preview Freshness | 0/0 | Planned | - |
| 9. Verification Evidence Reconciliation | 0/0 | Planned | - |

---
*Last updated: 2026-04-03 after Phase 07 planning and roadmap text repair*
