# Phase 1: Access Foundation - Research

**Researched:** 2026-03-31
**Domain:** Next.js internal-tool authentication, invite-gated onboarding, RBAC, and worker compensation foundation
**Confidence:** HIGH

## User Constraints

- Fresh implementation. Existing app code is not reliable architecture.
- Modern Next.js web app.
- Invite-gated onboarding.
- Google login.
- Single account model with role-based access control for admin vs worker.
- Admin-managed worker hourly rates.
- Internal tool for a single wedding hall operation.
- From requirements and state:
  - `AUTH-01`: admin can create worker accounts or issue invite links.
  - `AUTH-02`: users sign up and log in with Google.
  - `AUTH-03`: access differs for admin vs worker.
  - `PAY-01`: admin can register and update hourly rates.
- From `CLAUDE.md`:
  - Work should stay inside a GSD workflow.
  - Use `/gsd:quick` for small fixes, `/gsd:debug` for investigations, `/gsd:execute-phase` for planned implementation.
  - Do not make direct repo edits outside a GSD workflow unless the user explicitly says to bypass it.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Admin can create worker accounts or issue invite links. | Invite table + token flow, signup gate via hook/service, admin-only invite management |
| AUTH-02 | Users can sign up and sign in with Google. | Supabase Google OAuth with PKCE SSR callback in Next.js |
| AUTH-03 | The system separates access for admin and worker roles. | DAL-first authorization, JWT role claim, RLS, route guards |
| PAY-01 | Admin can register and update worker hourly rates. | Worker profile / compensation table, money-in-cents, admin-only write policies |
</phase_requirements>

## Summary

Use Supabase Auth + Postgres as the access foundation and Next.js App Router as the application shell. The standard implementation for this phase is: Google OAuth for authentication, an app-owned invite table for onboarding control, a canonical role record in Postgres, a custom access-token hook that adds the role claim to the JWT, and RLS policies that enforce admin-versus-worker access at the data layer.

The main non-obvious trap is that Supabase's built-in email invite flow is documented as not supporting PKCE, while the current Next.js SSR pattern is PKCE-based. For this phase, do not build onboarding around `inviteUserByEmail()`. Use app-managed invites instead: admin creates an invite record, the worker signs in with Google, and the server verifies the invite email or token before activating the account and role.

Authorization should follow current Next.js guidance: optimistic checks in `proxy.ts` only for redirects and coarse routing, secure checks in a DAL on every sensitive read/write, and RLS as the final boundary. Do not rely on client state or hidden UI for security.

**Primary recommendation:** Build Phase 1 on `Next.js 16 + @supabase/ssr + Supabase Auth/Postgres`, with app-managed invites, DB-backed roles, JWT role claims, and RLS from day one.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.1` | App Router web framework | Current stable Next.js; official auth guidance centers App Router, DAL, and `proxy.ts` |
| `react` | `19.2.4` | UI runtime | Current stable React paired with Next 16 |
| `react-dom` | `19.2.4` | Rendering/runtime | Required pair for React 19 |
| `@supabase/supabase-js` | `2.101.0` | Auth, database, storage client | Current Supabase client; official OAuth, auth admin, and DB APIs |
| `@supabase/ssr` | `0.10.0` | SSR-safe Supabase clients for Next.js | Current Supabase-recommended SSR package instead of old auth helpers |
| `zod` | `4.3.6` | Input validation and schema typing | Standard for server actions, route handlers, and form validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` | `7.72.0` | Client form state | Use for invite creation, sign-in UI affordances, rate edit forms |
| `@hookform/resolvers` | `5.2.2` | Zod integration for forms | Use with `react-hook-form` for shared server/client schemas |
| `@tanstack/react-query` | `5.95.2` | Client cache for authenticated admin/worker screens | Use after auth foundation for live dashboard and list screens; not required for the auth boundary itself |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth + Postgres | Auth.js + separate DB stack | More moving parts for invite gating, RBAC, and row security; worse fit for a single internal tool |
| App-managed invite table | Supabase `inviteUserByEmail()` | Official docs say PKCE is not supported for `inviteUserByEmail()`, which conflicts with current SSR auth flow |
| JWT role claim via hook | DB lookup on every route without claim | Works, but adds repeated auth joins and makes `proxy.ts` checks weaker |

**Installation:**
```bash
pnpm add next react react-dom @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
```

