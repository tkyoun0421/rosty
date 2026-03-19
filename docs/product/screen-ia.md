# Rosty Screen IA

## 1. 목적과 전제

이 문서는 Rosty V1의 화면 목록과 진입 경로를 정리한다.
세부 탭/스택 구현을 고정하는 문서는 아니며, 각 화면이 어떤 상태와 역할에서 열리는지만 정의한다.

전제:

- 앱은 라비에벨 웨딩홀 단일 홀 전용이다.
- `Hall Selector`, `플랫폼 운영`, `Super Admin` 화면은 없다.
- 활성 사용자만 메인 앱 영역에 진입한다.
- 직원 초대 링크는 `Login`에 invite 토큰 컨텍스트를 싣고 진입할 수 있다.

## 2. 진입 상태 화면

| 화면 | 진입 조건 | 다음 경로 |
| --- | --- | --- |
| `Splash` | 앱 시작, 세션 복구 시도 | Login 또는 상태 분기 화면 |
| `Login` | 세션 없음 | Profile Setup 또는 상태 분기 |
| `Profile Setup` | `profile_incomplete` | Approval Waiting |
| `Approval Waiting` | `pending_approval` | Active 승인 후 역할별 Home |
| `Suspended` | `suspended` | 로그아웃 |

메모:

- 직원 초대 링크로 열린 `Login`은 invite 토큰을 유지한 채 Google 로그인 이후 `Profile Setup`까지 연결된다.
- 신규 직원의 `Profile Setup` 제출은 유효한 invite 토큰이 있을 때만 완료된다.

## 3. Employee 영역

### 3.1 주요 화면

| 화면 | 역할 | 주요 목적 | 대표 진입 경로 |
| --- | --- | --- | --- |
| `Employee Home` | employee | 다가오는 내 배정, 모집 중 일정 요약 | 로그인 완료 후 기본 진입 |
| `Schedule List` | employee | 공개 일정 목록 조회 | Home, Search 결과 |
| `Schedule Detail` | employee | 본인 응답 상태와 일정 기본 정보 확인 | Schedule List |
| `My Assignments` | employee | 확정된 본인 배정 목록 조회 | Home |
| `Assignment Detail` | employee | 본인 배정 상세와 취소 요청 진입 | My Assignments |
| `My Payroll` | employee | 본인 예상 급여 조회 | Home, Settings 보조 링크 |
| `Notifications` | employee | 미읽음/전체 알림 조회 | Home, 공통 헤더 |
| `Settings` | employee | 프로필 수정, 로그아웃, 탈퇴 | 공통 진입 |

### 3.2 흐름 메모

- `Schedule Detail`에서는 본인 응답 생성/수정으로 이동한다.
- `Assignment Detail`에서만 취소 요청을 생성할 수 있다.
- `My Assignments`는 `다가오는 일정`, `지난 일정` 탭으로 나뉜다.

## 4. Manager/Admin 운영 영역

### 4.1 공통 운영 화면

| 화면 | 역할 | 주요 목적 | 대표 진입 경로 |
| --- | --- | --- | --- |
| `Manager Home` | manager, admin | 운영 큐와 빠른 액션 제공 | 로그인 완료 후 기본 진입 |
| `Schedule Create/Edit` | manager, admin | 일정 생성, 슬롯 프리셋 조정 | Manager Home, Schedule Detail |
| `Schedule Detail` | manager, admin | 일정 요약, 운영 상태 확인, 다음 액션 진입 | Schedule List, Manager Home |
| `Availability Overview` | manager, admin | 포지션별 가능자와 보조 현황 확인 | Schedule Detail |
| `Assignment Workspace` | manager, admin | 초안 배정, 게스트 배정, 전체 확정 | Schedule Detail, Availability Overview |
| `Cancellation Queue` | manager, admin | 취소 요청 승인/거절 | Manager Home, Notifications |
| `Work Time` | manager, admin | 예정/실제 근무 시간 기록 | Schedule Detail, Manager Home |
| `Notifications` | manager, admin | 운영 관련 알림 조회 | Home, 공통 헤더 |
| `Settings` | manager, admin | 프로필 수정, 로그아웃, 탈퇴 | 공통 진입 |

### 4.2 흐름 메모

- `Schedule Detail`은 편집 화면이 아니라 운영 허브 역할을 한다.
- 신청 현황, 배정, 시간 기록은 각각 전용 화면으로 이동해 처리한다.
- `admin`도 운영 홈 구조는 `manager`와 동일하게 시작한다.

## 5. Admin 전용 영역

| 화면 | 역할 | 주요 목적 | 대표 진입 경로 |
| --- | --- | --- | --- |
| `Members` | admin | 승인 대기/활성/정지 사용자 관리 | Manager Home 보조 진입, Settings 보조 진입 |
| `Invitation` | admin | 직원 초대 링크 발급/재발급 | Members |
| `Pay Policy` | admin | 홀 기본 시급, 초과근무 정책, 직원별 시급 관리 | Members, Manager Home 보조 진입 |
| `Team Payroll` | admin, manager | 전체 직원 예상 급여 조회 | Manager Home, Pay Policy |

메모:

- `Members` 안에서 승인, 역할 변경, 정지/복구가 이루어진다.
- `Invitation`은 활성, 사용됨, 만료, 비활성 링크를 함께 보여주고 재발급 시 기존 활성 링크를 비활성 이력으로 남긴다.
- `Invitation`은 방금 발급한 링크와 현재 활성 링크를 바로 복사하거나 네이티브 공유 시트로 전달할 수 있다.
- 마지막 Admin 보호 규칙은 `Members`에서 반드시 반영된다.

## 6. 공통 보조 화면

| 화면 | 역할 | 주요 목적 | 대표 진입 경로 |
| --- | --- | --- | --- |
| `Global Search` | active 전 역할 | 일정, 내 배정, 멤버 검색 | Home, 공통 헤더 |
| `Notifications` | active 전 역할 | 미읽음/전체 알림 목록 | Home, 공통 헤더 |
| `Settings` | active 전 역할 | 프로필, 세션, 탈퇴 관리 | 공통 하단 또는 헤더 진입 |

## 7. 화면 연결 원칙

- 홈은 요약과 진입 중심 화면이다.
- 편집 액션은 가능한 한 전용 작업 화면에서 수행한다.
- 목록 화면은 `상단 탭 + 간단 칩` 필터 구조를 공유한다.
- 직원은 개인 정보 중심 화면만 본다.
- 운영진은 운영 큐와 작업 화면으로 빠르게 이동하는 흐름을 우선한다.

## 8. 제외된 화면

다음 화면은 V1 IA에 포함하지 않는다.

- Hall Selector
- Platform Home
- Hall Request Queue
- Hall Directory
- Guest Contact Detail
- Notification Settings




