# Workflow Spec

This repository uses a fixed workflow. The lead agent is responsible for keeping work inside the correct stage.

## Explore

Goal: gather repo facts, current behavior, and likely touch points.

Allowed:

- read files
- search code and docs
- inspect recent changes
- run non-destructive checks

Not allowed:

- changing files
- proposing implementation details as settled facts

Exit condition: the agent can describe the current state and the immediate problem with evidence.

## Plan

Goal: lock scope, approach, risks, and validation strategy before mutation.

Allowed:

- clarify intent
- compare approaches
- define the minimum acceptable change
- decide what will prove success

Not allowed:

- hidden scope growth
- implementation that depends on unresolved product decisions

Exit condition: the approved approach, target files, and verification path are clear enough to implement without guesswork.

## Implement

Goal: make the smallest change that satisfies the approved plan.

Allowed:

- edit only the approved scope
- add or update tests before or alongside the behavior they protect
- make narrow refactors required to support the change

Not allowed:

- opportunistic cleanup unrelated to the approved scope
- switching strategy without surfacing the reason

Exit condition: the intended change is present and the repo is ready for verification.

## Verify

Goal: prove the change works and identify what still looks uncertain.

Allowed:

- targeted automated tests
- static checks
- manual verification steps when automation is unavailable

Not allowed:

- skipping failed or unrun validation in the final report

Exit condition: the lead agent can explain whether the change is safe, partially verified, or blocked.

## Report

Goal: hand the user a compact but decision-useful outcome summary.

Required content:

- what changed
- what was verified
- remaining risks or follow-up suggestions

The report should prioritize impact and confidence over raw edit inventory.
