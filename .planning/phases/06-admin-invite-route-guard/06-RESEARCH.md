# Phase 6: Admin Invite Route Guard - Research

**Researched:** 2026-04-02
**Domain:** Next.js App Router admin authorization with Supabase SSR
**Confidence:** HIGH

<user_constraints>
## User Constraints

No `*-CONTEXT.md` file exists for this phase.

Locked project constraints already in effect from `.planning/STATE.md`, `.planning/ROADMAP.md`, and `CLAUDE.md`:

- Use one account system with role-based permissions.
- Privileged admin checks should use the strict DB-backed `requireAdminUser` guard pattern.
- Keep `src/app` route files thin and place authorization/business logic in flow or DAL code.
- Use `#` absolute imports only.
- Prefer tag-based invalidation over `revalidatePath`, though this phase does not need cache invalidation.
- Do not write repo files with raw PowerShell `Set-Content` or `Out-File`.
- Repository text files must remain UTF-8 without BOM and LF line endings.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Admin invite management must only be reachable from admin-authorized sessions. | Secure server-side route guard should run before invite UI render, using `requireAdminUser()` instead of cookie-only or metadata-only checks. |
| AUTH-03 | Admin and worker permissions must remain distinct at route level. | `/admin/invites` must reject signed-in non-admin users even when a valid session cookie exists; this requires a DB-backed role check in the route flow. |
</phase_requirements>

## Summary

Phase 6 is a narrow auth-hardening phase, not a redesign of invite creation. The actual gap is confirmed in the codebase and the milestone audit: `src/app/admin/invites/page.tsx` renders `AdminInvitesPage` directly, and `src/flows/admin-invites/components/AdminInvitesPage.tsx` currently has no `requireAdminUser()` gate. Because `proxy.ts` only checks for the presence of a Supabase session cookie, any signed-in worker can still reach `/admin/invites` and see the admin invite UI.

The current codebase already has the correct secure pattern. Other admin read routes such as the dashboard, schedules, assignment review, and worker rates call `requireAdminUser()` inside the flow component before loading privileged data. Next.js current auth guidance matches that pattern: use Proxy only for optimistic cookie checks, and perform secure authorization as close to the data and page component as possible through a DAL. Supabase current guidance also matches the repo's existing approach: trust `auth.getUser()` for server identity verification, not cookie-derived session state.

**Primary recommendation:** Implement Phase 6 by adding the existing strict `requireAdminUser()` guard to `AdminInvitesPage`, keep `src/app/admin/invites/page.tsx` thin, and add a colocated Vitest page/flow test that proves non-admin sessions cannot render the invite UI.

## Project Constraints (from CLAUDE.md)

- Start work through the GSD workflow; do not make direct repo edits outside it unless explicitly asked.
- Commit and push only when explicitly asked.
- Runtime architecture source of truth is `.planning/codebase/CONVENTIONS.md` and `.planning/codebase/ARCHITECTURE.md`.
- Keep route files thin; business logic belongs below `src/app`.
- Repository text files must use UTF-8 without BOM and LF line endings, except `*.ps1`.
- Do not write repo-tracked files with raw PowerShell `Set-Content` or `Out-File`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.2` | App Router route rendering and server auth boundaries | Current framework guidance explicitly recommends DAL-based secure auth checks close to pages/data, with Proxy only for optimistic checks. |
| `@supabase/ssr` | `0.10.0` | Server/client Supabase auth session wiring in Next.js | Standard SSR adapter for cookie-backed Supabase auth in App Router. |
| `@supabase/supabase-js` | `2.101.1` | Secure server user lookup and role-backed reads | Current docs explicitly warn against trusting cookie-backed session reads for authorization-sensitive decisions. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | `4.1.2` | Fast colocated route/flow tests | Use for page-level auth coverage and guard regression tests in this phase. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Guarding in `AdminInvitesPage` with `requireAdminUser()` | Cookie-only redirect in `proxy.ts` | Not secure enough for admin authorization; workers still have valid session cookies. |
| Existing `requireAdminUser()` | New invite-specific admin helper | Duplicates the repo's admin auth contract and risks drift. |
| Current inline forbidden-copy pattern | Next.js `forbidden()` / `forbidden.js` | Current Next.js docs still mark `forbidden` as experimental; not a good reason to widen this phase. |

**Installation:**

```bash
# No new packages required for Phase 6.
```

**Version verification:** Verified on 2026-04-02 with:

```bash
npm.cmd view next version time.modified
npm.cmd view @supabase/ssr version time.modified
npm.cmd view @supabase/supabase-js version time.modified
npm.cmd view vitest version time.modified
```

- `next@16.2.2` published state modified `2026-04-01T23:33:22.418Z`
- `@supabase/ssr@0.10.0` published state modified `2026-03-30T12:57:40.859Z`
- `@supabase/supabase-js@2.101.1` published state modified `2026-04-02T10:45:11.770Z`
- `vitest@4.1.2` published state modified `2026-03-26T14:36:51.783Z`

## Architecture Patterns

### Recommended Project Structure

```text
src/
+-- app/
|   +-- admin/
|       +-- invites/
|           +-- page.tsx          # Thin route entry only
+-- flows/
|   +-- admin-invites/
|       +-- components/
|           +-- AdminInvitesPage.tsx
|           +-- AdminInvitesPage.test.tsx
+-- queries/
|   +-- access/
|       +-- dal/
|           +-- requireAdminUser.ts
+-- mutations/
    +-- invite/
        +-- actions/
            +-- createWorkerInvite.ts
