# Work Log

## Purpose

Track what was completed, what was in progress at the end of a session, and what should be resumed next.

## Update Rules

- Add a new entry at the top when a meaningful session ends.
- Update `docs/prd.md` together with this log whenever feature status changes.
- Record the last in-progress task and the immediate next task, not only completed items.
- Include the related commit hash when work is committed. Use `uncommitted` until a commit exists.

## Current Handoff

### 2026-03-30

- Completed
  - Added a dedicated admin schedule overview route at `/admin/schedule-overview`.
  - Connected the admin home card `전체 일정 조회` to the new overview route.
  - Added a read-only admin overview flow that summarizes approved assignments and employee response state from existing `schedule request` data.
  - Added regression coverage for the new dashboard link and overview rendering.
- Last In Progress
  - The admin overview now exists, but it is still derived from `schedule request` records rather than a separate `WorkAssignment`-centered read model.
- Next Up
  - Decide whether Release 1 should keep the overview derived from `schedule request` data or promote a separate `WorkAssignment` read model before Supabase migration.
  - Define the remaining notification scope beyond in-app state reflection, including whether instant/push/email delivery stays out of Release 1.
- Blockers / Notes
  - The dev API is still in-memory, so overview freshness depends on polling and the current mock lifecycle.
- Related Commit
  - `uncommitted`

### 2026-03-29

- Completed
  - `schedule request` 도메인에 직원 응답 상태(`pending/accepted/declined`)와 이력 이벤트(`accepted/declined`)가 추가되어 승인 이후 수락/거절 흐름을 별도 상태로 기록할 수 있게 되었습니다.
  - `PUT /api/dev/schedule-requests` 응답 처리와 관련 mutation/hook이 추가되어 직원이 배정 스케줄 화면에서 수락/거절과 메모를 남길 수 있게 되었습니다.
  - 직원 배정 스케줄 화면이 응답 상태, 응답 메모, 전체 이력 타임라인을 표시하도록 확장되었고 승인된 요청은 응답 후 읽기 전용 상태로 전환됩니다.
  - 관리자 신청 검토 화면에 30초 주기 갱신과 상태/직원 응답/정렬 필터가 추가되어 승인 결과와 직원 응답 결과를 한 화면에서 계속 추적할 수 있게 되었습니다.
  - dev API, 타입, DAL, 훅 테스트가 새 응답 플로우 기준으로 갱신되어 전체 `pnpm test`가 green입니다.
- Last In Progress
  - 승인/거절 및 직원 응답은 인앱 상태와 이력으로는 추적되지만, 별도 알림 센터나 푸시/이메일 발송은 아직 없습니다.
- Next Up
  - 직원 거절과 배정 변경에 대한 알림 범위를 `인앱 이벤트`, `푸시/이메일`, `관리자 액션 큐` 중 어디까지 Release 1에 포함할지 정합니다.
  - `schedule request` 검토 화면을 넘어서는 관리자용 일정 조회 모델이 필요한지, 아니면 `WorkAssignment` 중심 읽기 모델로 분리할지 결정합니다.
- Blockers / Notes
  - 현재 dev 데이터 소스는 in-memory라 새 응답 상태와 이력도 영속되지 않으며, 실시간성은 polling에 의존합니다.
- Related Commit
  - `uncommitted`

### 2026-03-28

- Completed
  - 직원 스케줄 신청 흐름이 `현재 근무에 대한 availability-only 신청` 방식으로 바뀌어 날짜/시간대/역할 직접 선택이 제거되었습니다.
  - `src/app/api/dev/work/route.ts`와 `queries/work` 슬라이스가 추가되어 현재 모집 중인 근무를 별도 조회할 수 있게 되었습니다.
  - 관리자 검토 흐름이 포지션 선택 기반 배정/반려로 바뀌었고, 직원 배정 스케줄 화면도 배정 포지션과 배정 시각 기준으로 표시되도록 정렬되었습니다.
  - 관리자용 `/admin/work` 화면과 `mutations/work` 쓰기 슬라이스가 추가되어 현재 근무를 생성하고 즉시 현재 근무 카드에 반영할 수 있게 되었습니다.
  - 배정 포지션 canonical 목록과 한국 시간 범위 포맷 유틸이 공통화되었고, 관련 테스트가 새 모델 기준으로 갱신되었습니다.
