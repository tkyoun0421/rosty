# Project Agents

This repository uses a workflow-driven agent model. Start here, then follow the documents in `docs/agents` and `docs/development`.

## Operating Model

- One `lead agent` owns the user conversation, workflow stage, and final output.
- Specialists are opt-in helpers, not default participants.
- Use specialists only when they remove a real bottleneck or reduce review risk.
- The lead agent keeps final responsibility for correctness, integration, and reporting.

## Workflow

1. Explore the repo and collect facts.
2. Plan the change, risks, and validation approach.
3. Implement only the approved scope.
4. Verify behavior before claiming completion.
5. Report outcome, validation, and remaining risk.

## Development Baseline

Use this stack as the default unless there is a concrete reason the existing baseline cannot solve the problem.

### Runtime

- `Next.js 16`
- `React 19`
- `TypeScript 5`
- Package manager: `pnpm 10`

### Core Libraries

- Server state: `TanStack Query 5`
- Client local state: `Zustand 5`
- Backend and auth: `Supabase JS 2`
- UI primitives: `shadcn/ui`
- Styling: `Tailwind CSS 4`
- Formatting: `Prettier 3`

### State And Data Rules

- Use `TanStack Query` for server state, caching, invalidation, and async request status.
- Manage query keys through shared key factories in `src/shared/constants/queryKeys.ts`.
- Do not inline query key arrays inside hooks or mutation invalidation.
- Keep components folders dumb. They should render props, not own query, mutation, form, or fetch logic.
- Keep app-only providers under `src/app/_providers` and name them by concern.
- Use `Zustand` for client-only local state that should not live in React component state.
- Do not solve the same problem with both `TanStack Query` and `Zustand`.
- Keep auth and backend integration on `Supabase` unless a documented exception is approved.

### Auth Baseline

- Default auth provider: `Supabase Auth + Google OAuth`
- Do not add email/password auth unless the user explicitly asks for it.
- Add new providers only after the Google path is stable.

### Form And Validation

- Form state: `react-hook-form 7`
- Runtime validation: `zod 3`

### Testing Baseline

- Unit and component tests: `Vitest` + `React Testing Library`
- End-to-end tests: `Playwright`

### Text Encoding

- All docs and text-based config files must be stored as `UTF-8`.
- When using PowerShell to write docs or config files, always pass `-Encoding UTF8` or use a UTF-8 .NET writer explicitly.
- Treat invalid UTF-8 or mojibake as a correctness issue, not a cosmetic issue.
- PowerShell scripts that contain non-ASCII text should use UTF-8 BOM for Windows PowerShell compatibility.

## Required Documents

- `docs/agents/agent-charter.md`: non-negotiable operating rules and escalation boundaries
- `docs/agents/workflow-spec.md`: stage-by-stage behavior contract
- `docs/agents/specialist-contracts.md`: role summary, invocation guidance, and links to detailed role rules
- `docs/agents/task-templates.md`: minimum completion criteria by task type
- `docs/agents/roles/lead.md`: lead-specific execution rules and handoff boundaries
- `docs/agents/roles/research.md`: research specialist evidence and reporting rules
- `docs/agents/roles/implementation.md`: implementation specialist scope and verification rules
- `docs/agents/roles/review.md`: review specialist finding and risk-reporting rules
- `docs/development/structure.md`: project layer structure and ownership rules
- `docs/development/naming.md`: file, symbol, export, and UI naming conventions
- `docs/development/boundaries.md`: layer boundaries, import rules, and UI safety rules
- `docs/development/quality.md`: testing, review, and structural safety rules

Before code changes, read the development rules first.

If a local instruction conflicts with an ad hoc request, obey the user. If two agent documents conflict, `agent-charter.md` wins.
