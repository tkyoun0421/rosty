<!-- GSD:project-start source:PROJECT.md -->
## Project

**라비에벨 웨딩홀 근무자 관리 웹 앱**

라비에벨 웨딩홀 전용 근무 운영 웹 애플리케이션이다. 관리자와 근무자가 같은 계정 체계를 쓰되 역할로 권한을 나누고, 웨딩홀 근무 스케줄 생성부터 신청, 역할 배정, 출근 체크, 예상 급여 확인까지의 운영 흐름을 한 곳에서 처리한다.

이 제품은 웨딩홀 근무 운영에서 반복적으로 발생하는 일정 공지, 신청 취합, 배정 확정, 출근 확인, 지각 파악을 자동화해 운영 부담을 줄이는 것이 목적이다.

**Core Value:** 관리자가 웨딩홀 근무를 빠르게 확정하고 근무자는 자신의 확정 근무, 역할, 예상 급여를 신뢰할 수 있게 확인할 수 있어야 한다.

### Constraints

- **Scope**: 라비에벨 웨딩홀 전용 — 다지점 일반화보다 현장 운영 효율 개선이 우선이다.
- **Auth**: 초대 기반 가입 + Google 로그인 — 내부 인력만 접근하도록 제한해야 한다.
- **Roles**: 단일 계정 체계에서 역할 기반 권한 분리 — 사용자 모델을 단순하게 유지하기 위해서다.
- **Payroll**: 예상 급여만 제공 — 실제 정산/지급 시스템은 v1 범위 밖이다.
- **Attendance**: 위치 기반 출근 체크 필요 — 현장 출근 검증이 운영상 필수다.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
When a coherent unit of work is finished, commit and push it unless the user explicitly says not to. Use a detailed commit message that explains the scope and outcome of the change.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
