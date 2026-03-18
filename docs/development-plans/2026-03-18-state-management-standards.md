# State Management Standards

## Summary

Document the repo-wide client state policy for Rosty so new implementation tasks consistently use `zustand` for local app state and `@tanstack/react-query` for remote server state. This task also adds Windows-safe editing guardrails to `AGENTS.md` so scripted file edits are read back and verified before work continues.

## Scope

- Add the state management standards to `AGENTS.md`.
- Add editing safety rules that prevent repeated newline or escape-sequence corruption during scripted edits.
- Record the active task and plan path in `WORKLOG.md`.
- Keep the guidance aligned with the existing React Native, Supabase, and testing workflow.

Out of scope:

- Feature implementation changes
- Dependency version changes
- Query client refactors or store creation
- PRD, schema, or screen IA updates

## Implementation Steps

1. Add a plan document for the state management standards task.
2. Update `WORKLOG.md` so the session pointer reflects the active doc change.
3. Add `zustand` and `@tanstack/react-query` usage rules to `AGENTS.md`, including ownership boundaries and persistence constraints.
4. Add Windows-safe editing rules to `AGENTS.md` so scripted edits are verified immediately after write operations.
5. Inspect the updated docs for consistency and record verification plus next action in `WORKLOG.md`.

## Data / Interface Impact

- Updated repo workflow contract in `AGENTS.md`
- Updated session pointer in `WORKLOG.md`
- New task plan in `docs/development-plans/`

## Test Plan

- Manual inspection of `AGENTS.md`, `WORKLOG.md`, and the new plan document
- `git diff -- AGENTS.md WORKLOG.md docs/development-plans/2026-03-18-state-management-standards.md`

Expected pass criteria:

- `AGENTS.md` explicitly defines when to use `zustand` and when to use `@tanstack/react-query`
- `AGENTS.md` includes editing rules that require post-write readback verification
- The standards distinguish local app state from remote server state
- `WORKLOG.md` points to the active documentation task and records verification notes
- No literal newline escape sequences or broken markdown headers remain in the edited files

Known gaps:

- No runtime code changes are included in this task
- No automated test coverage applies to the documentation-only update

## Done Criteria

- `AGENTS.md` contains the locked state management standards for this repo
- `AGENTS.md` contains the editing safety rules for Windows shell-based edits
- `WORKLOG.md` reflects the active task and latest verification for the doc update
- The repo docs are internally consistent about local state versus server state ownership
