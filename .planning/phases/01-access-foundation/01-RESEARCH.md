# Phase 1: Access Foundation - Research

**Researched:** 2026-03-31
**Domain:** Next.js 16 + Supabase Auth access control foundation
**Confidence:** MEDIUM-HIGH

## User Constraints

No phase-specific `*-CONTEXT.md` exists yet. Treat these as binding inputs from `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, and the user prompt:

### Locked Decisions
- Single-venue internal tool for 라비에벨 웨딩홀.
- One account system with role-based permissions.
- Google login is required.
- Access must be invite-gated for internal staff only.
- Phase 1 must satisfy `AUTH-01`, `AUTH-02`, `AUTH-03`, and `PAY-01`.
- Existing app code is not trustworthy and should not constrain planning.
- Payroll scope in v1 is pay preview only, not actual payroll processing.

### Claude's Discretion
- Exact invite enforcement mechanism.
- Exact RBAC data model and RLS pattern.
- Exact hourly-rate schema as long as it supports admin create/update now and safe pay logic later.
- Exact App Router structure and implementation sequence across the 3 phase plans.

### Deferred Ideas (OUT OF SCOPE)
- Multi-venue support.
- Separate admin and worker account systems.
- Real payroll settlement and payout.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | 관리자는 초대 기반으로 근무자 계정을 생성하거나 초대 링크를 발급할 수 있다. | Invitation table, admin-only invite actions, signup gate with auth hook, accept-invite transaction |
| AUTH-02 | 사용자는 Google 로그인을 통해 가입 및 로그인할 수 있다. | Supabase Google OAuth with PKCE callback route and SSR session cookies |
| AUTH-03 | 시스템은 사용자 역할에 따라 관리자와 근무자의 접근 권한을 구분한다. | `app_users.role` enum, DAL authorization helpers, RLS helper functions, route groups |
| PAY-01 | 관리자는 근무자별 시급을 등록하고 수정할 수 있다. | Effective-dated hourly-rate table, admin mutation flow, current-rate query/view |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Follow GSD workflow expectations for repo changes.
- Do not recommend a separate admin/worker account model; keep a single account system with role-based permissions.
- Keep v1 payroll limited to pay preview.
- Keep the product scoped to a single venue.
- Phase 1 auth must support invite-based access plus Google login.
- Later attendance work requires location-based check-in, so user and worker identity should stay stable across future phases.

## Summary

Use Supabase Auth for Google sign-in and session management, but do not use Auth alone as the authorization model. The durable business identity for this app should live in Postgres: an `app_users` table keyed by `auth.users.id`, an `invitations` table that controls who may onboard, and an effective-dated `worker_hourly_rates` table that avoids rewriting pay history later.

The strongest Phase 1 architecture is invite-gated at auth creation time, not only after login. Supabase's `before-user-created` hook can reject uninvited signups before the `auth.users` row is inserted. That closes the main hole in a Google-only flow, where otherwise any Google account could create an auth user and only be blocked after the fact.

For authorization, follow Next.js's current guidance: optimistic checks in `proxy.ts` only if needed, but secure checks in a server-side data access layer backed by the database. Keep admin/worker role checks on the server and in RLS policies. Do not rely on client state or experimental Next.js auth interrupt APIs for the core enforcement path.

**Primary recommendation:** Build Phase 1 around Supabase Google OAuth + a Postgres-backed invitation gate + server-side DAL authorization + effective-dated worker rates.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.1` | App Router application shell and server actions | Current repo stack; official auth guidance and `proxy.ts` conventions are current here |
| `react` | `19.2.4` | UI runtime | Matches current Next 16 ecosystem |
| `react-dom` | `19.2.4` | Server/client rendering | Required by Next 16 |
| `@supabase/supabase-js` | `2.101.0` | Auth, PostgREST, admin API access | Official Supabase client for OAuth, auth admin, and DB access |
| `@supabase/ssr` | `0.10.0` | SSR-safe Supabase clients with cookie-based auth | Official server-side auth integration for Next.js |
| `zod` | `4.3.6` | Input validation for server actions and forms | Keep invite and rate mutations validated on the server |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` | `7.72.0` | Admin invite and rate-edit forms | Use for admin UI forms with validation and error state |
| `@hookform/resolvers` | `5.2.2` | Zod integration for forms | Use with `react-hook-form` |
| `@tanstack/react-query` | `5.95.2` | Client-side cache for interactive admin screens | Use only where client cache improves UX; do not use for core auth checks |
| `vitest` | `4.1.2` | Unit/component tests | Use for DAL, server action, schema, and form tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth + SSR | Auth.js | Valid, but repo already depends on Supabase auth stack; duplicating auth/session layers adds avoidable complexity |
| Table-backed role checks | JWT custom role claims | Faster reads, but token refresh and role-staleness add risk for a two-role internal tool |
| Effective-dated hourly-rate table | Single `hourly_rate` column on `app_users` | Simpler today, but causes pay-history rewrites or silent retroactive pay changes later |
| Server actions for admin mutations | Route handlers for everything | Route handlers are useful for OAuth callback, but server actions are better for internal admin mutations in App Router |

**Installation:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers @tanstack/react-query
pnpm add -D vitest
```

