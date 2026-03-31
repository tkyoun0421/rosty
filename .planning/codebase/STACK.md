# Technology Stack

**Analysis Date:** 2026-03-31

## Languages

**Primary:**
- TypeScript 5.9.x - Configured for the app and tests in `tsconfig.json` and used by Next/Vitest config files such as `next.config.ts` and `vitest.config.ts`
- JavaScript (ES modules) - Used for some root tooling config such as `postcss.config.mjs`

**Secondary:**
- Markdown - Used heavily for GSD planning and workflow content under `.planning/` and `.codex/get-shit-done/`
- PowerShell - Referenced by `package.json` for `test:foundation`, but the target script path `tests/agent-foundation.test.ps1` does not exist in the current repo
- TOML - Used for Codex/GSD agent configuration in `.codex/config.toml` and `.codex/agents/*.toml`

## Runtime

**Environment:**
- Node.js runtime required by `next`, `vitest`, and the root scripts in `package.json`
- Exact Node version is not pinned in the repository: no `.nvmrc`, `.node-version`, or `engines` field was detected

**Package Manager:**
- pnpm 10.32.1 - Declared in `package.json`
- Lockfile: present in `pnpm-lock.yaml`

## Frameworks

**Core:**
- Next.js 16.x - Primary web framework declared in `package.json`; minimal runtime config lives in `next.config.ts`
- React 19.x - UI runtime dependency declared in `package.json`

**Testing:**
- Vitest 3.x - Test runner configured in `vitest.config.ts`
- Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) - Installed in `package.json`, but no current test files were found under `tests/`
- jsdom 27.x - Browser-like test environment configured in `vitest.config.ts`

**Build/Dev:**
- TypeScript 5.9.x - Strict typechecking configuration in `tsconfig.json`
- PostCSS + `@tailwindcss/postcss` - Configured in `postcss.config.mjs`
- Prettier 3.x - Formatting rules in `.prettierrc.json`
- GSD/Codex workflow tooling - Repo-local planning and agent system under `.codex/` and `.planning/`

## Key Dependencies

**Critical:**
- `next` - Core app framework, even though there is no live `app/` or `src/` tree in the current repo state
- `react` and `react-dom` - Required by the configured Next.js workspace
- `typescript` - Enforces strict compile-time checks via `tsconfig.json`
- `vitest` - Primary automated test runner, although the repository currently has no matching test files

**Infrastructure:**
- `@supabase/supabase-js` and `@supabase/ssr` - Installed and referenced by planning artifacts such as `.planning/phases/01-access-foundation/01-02-PLAN.md`, but not implemented in live source files
- `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers` - Installed as app-layer dependencies, but currently unused because `src/` is absent
- `tailwindcss`, `@tailwindcss/postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` - UI styling stack is installed, but no current component or stylesheet source exists
- `server-only` - Installed for future server/client boundary work; no present usage detected

## Configuration

**Environment:**
- Local environment file exists at `.env` and is gitignored by `.gitignore`
- Example environment file exists at `.env.example`; it indicates required setup exists conceptually, but this analysis does not read its contents
- Planning documents under `.planning/phases/01-access-foundation/` define future env requirements for Supabase and Google auth, but those integrations are not yet implemented

**Build:**
- `next.config.ts` enables `reactStrictMode`
- `tsconfig.json` defines strict TS settings plus path aliases for `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, and `#shared/*`
- Those aliases currently point to directories under `src/` that do not exist in the repository
- `vitest.config.ts` mirrors the same alias map and targets `tests/**/*.test.ts?(x)`, but `tests/` does not exist
- `postcss.config.mjs` enables the Tailwind PostCSS plugin
- `.editorconfig` and `.prettierrc.json` define repository-wide formatting behavior

## Platform Requirements

**Development:**
- Node.js and pnpm are required to run the scripts in `package.json`
- A local Next.js dev server can be started via `pnpm dev`, but there is no current application entry tree (`app/` or `src/`) to serve meaningful app functionality
- GSD workflow usage depends on the repo-local tool and agent definitions in `.codex/` plus planning state in `.planning/`

**Production:**
- Deployment target is not defined in the current repository
- No hosting configuration, CI pipeline, Dockerfile, or infrastructure-as-code was detected
- The current state is better described as a planning-centric workspace skeleton than a deployable application

---

*Stack analysis: 2026-03-31*
