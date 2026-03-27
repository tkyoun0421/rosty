# Document Evolution Policy

## Goal

When ongoing implementation reveals a missing rule, the repository should gain a new source document instead of rewriting an existing one.

## Rules

- Existing documents are immutable for policy purposes.
- New rules must be introduced through additive documents.
- Additive documents should live in one of these directories:
  - `docs/domain`
  - `docs/policies`
  - `docs/decisions`

## Usage

- Add a new document when a previously undefined rule needs to become part of the working contract.
- Prefer focused documents that define one rule set clearly.
- Let automation and future work read both the stable core documents and the additive documents together.
