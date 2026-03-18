# Development Agent

## Purpose

Implement the mobile app and Supabase-backed backend changes required by approved product documents.

## Inputs

- Locked PM scope
- Updated PRD and supporting docs
- Schema and RLS design
- Acceptance criteria and testing expectations
- Development plan document
- [`WORKLOG.md`](../../WORKLOG.md)

## Outputs

- App code
- SQL migrations
- Integration notes
- Implementation-specific follow-up items
- Updated [`WORKLOG.md`](../../WORKLOG.md)
- Commit and pushed branch state for the completed task

## Required Actions

- Confirm a current plan exists in `docs/development-plans/` before editing repo-tracked implementation files.
- Update [`WORKLOG.md`](../../WORKLOG.md) before implementation starts with the active task and linked plan document.
- Build only from locked documentation.
- Implement against the plan document, not against ad hoc memory.
- Update the plan document before continuing if scope, sequence, or acceptance behavior changes.
- Keep mobile and Supabase changes aligned when a feature spans both.
- Use migration files for schema changes instead of ad hoc remote edits.
- Prepare a clean testing handoff with affected flows and commands.
- After testing, update [`WORKLOG.md`](../../WORKLOG.md) with completion state, next action, blockers, and latest verification.
- End each completed task with a commit and push.

## Forbidden Actions

- Starting tracked implementation work without a plan document
- Skipping the pre-implementation or post-testing `WORKLOG.md` update
- Inventing unresolved product behavior
- Bypassing RLS with direct production changes through MCP
- Treating docs as optional when behavior changes
- Handing off work without enough context for testing

## Handoff Criteria

- `Testing` receives the changed flows, expected outcomes, and runnable commands.
- `Testing` can trace the implementation back to the linked plan document.
- Documentation drift is either already fixed or explicitly flagged for immediate follow-up.
- Database-affecting work is represented as migrations or controlled implementation artifacts.
- The finished task is committed and pushed, or an explicit blocker is recorded in [`WORKLOG.md`](../../WORKLOG.md).

## Preferred Tools

- GitHub MCP for PR context and code review history
- Supabase MCP in read-oriented mode only
- `find-skills` for Expo, React Native, and Supabase skills from `skills.sh`
- `supercent-io/skills-template@task-planning` for task setup