**Version verification:** Verified on 2026-03-31 with `npm view`.

| Package | Verified version | Registry modified |
|---------|------------------|-------------------|
| `next` | `16.2.1` | `2026-03-30` |
| `react` | `19.2.4` | `2026-03-30` |
| `react-dom` | `19.2.4` | `2026-03-30` |
| `@supabase/supabase-js` | `2.101.0` | `2026-03-30` |
| `@supabase/ssr` | `0.10.0` | `2026-03-30` |
| `zod` | `4.3.6` | `2026-01-25` |
| `react-hook-form` | `7.72.0` | `2026-03-22` |
| `@hookform/resolvers` | `5.2.2` | `2025-09-14` |
| `@tanstack/react-query` | `5.95.2` | `2026-03-23` |
| `vitest` | `4.1.2` | `2026-03-26` |

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/
│   ├── (public)/                 # login, invite landing, onboarding info
│   ├── auth/
│   │   └── callback/route.ts     # Google OAuth PKCE callback
│   ├── (admin)/                  # admin-only routes
│   ├── (worker)/                 # worker-only routes
│   └── forbidden/page.tsx        # stable access-denied page
├── shared/
│   ├── auth/                     # Supabase clients, session helpers, requireRole helpers
│   ├── db/                       # typed queries, mutation helpers, SQL wrappers
│   ├── validation/               # zod schemas
│   └── types/                    # DB and domain types
├── flows/
│   └── access-foundation/        # invite acceptance and rate admin orchestration
└── queries/
    └── access-foundation/        # server-side reads for current actor, invites, current rates
