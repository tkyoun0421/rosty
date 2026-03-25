# Development Plans Archive

Historical slice plans live in this directory.
The single active plan now lives at [`../development-plan.md`](../development-plan.md).
Implementation follows the active master plan first, and this directory is archive-only unless a historical record needs to be preserved.

## Required Flow

1. Update [`docs/development-plan.md`](../development-plan.md) for the currently active item.
2. Update [`WORKLOG.md`](../../WORKLOG.md) with the active task and master plan path before implementation starts.
3. Implement only after the plan is written and the relevant product docs are locked.
4. If scope or sequence changes during implementation, update the plan document before continuing.
5. Run the required tests and capture the results.
6. Update [`WORKLOG.md`](../../WORKLOG.md) again with the latest verification, blockers, and next action.
7. End the completed task with a commit and push.
8. If the task installs repo-local skills, commit the generated skills-lock.json and agent skill directories with the task.
9. When a slice needs historical preservation, archive its plan artifacts into `docs/development-plans/<task-slug>/` and add a `summary.md` for the final handoff note.

## Naming

- The active plan is always `docs/development-plan.md`.
- Completed feature archives live under `docs/development-plans/<task-slug>/` and should include the detailed plan plus `summary.md`.
- Do not create a second active plan file while `docs/development-plan.md` is current.

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

