# Rosty Supabase Schema Design

## 1. 목적

이 문서는 Rosty V1의 단일 홀 운영 규칙을 Supabase 테이블 구조와 RLS 기준으로 정리한다.
현재 범위는 `문서 설계`까지이며, 실제 SQL migration과 policy 적용은 후속 구현 단계에서 진행한다.

관련 문서:

- [PRD](./prd.md)
- [화면 IA](./screen-ia.md)
- [핵심 상태표](./state-tables.md)

## 2. 설계 원칙

- 앱은 단일 홀 전용이므로 `halls`, `memberships`, `current_hall` 계열 테이블은 만들지 않는다.
- 인증 기준은 `auth.users`이고, 앱 사용자 정보는 `profiles.id = auth.users.id` 1:1로 연결한다.
- 기본 쓰기 경로는 `클라이언트 직접 CRUD + RLS 검증`이다.
- 삭제보다 상태 전환을 우선한다.
- 사용자 관리와 급여 정책은 `admin`만 쓴다.
- Manager의 멤버 조회는 Admin 관리용 원본 테이블이 아니라 최소 노출 경로로 제한한다.
- 직원 초대 링크는 `1회성`으로 설계한다.
- 첫 번째 Admin 계정은 앱 바깥에서 `SQL seed 1회 부여`로 초기화한다.

## 3. 공통 enum 초안

| 이름 | 값 |
| --- | --- |
| `user_role` | `employee`, `manager`, `admin` |
| `user_status` | `profile_incomplete`, `pending_approval`, `active`, `suspended`, `deactivated` |
| `profile_gender` | `male`, `female`, `unspecified` |
| `required_gender` | `any`, `male`, `female` |
| `schedule_status` | `collecting`, `assigned`, `completed`, `cancelled` |
| `availability_collection_state` | `open`, `locked` |
| `availability_status` | `available`, `unavailable` |
| `assignment_status` | `proposed`, `confirmed`, `cancel_requested`, `cancelled`, `completed` |
| `cancellation_request_status` | `requested`, `approved`, `rejected` |
| `schedule_time_status` | `planned`, `actual_recorded`, `corrected` |
| `notification_type` | `user_approved`, `schedule_created`, `assignment_confirmed`, `cancellation_requested`, `cancellation_approved`, `cancellation_rejected` |
| `device_platform` | `ios`, `android` |

메모:

- `InvitationLink`는 별도 enum 대신 `disabled_at`, `expires_at`, `consumed_at` 조합으로 상태를 판정한다.
- `vacant`는 assignment 상태가 아니라 빈 슬롯 상태이므로 enum에 넣지 않는다.

## 4. 테이블 설계

### 4.1 `profiles`

앱 사용자 원본 테이블이다.

핵심 컬럼:

