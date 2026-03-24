# Rosty State Tables

## 1. 목적

이 문서는 Rosty V1 구현에 필요한 핵심 상태값과 허용 전이를 정리한다.
상태명은 [PRD](./prd.md)와 동일해야 하며, 구현에서는 이 문서를 기준으로 서버 정책과 클라이언트 분기를 맞춘다.

## 2. UserStatus

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `profile_incomplete` | 로그인은 성공했지만 필수 프로필 미완성 | 시스템 | `pending_approval` |
| `pending_approval` | 프로필 완료 후 승인 대기 | 시스템 | `active`, `suspended` |
| `active` | 메인 앱 접근 가능 | admin | `suspended`, `deactivated` |
| `suspended` | 로그인은 가능하지만 앱 기능 차단 | admin | `active` |
| `deactivated` | 탈퇴 또는 운영 종료로 로그인 차단 | 사용자, 시스템, admin | 없음 |

메모:

- `manager`는 사용자 상태를 변경할 수 없다.
- 마지막 남은 `admin`은 `suspended` 또는 `deactivated`로 전환할 수 없다.
- 사용자는 설정 화면에서 본인 계정을 `deactivated` 상태로 전환할 수 있다.
- 단, `다가오는 confirmed assignment`가 남아 있으면 먼저 취소 요청 절차를 진행해야 한다.

## 3. InvitationLinkState

| 상태 | 의미 | 전이 |
| --- | --- | --- |
| `active` | 사용 가능한 초대 링크 | `disabled`, `expired`, `consumed` |
| `disabled` | Admin이 비활성화한 링크 | 없음 |
| `expired` | 만료된 링크 | 없음 |
| `consumed` | 직원 가입 검증에 이미 사용된 링크 | 없음 |

메모:

- V1 앱 발급 플로우는 초대 링크를 발급 시점부터 7일 동안 유효하게 만든다.
- 재발급은 기존 `active` 링크를 `disabled`로 전환하고 새 `active` 링크를 추가하는 방식으로 처리한다.
- Admin UI의 복사/공유 액션은 `active` 링크에만 노출되고 나머지 이력 상태는 읽기 전용이다.
- 직원 온보딩에서는 `complete_employee_join` RPC가 성공하면 초대 링크가 `consumed`로 전환된다.

## 4. ScheduleStatus

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `collecting` | 일정 생성 완료, 신청 수집 또는 배정 준비 단계 | manager, admin | `assigned`, `cancelled` |
| `assigned` | 일정 전체 배정 확정 완료 | manager, admin | `completed`, `cancelled` |
| `completed` | 행사 종료 및 운영 완료 | 시스템, manager, admin | 없음 |
| `cancelled` | 일정 취소 | manager, admin | 없음 |

메모:

- 신청 수집 열림/잠금은 `ScheduleStatus`와 별도로 `AvailabilityCollectionState`로 관리한다.
- UI에서는 `collecting + locked` 조합을 `모집 잠금` 또는 `배정 준비` 상태로 표현할 수 있다.

## 5. AvailabilityCollectionState

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `open` | 직원 응답 생성/수정 가능 | 시스템, manager, admin | `locked` |
| `locked` | 직원 응답 생성/수정 불가 | manager, admin | `open` |

## 6. AvailabilityStatus

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `not_responded` | 아직 응답하지 않음 | 시스템 | `available`, `unavailable` |
| `available` | 근무 가능 응답 | employee | `unavailable` |
| `unavailable` | 근무 불가 응답 | employee | `available` |

메모:

- `open` 상태일 때만 직원이 응답을 변경할 수 있다.

## 7. AssignmentStatus

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `proposed` | 운영진이 저장한 초안 배정 | manager, admin | `confirmed`, `cancelled` |
| `confirmed` | 일정 전체 확정 후 직원에게 공개된 배정 | manager, admin | `cancel_requested`, `completed`, `cancelled` |
| `cancel_requested` | 취소 요청이 걸려 있는 배정 | employee, 시스템 | `confirmed`, `cancelled` |
| `cancelled` | 승인된 취소 또는 운영 취소 처리 완료 | manager, admin | 없음 |
| `completed` | 행사 완료 후 종료된 배정 | 시스템, manager, admin | 없음 |

메모:

- `vacant`는 Assignment 상태가 아니라 `빈 슬롯` 상태를 의미한다.
- 초안 배정은 직원에게 노출되지 않는다.

## 8. CancellationRequestStatus

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `requested` | 직원이 취소 요청 생성 | employee | `approved`, `rejected` |
| `approved` | 운영진 승인 완료 | manager, admin | 없음 |
| `rejected` | 운영진 거절 완료 | manager, admin | 없음 |

메모:

- `approved` 시 연결된 Assignment는 `cancelled`가 되고 슬롯은 공석으로 돌아간다.
- `rejected` 시 연결된 Assignment는 `confirmed`로 복귀한다.

## 9. ScheduleTimeStatus

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `planned` | 예정 시작/종료 시간만 입력된 상태 | manager, admin | `actual_recorded` |
| `actual_recorded` | 실제 시간 입력 완료 | manager, admin | `corrected` |
| `corrected` | 실제 시간을 다시 수정한 상태 | manager, admin | `corrected` |

메모:

- 급여 계산은 `actual_recorded`, `corrected` 상태의 실제 시간을 기준으로 한다.

## 10. NotificationType

| 타입 | 수신자 | 기본 이동 대상 |
| --- | --- | --- |
| `user_approved` | 승인된 사용자 본인 | Employee Home 또는 Manager Home |
| `user_suspended` | 정지된 사용자 본인 | Suspended |
| `user_reactivated` | 복구된 사용자 본인 | Employee Home 또는 Manager Home |
| `schedule_created` | 관련 직원 | Schedule Detail |
| `schedule_cancelled` | 영향받은 배정 직원 | Schedule Detail |
| `assignment_confirmed` | 배정 대상 사용자 | Assignment Detail |
| `cancellation_requested` | 처리 대상 운영진 | Cancellation Queue 또는 Assignment Detail |
| `cancellation_approved` | 취소 요청자 | Assignment Detail |
| `cancellation_rejected` | 취소 요청자 | Assignment Detail |

메모:

- 알림함 노출 범위는 최근 30일이다.
- 알림은 사용자가 탭하는 시점에 `read` 처리된다.

## 11. PayRateOverrideState

| 상태 | 의미 | 진입 주체 | 다음 상태 |
| --- | --- | --- | --- |
| `default` | 직원별 override row가 없어서 홀 기본 시급을 사용 | admin, 시스템 | `custom` |
| `custom` | 직원별 override row가 있어서 해당 시급을 사용 | admin | `default`, `custom` |

메모:

- `Pay Policy`에서 직원별 시급 입력을 비우고 저장하면 `custom`에서 `default`로 복귀한다.
- `custom` row가 없으면 급여 계산은 `pay_policies.default_hourly_rate`를 사용한다.

## 12. 검색 및 목록 상태 원칙

상태값은 아니지만 공통 목록에서 아래 원칙을 유지한다.

- 일정성 데이터: `가까운 시간 순` 기본 정렬
- 기록성 데이터: `최신순` 기본 정렬
- 필터 UI: `상단 탭 + 간단 칩`
- 전역 검색 결과: `일정`, `내 배정`, `멤버` 섹션 분리