- Last In Progress
  - 현재 근무 생성까지는 열렸지만, 여전히 단일 current work만 다루는 dev in-memory 구조라 여러 날짜 근무를 누적 관리하지는 못합니다.
- Next Up
  - `Work / WorkApplication / WorkAssignment`를 실제 저장 구조에서도 분리할지 결정하고, 최소한 current work 단일 레코드 제약을 넘는 다건 근무 관리 방향을 정합니다.
  - 이후 Supabase 이관 시 현재 in-memory API를 어떤 테이블과 관계로 옮길지 설계합니다.
- Blockers / Notes
  - 현재 구현은 도메인 정의에 맞춰 의미는 정렬됐지만, 데이터 저장 구조는 아직 완전 분리 전 단계이며 current work는 단일 레코드로만 운용됩니다.
- Related Commit
  - `uncommitted`

### 2026-03-28

- Completed
  - `docs/domain/working-model.md`가 추가되어 근무, 근무 신청, 근무 배정, 포지션의 canonical 정의가 문서로 고정되었습니다.
  - `docs/prd.md`에 도메인 기준 문서 참조가 추가되어 이후 설계와 구현이 같은 용어를 참조할 수 있게 되었습니다.
- Last In Progress
  - 근무 개념 정의는 고정되었고, 다음은 현재 구현의 `schedule request` 중심 모델을 새 도메인 정의와 어떻게 맞출지 정리하는 일입니다.
- Next Up
  - 현재 구현에서 `근무`, `근무 신청`, `근무 배정`이 뒤섞인 지점을 식별합니다.
  - 관리자 근무 생성, 직원 availability 신청, 관리자 포지션 배정 흐름으로 타입과 화면을 재정렬하는 계획을 만듭니다.
- Blockers / Notes
  - 현재 코드와 새 도메인 문서 사이에 개념 차이가 커서, 기능 추가보다 모델 정렬을 먼저 보는 편이 안전합니다.
- Related Commit
  - `uncommitted`

### 2026-03-28

- Completed
  - 직원용 `/schedule/assigned` 화면이 추가되어 승인된 요청을 날짜, 시간대, 장소, 관리자 메모 기준으로 확인할 수 있습니다.
  - 직원/관리자 홈 카드가 현재 Release 1 흐름에 맞게 실제 경로로 연결되고, 직원 신청 화면에서 배정 스케줄 화면으로 바로 이동할 수 있습니다.
  - 직원 신청 현황에 상태 필터와 정렬이 추가되었고, 한국 시간 기준 공용 날짜 포맷 유틸이 `shared/utils`로 정리되었습니다.
  - 직원 신청 목록이 30초 주기 인앱 재조회로 자동 갱신되도록 설정되어 관리자 처리 결과가 화면에 다시 반영됩니다.
- Last In Progress
  - Release 1의 배정 확인, 최소 대시보드, 자동 상태 갱신은 green이며, 다음은 알림 기초 범위와 처리 기록 보강입니다.
- Next Up
  - Release 1 인앱 알림 기초 범위를 UI와 데이터 흐름에 반영합니다.
  - 승인/반려 처리 이력의 현재 기록을 더 명확히 노출하고 Supabase 이관 준비 범위를 정리합니다.
- Blockers / Notes
  - 스케줄 persistence는 아직 in-memory dev API이며 Supabase 이관이 남아 있습니다.
  - 승인/반려 이력은 현재 처리 시각과 담당자만 기록하며, 변경 이력 조회와 알림 이력은 아직 미구현입니다.
- Related Commit
  - `uncommitted`

### 2026-03-27