supabase/
└── migrations/                   # schema, RLS, functions, auth hook setup SQL
```

### Pattern 1: Invite-Gated Google Onboarding
**What:** Use a Postgres `invitations` table as the source of truth for onboarding eligibility, then enforce it twice:
1. `before-user-created` auth hook blocks uninvited signups.
2. The OAuth callback finalizes the invitation and provisions the app user profile in one server-side transaction.

**When to use:** Always for this phase. It is the cleanest way to satisfy "internal staff only" with Google login.

**Recommended schema shape:**
- `app_role` enum: `admin`, `worker`
- `invite_status` enum: `pending`, `accepted`, `revoked`, `expired`
- `app_users`
  - `id uuid primary key` references `auth.users(id)`
  - `email text unique not null`
  - `display_name text`
  - `role app_role not null`
  - `is_active boolean not null default true`
  - `invited_by uuid null`
  - `created_at`, `updated_at`
- `invitations`
  - `id uuid primary key`
  - `email text not null`
  - `role app_role not null`
  - `token_hash text unique not null`
  - `status invite_status not null default 'pending'`
  - `expires_at timestamptz not null`
  - `invited_by uuid not null`
  - `accepted_by uuid null`
  - `accepted_at timestamptz null`
  - unique partial index on lower(email) where status = 'pending'

**Implementation notes:**
- Match invitation by normalized email, not by token alone.
- Treat shareable invite links as secondary. The security control is email + invitation status.
- If the business insists on generic links later, add a second onboarding factor. Do not start there.

### Pattern 2: Table-Backed RBAC With Server-Side DAL
**What:** Put the role in `app_users.role`, then centralize secure authorization in server-side helpers such as `requireActor()` and `requireAdmin()`.

**When to use:** All protected pages, server actions, and route handlers.

**Example:**
```ts
// Source guidance: https://nextjs.org/docs/app/guides/authentication
// Source auth verification: https://supabase.com/docs/reference/javascript/auth-getuser
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await getActorById(user.id);
  if (!actor || actor.role !== "admin" || !actor.is_active) {
    redirect("/forbidden");
  }

  return actor;
}
```

### Pattern 3: Effective-Dated Worker Rates
**What:** Store hourly rates in a separate history table rather than a mutable column.

**When to use:** Phase 1 already. Future pay preview depends on historical correctness.

**Recommended schema shape:**
- `worker_hourly_rates`
  - `id uuid primary key`
  - `user_id uuid not null` references `app_users(id)`
  - `hourly_rate numeric(10,2) not null check (hourly_rate > 0)`
  - `currency_code text not null default 'KRW'`
  - `effective_from timestamptz not null`
  - `effective_to timestamptz null`
  - `created_by uuid not null`
  - `created_at timestamptz not null default now()`
- partial unique index: one open-ended rate per worker where `effective_to is null`

**Operational rule:** Updating the current rate closes the prior row and inserts a new current row in one transaction.

### Pattern 4: Server Actions For Admin Mutations, Route Handler For OAuth
**What:** Keep internal mutations in server actions, but keep the OAuth callback as `app/auth/callback/route.ts`.

**When to use:**
- Server actions: create invite, revoke invite, create initial admin, update rate
- Route handler: Google code exchange

**Example:**
```ts
// Source pattern: https://supabase.com/docs/guides/auth/social-login/auth-google
export async function startGoogleSignIn(next = "/") {
  const supabase = createBrowserSupabaseClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
}
```

### Anti-Patterns to Avoid
- **Client-only role checks:** Hiding links is not authorization.
- **Relying on Supabase session cookie alone for role:** Store roles in app tables and verify on the server.
- **Using experimental Next.js `authInterrupts` as core auth UX:** `unauthorized()` and `forbidden()` remain experimental in current docs; use stable routes/redirects for Phase 1.
- **Single mutable rate field without history:** This will break future pay correctness.
- **Using `getSession()` for server authorization:** Supabase explicitly recommends `getUser()` for server auth verification.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Google OAuth and cookie session sync | Custom OAuth client/session cookies | `@supabase/supabase-js` + `@supabase/ssr` | Official flow already handles PKCE and SSR cookies |
| Signup gating | Client-side "invite required" page only | Supabase `before-user-created` hook | Prevents uninvited auth users from being created |
| RBAC enforcement | Ad hoc checks scattered through pages | DAL helpers + RLS helper functions | Centralized rules are auditable and testable |
| Form validation | Handwritten string checks | `zod` + `react-hook-form` | Prevents drift between client and server validation |
| Current-rate lookup | Manually picking latest rows everywhere | SQL view/helper for current worker rate | Avoids duplicated time-range logic |

**Key insight:** Keep authentication, authorization, and compensation as three separate concerns. Supabase Auth proves identity, Postgres tables decide access, and rate history decides pay.

## Common Pitfalls

### Pitfall 1: Google Login Creates Users Before Invite Logic Runs
**What goes wrong:** Any Google account can create an auth user, and the app only blocks them after login.
**Why it happens:** The invite rule lives only in UI or callback code.
**How to avoid:** Enforce invites in a `before-user-created` hook and then re-check in the callback transaction.
**Warning signs:** `auth.users` contains people with no `app_users` row and no accepted invite.

### Pitfall 2: Secure Checks Happen in `proxy.ts`
**What goes wrong:** Every request triggers DB work in proxy, causing latency and brittle behavior.
**Why it happens:** Proxy feels like a global auth gateway.
**How to avoid:** Follow Next guidance: proxy only for optimistic redirects if needed; keep secure checks in the server DAL.
**Warning signs:** Route prefetches hit the database or authorization bugs only appear on direct URL access.

### Pitfall 3: Role Stored Only In JWT Or Client State
**What goes wrong:** Role changes do not take effect until token refresh, or the UI lies about access.
**Why it happens:** Role was optimized into session state too early.
**How to avoid:** Read the authoritative role from `app_users` for secure actions. If JWT claims are added later, treat them as cache.
**Warning signs:** Revoking admin access does not take effect immediately.

### Pitfall 4: RLS Policies Ignore Unauthenticated Nulls
**What goes wrong:** Policies behave unexpectedly or appear permissive during testing.
**Why it happens:** `auth.uid()` returns `null` when unauthenticated.
**How to avoid:** Write explicit checks like `auth.uid() is not null and auth.uid() = user_id`.
**Warning signs:** Policies behave differently in SQL editor tests vs authenticated app requests.

### Pitfall 5: Hourly Rate Updates Rewrite History
**What goes wrong:** Past shifts or future pay preview logic use the wrong rate.
**Why it happens:** Only the latest rate is stored.
**How to avoid:** Use effective-dated rows from Phase 1.
**Warning signs:** A single admin edit changes pay results for older confirmed work.

## Code Examples

Verified patterns from official sources:

### Google OAuth Callback Route
```ts
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
```

### Admin-Only Rate Update Action
```ts
// Source guidance: https://nextjs.org/docs/app/guides/authentication
"use server";