**Version verification:** verified with `npm view` on 2026-03-31.
- `next@16.2.1` published 2026-03-20
- `react@19.2.4` published 2026-01-26
- `react-dom@19.2.4` published 2026-01-26
- `@supabase/supabase-js@2.101.0` published 2026-03-30
- `@supabase/ssr@0.10.0` published 2026-03-30
- `zod@4.3.6` published 2026-01-22
- `react-hook-form@7.72.0` published 2026-03-22
- `@hookform/resolvers@5.2.2` published 2025-09-14
- `@tanstack/react-query@5.95.2` published 2026-03-23

## Architecture Patterns

### Recommended Project Structure
```text
src/
+-- app/
|   +-- (public)/
|   |   +-- sign-in/
|   |   `-- invite/[token]/
|   +-- (admin)/
|   |   +-- invites/
|   |   +-- workers/
|   |   `-- settings/
|   +-- (worker)/
|   |   `-- home/
|   +-- auth/callback/route.ts
|   `-- unauthorized/page.tsx
+-- lib/
|   +-- auth/
|   |   +-- session.ts
|   |   +-- roles.ts
|   |   +-- invites.ts
|   |   `-- guards.ts
|   +-- dal/
|   |   +-- current-user.ts
|   |   +-- admin.ts
|   |   `-- worker.ts
|   +-- supabase/
|   |   +-- browser.ts
|   |   +-- server.ts
|   |   `-- proxy.ts
|   `-- validation/
|       +-- invite.ts
|       `-- worker-rate.ts
`-- db/
    +-- migrations/
    +-- policies/
    `-- types.ts
