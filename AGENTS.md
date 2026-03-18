# Rosty Agents

Rosty uses five role-specific agents.
Each agent has a narrow responsibility and a required handoff to the next stage.

## Role Index

- [PM](docs/agents/pm.md)
- [Documentation](docs/agents/documentation.md)
- [Development](docs/agents/development.md)
- [Testing](docs/agents/testing.md)
- [Review](docs/agents/review.md)

## Workflow

1. `PM` locks the feature goal, scope, acceptance criteria, and out-of-scope items.
2. `Documentation` updates the PRD, schema, IA, state tables, and the implementation plan in [`docs/development-plans/`](docs/development-plans/README.md) when code work is required.
3. `Development` updates [`WORKLOG.md`](WORKLOG.md) before implementation starts and works only from the locked plan.
4. `Testing` is mandatory for every completed feature.
5. `Development` updates [`WORKLOG.md`](WORKLOG.md) again after testing, then commits and pushes the completed task.
6. `Review` is mandatory before release and release-like merges.

## Common Rules

- Product decisions must be locked before implementation starts.
- Documentation is a required artifact, not a cleanup step after coding.
- Every implementation task must start with a written plan under [`docs/development-plans/`](docs/development-plans/README.md).
- If implementation scope changes, update the plan document before continuing the code change.
- [`WORKLOG.md`](WORKLOG.md) is the session recovery pointer and must be updated before implementation starts and after implementation or testing ends.
- Development may not invent unresolved product behavior. Escalate back to `PM`.
- Testing must leave a reproducible command list, pass/fail result, and residual risk note.
- Review follows a findings-first style and focuses on correctness, regressions, and role leakage.
- Keep docs, code, schema, and tests aligned when behavior changes.
- Each completed task must end with a commit and push to the active remote branch.
- Follow the secret handling rules in [docs/ops/secrets.md](docs/ops/secrets.md).

## Editing Safety

- When editing files from PowerShell on Windows, prefer literal here-strings or explicit line arrays over newline escape replacements in regex strings.
- After any scripted write, immediately reopen the edited file and confirm there are no literal escape sequences, broken markdown headers, or encoding corruption.
- If a non-default editing fallback is used because a patch tool failed, record that fallback in the task notes and verify the rendered file before continuing.

## Plan Archive

- When a feature implementation task is completed, move its plan artifacts into `docs/development-plans/<task-slug>/`.
- Keep a short `summary.md` in that folder with the locked goal, shipped scope, verification result, and follow-up notes.
- Keep the detailed working plan in the same folder so the summary and the full execution record stay together.
- After archival, update `WORKLOG.md` so it points to the archived summary or the next active plan as the recovery entry.

## Session Recovery

- [`WORKLOG.md`](WORKLOG.md) is the single source of truth for the latest in-flight or recently completed task.
- The minimum pointer fields are `Current Task`, `Plan Doc`, `Last Completed`, `Next Action`, `Blockers`, and `Latest Verification`.
- Any resumed session should read [`WORKLOG.md`](WORKLOG.md) first, then open the linked plan document.

## MCP Policy

- Active MCP today: `GitHub`, configured through [.mcp.json](.mcp.json).
- Approved future MCP: `Supabase`, but only in read-oriented mode for schema inspection, SQL review, and environment checks.
- Do not use MCP to make direct production database writes.
- Schema changes must go through migration files and manual apply or controlled rollout steps.
- MCP tokens must be rotated if exposed and must be loaded from local environment variables or secret storage only.

## Skills Policy

- Discovery source: `skills.sh`.
- First step for a new capability: use the installed `find-skills` helper to identify relevant skills.
- Official planning skill for this repo: `supercent-io/skills-template@task-planning`.
- Install repo-required skills at the project level. Do not make global install the default for Rosty workflows.
- Existing global skills may remain on the machine, but Rosty should not depend on them.
- Commit repo-local skill artifacts created by the Skills CLI, including `skills-lock.json` and the generated agent skill directories.
- Preferred categories for this repo:
  - Expo or React Native UI implementation
  - React Native data fetching and app integration
  - Supabase and Postgres best practices
- Use `skill-installer` only when a skill adds clear recurring value and does not conflict with repo rules, and only when the install target matches the repo policy.
- Use `skill-creator` only after a workflow repeats enough to justify a project-local skill.
- Project-local skills are deferred for now.

## State Management Standards

- `zustand` is the default library for client-owned app state such as auth shell state, view filters, temporary selections, cross-screen drafts, and other UI workflow state.
- `zustand` must not be used as the primary cache for Supabase rows, API payloads, or other server-owned collections.
- Keep Zustand stores feature-scoped under `src/features/<feature>/model/` by default. Promote a store to shared only when multiple features consume the same local state contract.
- Persist only non-sensitive local state in Zustand. Do not persist access tokens, service keys, or other secrets through store middleware.
- `@tanstack/react-query` is the default library for all server state, including Supabase reads, mutations, cache invalidation, background refetch, and loading or error lifecycle handling.
- Every remote read should have a stable query key and a single query-function boundary. Every remote write should update or invalidate the affected query keys explicitly.
- Screens must read server-owned data through query hooks instead of copying remote collections into Zustand.
- When both libraries are involved, TanStack Query owns remote truth and Zustand owns local interaction state. Store only the local controls in Zustand and derive rendered data from query results.

## Release Gates

- `Testing` is required on every completed feature.
- `Review` is required before release, release candidate handoff, or any merge treated as release quality.
- A feature is not release-ready if testing evidence is missing or if review findings leave unresolved high-severity risk.
