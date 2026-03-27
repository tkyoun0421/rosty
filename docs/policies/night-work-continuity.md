# Night Work Continuity Policy

## Goal

`night-work` sessions should continue across multiple coherent slices instead of stopping after the first completed implementation or report.

## Continuation Rules

- A completed feature slice is a checkpoint, not a terminal state.
- After each slice, the next highest-value in-scope task should begin immediately.
- Validation, failure repair, cleanup, and additive documentation are part of the same continuous loop.

## Hard Stop Rules

Work should stop only for these reasons:

- approval is required
- a destructive change is required
- the request conflicts with explicit user requirements
- an external blocker prevents safe progress
- the approved scope is truly exhausted

## Output Contract

Each unattended run should emit a machine-readable result that can be reduced to these markers:

- `NIGHT_WORK_STATUS: CONTINUE`
- `NIGHT_WORK_STATUS: BLOCKED`
- `NIGHT_WORK_REASON: slice_complete|approval_required|destructive_change|requirement_conflict|external_blocker|scope_exhausted`