```

### Pattern 1: App-Managed Invite Gating
**What:** Store invites in your own table, keyed by token and intended email, then activate the user only after a Google-authenticated identity matches the invite.
**When to use:** Always, for this phase.
**Why:** Current official Supabase docs state `inviteUserByEmail()` does not support PKCE, while current SSR guidance uses PKCE.
**Implementation order:**
1. Create `invites` table with `token_hash`, `email`, `role`, `expires_at`, `accepted_at`, `created_by`.
2. Build admin-only invite issue/revoke UI and server action.
3. Build `invite/[token]` landing page that stores the token server-side and initiates Google login.
4. In the OAuth callback, exchange code for session, load the current user, validate invite token + email, then create or activate profile + role.
5. Mark invite accepted atomically.

### Pattern 2: DB-Canonical Role With JWT Claim
**What:** Keep the authoritative role in Postgres and project it into the JWT via a Custom Access Token hook.
**When to use:** Always, because both route guards and RLS need consistent role semantics.
**Example:**
```ts
// Source pattern: Supabase custom access token hook + Next.js DAL guidance
export type AppRole = "admin" | "worker";
```
Use `public.user_roles(user_id uuid primary key, role app_role not null)` as the canonical role table. Use the auth hook to add `user_role` to the token. Treat the DB row as source of truth.

### Pattern 3: DAL-First Authorization
**What:** Centralize secure authorization in server-only DAL functions. `proxy.ts` is only for optimistic redirects.
**When to use:** All protected pages, server actions, and route handlers.
**Example:**
```ts
// Source pattern: Next.js auth guide
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}
```

### Pattern 4: Separate Identity, Profile, and Compensation
**What:** Keep auth identity, app profile, and pay settings in separate tables.
**When to use:** Always.
**Recommended schema:**
- `profiles(id uuid primary key references auth.users, email text not null, full_name text, hall_name text default 'laviebel', onboarding_state text, created_at, updated_at)`
- `user_roles(user_id uuid primary key references profiles(id), role app_role not null)`
- `worker_rates(user_id uuid primary key references profiles(id), hourly_rate_cents integer not null check (hourly_rate_cents > 0), effective_from timestamptz default now(), updated_by uuid not null, updated_at timestamptz not null default now())`

### Anti-Patterns to Avoid
- **Using `inviteUserByEmail()` for the main onboarding path:** conflicts with PKCE-based SSR flow.
- **Putting the role in client state or `user_metadata`:** not authoritative; easy to spoof or desynchronize.
- **Using `proxy.ts` as the only auth boundary:** Next.js recommends secure DB-backed checks in a DAL for sensitive operations.
- **Combining auth profile and payroll fields into one catch-all table without RLS separation:** makes future auditability and policies harder.
- **Storing hourly pay as a float:** use integer cents.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth with Google | Manual OAuth exchange and cookie handling | Supabase Auth OAuth + `@supabase/ssr` | Handles PKCE, session cookies, callback exchange |
| Session propagation in Next.js | Custom cookie sync across server/client/proxy | Official `@supabase/ssr` client split | Current supported SSR path |
| Authorization spread across pages | Ad hoc role checks in components | DAL + RLS + JWT role claim | Consistent, auditable, harder to bypass |
| Invite validation | Implicit email-domain trust only | Explicit invite table + token/email match | Internal access needs revocation, expiry, and audit trail |
| Money math | JS floats for pay | integer `hourly_rate_cents` | Prevents rounding drift |

**Key insight:** The deceptively hard parts in this phase are auth state propagation, invite gating with social login, and authorization consistency across UI, server, and database. Use the stack's native solutions for those boundaries.

## Common Pitfalls

### Pitfall 1: PKCE/Invite mismatch
**What goes wrong:** Teams try to pair Supabase SSR PKCE with `inviteUserByEmail()` and hit an onboarding dead end.
**Why it happens:** The older "invite by email" mental model does not match the current PKCE SSR flow.
**How to avoid:** Use an app-owned invite record and validate it after Google sign-in.
**Warning signs:** Invite acceptance depends on email magic-link semantics instead of OAuth callback semantics.

### Pitfall 2: Treating `proxy.ts` as real authorization
**What goes wrong:** Pages look protected, but server actions or direct requests still succeed.
**Why it happens:** `proxy.ts` is only an optimistic routing layer.
**How to avoid:** Re-check the user and role in DAL functions and enforce RLS in Postgres.
**Warning signs:** Sensitive writes have no server-side role check.

### Pitfall 3: Storing role in mutable user metadata
**What goes wrong:** Role changes lag, tokens drift, or policies trust the wrong claim.
**Why it happens:** Teams confuse presentation metadata with authorization metadata.
**How to avoid:** Keep role in Postgres, add it to JWT with a hook, and refresh session after role mutation.
**Warning signs:** Role updates require manual dashboard edits or only update `user_metadata`.

### Pitfall 4: Forgetting auth hook permissions
**What goes wrong:** Custom access token hook works locally in SQL tests but fails in Supabase Auth.
**Why it happens:** `supabase_auth_admin` needs explicit execute/schema/table permissions, and Supabase docs recommend avoiding `security definer`.
**How to avoid:** Grant only the required permissions to `supabase_auth_admin`, revoke from `authenticated`/`anon`, and version the hook as a migration.
**Warning signs:** Tokens issue without the expected role claim.

### Pitfall 5: Embedding hourly rate directly into auth/session objects
**What goes wrong:** Compensation changes are hard to audit and easy to leak to the wrong role.
**Why it happens:** Convenience-driven denormalization.
**How to avoid:** Keep pay settings in a dedicated table with admin-only writes and explicit read rules.
**Warning signs:** Rate edits are implemented as profile metadata updates.

## Code Examples

Verified patterns from official sources:

### Google OAuth start with PKCE callback
```ts
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${origin}/auth/callback?next=/`,
  },
});
```

### Next.js callback route for code exchange
```ts
// Source pattern adapted from Supabase Next.js SSR guide
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) return NextResponse.redirect(new URL("/sign-in?error=oauth", url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/sign-in?error=oauth", url.origin));

  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", url.origin));
}
```

### DAL guard for secure admin access
```ts
// Source pattern: https://nextjs.org/docs/app/guides/authentication
import "server-only";

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
```

### RLS policy shape
```sql
-- Source pattern: Supabase RLS + JWT claims docs
create policy "admins manage worker_rates"
on public.worker_rates
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` style helpers | `@supabase/ssr` | Current Supabase SSR docs | Use the SSR package, not older helper patterns |
| `middleware.ts` for routing gatekeeping | `proxy.ts` in Next 16 auth guidance | Next.js 16 cycle | New projects should follow current file convention |
| UI-only role checks | DAL + DTO + secure DB-backed checks | Current Next.js auth guide | Required for sensitive actions |

**Deprecated/outdated:**
- Supabase email-invite onboarding as the main path for this phase: not compatible with PKCE-based SSR flow.
- Treating new Next.js `forbidden()`/auth interrupts as production-stable: official docs currently label `forbidden()` experimental and not recommended for production.

## Open Questions

1. **Should rate history be modeled now or deferred?**
   - What we know: `PAY-01` only requires admin create/update today.
   - What's unclear: whether later payroll preview must preserve historic rate snapshots before Phase 3.
   - Recommendation: start with `worker_rates` current-value table plus audit columns; add assignment-time rate snapshots in Phase 3.

