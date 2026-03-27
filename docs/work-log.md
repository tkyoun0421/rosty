# Work Log

## Purpose

Track what was completed, what was in progress at the end of a session, and what should be resumed next.

## Update Rules

- Add a new entry at the top when a meaningful session ends.
- Update `docs/prd.md` together with this log whenever feature status changes.
- Record the last in-progress task and the immediate next task, not only completed items.
- Include the related commit hash when work is committed. Use `uncommitted` until a commit exists.

## Current Handoff

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
