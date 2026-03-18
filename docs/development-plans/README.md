# Development Plans

Every repo-tracked implementation task starts with a written plan in this directory.
Implementation follows the plan, not the other way around.

## Required Flow

1. Create or update a plan file in `docs/development-plans/`.
2. Update [`WORKLOG.md`](../../WORKLOG.md) with the active task and plan path before implementation starts.
3. Implement only after the plan is written and the relevant product docs are locked.
4. If scope or sequence changes during implementation, update the plan document before continuing.
5. Run the required tests and capture the results.
6. Update [`WORKLOG.md`](../../WORKLOG.md) again with the latest verification, blockers, and next action.
7. End the completed task with a commit and push.
8. If the task installs repo-local skills, commit the generated skills-lock.json and agent skill directories with the task.
9. When the feature is completed, archive its plan artifacts into `docs/development-plans/<task-slug>/` and add a `summary.md` for the final handoff note.

## Naming

- Active plans may start as `YYYY-MM-DD-<task-slug>.md`.
- Completed feature archives live under `docs/development-plans/<task-slug>/` and should include the detailed plan plus `summary.md`.
- Keep one active plan per implementation task.

## Required Sections

- `Summary`
- `Scope`
- `Implementation Steps`
- `Data / Interface Impact`
- `Test Plan`
- `Done Criteria`

## Template

```md
# <Task Title>

## Summary

Short description of the task and why it exists.

## Scope

- In scope
- Out of scope

## Implementation Steps

1. First change
2. Second change
3. Verification and handoff

## Data / Interface Impact

- Affected docs, routes, tables, APIs, or commands

## Test Plan

- Commands to run
- Expected pass criteria
- Known gaps if any

## Done Criteria

- Observable completion conditions
```