2. **Should invite matching require exact email or also token possession?**
   - What we know: internal-tool security is higher with both.
   - What's unclear: whether staff may log in with alternate Google aliases.
   - Recommendation: default to exact email + invite token match. Do not rely on domain-only gating.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime and tooling | Y | `v22.22.1` | - |
| npm | package version lookup / installs | Y | `10.9.4` | pnpm |
| pnpm | repo package manager | Y | `10.32.1` | npm |
| Git | migrations and docs versioning | Y | `2.53.0.windows.2` | - |
| Supabase CLI | local DB, auth hooks, SQL migrations, policy verification | N | - | hosted Supabase project, but local verification is weaker |
| `psql` | direct DB inspection | N | - | Supabase dashboard SQL editor |
| Docker | local Supabase stack if CLI uses containers | N | - | hosted Supabase project only |

**Missing dependencies with no clean fallback:**
- None. A hosted Supabase dev project can unblock implementation.

**Missing dependencies with fallback:**
- `supabase` CLI, `psql`, and Docker are absent. Planner should either add an explicit install/setup step or use a hosted Supabase dev project and accept weaker local migration/policy verification.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (`package.json` + `vitest.config.ts`) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | invite create/revoke/accept gating | integration | `pnpm exec vitest run tests/access/invite-flow.test.ts` | N - Wave 0 |
| AUTH-02 | Google OAuth start + callback exchange orchestration | integration | `pnpm exec vitest run tests/access/google-auth.test.ts` | N - Wave 0 |
| AUTH-03 | role guard + RLS-safe access paths | integration | `pnpm exec vitest run tests/access/rbac.test.ts` | N - Wave 0 |
| PAY-01 | hourly rate validation + admin-only mutation | unit/integration | `pnpm exec vitest run tests/access/worker-rates.test.ts` | N - Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green plus manual OAuth smoke test before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/access/invite-flow.test.ts` - covers `AUTH-01`
- [ ] `tests/access/google-auth.test.ts` - covers `AUTH-02`
- [ ] `tests/access/rbac.test.ts` - covers `AUTH-03`
- [ ] `tests/access/worker-rates.test.ts` - covers `PAY-01`
- [ ] Supabase test strategy - choose hosted dev project or install Supabase CLI for policy/hook verification

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/guides/authentication - DAL, DTO, optimistic vs secure authorization, `proxy.ts`
- https://nextjs.org/docs/app/api-reference/functions/forbidden - current status of `forbidden()` as experimental
- https://supabase.com/docs/guides/auth/social-login/auth-google - Google OAuth setup, PKCE callback flow, `signInWithOAuth`, callback exchange
- https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail - official note that PKCE is not supported for `inviteUserByEmail()`
- https://supabase.com/docs/guides/auth/auth-hooks - auth hook permissions, `supabase_auth_admin`, migration guidance, avoid `security definer`
- https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook - signup gate hook capability
- https://supabase.com/docs/guides/api/securing-your-api - RLS-first API security guidance
- https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac - custom access token hook, `user_roles`, JWT claims

### Secondary (MEDIUM confidence)
- Local project skills:
  - `C:\code\rosty\.agents\skills\next-best-practices\SKILL.md`
  - `C:\code\rosty\.agents\skills\supabase-postgres-best-practices\SKILL.md`
- Local environment inspection:
  - `package.json`
  - `vitest.config.ts`
  - `npm view` output on 2026-03-31

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - current package versions verified via `npm view`; auth stack aligned with official Next.js and Supabase docs
- Architecture: HIGH - core recommendations are directly supported by official docs; invite-table recommendation is a strong inference from documented PKCE constraints
- Pitfalls: HIGH - each major pitfall is anchored in official docs or direct environment evidence

**Implementation order:**
1. Create Supabase project and Google provider configuration.
2. Add SSR client split (`browser.ts`, `server.ts`, `proxy.ts`) and OAuth callback route.
3. Create `profiles`, `user_roles`, `worker_rates`, and `invites` schema with RLS enabled.
4. Implement auth hook(s): invite gate and custom access token claim.
5. Build DAL functions and role guards.
6. Build minimal admin invite and worker onboarding screens.
7. Add Phase 1 Vitest coverage and one manual Google OAuth smoke test.

**Research date:** 2026-03-31
**Valid until:** 2026-04-30