- `id uuid primary key references auth.users(id)`
- `full_name text not null`
- `phone_number text not null`
- `gender profile_gender not null default 'unspecified'`
- `role user_role not null`
- `status user_status not null`
- `approved_at timestamptz null`
- `approved_by uuid null references profiles(id)`
- `last_active_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

제약:

- 자기 자신 승인 금지는 애플리케이션 규칙으로 막고, 마지막 Admin 보호는 SQL 검증 규칙으로 추가한다.
- `role = admin`인 마지막 사용자에 대한 강등/정지/비활성은 차단한다.

RLS:

- 본인: 읽기/수정 가능
- Admin: 전체 읽기/수정 가능
- Manager: 직접 테이블 읽기 불가

### 4.2 `member_directory`

운영 목적 최소 조회용 뷰 또는 동등한 읽기 경로다.
배정 후보 탐색과 전역 검색에 필요한 최소 필드만 노출한다.

노출 필드:

- `id`
- `full_name`
- `phone_number`
- `gender`
- `role`
- `status`

규칙:

- 기본적으로 `active` 사용자만 포함한다.
- Admin은 원본 `profiles`와 `member_directory` 모두 쓸 수 있지만, Manager는 `member_directory`만 읽는다.

### 4.3 `invitation_links`

직원 초대용 1회성 링크를 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `token text unique not null`
- `target_role user_role not null default 'employee'`
- `created_by uuid not null references profiles(id)`
- `expires_at timestamptz not null`
- `consumed_by uuid null references profiles(id)`
- `consumed_at timestamptz null`
- `disabled_at timestamptz null`
- `created_at timestamptz not null default now()`

제약:

- V1에서 `target_role` 허용값은 `employee`만 사용한다.
- `consumed_at is null`인 활성 링크만 가입에 사용할 수 있다.

RLS:

- Admin: 읽기/쓰기
- 기타 사용자: 직접 접근 불가

### 4.4 `pay_policies`

홀 공통 급여 정책을 담는 싱글톤 테이블이다.

핵심 컬럼:

- `id smallint primary key`
- `default_hourly_rate numeric(10,2) not null`
- `overtime_threshold_minutes integer not null`
- `overtime_multiplier numeric(5,2) not null`
- `updated_by uuid not null references profiles(id)`
- `updated_at timestamptz not null default now()`

제약:

- `id = 1` 한 행만 허용한다.

RLS:

- Employee: 읽기 불가
- Manager: 읽기 가능
- Admin: 읽기/수정 가능

### 4.5 `pay_rates`

직원별 시급을 저장한다.

핵심 컬럼:

- `user_id uuid primary key references profiles(id)`
- `hourly_rate numeric(10,2) not null`
- `updated_by uuid not null references profiles(id)`
- `updated_at timestamptz not null default now()`

RLS:

- Employee: 본인 rate 직접 조회 불필요, 급여 계산 결과만 조회
- Manager: 읽기 불가
- Admin: 읽기/쓰기 가능

### 4.6 `slot_presets`

표준 포지션 프리셋을 데이터로 관리한다.

핵심 컬럼:

- `id uuid primary key`
- `code text unique not null`
- `position_name text not null`
- `default_headcount integer not null`
- `required_gender required_gender not null default 'any'`
- `is_required boolean not null default true`
- `sort_order integer not null`
- `is_active boolean not null default true`

RLS:

- Active 사용자: 읽기 가능
- Admin: 관리 가능
- Manager: 직접 수정 불가, 후속 필요 시 Admin 관리로 시작

### 4.7 `schedules`

행사 일정을 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `event_date date not null`
- `package_count integer not null`
- `status schedule_status not null`
- `collection_state availability_collection_state not null`
- `memo text null`
- `created_by uuid not null references profiles(id)`
- `updated_by uuid not null references profiles(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

RLS:

- Active 사용자: 읽기 가능
- Manager/Admin: 생성/수정 가능

### 4.8 `schedule_slots`

일정별 실제 배정 단위를 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `schedule_id uuid not null references schedules(id)`
- `preset_id uuid null references slot_presets(id)`
- `position_name text not null`
- `headcount integer not null`
- `required_gender required_gender not null default 'any'`
- `is_required boolean not null default true`
- `is_enabled boolean not null default true`
- `sort_order integer not null`

RLS:

- Active 사용자: 읽기 가능
- Manager/Admin: 생성/수정 가능

### 4.9 `availability_submissions`

직원의 일정 가능 여부를 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `schedule_id uuid not null references schedules(id)`
- `user_id uuid not null references profiles(id)`
- `status availability_status not null`
- `submitted_at timestamptz null`
- `updated_at timestamptz not null default now()`

제약:

- `unique(schedule_id, user_id)`

RLS:

- Employee: 본인 행 읽기/쓰기
- Manager/Admin: 전체 읽기
- 쓰기는 연결 schedule의 `collection_state = open`일 때만 허용

### 4.10 `assignments`

슬롯별 배정 초안과 확정 결과를 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `schedule_id uuid not null references schedules(id)`
- `slot_id uuid not null references schedule_slots(id)`
- `assignee_user_id uuid null references profiles(id)`
- `guest_name text null`
- `status assignment_status not null`
- `is_exception_case boolean not null default false`
- `confirmed_at timestamptz null`
- `confirmed_by uuid null references profiles(id)`
- `created_by uuid not null references profiles(id)`
- `updated_by uuid not null references profiles(id)`
- `updated_at timestamptz not null default now()`

제약:

- `assignee_user_id` 또는 `guest_name` 중 정확히 하나만 채운다.
- 동일 일정의 동일 사용자 다중 배정은 기본 금지, 예외 케이스만 `is_exception_case = true`로 허용한다.

RLS:

- Employee: 본인 `confirmed`, `cancel_requested`, `cancelled`, `completed` 상태만 읽기
- Manager/Admin: 전체 읽기/쓰기

### 4.11 `cancellation_requests`

배정 취소 요청을 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `assignment_id uuid not null references assignments(id)`
- `requested_by uuid not null references profiles(id)`
- `reason text not null`
- `status cancellation_request_status not null`
- `reviewed_by uuid null references profiles(id)`
- `reviewed_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

제약:

- assignment별 동시 진행 중 요청은 1건만 허용한다.

RLS:

- Employee: 본인 assignment에 대한 요청 생성/조회
- Manager/Admin: 전체 읽기/수정

### 4.12 `schedule_time_records`

일정 단위 예정/실제 시간을 저장한다.

핵심 컬럼:

- `schedule_id uuid primary key references schedules(id)`
- `planned_start_at timestamptz null`
- `planned_end_at timestamptz null`
- `actual_start_at timestamptz null`
- `actual_end_at timestamptz null`
- `status schedule_time_status not null`
- `updated_by uuid not null references profiles(id)`
- `updated_at timestamptz not null default now()`

RLS:

- Active 사용자: 읽기 가능
- Manager/Admin: 쓰기 가능

### 4.13 `notifications`

인앱 알림을 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `user_id uuid not null references profiles(id)`
- `type notification_type not null`
- `title text not null`
- `body text not null`
- `target_route text not null`
- `target_id uuid null`
- `is_read boolean not null default false`
- `read_at timestamptz null`
- `created_at timestamptz not null default now()`

RLS:

- 사용자 본인만 읽기/수정 가능
- 시스템 생성은 후속 migration에서 service role 경로로 연결

### 4.14 `device_tokens`

푸시 전송 대상 기기 토큰을 저장한다.

핵심 컬럼:

- `id uuid primary key`
- `user_id uuid not null references profiles(id)`
- `device_id text not null`
- `platform device_platform not null`
- `push_token text not null`
- `last_seen_at timestamptz not null default now()`
- `revoked_at timestamptz null`

제약:

- `unique(user_id, device_id)`

RLS:

- 사용자 본인만 읽기/쓰기 가능

## 5. 조회/계산 규칙

### 예상 급여

- 저장형 `pay_estimates` 테이블은 V1에서 만들지 않는다.
- `schedule_time_records`의 실제 시간과 `pay_rates` 또는 `pay_policies.default_hourly_rate`를 조합해 계산형 조회로 시작한다.
- 같은 일정에서 같은 사용자가 여러 포지션을 맡아도 시간 계산은 1회만 한다.

### 멤버 검색

- Manager는 `member_directory`만 사용한다.
- Admin 관리 화면은 `profiles` 원본 데이터를 사용한다.
- Employee는 멤버 검색 결과를 볼 수 없다.

## 6. RLS 매트릭스 요약

| 리소스 | employee | manager | admin |
| --- | --- | --- | --- |
| `profiles` | self read/update | no | full |
| `member_directory` | no | read | read |
| `invitation_links` | no | no | read/write |
| `pay_policies` | no | read | read/write |
| `pay_rates` | no | no | read/write |
| `slot_presets` | read | read | read/write |
| `schedules` | read | read/write | read/write |
| `schedule_slots` | read | read/write | read/write |
| `availability_submissions` | self read/write | read | read |
| `assignments` | own confirmed read | read/write | read/write |
| `cancellation_requests` | own read/create | read/write | read/write |
| `schedule_time_records` | read | read/write | read/write |
| `notifications` | own read/write | own read/write | own read/write |
| `device_tokens` | own read/write | own read/write | own read/write |

## 7. 후속 구현 작업

이 문서를 기준으로 다음 턴에서 바로 이어질 작업은 아래 두 가지다.

- Supabase migration SQL 초안 작성
- 정책별 RLS SQL 작성과 seed Admin 초기화 스크립트 정의