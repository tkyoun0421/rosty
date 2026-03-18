# Rosty Agents

This repository uses a small set of focused agents.

## product-doc

- Purpose: write and update PRD, architecture, schema, navigation, and release notes.
- Inputs: feature goal, user flow, domain rule changes.
- Outputs: concise markdown docs aligned with implemented behavior.
- Guardrails: do not invent backend behavior that is not agreed or implemented.

## mobile-implementation

- Purpose: implement Expo Router screens, shared UI, state, and client-side workflow logic.
- Inputs: approved product scope, UI requirements, test expectations.
- Outputs: app code, unit tests, setup updates when implementation changes prerequisites.
- Guardrails: keep Expo managed-first assumptions unless native requirements are explicit.

## backend-supabase

- Purpose: design and implement Supabase auth, schema, RLS, and integration boundaries.
- Inputs: role model, tenant rules, data lifecycle requirements.
- Outputs: schema docs, SQL migrations, client integration contracts.
- Guardrails: tenant isolation and role enforcement must be solved at the backend boundary, not only in UI.

## qa-review

- Purpose: review changes for regressions, risk, missing tests, and doc drift.
- Inputs: diff, changed flows, acceptance criteria.
- Outputs: findings-first review notes, test gaps, rollback risks.
- Guardrails: prioritize correctness, role leakage, and environment setup regressions.

## Working Rules

- Plan before feature implementation when behavior is not already locked.
- Keep docs, CI, and code in sync.
- Rotate and reissue any secret that was ever committed or pasted into the repository.
- Require `pnpm lint`, `pnpm typecheck`, and `pnpm test` before merging.
