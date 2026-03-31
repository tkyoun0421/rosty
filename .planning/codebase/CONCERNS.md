# Codebase Concerns

**Analysis Date:** 2026-03-31

## Process Risks

**Planning drift after repository reset:**
- Issue: The planning system already records that the repository was reset and that Phase 1 plans should be regenerated, but the draft plans are still the active execution source.
- Files: `.planning/STATE.md`, `.planning/phases/01-access-foundation/01-CONTEXT.md`, `.planning/phases/01-access-foundation/01-01-PLAN.md`, `.planning/phases/01-access-foundation/01-02-PLAN.md`, `.planning/phases/01-access-foundation/01-03-PLAN.md`, `.planning/phases/01-access-foundation/01-04-PLAN.md`
- Impact: Future `/gsd:execute-phase` runs can treat stale file lists and stale verification targets as current truth, producing implementation work against a workspace that no longer exists.
- Fix approach: Regenerate Phase 1 plans from `.planning/phases/01-access-foundation/01-CONTEXT.md` and current repository contents before any execution step.

**Planning artifacts describe a larger codebase than the skeleton contains:**
- Issue: Phase 1 artifacts assume `src/`, `app/`, `tests/`, `scripts/`, and `supabase/` trees, but the repository currently contains root config plus `.planning/` only.
- Files: `.planning/phases/01-access-foundation/01-CONTEXT.md`, `.planning/phases/01-access-foundation/01-RESEARCH.md`, `.planning/phases/01-access-foundation/01-VALIDATION.md`, `tsconfig.json`, `vitest.config.ts`, `package.json`
- Impact: The docs are useful as intent, but they are not a reliable map of what is actually present. Mapping, planning, and verification commands can overestimate implementation readiness.
- Fix approach: Treat `.planning/phases/01-access-foundation/01-CONTEXT.md` as the only stable intent source, then re-baseline file inventories and validation targets around the current skeleton.

**Encoding visibility risk in planning and workflow docs:**
- Issue: Core project and workflow docs contain Korean text, and they rendered as mojibake in the current shell despite the repo declaring UTF-8 text handling.
- Files: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `CLAUDE.md`, `.editorconfig`, `.gitattributes`
- Impact: Planning decisions become harder to review correctly in some terminals or editors, which increases the chance of misreading constraints and shipping against the wrong product assumptions.
- Fix approach: Keep UTF-8 as the repo standard, but verify terminal/editor encoding in the active workflow and spot-check critical planning files after edits.

**Research-to-config drift:**
- Issue: research documents pin exact dependency versions that differ from the current manifest and lock state.
- Files: `.planning/phases/01-access-foundation/01-RESEARCH.md`, `package.json`, `pnpm-lock.yaml`
- Impact: Agents can cite `.planning/phases/01-access-foundation/01-RESEARCH.md` as if it matches installed tooling even though the workspace currently resolves different package versions.
- Fix approach: Refresh version notes in research artifacts when dependencies change, or explicitly mark the research versions as advisory rather than canonical.

## Code Risks

**No executable application entrypoint:**
- Symptoms: `pnpm build` fails because Next.js cannot find an `app` or `pages` directory.
- Files: `package.json`, `next.config.ts`
- Trigger: Run `pnpm build` in the repository root.
- Workaround: Create a minimal `app/` tree before treating the workspace as a runnable Next.js app.

**Automated test command is broken at baseline:**
- Symptoms: `pnpm test` exits with `No test files found`.
- Files: `package.json`, `vitest.config.ts`, `vitest.setup.ts`
- Trigger: Run `pnpm test` in the repository root.
- Workaround: Add the planned `tests/**/*.test.ts(x)` files or temporarily replace the test script with a skeleton-health check that matches the current workspace.

**Package scripts point to missing files:**
- Symptoms: multiple npm scripts reference files that are not present in the repository.
- Files: `package.json`
- Trigger: Run `pnpm run test:foundation`, `pnpm run night-work:start`, `pnpm run night-work:build-prompt`, `pnpm run night-work:status`, or `pnpm run night-work:stop`.
- Workaround: Remove or replace dead scripts until `tests/agent-foundation.test.ps1` and `scripts/night-work/*` are restored.

## Security Considerations

**Secret-dependent auth plan without executable validation:**
- Risk: the workspace already expects secret-backed auth configuration, but there is no runtime code, schema, or startup validation enforcing the required environment contract.
- Files: `package.json`, `.env` (present), `.env.example` (present), `.planning/phases/01-access-foundation/01-01-PLAN.md`, `.planning/phases/01-access-foundation/01-02-PLAN.md`
- Current mitigation: Secret files are ignored by `.gitignore`, and `.env.example` is kept as the shareable template.
- Recommendations: Add a minimal config-validation module as soon as app code exists, and fail fast on missing auth variables before adding Supabase or Google login flows.

## Performance Bottlenecks

**Planning-heavy workspace with no executable target:**
- Problem: most repository surface area is documentation and workflow metadata, while core commands still attempt full app build and test flows.
- Files: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/phases/01-access-foundation/01-RESEARCH.md`, `package.json`
- Cause: the repository was intentionally reduced to a skeleton, but command defaults still assume an implementation-bearing app.
- Improvement path: add a dedicated "workspace skeleton" health script and use that until `app/`, `src/`, and `tests/` are restored.

## Fragile Areas

**`.planning/` is the only rich source of product and implementation context:**
- Files: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/phases/01-access-foundation/01-CONTEXT.md`
- Why fragile: when the codebase is this thin, any stale or misencoded planning artifact has outsized influence over every later implementation decision.
- Safe modification: update planning docs in small, verified passes and cross-check `.planning/STATE.md` against the phase plans after each reset or scope change.
- Test coverage: no automated checks verify document consistency, plan freshness, or path existence.

## Scaling Limits

**Execution workflow does not scale past the skeleton stage:**
- Current capacity: the workspace can hold requirements, plans, and config, but it cannot build, test, or execute Phase 1 tasks yet.
- Limit: any attempt to treat the repo as a live Next.js app or a live verified phase will fail immediately on missing directories and targets.
- Scaling path: restore a minimal vertical slice first: `app/`, `src/`, `tests/`, then regenerate validation and execution artifacts around those files.

## Dependencies at Risk

**Workflow dependence on absent local assets:**
- Risk: local workflow commands assume shell scripts and PowerShell tests that have been removed.
- Impact: automation appears available from `package.json` but fails when invoked, which can mislead later agents and CI setup.
- Migration plan: either recreate `tests/agent-foundation.test.ps1` and `scripts/night-work/*` or delete those scripts from `package.json`.

## Missing Critical Features

**Current repository is a skeleton, not a functioning app:**
- Problem: the expected application directories and database assets are missing.
- Blocks: Next.js routing, auth implementation, Supabase schema work, integration tests, and any execution of Phase 1 plans.
- Files: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.planning/phases/01-access-foundation/01-CONTEXT.md`

## Test Coverage Gaps

**No repository-level executable tests exist:**
- What's not tested: all planned Phase 1 auth, invite, RBAC, and worker-rate behavior remains unimplemented and untested in the current workspace.
- Files: `vitest.config.ts`, `.planning/phases/01-access-foundation/01-VALIDATION.md`, `.planning/phases/01-access-foundation/01-01-PLAN.md`
- Risk: future work can claim progress through planning artifacts while the actual repository still has no passing automated verification.
- Priority: High

---

*Concerns audit: 2026-03-31*
