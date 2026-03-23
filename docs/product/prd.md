# Rosty V1 PRD

## 1. 문서 목적

이 문서는 `라비에벨 웨딩홀 전용` Rosty 모바일 앱의 V1 구현 기준 문서다.
목표는 구현자가 추가 제품 결정을 하지 않고도 화면 설계, 데이터 설계, API 설계, 테스트 시나리오 작성으로 바로 넘어갈 수 있게 만드는 것이다.

관련 보조 문서:

- [화면 IA](./screen-ia.md)
- [핵심 상태표](./state-tables.md)
- [Supabase 스키마 설계](./supabase-schema.md)
- [개발 환경 설정](./setup.md)

## 2. 제품 정의

Rosty는 라비에벨 웨딩홀 운영진과 근무자가 일정 운영, 신청 수집, 배정, 취소 처리, 근무 시간 기록, 예상 급여 조회를 하나의 모바일 앱에서 처리하기 위한 운영 애플리케이션이다.

V1의 핵심은 두 가지다.

- 운영진이 일정 생성부터 배정 확정, 취소 처리, 근무 시간 확정까지 앱 안에서 닫는다.
- 근무자가 신청, 배정 확인, 취소 요청, 예상 급여 확인을 앱 안에서 처리한다.

### 2.1 제품 전제

- 앱은 `단일 홀 전용`이다.
- `멀티 홀`, `Hall Selector`, `현재 홀 전환`은 없다.
- `Super Admin`, `플랫폼 운영`, `홀 생성 요청 승인`은 없다.
- 인증 provider의 V1 구현 기준은 `Google`이다.
- 역할은 `employee`, `manager`, `admin` 세 가지다.
- 활성 사용자만 메인 앱 영역에 진입할 수 있다.

### 2.2 V1 목표

- 메신저 중심의 일정 공지와 수동 배정 흐름을 앱 중심 흐름으로 전환한다.
- 근무자 응답과 배정 상태를 구조화해 누락과 중복 확인 비용을 줄인다.
- 취소 요청, 근무 시간, 예상 급여까지 하나의 운영 데이터 흐름으로 연결한다.
- 사용자/권한/정책 관리를 Admin 화면에서 닫는다.
- 핵심 이벤트를 인앱 알림과 푸시 알림으로 전달한다.

### 2.3 V1 제외 범위

- Kakao/Naver/Apple 로그인
- 웹 제품
- 고급 추천 엔진 또는 점수 랭킹
- 실제 급여 정산, 세금, 공제, 명세서 다운로드
- 게스트 연락처 관리
- 사용자별 상세 알림 설정
- 앱 잠금, 기기 관리, 생체인증

## 3. 역할과 공통 규칙

### 3.1 역할 정의

| 역할 | 핵심 책임 | 제한 |
| --- | --- | --- |
| `employee` | 일정 응답, 내 배정 확인, 취소 요청, 예상 급여 조회 | 일정 생성, 배정 편집, 사용자 관리 불가 |
| `manager` | 일정 생성/수정, 신청 현황 조회, 배정 초안/확정, 취소 처리, 근무 시간 기록 | 사용자 승인/권한 변경, 정책 수정 불가 |
| `admin` | Manager 권한 전체 + 사용자 승인, 역할 변경, 초대 링크 발급, 시급/정책 관리 | 마지막 Admin 보호 규칙을 우회할 수 없음 |

### 3.2 사용자 상태

- `profile_incomplete`: 로그인은 성공했지만 필수 프로필이 미완성인 상태
- `pending_approval`: 프로필 완료 후 승인 대기 상태
- `active`: 메인 앱 접근 가능 상태
- `suspended`: 로그인은 가능하지만 운영 기능 접근이 차단된 상태
- `deactivated`: 탈퇴 또는 운영 종료로 로그인 자체가 차단된 상태

### 3.3 공통 운영 규칙

- 사용자 승인, 역할 변경, 정지/복구, 정책 수정은 `admin`만 가능하다.
- 마지막 남은 `admin`은 강등, 정지, 비활성 처리할 수 없다.
- 직원 초대는 `초대 링크` 방식이다.
- 초대 링크의 기본 역할은 `employee`다.
- 일정은 단일 홀 데이터만 다루므로 홀 범위 선택이나 전환은 없다.
- 직원은 `확정된 본인 배정`만 본인 배정 화면에서 본다.
- 권한이 없는 데이터는 목록, 상세, 검색 결과 어디에도 노출되지 않는다.