```

### Pattern 1: Secure Admin Read Guard Inside The Flow
**What:** Call `requireAdminUser()` at the top of the flow component rendered by the route, before privileged UI or reads are returned.

**When to use:** Any admin read route under `/admin/*` that should be inaccessible to workers or unauthenticated sessions.

**Example:**

```typescript
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { createWorkerInvite } from "#mutations/invite/actions/createWorkerInvite";

export async function AdminInvitesPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  return (
    <main>
      <h1>Invite management</h1>
      <form action={createWorkerInvite}>
        <button type="submit">Create worker invite</button>
      </form>
    </main>
  );
}
```

Source pattern: repo-admin flows plus Next.js auth guidance on secure page-component checks.

### Pattern 2: Keep Proxy Optimistic Only
**What:** Leave `proxy.ts` responsible for coarse session-presence redirects only.

**When to use:** Pre-filtering anonymous users from `/admin/*` and `/worker/*`.

**Why:** Next.js current guidance explicitly says Proxy is appropriate for optimistic checks from cookies, not full authorization. This repo's `proxy.ts` is already aligned with that rule.

### Pattern 3: Reuse The Existing DB-Backed Admin DAL
**What:** Use `#queries/access/dal/requireAdminUser` for the route guard instead of `getCurrentUser()`.

**When to use:** Any privileged admin route where the rendered UI itself must be protected.

**Why:** `requireAdminUser()` verifies identity via `supabase.auth.getUser()` and confirms admin role from `user_roles`. `getCurrentUser()` can use metadata fallback and bootstrap logic, which is appropriate for broader session resolution but is not the strictest route gate.

### Anti-Patterns to Avoid

- **Proxy-only admin authorization:** `proxy.ts` checks only for a session cookie, so a worker session still passes.
- **Guarding only the server action:** Hiding submit failures is not enough; the route itself must not render admin invite UI to non-admin users.
- **Moving auth logic into `src/app/admin/invites/page.tsx`:** The repo contract keeps route files declarative and pushes auth logic into flows/DAL.
- **Introducing a new auth UX primitive in this phase:** `forbidden()` is still experimental in current Next.js docs; stay with the repo's current inline forbidden-copy pattern unless the user explicitly expands scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin route authorization | Custom route-role parser or duplicated Supabase role fetch | `requireAdminUser()` | Existing repo contract already centralizes secure admin verification. |
| Admin pre-filtering | Full RBAC inside `proxy.ts` | Keep `proxy.ts` as session-presence gate only | Next.js docs explicitly warn Proxy is not a full authorization solution. |
| Invite-page regression coverage | Manual browser-only checks | Colocated Vitest page/flow test | Faster, repeatable, and consistent with existing admin flow test coverage. |

**Key insight:** Phase 6 should close the audit gap by reusing the repo's proven admin-read guard pattern, not by inventing a new routing or auth abstraction.

## Common Pitfalls

### Pitfall 1: Treating Session Presence As Authorization
**What goes wrong:** A worker can access `/admin/invites` because they have a valid session cookie.

**Why it happens:** `proxy.ts` only distinguishes signed-in versus signed-out.

**How to avoid:** Keep `proxy.ts` unchanged for optimistic checks and add `requireAdminUser()` at the invite flow entry.

**Warning signs:** Anonymous users are redirected correctly, but signed-in workers can still see the invite page.

### Pitfall 2: Guarding The Mutation But Not The Page
**What goes wrong:** The form submit is rejected, but the admin invite UI remains visible to workers.

**Why it happens:** The server action enforces admin-only behavior later than the route render.

**How to avoid:** Fail closed before rendering the page.

**Warning signs:** Audit still reports route-level exposure even though `createInvite()` throws `FORBIDDEN`.

### Pitfall 3: Using The Wrong Auth Primitive
**What goes wrong:** A developer uses `getCurrentUser()` for the route gate because it is already imported elsewhere.

**Why it happens:** `getCurrentUser()` is convenient, but it is broader than the strict admin-only contract.

**How to avoid:** For admin route gating, standardize on `requireAdminUser()`.

**Warning signs:** The guard logic starts checking `currentUser.role !== "admin"` inline in multiple files.

### Pitfall 4: Widening Scope Into A UX Rewrite
**What goes wrong:** The phase expands into `forbidden.js`, `unauthorized.js`, layout changes, or broader admin navigation work.

**Why it happens:** Route hardening looks small, so it is tempting to clean up adjacent auth UX.

**How to avoid:** Keep this phase focused on secure route access and minimum regression tests.

**Warning signs:** Planned edits spread into `next.config.*`, new special files, or unrelated admin routes.

## Code Examples

Verified patterns from official guidance and this codebase:

### Secure Admin Page Guard

```typescript
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";

export async function AdminPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  return <main>Protected admin UI</main>;
}
```

Source: https://nextjs.org/docs/app/guides/authentication

### Strict DAL-Based Admin Verification

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

const { data } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", user.id)
  .maybeSingle();
```

Source: https://supabase.com/docs/guides/auth/server-side/nextjs

### Proxy As Optimistic Session Filter Only

```typescript
if ((pathname.startsWith("/admin") || pathname.startsWith("/worker")) && !hasSession) {
  return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
}
```

Source: repo `proxy.ts`, aligned with https://nextjs.org/docs/app/getting-started/proxy

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Middleware-only auth mental model | Next.js 16 frames Proxy as optimistic only and recommends secure DAL/page checks | Current docs updated through March 2026 | Route authorization should happen inside server page/flow logic, not only in `proxy.ts`. |
| Cookie/session-derived trust | Supabase recommends `auth.getUser()` for secure server identity verification | Current docs live as of April 2026 | Route guards should verify against Auth server and DB-backed roles, not rely on cookie-derived session objects. |
| Experimental `forbidden()` for 403 flows | Existing repo inline forbidden copy in admin pages | Repo current pattern; Next docs still mark `forbidden` experimental as of Feb 2026 | Phase 6 should preserve current UX unless broader auth UX refactor is explicitly requested. |

**Deprecated/outdated:**

- Using Proxy as the only admin authorization layer: outdated and explicitly discouraged by current Next.js docs.
- Using cookie-backed session reads for privileged authorization decisions: explicitly discouraged by current Supabase docs.

## Open Questions

1. **Should denied `/admin/invites` access keep the inline forbidden copy or redirect to `/unauthorized`?**
   - What we know: Existing admin pages return inline forbidden copy; root entry redirects to `/unauthorized`.
   - What's unclear: Whether Phase 6 wants consistency with current admin pages or a broader auth UX unification.
   - Recommendation: Keep the current inline copy for this phase to avoid widening scope.

2. **Should Phase 6 also harden `createInvite()` to use `requireAdminUser()` instead of `getCurrentUser()`?**
   - What we know: The audit gap is specifically route-level exposure, and invite creation already rejects non-admin users.
   - What's unclear: Whether the team wants to tighten mutation auth semantics now or leave that for a separate hardening pass.
   - Recommendation: Treat route guarding as required scope; mutation-auth tightening is optional follow-up unless the planner sees a low-cost bundled change.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest@4.1.2` with `@testing-library/react` and `jsdom` |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Non-admin sessions cannot render `/admin/invites` invite-management UI. | flow/page unit | `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` | NO - Wave 0 |
| AUTH-03 | Admin sessions render the invite page and route-level guard executes once before protected UI. | flow/page unit | `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` | NO - Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/flows/admin-invites/components/AdminInvitesPage.test.tsx` - cover admin success path and denied access path.
- [ ] Route import coverage inside the same test file or a sibling page test - verify `src/app/admin/invites/page.tsx` stays thin and still exercises the guard through the flow.
- [ ] Explicit assertion that invite-creation CTA is absent for denied access.

## Sources

### Primary (HIGH confidence)

- Next.js auth guide - secure authorization patterns, Proxy guidance, DAL/page-check recommendations: https://nextjs.org/docs/app/guides/authentication
- Next.js Proxy guide - Proxy purpose and limitation as not a full authorization solution: https://nextjs.org/docs/app/getting-started/proxy
- Supabase Next.js SSR guide - current server-side client/auth guidance: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase JS `getSession` reference - explicit warning not to trust cookie-backed storage for secure auth decisions; use `getUser()` instead: https://supabase.com/docs/reference/javascript/auth-getsession

### Secondary (MEDIUM confidence)

- Next.js `forbidden` reference - confirms feature remains experimental as of February 27, 2026: https://nextjs.org/docs/app/api-reference/functions/forbidden
- Next.js `forbidden.js` reference - confirms file-based 403 UX is also part of the experimental interrupt flow: https://nextjs.org/docs/app/api-reference/file-conventions/forbidden

### Local Codebase Inspection

- `src/app/admin/invites/page.tsx`
- `src/flows/admin-invites/components/AdminInvitesPage.tsx`
- `src/queries/access/dal/requireAdminUser.ts`
- `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.tsx`
- `src/flows/admin-schedules/components/AdminSchedulesPage.tsx`
- `src/flows/admin-worker-rates/components/AdminWorkerRatesPage.tsx`
- `proxy.ts`
- `vitest.config.ts`
- `package.json`

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - current versions were verified from the npm registry on 2026-04-02.
- Architecture: HIGH - recommendation matches both current official Next.js/Supabase guidance and repeated repo patterns.
- Pitfalls: HIGH - directly derived from the current code gap, milestone audit evidence, and official auth guidance.

**Research date:** 2026-04-02
**Valid until:** 2026-05-02
