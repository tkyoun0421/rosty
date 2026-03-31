# Roadmap: 라비에벨 웨딩홀 근무자 관리 웹 앱

## Overview

이 프로젝트는 웨딩홀 근무 운영의 핵심 흐름을 끊김 없이 연결하는 내부 도구를 만드는 작업이다. 먼저 초대 기반 인증과 역할 권한을 세우고, 관리자용 스케줄 생성과 모집 공고를 만든 뒤, 신청 접수와 배정 확정, 예상 급여 계산, 위치 기반 출근 체크, 운영 대시보드까지 순차적으로 완성한다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Access Foundation** - 초대 기반 로그인과 역할 권한, 기본 운영 인력 데이터를 준비한다.
- [ ] **Phase 2: Schedule Publishing** - 관리자가 근무 스케줄을 생성하고 근무자가 모집 공고를 보고 신청할 수 있게 만든다.
- [ ] **Phase 3: Assignment And Pay Preview** - 신청 검토, 역할 배정, 확정 공지, 예상 급여 계산 흐름을 완성한다.
- [ ] **Phase 4: Attendance Check-In** - 위치 기반 출근 체크와 출근 상태 확인 흐름을 구현한다.
- [ ] **Phase 5: Operations Dashboard** - 운영 현황과 이상 징후를 빠르게 확인할 수 있는 관리자 대시보드를 완성한다.

## Phase Details

### Phase 1: Access Foundation
**Goal**: 내부 인력만 접근 가능한 인증 체계와 관리자/근무자 권한 구분, 시급 관리의 기반을 만든다.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, PAY-01
**Success Criteria** (what must be TRUE):
  1. 관리자는 초대 기반으로 근무자 계정을 등록하거나 초대 링크를 발급할 수 있다.
  2. 사용자는 Google 로그인을 통해 가입 및 로그인할 수 있다.
  3. 관리자와 근무자는 같은 계정 체계를 쓰되 역할에 따라 접근 가능한 화면과 기능이 구분된다.
  4. 관리자는 근무자별 시급을 저장하고 수정할 수 있다.
**Plans**: 4 plans

Plans:
- [ ] 01-01: Phase 1 테스트 스캐폴드와 공통 인증 계약, 환경 설정을 준비한다.
- [ ] 01-02: Supabase 검증 경로를 확정하고 SSR Google 로그인, 세션, 프록시 흐름을 구현한다.
- [ ] 01-03: 초대 기반 가입, JWT 역할 클레임, RLS, 서버 권한 분기를 완성한다.
- [ ] 01-04: 관리자용 근무자 시급 관리 UI와 저장 흐름을 추가한다.

### Phase 2: Schedule Publishing
**Goal**: 관리자가 근무 스케줄을 열고 근무자가 신청할 수 있는 모집 흐름을 제공한다.
**Depends on**: Phase 1
**Requirements**: SCHD-01, SCHD-02, SCHD-03, APPL-01, APPL-02
**Success Criteria** (what must be TRUE):
  1. 관리자는 날짜, 시간, 역할, 모집 인원을 포함한 근무 스케줄을 생성하고 수정할 수 있다.
  2. 각 근무 스케줄은 모집 중, 배정 중, 확정 완료 상태로 관리된다.
  3. 근무자는 현재 모집 중인 근무 스케줄 목록을 확인할 수 있다.
  4. 근무자는 특정 근무 스케줄에 신청을 제출할 수 있다.
**Plans**: 3 plans

Plans:
- [ ] 02-01: 관리자용 근무 스케줄 생성 및 상태 관리 기능을 구현한다.
- [ ] 02-02: 근무자용 모집 스케줄 목록과 상세 조회 화면을 구현한다.
- [ ] 02-03: 근무 신청 제출 및 저장 흐름을 구현한다.

### Phase 3: Assignment And Pay Preview
**Goal**: 신청 검토부터 역할 배정, 최종 확정, 예상 급여 노출까지 이어지는 핵심 운영 흐름을 완성한다.
**Depends on**: Phase 2
**Requirements**: APPL-03, ASGN-01, ASGN-02, ASGN-03, PAY-02, PAY-03, PAY-04
**Success Criteria** (what must be TRUE):
  1. 관리자는 스케줄별 신청자 목록과 신청 상태를 확인할 수 있다.
  2. 관리자는 신청자를 역할별로 배정하고 최종 확정할 수 있다.
  3. 근무자는 자신에게 확정된 근무 일정과 역할을 확인할 수 있다.
  4. 시스템은 근무자별 시급과 연장수당 규칙을 반영해 예상 급여를 계산한다.
  5. 근무자는 자신의 확정 근무에 대한 예상 급여를 확인할 수 있다.
**Plans**: 3 plans

Plans:
- [ ] 03-01: 관리자용 신청자 검토와 역할 배정 UI를 구현한다.
- [ ] 03-02: 배정 확정과 근무자 확정 정보 조회 흐름을 구현한다.
- [ ] 03-03: 예상 급여 계산 규칙과 표시 UI를 구현한다.

### Phase 4: Attendance Check-In
**Goal**: 확정된 근무에 대해 현장 출근 여부를 위치 기반으로 기록하고 확인할 수 있게 한다.
**Depends on**: Phase 3
**Requirements**: ATTD-01, ATTD-02, ATTD-03
**Success Criteria** (what must be TRUE):
  1. 근무자는 자신의 확정 근무에 대해 위치 기반 출근 체크를 제출할 수 있다.
  2. 시스템은 출근 체크 시점의 위치 정보를 저장하고 검증에 활용할 수 있다.
  3. 관리자는 근무자별 출근 상태와 지각 여부를 확인할 수 있다.
**Plans**: 2 plans

Plans:
- [ ] 04-01: 근무자용 위치 기반 출근 체크 제출 흐름을 구현한다.
- [ ] 04-02: 관리자용 출근 상태 및 지각 확인 화면을 구현한다.

### Phase 5: Operations Dashboard
**Goal**: 운영자가 당일 근무 현황과 이상 징후를 한 화면에서 빠르게 파악할 수 있게 한다.
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. 관리자는 당일 및 예정 근무 현황을 대시보드에서 확인할 수 있다.
  2. 관리자는 스케줄별 신청 수, 배정 상태, 출근 상태를 한 화면에서 볼 수 있다.
  3. 관리자는 지각 여부를 포함한 운영 이상 징후를 빠르게 식별할 수 있다.
**Plans**: 2 plans

Plans:
- [ ] 05-01: 운영 지표와 근무 현황 요약 카드 및 목록을 구현한다.
- [ ] 05-02: 지각 및 운영 이상 징후 강조 표시를 포함한 관리자 대시보드를 완성한다.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Access Foundation | 0/4 | Not started | - |
| 2. Schedule Publishing | 0/3 | Not started | - |
| 3. Assignment And Pay Preview | 0/3 | Not started | - |
| 4. Attendance Check-In | 0/2 | Not started | - |
| 5. Operations Dashboard | 0/2 | Not started | - |