## 4. 도메인 맵

| 도메인 | 핵심 엔티티 | 대표 화면 |
| --- | --- | --- |
| Auth & Identity | `UserProfile`, `InvitationLink` | Splash, Login, Profile Setup, Approval Waiting, Suspended |
| User & Admin Management | `UserRole`, `UserStatus`, `InvitationLink`, `PayPolicy`, `PayRate` | Members, Invitation, Pay Policy |
| Schedule Planning | `Schedule`, `ScheduleSlot` | Schedule Create/Edit, Schedule Detail |
| Availability Collection | `AvailabilitySubmission` | Schedule Detail, Availability Overview |
| Assignment | `Assignment` | Assignment Workspace, My Assignments, Assignment Detail |
| Cancellation | `CancellationRequest` | Assignment Detail, Cancellation Queue |
| Work Time | `ScheduleTimeRecord` | Work Time |
| Payroll | `PayEstimate` | My Payroll, Team Payroll |
| Notification | `Notification` | Notifications |
| Shared Experience | 검색, 필터, 홈 대시보드, 설정 | Employee Home, Manager Home, Settings, Search |

## 5. Auth & Identity

### 목적

사용자를 안전하게 로그인시키고, 필수 프로필 입력과 승인 상태 분기를 통해 앱 접근 상태를 결정한다.

### 핵심 엔티티

- `UserProfile`
- `InvitationLink`
- `UserRole`
- `UserStatus`

### 핵심 규칙

- V1 로그인 provider는 `Google`만 지원한다.
- 로그인 직후 필수 프로필이 비어 있으면 `profile_incomplete` 상태로 `Profile Setup`으로 보낸다.
- 직원은 유효한 `초대 링크`를 통해 가입한다.
- 직원 초대 링크는 `Login` 진입 시 토큰 컨텍스트를 전달하고 `Profile Setup` 제출 직전에 다시 검증한다.
- 직원 `Profile Setup` 제출은 초대 링크 검증, `profiles` 저장, 초대 링크 소모를 서버 검증 경로에서 한 번에 처리한다.
- 초대 링크가 없는 `Profile Setup` 제출도 서버 검증 경로를 통해 `profiles`를 저장하고 `pending_approval`로 전환한다.
- 관리자/운영진 후보는 로그인 후 프로필을 완료하면 `pending_approval` 상태로 진입한다.
- 초대 링크로 가입한 직원도 최종 활성화 전에는 `pending_approval`를 거친다.
- `active` 사용자만 메인 앱으로 진입한다.
- `pending_approval` 사용자는 승인 대기 화면만 볼 수 있다.
- `suspended` 사용자는 정지 안내 화면만 볼 수 있다.
- `deactivated` 사용자는 로그인 자체가 차단된다.

### 연결 화면

- Splash
- Login
- Profile Setup
- Approval Waiting
- Suspended

### Acceptance Criteria

- Google 로그인으로 신규 가입과 기존 계정 재로그인이 가능하다.
- 최초 로그인 사용자는 프로필을 완료하기 전 메인 앱에 진입할 수 없다.
- 유효한 초대 링크로 시작한 신규 직원은 프로필 제출 후 `pending_approval` 상태에 진입한다.
- 초대 링크가 없거나 무효, 만료, 사용됨, 비활성 상태면 직원 가입을 완료할 수 없다.
- 승인되지 않은 사용자는 홈, 일정, 배정, 급여 화면에 진입할 수 없다.

### Deferred

- 다중 provider 연결
- Apple/Kakao/Naver 로그인

## 6. User & Admin Management

### 목적

단일 홀 기준 사용자 승인, 역할 관리, 초대 링크 발급, 시급 및 급여 정책 관리를 Admin 화면에서 처리한다.

### 핵심 엔티티

- `UserRole`
- `UserStatus`
- `InvitationLink`
- `PayPolicy`
- `PayRate`

### 핵심 규칙

