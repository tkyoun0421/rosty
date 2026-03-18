# Agent Workflow Hardening

## Summary

Add repo-level execution discipline for Rosty so every implementation task starts with a documented plan, uses a single session recovery pointer, and ends with a commit and push. Install the official planning skill at the project level and document how it fits into the workflow.

## Scope

- Update agent workflow docs to require plan-first implementation.
- Add the `WORKLOG.md` session recovery pointer.
- Add development plan rules and the first concrete plan document.
- Install the project-level `task-planning` skill.
- Add the task-end commit and push rule to the operating docs.

Out of scope:

- Feature implementation changes
- Supabase schema migrations
- GitHub Actions automation changes
- Global skill cleanup or migration

## Implementation Steps

1. Update `AGENTS.md` and `docs/agents/*.md` to require a plan document, `WORKLOG.md` updates, and commit plus push at task completion.
2. Add `docs/development-plans/README.md` and this plan file to define the required planning format.
3. Add `WORKLOG.md` as the session recovery pointer and initialize it for this task.
4. Install `supercent-io/skills-template` with the `task-planning` skill at the project level and record the resulting repo artifacts.
5. Verify the new workflow files and skill installation output, then update `WORKLOG.md` with final status.

## Data / Interface Impact

- New repo workflow docs in `docs/development-plans/`
- New root pointer file `WORKLOG.md`
- Updated agent contracts in `AGENTS.md` and `docs/agents/`
- Project-level skill install artifacts created by the Skills CLI:
  - `skills-lock.json`
  - `.agent/skills/task-planning/`
  - `.agents/skills/task-planning/`
  - `.claude/skills/task-planning/`

## Test Plan

- Inspect the updated docs for consistent rules around planning, `WORKLOG.md`, and commit plus push.
- Confirm the project-level skill appears in the repo-local skills listing.
- Check `git status` to ensure the expected files are tracked.

## Done Criteria

- `AGENTS.md` and role docs consistently require plan-first implementation.
- `WORKLOG.md` exists and points to the active task.
- `docs/development-plans/README.md` defines the plan format and lifecycle.
- The `task-planning` skill is installed at the project level.
- The task ends with verification notes, a commit, and a push.