export async function updateWorkerRate(input: UpdateWorkerRateInput) {
  const actor = await requireAdmin();
  const data = updateWorkerRateSchema.parse(input);

  await closeCurrentRateAndInsertNewRate({
    workerUserId: data.workerUserId,
    hourlyRate: data.hourlyRate,
    createdBy: actor.id,
    effectiveFrom: data.effectiveFrom,
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` for route interception | `proxy.ts` in Next.js 16 | Next.js 16 | New projects should use `proxy.ts` naming and docs |
| Secure auth checks spread across pages | DAL + server-side secure checks | Current Next auth guide | Better separation between optimistic and secure auth |
| Post-login signup filtering only | Supabase `before-user-created` hook | Current Supabase auth hooks docs | Lets private apps reject unwanted signups before auth user creation |
| Single rate field on worker profile | Effective-dated compensation rows | Current best practice for auditability | Avoids future pay-history rewrites |

**Deprecated/outdated:**
- `middleware.ts` naming for new Next 16 work: use `proxy.ts`.
- Using `getSession()` for server authorization: use `getUser()` for authentic verification.
- Using `authInterrupts` as the main authorization UX: still experimental as of Next.js docs updated February 2026.

## Open Questions

1. **Can invites target only known email addresses, or must there be generic shareable links?**
   - What we know: Requirement allows account creation or invite link issuance.
   - What's unclear: Whether operations need a link that is not pre-bound to an email.
   - Recommendation: Plan Phase 1 around email-bound invites. Treat generic links as a later explicit requirement.

2. **Do all internal staff use a controlled Google Workspace domain?**
   - What we know: Google login is required.
   - What's unclear: Whether domain allowlisting can supplement invite checks.
   - Recommendation: Keep invite gating as the primary rule. Add domain allowlist only as defense in depth if operations confirms a managed domain.

3. **Does future payroll need full audit history or only current preview correctness?**
   - What we know: Phase 3 will calculate estimated pay from confirmed work.
   - What's unclear: Whether admins need historical audit views.
   - Recommendation: Use effective-dated rates now; it is the lowest-cost way to protect both future correctness and auditability.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js app, tests | ✓ | `v22.22.1` | — |
| pnpm | Package management, scripts | ✓ | `10.32.1` | `npm` is present, but repo is pinned to pnpm |
| Git | Planning workflow, commits | ✓ | `2.53.0.windows.2` | — |
| Supabase project env | Auth + database integration | ✓ | Env present locally | — |
| Supabase CLI | SQL migrations, local auth config | ✗ | — | Use Supabase SQL Editor / dashboard until CLI is installed |
| Google OAuth provider config | Google login | Unknown | — | No reliable fallback; must verify in Supabase and Google consoles |

**Missing dependencies with no fallback:**
- Verified Google provider setup in Supabase dashboard and Google Cloud console.

**Missing dependencies with fallback:**
- Supabase CLI. Planner can use SQL migrations committed in repo plus manual dashboard application initially.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (`package.json` currently pins `^3.2.4`; registry current is `4.1.2`) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Admin can create/revoke invite and invite acceptance consumes pending invite | unit + integration | `pnpm test -- access-foundation/invitations` | ❌ Wave 0 |
| AUTH-02 | Google callback exchanges code and only completes onboarding for allowed invite/email combinations | unit + manual smoke | `pnpm test -- access-foundation/oauth-callback` | ❌ Wave 0 |
| AUTH-03 | Admin-only vs worker-only authorization gates protected reads and mutations | unit | `pnpm test -- access-foundation/rbac` | ❌ Wave 0 |
| PAY-01 | Admin can create/update worker hourly rate and current-rate lookup is correct | unit | `pnpm test -- access-foundation/hourly-rates` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/access-foundation/invitations.test.ts` — invite status transitions and duplicate invite rules
- [ ] `tests/access-foundation/oauth-callback.test.ts` — code exchange result handling and onboarding gate
- [ ] `tests/access-foundation/rbac.test.ts` — `requireAdmin`, `requireActor`, inactive user handling
- [ ] `tests/access-foundation/hourly-rates.test.ts` — close-old/insert-new transaction behavior
- [ ] `tests/access-foundation/schemas.test.ts` — zod validation for invite and rate mutations
- [ ] Shared test doubles for Supabase server client and DB adapter

## Recommended Implementation Sequence

1. **Plan 01-01:** Create schema and access primitives first.
   - Ship `app_users`, `invitations`, `worker_hourly_rates`, enums, indexes, RLS, and DAL helpers.
   - Add SSR Supabase clients and stable login/logout scaffolding.

2. **Plan 01-02:** Implement invite-gated onboarding.
   - Add admin invite creation and revocation.
   - Configure Google OAuth and callback route.
   - Add `before-user-created` hook and invitation acceptance transaction.

3. **Plan 01-03:** Implement admin hourly-rate management.
   - Build admin-only worker list and rate editor.
   - Update rates with effective-dated inserts.
   - Expose current rate query for later payroll work.

## Major Risks

- **Hook deployment risk:** `before-user-created` requires Supabase auth-hook configuration outside normal app code. Treat hook SQL/config as an explicit plan task.
- **Email mismatch risk:** Google account email must equal invited email. Decide whether alias normalization rules are needed before implementation.
- **Bootstrap risk:** The first admin must exist before invite-only onboarding can scale. Plan a one-time bootstrap path, not a permanent backdoor.
- **Manual console drift risk:** Without Supabase CLI, auth provider and hook config can drift from repo state. Capture exact setup steps in docs or install CLI early.

## Sources

### Primary (HIGH confidence)
- Next.js Authentication Guide: https://nextjs.org/docs/app/guides/authentication
- Next.js `authInterrupts` config: https://nextjs.org/docs/app/api-reference/config/next-config-js/authInterrupts
- Next.js `forbidden.js` reference: https://nextjs.org/docs/app/api-reference/file-conventions/forbidden
- Supabase Next.js Auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase Google login guide: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase `getUser()` reference: https://supabase.com/docs/reference/javascript/auth-getuser
- Supabase `before-user-created` hook: https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook
- Supabase `inviteUserByEmail()` reference: https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail
- Supabase `generateLink()` reference: https://supabase.com/docs/reference/javascript/auth-admin-generatelink
- Supabase Row Level Security guide: https://supabase.com/docs/guides/database/postgres/row-level-security
- npm registry version verification via `npm view` on 2026-03-31

### Secondary (MEDIUM confidence)
- Repo-local skill: `.agents/skills/next-best-practices/SKILL.md`
- Repo-local skill: `.agents/skills/supabase-postgres-best-practices/SKILL.md`

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - repo dependencies and npm registry versions were verified directly.
- Architecture: MEDIUM-HIGH - based on current Next.js and Supabase official docs plus one design inference: using `before-user-created` with invitation-table lookup for Google onboarding.
- Pitfalls: HIGH - directly supported by current Next.js and Supabase documentation patterns.

**Research date:** 2026-03-31
**Valid until:** 2026-04-30
