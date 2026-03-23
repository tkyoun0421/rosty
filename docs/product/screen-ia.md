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
- `deactivated` 계정은 세션이 남아 있어도 로그인 셸로 되돌아가며 메인 앱 영역에 재진입할 수 없다.

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
- 첫 shipped `Schedule List/Detail` slice는 tracked scheduling schema를 읽는 공통 read-only 화면으로 시작한다.
- 현재 shipped `Schedule List`는 status tab, collection chip, date-range chip, local search로 현재 목록을 다시 좁혀 볼 수 있다.
- 첫 shipped `Availability` slice는 employee가 `Schedule Detail` 안에서 자신의 `available`/`unavailable` 응답만 제출/수정한다.
- 첫 shipped `Availability Overview` slice는 manager/admin이 slot별 available/support 후보와 vacancy를 읽는 read-only 화면으로 시작한다.
- `Assignment Detail`에서만 취소 요청을 생성할 수 있다.
- 현재 shipped `Assignment Detail`은 schedule-level work time도 read-only로 함께 보여준다.
- `My Assignments`는 `다가오는 일정`, `지난 일정` 탭으로 나뉜다.
- 첫 shipped `My Assignments` slice는 shared scheduling read schema를 기준으로 같은 일정의 다중 포지션을 하나의 일정 카드로 묶어 보여준다.
- 현재 shipped `My Assignments`는 `upcoming / past` 탭, status chip, local search, sort chip으로 현재 목록을 다시 좁혀 볼 수 있다.
- 첫 shipped `Assignment Detail` slice는 grouped schedule 안의 포지션별 assignment를 보여주고, `confirmed` 상태 포지션에만 개별 취소 요청을 보낸다.
- 첫 shipped `My Payroll` slice는 shared payroll snapshot을 현재 사용자 기준으로만 필터링해서 보여준다.

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
- 첫 shipped `Availability Collection` toggle slice는 `Schedule Detail`에서 manager/admin이 collecting schedule의 모집 상태를 열고 잠근다.
- 첫 shipped `Schedule Create/Edit` slice는 tracked slot preset baseline에서 새 일정을 만들고 collecting schedule만 수정한다.
- 첫 shipped `Schedule Detail` interruption slice는 manager/admin이 collecting 또는 assigned schedule을 cancelled로 닫을 수 있게 한다.
- 첫 shipped `Assignment Workspace` slice는 slot-level draft save/clear, duplicate-assignee exception confirm, schedule confirm을 먼저 다룬다.
- 첫 shipped `Work Time` slice는 schedule 단위 planned/actual start/end 저장과 assigned schedule completion까지 먼저 다룬다.
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
- `Members`는 deactivated 계정을 별도 read-only 섹션으로도 보여준다.
- 현재 shipped `Members`는 status top tab과 role chip으로 현재 목록을 다시 좁혀 볼 수 있다.
- 현재 shipped `Members`는 local search로 이름, 전화번호, 역할 기준으로도 현재 목록을 다시 좁혀 볼 수 있다.
- `Invitation`은 활성, 사용됨, 만료, 비활성 링크를 함께 보여주고 재발급 시 기존 활성 링크를 비활성 이력으로 남긴다.
- Invitation은 방금 발급한 링크와 현재 활성 링크를 바로 복사하거나 네이티브 공유 시트로 전달할 수 있다.
- Pay Policy는 Members와 Manager Home에서 바로 열 수 있고, 직원별 override를 비우고 저장하면 홀 기본 시급 fallback으로 복귀한다.
- 첫 shipped `Cancellation Queue` slice는 pending review와 reviewed history 탭, 그리고 approve/reject review를 먼저 다룬다.
- 첫 shipped `Team Payroll` slice는 payroll 계산 규칙을 먼저 보여주는 read-only 화면이며, tracked scheduling schema가 landing 되기 전까지는 deterministic seed snapshot을 사용한다.
- 마지막 Admin 보호 규칙은 `Members`에서 반드시 반영된다.

## 6. 공통 보조 화면

| 화면 | 역할 | 주요 목적 | 대표 진입 경로 |
| --- | --- | --- | --- |
| `Global Search` | active 전 역할 | 일정, 내 배정, 멤버 검색 | Home, 공통 헤더 |
| `Notifications` | active 전 역할 | 미읽음/전체 알림 목록 | Home, 공통 헤더 |
| `Settings` | active 전 역할 | 프로필, 세션, 탈퇴 관리 | 공통 하단 또는 헤더 진입 |

메모:

- 첫 shipped `Notifications` slice는 unread/all inbox와 cancellation flow 기반 알림만 먼저 다룬다.
- 현재 shipped staffing notifications는 `user_approved`, `schedule_created`, `assignment_confirmed`, cancellation 알림까지 포함한다.
- 첫 shipped `Settings` slice는 core profile fields 수정, sign-out, self deactivation, app info를 먼저 다룬다.
- self deactivation은 `다가오는 confirmed 배정`이 남아 있으면 차단된다.

## 7. 화면 연결 원칙

- 홈은 요약과 진입 중심 화면이다.
- 편집 액션은 가능한 한 전용 작업 화면에서 수행한다.
- 목록 화면은 `상단 탭 + 간단 칩` 필터 구조를 공유한다.
- 첫 shipped `Global Search` slice는 schedules, 내 assignments, role-gated member results를 한 화면에서 보여준다.
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