- `admin`만 사용자 관리와 정책 관리 화면에 접근할 수 있다.
- 승인 대기 사용자는 `admin`이 `active`로 승인한다.
- `admin`은 사용자를 `suspended`로 전환하거나 다시 `active`로 복구할 수 있다.
- `admin`은 `employee`, `manager`, `admin` 역할 간 변경이 가능하다.
- 마지막 남은 `admin`은 강등, 정지, 비활성 처리할 수 없다.
- 초대 링크는 단일 홀 전용이며 기본 역할은 `employee`다.
- `admin`은 초대 링크를 발급하고 재발급할 수 있다.
- `admin`은 활성 초대 링크의 직원용 로그인 URL을 직접 복사하거나 네이티브 공유 시트로 전달할 수 있다.
- V1 초대 링크는 발급 시점부터 7일 동안 유효하며, 재발급 시 기존 활성 링크는 즉시 비활성화하고 새 링크를 만든다.
- `admin`만 급여 정책을 수정할 수 있다.
- `Pay Policy` 화면은 홀 기본 시급, 초과근무 기준, 직원별 시급 override를 함께 관리한다.
- 직원별 시급 입력을 비우고 저장하면 홀 기본 시급 fallback으로 되돌린다.
- `manager`는 정책과 사용자 목록을 조회할 수 없고, 운영 기능만 담당한다.

### 연결 화면

- Members
- Invitation
- Pay Policy

### Acceptance Criteria

- `admin`은 승인 대기 사용자 승인, 역할 변경, 정지/복구를 수행할 수 있다.
- `admin`은 직원용 초대 링크를 발급, 재발급, 비활성화하고 활성 링크의 로그인 URL을 복사 또는 공유할 수 있다.
- 무효 또는 만료된 초대 링크로는 가입을 완료할 수 없다.
- `admin`은 홀 기본 시급, 초과근무 기준, 직원별 시급을 수정하고 직원별 override를 비워 홀 기본 시급 fallback으로 되돌릴 수 있다.
- 마지막 남은 `admin`을 잃는 변경은 차단된다.

### Deferred

- 대량 초대
- 감사 로그 UI

## 7. Schedule Planning

### 목적

운영진이 행사 일정을 생성하고 표준 슬롯 프리셋을 기반으로 배정 가능한 구조를 준비한다.

### 핵심 엔티티

- `Schedule`
- `ScheduleSlot`

### 핵심 규칙

- `manager`, `admin`만 일정을 생성하고 수정할 수 있다.
- 일정 생성 시 라비에벨 표준 슬롯 프리셋을 기본값으로 생성한다.
- 운영진은 생성 직후 슬롯별 인원 수, 성별 제한, 사용 여부를 수정할 수 있다.
- 일정 생성 직후 상태는 `collecting`이다.
- 일정 생성 직후 신청 수집 상태는 `open`이다.
- 과거 날짜 일정은 생성할 수 없다.
- 슬롯이 하나도 없는 일정은 저장할 수 없다.
- 필수 슬롯이 모두 비활성화된 일정은 저장할 수 없다.
- 배정이 확정되기 전까지만 일정 구조를 수정할 수 있다.

### 연결 화면

- Manager Home
- Schedule Create/Edit
- Schedule Detail

### Acceptance Criteria

- `manager`, `admin`은 프리셋 기반으로 일정을 생성할 수 있다.
- 직원은 일정 생성 화면에 접근할 수 없다.
- 배정 확정 전에는 슬롯 구조 수정이 가능하고, 확정 후에는 핵심 구조 수정이 차단된다.

### Deferred

- 반복 일정 생성
- 외부 캘린더 연동

## 8. Availability Collection

### 목적

직원의 근무 가능 여부를 수집하고, 운영진이 포지션별 후보 현황을 확인해 배정 준비를 한다.

### 핵심 엔티티

- `AvailabilitySubmission`
- `ScheduleSlot`

### 핵심 규칙

- 직원 응답값은 `available`, `unavailable` 두 가지다.
- 미응답은 별도 상태값 `not_responded`로 집계한다.
- 신청 수집은 일정 생성 직후 자동으로 열리며 `manager`, `admin`이 잠그거나 다시 열 수 있다.
- 직원은 수집 상태가 `open`일 때만 본인 응답을 생성/수정할 수 있다.
- 정지 사용자와 취소된 일정은 응답할 수 없다.
- 운영진은 포지션 기준 화면에서 가능자 목록을 본다.
- 포지션에 `requiredGender`가 있으면 해당 성별 프로필만 후보 목록에 포함한다.
- `unavailable`, `not_responded` 사용자는 메인 후보 목록이 아니라 보조 섹션으로 노출한다.
- 가능한 인원이 없는 포지션은 공석 경고를 표시한다.

