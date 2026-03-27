---
name: night-work
description: Continue working autonomously in the `rosty` repository during unattended stretches such as overnight sessions or long step-away periods. Use when the user asks Codex to keep going while they sleep or are away, minimize interruptions, chain follow-up work after each completed step, and stop only for approvals, destructive or high-risk actions, hard blockers, or true completion.
---

# Night Work

## Overview

Keep moving through the highest-value remaining work in `rosty` without waiting for frequent confirmation. Finish coherent slices end to end: implement, validate, repair failures, clean up, update related docs when behavior changed, then continue to the next in-scope task.

## Repository Grounding

Load the current repository rules before substantial implementation if they are not already in context:

- `AGENTS.md`
- `docs/agents/agent-charter.md`
- `docs/development/structure.md`
- `docs/development/naming.md`
- `docs/development/boundaries.md`
- `docs/development/quality.md`

Treat the most recent approved plan or user instruction as the scope boundary. Do not widen scope just because unattended time is available.

## Default Operating Mode

- Prefer continued progress over repeated check-ins when the remaining work is low-risk and within the approved scope.
- Make reasonable local decisions for naming, file placement, minor refactors, and test selection.
- Record meaningful assumptions in progress updates or the final report.
- After finishing one item, immediately continue with the next highest-value in-scope task instead of stopping at the first success.
- Use the full delivery loop whenever it is practical: implementation, targeted validation, failure repair, cleanup, and related doc updates.
- Leave optional polish for later if it does not materially improve correctness, validation, or handoff quality.

## Stop Conditions

Stop and ask the user only when at least one of these is true:

- A command requires approval or sandbox escalation.
- The next safe step is destructive and the user did not explicitly authorize it.
- The work would change a broad public interface, schema, auth flow, billing surface, production access path, or another high-impact contract without clear approval.
- The request is ambiguous enough that different reasonable interpretations would produce materially different outcomes.
- A hard blocker remains after reasonable local exploration and the next step cannot be derived safely.

Do not stop for minor gaps that can be closed with repo evidence or standard project conventions.

## Execution Loop

1. Restate the active goal and the current stopping rules in a short progress update.
2. Explore the relevant code and current worktree state before editing.
3. Implement the smallest coherent slice that advances the approved goal.
4. Run the best available targeted validation immediately after each slice.
5. Fix failures before moving on.
6. Continue into the next in-scope slice, follow-up fix, cleanup step, or doc update.
7. End only when the approved scope is finished or a stop condition is hit.

## Reporting

Keep progress updates short and factual while work is ongoing. When stopping, always report:

- what changed
- what validation ran and its result
- what still looks risky or incomplete
- the next best starting point if work is blocked or intentionally paused

If validation could not run, state the exact reason instead of implying success.
