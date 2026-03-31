# Testing Patterns

**Analysis Date:** 2026-03-31

## Test Framework

**Runner:**
- Vitest 3.2.4
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest assertions with `@testing-library/jest-dom` loaded from `vitest.setup.ts`

**Run Commands:**
```bash
pnpm test              # Run configured Vitest suite
pnpm test:watch        # Run Vitest in watch mode
pnpm test:foundation   # Run PowerShell-based foundation test script if it exists
```

## Test File Organization

**Location:**
- Tests are configured to live in a separate top-level `tests/` tree, not co-located with source files. This is enforced by `vitest.config.ts` and `tsconfig.json`.
- No `tests/` directory currently exists in the repository state analyzed on 2026-03-31.

**Naming:**
- Enforced include pattern: `tests/**/*.test.ts` and `tests/**/*.test.tsx` from `vitest.config.ts`.
- Planned names are documented in `.planning/phases/01-access-foundation/01-01-PLAN.md` and `.planning/phases/01-access-foundation/01-VALIDATION.md`, including `tests/access/invite-flow.test.ts` and `tests/access/google-auth.test.ts`.

**Structure:**
```text
tests/
  access/
    invite-flow.test.ts
    google-auth.test.ts
    rbac.test.ts
    worker-rates.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
// Current enforced structure comes from config rather than checked-in test files.
// New tests must match the configured include globs in `vitest.config.ts`.
```

**Patterns:**
- Setup is centralized through `setupFiles: ["./vitest.setup.ts"]` in `vitest.config.ts`.
- Tests run in a `jsdom` environment per `vitest.config.ts`.
- Planned suite granularity is requirement-driven. `.planning/phases/01-access-foundation/01-VALIDATION.md` maps individual requirement IDs to specific test files and commands.

## Mocking

**Framework:** Vitest

**Patterns:**
```typescript
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("server-only", () => ({}));
```

**What to Mock:**
- The only implemented global mock is `server-only` in `vitest.setup.ts`, which makes server-only imports harmless in the test environment.
- Additional mocking guidance is not enforced by checked-in tests. Add mocks only where framework boundaries require them.

**What NOT to Mock:**
- Do not invent a broad mocking policy from the current repo; there are no surviving test files demonstrating one.
- Planning docs favor behavior-level verification of auth flows and route outcomes rather than placeholder TODO tests, as shown in `.planning/phases/01-access-foundation/01-01-PLAN.md` and `.planning/phases/01-access-foundation/01-02-PLAN.md`.

## Fixtures and Factories

**Test Data:**
```typescript
// No fixtures or factories are implemented in the current repository state.
```

**Location:**
- Not detected

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# No coverage script or coverage reporter is configured in `package.json` or `vitest.config.ts`.
```

## Test Types

**Unit Tests:**
- Planned, not implemented. `.planning/phases/01-access-foundation/01-RESEARCH.md` marks `tests/access/worker-rates.test.ts` as `unit/integration`.

**Integration Tests:**
- Planned, not implemented. `.planning/phases/01-access-foundation/01-VALIDATION.md` and the phase plan files expect requirement-level integration tests under `tests/access/`.

**E2E Tests:**
- Not used in current repo state. No Playwright or Cypress config file is present at the repository root.

## Common Patterns

**Async Testing:**
```typescript
// No checked-in async test example exists.
// Planned auth and callback tests in `.planning/phases/01-access-foundation/01-02-PLAN.md`
// imply async flow verification, but this is documented intent rather than existing pattern.
```

**Error Testing:**
```typescript
// No checked-in error test example exists.
// Planned cases include redirecting to `/sign-in?error=oauth` and unauthorized routing,
// documented in `.planning/phases/01-access-foundation/01-02-PLAN.md`.
```

## Current-State Reality Check

- `pnpm test` currently fails because no files match the configured include pattern in `vitest.config.ts`.
- `pnpm test:foundation` currently fails because `tests/agent-foundation.test.ps1` does not exist, even though the script is declared in `package.json`.
- Testing infrastructure exists before implementation code exists. Treat `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json`, and the phase validation documents as the active testing contract until real test files are added.
- When adding the first tests, create them under `tests/` so both TypeScript and Vitest discover them without additional config changes.

---

*Testing analysis: 2026-03-31*