### 연결 화면

- Schedule Detail
- Availability Overview

### Acceptance Criteria

- 직원은 열린 일정에 대해 가능/불가 응답을 제출하고 수정할 수 있다.
- 운영진은 포지션별 가능자 목록과 미응답/불가 보조 목록을 볼 수 있다.
- 신청 잠금 후에는 신규 제출과 수정이 모두 차단된다.

### Deferred

- 보류 응답 상태
- 자동 시간 기반 마감

## 9. Assignment

### 목적

운영진이 포지션별 후보를 보고 수동으로 배정 초안을 만들고, 일정 단위로 전체 확정한다.

### 핵심 엔티티

- `Assignment`
- `ScheduleSlot`

### 핵심 규칙

- 배정은 `수동 배정 중심`이다.
- 추천 점수나 자동 추천 순위는 V1에 포함하지 않는다.
- `manager`, `admin`은 슬롯별 배정 초안을 저장하고 수정할 수 있다.
- 배정은 일정 전체 단위로 한 번에 확정한다.
- 게스트 인력은 `이름`만으로 임시 배정할 수 있다.
- 같은 일정에 같은 사용자를 여러 슬롯에 배정하는 것은 기본적으로 금지한다.
- 다만 포지션 통합 같은 운영 예외 상황에서는 명시적 확인 후 동일 사용자의 다중 배정을 허용한다.
- 필수 슬롯이 비어 있으면 확정 시 경고를 보여주지만, 경고 확인 후 빈 슬롯 상태로도 확정할 수 있다.
- 직원은 초안 배정을 볼 수 없고, 확정된 배정만 본다.

### 연결 화면

- Schedule Detail
- Assignment Workspace
- My Assignments
- Assignment Detail

### Acceptance Criteria

- 운영진은 슬롯별 초안 배정을 저장하고 수정/제거할 수 있다.
- 게스트는 이름만 입력해 배정할 수 있다.
- 전체 확정 전까지 초안은 자유롭게 수정할 수 있다.
- 직원은 확정된 배정만 내 배정 화면에서 볼 수 있다.

### Deferred

- 추천 엔진
- 자동 균등 배정

## 10. Cancellation

### 목적

확정된 배정에 대해 근무자가 취소 요청을 보내고, 운영진이 승인 또는 거절한다.

### 핵심 엔티티

- `CancellationRequest`
- `Assignment`

### 핵심 규칙

- 취소 요청 대상은 `confirmed` 상태의 본인 배정만 가능하다.
- 취소 요청은 행사 종료 전까지만 생성할 수 있다.
- 운영 원칙상 행사 전 요청이 기본이며, 당일 변경은 운영진 판단으로 처리한다.
- `manager`, `admin`은 요청을 승인 또는 거절할 수 있다.
- 승인 시 기존 배정은 취소되고 슬롯은 `vacant`로 복귀한다.
- 승인과 동시에 대체 인력을 자동 배정하지 않는다.
- 거절 시 원래 배정은 즉시 `confirmed`로 복귀한다.
- 이미 처리된 요청은 재처리할 수 없다.
- 재배정은 별도 배정 기능에서 다시 수행한다.

### 연결 화면

- Assignment Detail
- Cancellation Queue

### Acceptance Criteria

- 직원은 본인 확정 배정에 대해 취소 요청을 생성할 수 있다.
- 운영진은 취소 요청을 승인/거절할 수 있다.
- 승인 시 슬롯은 공석으로 돌아가고, 거절 시 배정은 확정 상태로 유지된다.

### Deferred

- 다단계 승인
- 자동 대체 인력 추천

## 11. Work Time

### 목적

일정 단위 예정 근무 시간과 행사 후 실제 시간을 기록해 급여 계산 기준을 만든다.

### 핵심 엔티티

- `ScheduleTimeRecord`

### 핵심 규칙