- Completed
  - 관리자 요청 검토 화면과 `/admin/schedule-requests` 경로가 추가되어 승인/반려 루프가 동작합니다.
  - 직원 신청 화면과 관리자 검토 화면이 같은 mock 데이터 소스를 공유하고, 승인/반려 후 직원 신청 상태가 다시 조회되도록 연결했습니다.
  - 깨져 있던 employee/admin schedule 관련 한국어 UI 문자열을 UTF-8 기준으로 정리했습니다.
- Last In Progress
  - Release 1의 관리자 승인/반려 슬라이스가 green이며, 다음은 배정 스케줄 확인과 최소 대시보드 연결입니다.
- Next Up
  - 직원 배정 스케줄 확인 화면을 추가합니다.
  - 직원/관리자 홈의 대시보드 카드를 실제 Release 1 흐름에 맞게 연결합니다.
  - 신청 상태 필터/정렬과 알림 기초 범위를 정의합니다.
- Blockers / Notes
  - 스케줄 persistence는 아직 in-memory dev API이며 Supabase 이관이 남아 있습니다.
  - 승인/반려 이력의 처리 일시와 담당자 기록, 알림 발송은 아직 미구현입니다.
- Related Commit
  - `uncommitted`

### 2026-03-27

- Completed
  - The root route redirect loop was fixed so employee sessions render the employee home instead of redirecting back to `/`.
  - A server-page regression test was added for employee render and admin/sign-in redirects.
- Last In Progress
  - Routing is stable again and the app is ready to resume the admin approval slice.
- Next Up
  - Implement admin request review with approval and rejection.
  - Reflect admin decisions back into the employee request status flow.
  - Start the assigned schedule confirmation view after the approval loop is stable.
- Blockers / Notes
  - Schedule persistence still uses an in-memory dev API and must later move to Supabase.
  - Real-time updates and request filter/sort are still pending.
- Related Commit
  - `uncommitted`

### 2026-03-27

- Completed
  - Prettier 3 was added as the repository formatter with `pnpm format` and `pnpm format:check` scripts.
  - Root formatting files were added through `.prettierrc.json` and `.prettierignore`.
  - Agent and development docs were updated to document Prettier as the formatting baseline.
- Last In Progress
  - Formatting infrastructure is being locked before resuming Release 1 feature work.
- Next Up
  - Implement admin request review with approval and rejection.
  - Reflect admin decisions back into the employee request status flow.
  - Start the assigned schedule confirmation view after the approval loop is stable.
- Blockers / Notes
  - Schedule persistence still uses an in-memory dev API and must later move to Supabase.
  - Real-time updates and request filter/sort are still pending.
- Related Commit
  - `8e9e5af`

### 2026-03-27

- Completed
  - Provider wiring moved under `src/app/_providers` and `AppProviders` was renamed to `QueryClientProvider`.
  - Schedule slices were realigned from `models/dto/dal/form` to `types/schemas/dal`.
  - Development rules and contract tests were updated to lock the new folder taxonomy.
- Last In Progress
  - Structural cleanup is green and the codebase is ready to resume Release 1 feature work on top of the new taxonomy.
- Next Up
  - Implement admin request review with approval and rejection.
  - Reflect admin decisions back into the employee request status flow.
  - Start the assigned schedule confirmation view after the approval loop is stable.
- Blockers / Notes
  - Schedule persistence still uses an in-memory dev API and must later move to Supabase.
  - Real-time updates and request filter/sort are still pending.
- Related Commit
  - `7be74a4`

### 2026-03-27

- Completed
  - Employee schedule request form was added at `/schedule`.
  - Employee request list and status view were added with React Query and a mock-backed dev API.
  - Date validation, duplicate slot rejection, and role selection were added for the first Release 1 slice.
- Last In Progress
  - The employee-side schedule MVP loop is green with mock data and ready for the admin review slice.
- Next Up
  - Implement admin request review with approval and rejection.
  - Reflect admin decisions back into the employee request status flow.
  - Start the assigned schedule confirmation view after the approval loop is stable.
- Blockers / Notes
  - Schedule persistence still uses an in-memory dev API and must later move to Supabase.
  - Real-time updates and request filter/sort are still pending.
- Related Commit
  - `ee48e2d`
