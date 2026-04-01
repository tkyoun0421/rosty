# Requirements: 라비에벨 웨딩홀 근무자 관리 웹 앱

**Defined:** 2026-03-31
**Core Value:** 관리자가 웨딩홀 근무를 빠르게 확정하고 근무자는 자신의 확정 근무, 역할, 예상 급여를 신뢰할 수 있게 확인할 수 있어야 한다.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: 관리자는 초대 기반으로 근무자 계정을 생성하거나 초대 링크를 발급할 수 있다.
- [ ] **AUTH-02**: 사용자는 Google 로그인을 통해 가입 및 로그인할 수 있다.
- [ ] **AUTH-03**: 시스템은 사용자 역할에 따라 관리자와 근무자의 접근 권한을 구분한다.

### Schedule Setup

- [x] **SCHD-01**: 관리자는 근무일의 날짜, 시작 시각, 종료 시각을 포함한 근무 스케줄을 생성할 수 있다.
- [x] **SCHD-02**: 관리자는 근무 스케줄별로 필요한 역할과 모집 인원을 설정할 수 있다.
- [x] **SCHD-03**: 관리자는 모집 중, 배정 중, 확정 완료 등 근무 스케줄 상태를 관리할 수 있다.

### Applications

- [x] **APPL-01**: 근무자는 모집 중인 근무 스케줄 목록을 확인할 수 있다.
- [x] **APPL-02**: 근무자는 특정 근무 스케줄에 근무 신청을 제출할 수 있다.
- [x] **APPL-03**: 관리자는 각 근무 스케줄에 대한 신청자 목록과 신청 상태를 확인할 수 있다.

### Assignment

- [x] **ASGN-01**: 관리자는 신청자를 바탕으로 역할별 근무자를 배정할 수 있다.
- [x] **ASGN-02**: 관리자는 배정 결과를 확정해 근무자에게 최종 근무 정보를 제공할 수 있다.
- [x] **ASGN-03**: 근무자는 자신에게 확정된 근무 일정과 역할을 확인할 수 있다.

### Payroll Preview

- [ ] **PAY-01**: 관리자는 근무자별 시급을 등록하고 수정할 수 있다.
- [x] **PAY-02**: 시스템은 확정된 근무 정보를 기준으로 근무자별 예상 급여를 계산할 수 있다.
- [x] **PAY-03**: 시스템은 9시간 초과 근무분에 대해 기본 시급의 1.5배를 적용해 예상 급여를 계산할 수 있다.
- [x] **PAY-04**: 근무자는 자신의 확정 근무에 대한 예상 급여를 확인할 수 있다.

### Attendance

- [x] **ATTD-01**: 근무자는 자신의 확정 근무에 대해 위치 기반 출근 체크를 제출할 수 있다.
- [x] **ATTD-02**: 시스템은 출근 체크 시점의 위치 정보를 저장해 현장 출근 검증에 활용할 수 있다.
- [x] **ATTD-03**: 관리자는 근무자별 출근 상태와 지각 여부를 확인할 수 있다.

### Operations Dashboard

- [ ] **DASH-01**: 관리자는 당일 및 예정 근무 현황을 대시보드에서 확인할 수 있다.
- [x] **DASH-02**: 관리자는 근무 스케줄별 신청 수, 배정 상태, 출근 상태를 한 화면에서 확인할 수 있다.
- [x] **DASH-03**: 관리자는 지각 여부를 포함한 운영 이상 징후를 빠르게 확인할 수 있다.

## v2 Requirements

### Assignment Intelligence

- **AINT-01**: 시스템은 신청 이력과 역할 적합도를 바탕으로 자동 배정 후보를 추천할 수 있다.

### Communication

- **COMM-01**: 시스템은 배정 확정과 변경 사항을 실시간 알림으로 전달할 수 있다.

## Out of Scope

| Feature | Reason |
|---------|--------|
| 실제 급여 정산 및 지급 처리 | v1의 핵심은 예상 급여의 투명한 안내이며, 정산 시스템까지 포함하면 운영 범위를 과도하게 넓힌다. |
| 다지점 및 다중 웨딩홀 운영 | 현재는 라비에벨 웨딩홀 단일 현장 운영 최적화가 우선이다. |
| 별도 관리자/근무자 계정 체계 분리 | 동일 계정 체계와 역할 기반 권한으로 v1 요구를 충족할 수 있다. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| SCHD-01 | Phase 2 | Complete |
| SCHD-02 | Phase 2 | Complete |
| SCHD-03 | Phase 2 | Complete |
| APPL-01 | Phase 2 | Complete |
| APPL-02 | Phase 2 | Complete |
| APPL-03 | Phase 3 | Complete |
| ASGN-01 | Phase 3 | Complete |
| ASGN-02 | Phase 3 | Complete |
| ASGN-03 | Phase 3 | Complete |
| PAY-01 | Phase 1 | Complete |
| PAY-02 | Phase 3 | Complete |
| PAY-03 | Phase 3 | Complete |
| PAY-04 | Phase 3 | Complete |
| ATTD-01 | Phase 4 | Complete |
| ATTD-02 | Phase 4 | Complete |
| ATTD-03 | Phase 4 | Complete |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Complete |
| DASH-03 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after Phase 4 Plan 03 execution*