- 시간 기록 단위는 `일정 전체`다.
- 배정 확정 전 운영진이 예정 시작/종료 시간을 입력한다.
- 행사 후 `manager`, `admin`이 실제 시작/종료 시간으로 수정한다.
- 급여 계산은 항상 `최종 실제 시간`을 기준으로 한다.
- 종료 시각이 시작 시각보다 빠르면 저장할 수 없다.
- 취소된 일정은 실제 시간 입력 대상이 아니다.
- 직원은 시간 기록을 수정할 수 없고 조회만 가능하다.

### 연결 화면

- Work Time
- Schedule Detail

### Acceptance Criteria

- 운영진은 예정 시간과 실제 시간을 순차적으로 기록할 수 있다.
- 실제 시간이 없는 일정은 급여 계산 대기 상태로 남는다.
- 직원은 시간 기록을 조회만 할 수 있다.

### Deferred

- 직원 셀프 출퇴근
- 사람별 출퇴근 기록

## 12. Payroll

### 목적

최종 실제 근무 시간과 시급 정책을 바탕으로 예상 급여를 계산하고 조회한다.

### 핵심 엔티티

- `PayPolicy`
- `PayRate`
- `PayEstimate`

### 핵심 규칙

- 시간 기준은 `일정 단위 최종 실제 시작/종료 시간`이다.
- 같은 일정에서 한 사람이 여러 포지션을 맡아도 급여 시간은 한 번만 계산한다.
- 시급 적용 순서는 `직원별 시급 우선`, 없으면 `홀 기본 시급 fallback`이다.
- 초과근무 기준과 배율은 홀 공통 정책을 사용한다.
- `employee`는 본인 예상 급여만 본다.
- `manager`, `admin`은 전체 직원 예상 급여를 볼 수 있다.
- `admin`만 시급과 정책을 수정할 수 있다.
- 실제 시간이 없으면 급여는 계산하지 않는다.
- 취소된 배정은 급여 계산 대상에서 제외한다.

### 연결 화면

- My Payroll
- Team Payroll
- Pay Policy

### Acceptance Criteria

- 직원별 시급이 있으면 해당 시급으로 계산한다.
- 직원별 시급이 없으면 홀 기본 시급으로 계산한다.
- 동일 일정 다중 포지션은 한 건의 근무 시간으로 계산한다.
- 실제 시간이 없으면 예상 급여가 계산되지 않는다.

### Deferred

- 실제 정산
- 세금/공제
- 명세서 다운로드

## 13. Notification

### 목적

운영 핵심 이벤트를 관련 사용자에게 인앱 알림과 푸시 알림으로 전달한다.

### 핵심 엔티티

- `Notification`

### 핵심 규칙

- 핵심 이벤트 발생 시 인앱 알림 레코드를 만든다.
- 같은 이벤트에 대해 푸시 알림도 시도한다.
- 푸시 전송 실패 시 인앱 알림은 유지한다.
- 수신자는 이벤트의 `직접 관련자`로 제한한다.
- V1 이벤트 타입은 아래 일곱 가지다.
  - `user_approved`
  - `schedule_created`
  - `schedule_cancelled`
  - `assignment_confirmed`
  - `cancellation_requested`
  - `cancellation_approved`
  - `cancellation_rejected`
- 알림함은 `미읽음`, `전체` 탭 구조를 사용한다.
- 알림은 사용자가 탭해 관련 화면으로 이동하는 순간 읽음 처리된다.
- 알림함은 최근 `30일` 알림만 노출한다.

### 연결 화면

- Notifications
- 각 도메인의 상세 화면

### Acceptance Criteria

- 직접 관련된 사용자만 알림을 받는다.
- 알림 탭 시 관련 상세 화면 또는 관련 목록으로 이동한다.
- 전체 읽음과 상세 알림 설정 없이도 핵심 이벤트 전달이 가능하다.

### Deferred

- 사용자별 이벤트 on/off
- 마케팅 알림

## 14. Shared Experience

### 목적

역할별 홈, 공통 목록 조회, 전역 검색, 설정을 통해 앱 전체 사용 경험을 일관되게 제공한다.

### 핵심 엔티티

- 홈 요약 카드
- 목록 필터/정렬
- 전역 검색 결과
- 계정 설정 정보

### 핵심 규칙

