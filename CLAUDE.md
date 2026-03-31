<!-- GSD:project-start source:PROJECT.md -->
## Project

**라비에벨 웨딩홀 근무자 관리 웹 앱**

라비에벨 웨딩홀 단일 현장을 위한 내부 근무 운영 웹 애플리케이션이다. 관리자는 근무 스케줄 생성, 모집 운영, 신청 확인, 역할 배정, 출근 체크, 예상 급여 확인까지의 흐름을 한 곳에서 관리한다. 근무자는 자신이 신청 가능한 근무, 확정된 근무와 역할, 예상 급여를 신뢰할 수 있게 확인한다.

이 제품의 목적은 웨딩홀 운영에서 반복적으로 발생하는 스케줄 공지, 신청 수집, 배정 확정, 출근 확인, 운영 이상 징후 파악을 한 흐름으로 연결해 운영 부담을 줄이는 것이다.

**Core Value:** 관리자가 웨딩홀 근무를 빠르게 확정하고 근무자는 자신의 확정 근무, 역할, 예상 급여를 신뢰할 수 있게 확인할 수 있어야 한다.

### Constraints

- **Scope**: 라비에벨 웨딩홀 단일 현장 운영 최적화가 우선이다.
- **Auth**: 초대 기반 접근과 Google 로그인으로 내부 인력만 접근하도록 제한한다.
- **Roles**: 동일 계정 체계 안에서 역할 기반 권한만으로 운영한다.
- **Payroll**: v1에서는 예상 급여만 제공하고 실제 지급/정산은 하지 않는다.
- **Attendance**: 위치 기반 출근 체크는 현장 출근 검증을 위한 최소 기능으로 시작한다.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions are defined in `.planning/codebase/CONVENTIONS.md` and should be treated as the active source of truth for runtime code structure and workflow rules.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture is tracked in `.planning/codebase/ARCHITECTURE.md`. Runtime code follows the `src/app`, `src/flows`, `src/mutations`, `src/queries`, `src/shared` contract.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
Commit and push only when the user explicitly asks for it.
When committing, use a detailed commit message that explains the scope and outcome of the change.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->