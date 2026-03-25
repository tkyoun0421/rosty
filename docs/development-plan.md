# 개발 마스터 플랜

## 목적

이 문서는 현재 저장소의 유일한 active plan이다.

- 새 기능을 시작할 때마다 별도 plan 파일이나 plan 폴더를 만들지 않는다.
- 구현 순서, 선행조건, 완료조건은 이 문서 하나에서 계속 갱신한다.
- 이미 삭제한 예전 slice별 계획 문서는 더 이상 기준 문서로 쓰지 않는다.

## 운영 원칙

1. 실서비스 검증을 막는 blocker를 먼저 푼다.
2. `지금 repo 안에서 가능한 일`과 `외부 환경이 필요한 일`을 명확히 나눈다.
3. 다음 작업을 바로 집을 수 있도록 각 항목을 가능한 한 실행 단위로 쪼갠다.
4. 새 작업을 시작하면 이 문서와 `WORKLOG.md`를 먼저 갱신한다.

## 상태 표기

- `진행중`: 지금 바로 착수하거나 이미 잠근 항목
- `완료`: 구현과 기본 검증이 끝난 항목
- `준비됨`: repo 안에서 바로 구현 가능
- `차단됨`: 실 Supabase, 실제 auth user, 디바이스 QA, 의존성 승인 같은 외부 조건 필요
- `선택`: 지금 당장 안 해도 되지만 이후 품질/운영성 개선에 유효

## 남은 작업 순서

### 1. 실 백엔드 전환

상태: `차단됨`

목표:

- seeded fallback에 기대는 주요 route를 real Supabase read/write로 전환한다.

세부 단계:

1. tracked scheduling/payroll migration을 real Supabase에 적용
2. tracked settings, availability, assignment, cancellation, notifications migration을 real Supabase에 적용
3. first admin bootstrap을 실제 auth user에 실행
4. live data 기준으로 핵심 route smoke QA 재실행

완료 조건:

- assignments/payroll/settings/notifications route가 seeded fallback 없이 live project에서 동작
- 실제 admin 계정이 존재

### 2. 네이티브 Google OAuth QA

상태: `차단됨`

목표:

- Expo Go가 아닌 dev build/standalone에서 real Google OAuth 왕복을 검증한다.

세부 단계:

1. dev build 또는 standalone 빌드 준비
2. `rosty://auth/callback` 복귀 확인
3. 로그인 후 session/profile route 분기 확인

완료 조건:

- 브라우저 dead-end 없이 앱으로 복귀
- active/pending/suspended 흐름이 실제 계정으로 확인됨

### 3. 푸시 등록 및 푸시 발송

상태: `차단됨`
차단 이유: 구현 전 의존성/권한 승인 필요

목표:

- inbox 알림을 push delivery까지 연결한다.

세부 단계:

1. `device_tokens` schema 추가
2. 앱의 push permission / token registration 구현
3. 기존 notification event별 push delivery 시도 추가
4. `Settings`의 placeholder status를 실제 상태로 교체

완료 조건:

- 로그인 사용자가 device token을 등록
- 주요 inbox event가 push도 시도

### 4. Members Backend Hardening

상태: `완료`

목표:

- 현재 client-side sequential bulk member action을 제한 RPC 기반으로 옮겨서 더 안전하고 일관되게 만든다.

#### 4-1. Bulk Member RPC 추가

상태: `완료`

세부 단계:

1. `admin_manage_members_bulk(...)` 같은 제한 RPC 추가
2. bulk approve / suspend / reactivate / change-role를 한 경로로 수렴
3. empty input, duplicate id, invalid action 같은 기본 검증 추가
4. 기존 `admin_manage_member(...)` 검증과 마지막 admin 보호 규칙을 그대로 재사용

완료 조건:

- bulk member action이 client loop가 아니라 RPC 1회 호출로 수행

#### 4-2. 앱 bulk action 연결

상태: `완료`

세부 단계:

1. bulk API client 추가
2. `Members` bulk action card를 새 bulk RPC로 연결
3. invalidate / self-session refresh를 bulk 대상 전체 기준으로 정리
4. partial failure 메시지 또는 atomic failure 메시지 정책 확정

완료 조건:

- 현재 `Members`의 bulk action UI가 batch RPC를 사용

#### 4-3. 검증 강화

상태: `완료`

세부 단계:

1. migration artifact test 추가
2. bulk API client test 추가
3. 필요하면 hook/mutation 경계 테스트 추가

완료 조건:

- bulk member hardening이 regression으로 잠겨 있음

### 5. Members Admin 추가 폴리시

상태: `준비됨`

목표:

- 현재 broad한 `Members` 기능 위에 운영 편의성을 더한다.

후속 후보:

- richer audit history
- bulk role-change confirmation / result summary polish
- admin-side restore or review affordance

### 6. Search / Discovery 개선

상태: `준비됨`

후속 후보:

- ranking 보강
- saved search state
- query와 chip state persistence

### 7. Scheduling / Staffing 개선

상태: `준비됨`

후속 후보:

- slot preset management
- assignment workspace ergonomics
- queue/list/search polish

### 8. Payroll 개선

상태: `준비됨`

후속 후보:

- 다운로드형 export
- saved period preset
- richer operator summary view

## 지금 바로 다음 구현

다음 구현 항목:

- `5. Members Admin 추가 폴리시`

이유:

- `Members`는 지금 broad한 기능을 갖췄고, 다음 자연스러운 개선은 richer audit history나 admin-side review polish다.
- 외부 환경이나 디바이스 QA가 필요 없다.
- 최근에 hardening한 bulk member flow와도 자연스럽게 이어진다.