- `employee` 홈 최상단에는 `다가오는 내 배정`을 노출한다.
- `employee` 홈 두 번째 영역에는 `모집 중 일정`을 노출한다.
- `manager`, `admin` 홈 최상단에는 `처리할 운영 큐`를 노출한다.
- 운영진 홈의 빠른 액션은 `일정 생성`과 운영 큐 진입 중심이다.
- 일정 목록은 날짜 가까운 순 정렬을 기본으로 한다.
- 내 배정 목록은 `다가오는 일정`, `지난 일정` 탭으로 나눈다.
- 같은 일정에서 여러 포지션을 맡은 경우 하나의 일정 안에 다중 포지션으로 표시한다.
- 전역 검색은 V1에 포함하며 대상은 `일정`, `내 배정`, `멤버`다.
- 검색 결과는 엔티티별 섹션으로 나눠 노출한다.
- 필터 UX는 `상단 탭 + 간단 칩` 구조를 공통 규칙으로 사용한다.
- 설정 화면에서는 프로필 수정, 로그아웃, 푸시 권한 상태 안내, 앱 기본 정보, 탈퇴를 제공한다.
- 탈퇴는 `다가오는 confirmed 배정`이 남아 있으면 바로 수행할 수 없고, 먼저 취소 요청 절차를 거쳐야 한다.
- 탈퇴 완료 시 계정은 `deactivated`로 전환되고 운영 데이터는 유지된다.

### 연결 화면

- Employee Home
- Manager Home
- Schedule List
- Schedule Detail
- My Assignments
- Notifications
- Settings
- Global Search

### Acceptance Criteria

- 역할별 홈이 서로 다른 우선 정보를 보여준다.
- 직원은 확정된 본인 배정만 내 배정 화면에서 본다.
- 전역 검색 결과에는 권한 없는 데이터가 노출되지 않는다.
- 사용자는 설정 화면에서 본인 프로필을 수정하고 로그아웃/탈퇴를 수행할 수 있다.

### Deferred

- 고급 필터 저장
- 전역 검색 랭킹 최적화
- 앱 잠금, 기기 관리

## 15. 공통 타입 기준

V1 구현 기준에서 공통으로 맞춰야 하는 핵심 타입은 아래와 같다.

- `UserProfile`
- `InvitationLink`
- `UserRole`
- `UserStatus`
- `Schedule`
- `ScheduleSlot`
- `AvailabilitySubmission`
- `Assignment`
- `CancellationRequest`
- `ScheduleTimeRecord`
- `PayPolicy`
- `PayRate`
- `PayEstimate`
- `Notification`

명시적으로 제거된 개념:

- `Hall`
- `Membership`
- `CurrentHall`
- `SuperAdmin`
- 홀 생성 요청/플랫폼 운영 엔티티

## 16. 통합 Acceptance Criteria

- 문서 어디에도 멀티 홀, Hall Selector, 현재 홀 전환, Super Admin 전제가 남아 있지 않아야 한다.
- 활성 직원은 로그인 후 홈, 일정 목록, 내 배정, 알림, 설정 흐름을 모두 사용할 수 있어야 한다.
- 운영진은 일정 생성, 신청 수집, 배정, 취소 처리, 근무 시간 기록을 앱 안에서 끝낼 수 있어야 한다.
- Admin은 사용자 승인, 역할 변경, 초대 링크 발급, 시급/정책 관리를 앱 안에서 끝낼 수 있어야 한다.
- 상태명과 권한 규칙은 [핵심 상태표](./state-tables.md)와 충돌하지 않아야 한다.
- 화면 진입 경로는 [화면 IA](./screen-ia.md)와 충돌하지 않아야 한다.

## 17. 주요 E2E 시나리오

1. 신규 직원이 초대 링크로 로그인하고 프로필을 작성한 뒤 승인 대기 상태에 진입한다.
2. Admin이 사용자를 승인해 활성화하고 직원이 홈에 진입한다.
3. 운영진이 일정을 만들고 슬롯 프리셋을 조정한다.
4. 직원이 일정 가능 여부를 제출하고 수정한다.
5. 운영진이 포지션별 후보를 확인하고 수동 배정을 확정한다.
6. 직원이 내 배정에서 확정 배정을 확인하고 취소 요청을 보낸다.
7. 운영진이 취소 요청을 승인 또는 거절한다.
8. 운영진이 실제 근무 시간을 입력하고 예상 급여가 계산된다.
9. 관련 당사자는 알림함과 푸시로 핵심 이벤트를 확인할 수 있다.


