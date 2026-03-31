# External Integrations

**Analysis Date:** 2026-03-31

## APIs & External Services

**Application Integrations:**
- Supabase - Planned backend for auth, database, and SSR session handling
  - SDK/Client: `@supabase/supabase-js`, `@supabase/ssr` in `package.json`
  - Auth: planned env vars are referenced by `.planning/phases/01-access-foundation/01-01-PLAN.md` and `.planning/phases/01-access-foundation/01-02-PLAN.md`
  - Implementation status: planned/configured in dependencies and planning docs only; no live implementation files such as `src/lib/supabase/*.ts` exist in the current repo
- Google OAuth - Planned sign-in provider for the future auth flow
  - SDK/Client: no direct Google SDK is installed; the plan routes Google auth through Supabase Auth in `.planning/phases/01-access-foundation/01-RESEARCH.md`
  - Auth: planned credentials are called out in Phase 1 planning docs and implied by tracked `.env.example`
  - Implementation status: planned only; no current route handlers such as `src/app/auth/callback/route.ts` exist

**Workspace / Agent Tooling:**
- GSD/Codex local workflow system - Active repository-level workflow integration
  - SDK/Client: repo-local code and configuration under `.codex/` and `.codex/get-shit-done/`
  - Auth: none at the application layer; this is local tool wiring, not a user-facing product integration
  - Implementation status: present and active as repository tooling, not as runtime app code
- Optional search/research providers in vendored GSD code - Brave, Firecrawl, and Exa are conditionally referenced in `.codex/get-shit-done/bin/lib/config.cjs` and `.codex/get-shit-done/bin/lib/init.cjs`
  - SDK/Client: custom local Node scripts inside `.codex/get-shit-done/`
  - Auth: environment-variable based in vendored tooling
  - Implementation status: capability exists in the bundled GSD toolchain, but no repository-level configuration proves they are enabled for this workspace

## Data Storage

**Databases:**
- Supabase Postgres - Planned only
  - Connection: future environment variables are referenced in `.planning/phases/01-access-foundation/01-02-PLAN.md`
  - Client: intended clients are `@supabase/supabase-js` and `@supabase/ssr` from `package.json`
  - Implementation status: no `supabase/` directory, migrations, seed files, or live data-access modules exist in the current repository

**File Storage:**
- None implemented
- Supabase Storage is only indirectly available through `@supabase/supabase-js`; no current storage code or storage configuration files were found

**Caching:**
- None implemented
- `@tanstack/react-query` and `zustand` are installed in `package.json`, but there is no live application code using them

## Authentication & Identity

**Auth Provider:**
- Planned: Supabase Auth with Google login
  - Implementation: described in `.planning/REQUIREMENTS.md` and detailed in `.planning/phases/01-access-foundation/01-02-PLAN.md`
  - Implementation status: not implemented in current source because there is no `src/` or `app/` auth code

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- No application logging integration detected
- GSD/Codex tooling maintains planning and workflow artifacts in `.planning/`, but that is project-process state rather than runtime observability

## CI/CD & Deployment

**Hosting:**
- Not defined
- No Vercel config, Dockerfile, container config, or deployment manifests were detected

**CI Pipeline:**
- None detected
- `.github/` is absent, so there are no repository CI workflows in the current state

## Environment Configuration

**Required env vars:**
- Current repo state proves only that `.env` exists and `.env.example` is tracked
- Planned application vars are documented in `.planning/phases/01-access-foundation/01-01-PLAN.md` and `.planning/phases/01-access-foundation/01-02-PLAN.md` for:
  - Supabase project URL and anon key
  - Supabase service role and project reference
  - Supabase DB password
  - Google OAuth client credentials
- Exact values were intentionally not read from any environment file

**Secrets location:**
- Local secrets file: `.env` exists and is ignored by `.gitignore`
- Template file: `.env.example` is tracked for setup guidance
- Additional future secret handling is only discussed in planning artifacts, not implemented in code

## Webhooks & Callbacks

**Incoming:**
- None implemented
- Planned auth callback route is referenced in `.planning/phases/01-access-foundation/01-02-PLAN.md` as `src/app/auth/callback/route.ts`, but that file does not exist

**Outgoing:**
- None implemented
- No current HTTP clients, webhook senders, or third-party API call sites were found in live application source because no app source tree is present

---

*Integration audit: 2026-03-31*
