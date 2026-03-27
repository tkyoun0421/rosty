# Task Templates

These templates define the minimum bar for common task types.

## Bugfix

Before starting:

- identify the failing behavior
- capture the expected behavior

Completion criteria:

- root cause is explained
- a regression check exists or the lack of one is explicit
- the fix is verified against the failing case

Final report must include:

- bug symptom
- fix summary
- regression coverage or remaining gap

## Feature

Before starting:

- define the user or developer scenario
- define the success condition
- identify failure cases worth protecting

Completion criteria:

- the feature path works
- failure paths are considered
- validation covers the core scenario

Final report must include:

- scenario delivered
- validation run
- known edge cases not yet covered

## Refactor

Before starting:

- state which behavior must stay the same
- define why the refactor is needed

Completion criteria:

- behavior-preservation claim is backed by checks
- boundaries or readability improve without hidden scope growth

Final report must include:

- what was simplified
- what protected behavior stayed the same
- where risk still exists

## Docs

Before starting:

- identify the target reader
- identify the source of truth being documented

Completion criteria:

- the documented steps or facts match the repo state
- ambiguity and placeholders are removed

Final report must include:

- audience
- document purpose
- what was checked for accuracy
