# Phase 10: Entry And Shared Shell Surface - Research

**Researched:** 2026-04-06
**Domain:** Next.js App Router entry-surface completion for sign-in, invite, onboarding, unauthorized, and role-aware landing shells
**Confidence:** HIGH

<user_constraints>
## User Constraints (from ROADMAP.md and PROJECT.md)

### Locked Decisions
### Scope stays on shipped v1 flows
- **D-01:** Phase 10 must make existing entry and shell routes feel usable without adding new staffing domain behavior.
- **D-02:** Keep the milestone focused on surface completion for sign-in, invite acceptance, onboarding, unauthorized handling, and role-aware landing pages.

### Structural rules
- **D-03:** Keep `src/app` routes thin and keep auth or role logic inside flow components.
- **D-04:** Reuse existing shared UI primitives such as `Card`, `Badge`, `Alert`, and `Button` instead of introducing a second parallel styling system.
- **D-05:** Treat the existing `RootRedirectPage` card layout as the visual anchor for the rest of the entry flow instead of inventing a different look for each route.

### Product-quality expectations
- **D-06:** Replace mojibake and placeholder copy on the primary entry surfaces with readable product copy.
- **D-07:** Primary entry routes need readable loading, unauthorized, empty, and failure states rather than raw headings or bare forms.
- **D-08:** Role-aware landing surfaces should make the next destination obvious for both worker and admin users.

### the agent's Discretion
- Whether `/admin` should stay the dashboard route with a shell wrapper, or become a dedicated admin home with the dashboard moved to a thin child route such as `/admin/operations`.
- Whether loading and error states are implemented through one global route surface (`src/app/loading.tsx`, `src/app/error.tsx`) plus local overrides, or through per-route files only.
- Whether the shared entry layout lives in `src/flows/auth-shell/components` or a small reusable surface component under `src/shared/ui`.

### Deferred Ideas (OUT OF SCOPE)
- New auth providers, passwordless flows, or account-recovery mechanics.
- Admin schedule-creation polish, schedule-detail polish, and operations dashboard polish outside what is needed to establish a readable admin landing shell.
- Worker recruiting-card redesigns, pay-preview redesigns, or attendance UX beyond shell-level handoff.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENTRY-01 | User can open a sign-in screen with a clear primary Google sign-in action and readable explanation of what happens next. | Replace the current bare `SignInPage` and plain button treatment with a structured entry card and clear CTA copy. |
| ENTRY-02 | Invited user can understand that they are accepting an invite and see the appropriate sign-in call to action from the invite entry surface. | Give the invite route its own copy, badge, and CTA label instead of looking like a generic sign-in page. |
| ENTRY-03 | Signed-in user can land on a role-aware home shell that makes the next available destinations obvious. | Align `/`, `/worker`, and `/admin` around a readable landing-shell pattern with role-scoped cards and links. |
| ENTRY-04 | User sees readable loading, unauthorized, empty, and failure states on the primary entry surfaces instead of placeholder copy. | Add route-level loading/error surfaces and readable unauthorized or blocked-state cards around onboarding and shell routes. |
</phase_requirements>

## Summary

Phase 10 is a surface-completion phase, not an auth rewrite. The core behaviors already exist:

- `/` already gates users through `RootRedirectPage` based on sign-in, profile completion, and role.
- `/sign-in` already starts Google sign-in through `GoogleSignInButton`.
- `/invite/[token]` already carries the invite token into the sign-in action.
- `/onboarding` already loads the current profile and submits profile completion data.
- `/worker` already exposes basic worker navigation links.

The gap is that most of these routes still render as raw scaffolds:

- `src/flows/auth-shell/components/SignInPage.tsx` is a bare `<main>` with mojibake copy.
- `src/app/invite/[token]/page.tsx` is also a bare `<main>` with a token-aware CTA but no dedicated invite framing.
- `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx` and `src/mutations/auth/components/ProfileOnboardingForm.tsx` still use raw labels, native controls, and mojibake copy with almost no layout.
- `src/app/unauthorized/page.tsx` is only a one-line heading.
- `src/flows/worker-shell/components/WorkerShellPage.tsx` is functional but visually equivalent to a prototype.
- `src/flows/admin-shell/components/AdminShellPage.tsx` is still placeholder text and is not wired into `src/app/admin/page.tsx`.

The codebase already contains the design primitives needed for Phase 10. `RootRedirectPage.tsx` shows the intended pattern: card-based sections, a badge, readable spacing, and route links that feel like a product surface rather than a test scaffold. Phase 10 should extend that same visual language to all primary entry routes.

**Primary recommendation:** split the phase into three plans:

1. Establish a shared entry-surface pattern and use it to complete sign-in and invite acceptance.
2. Rebuild onboarding plus readable loading, unauthorized, and failure surfaces around the same entry pattern.
3. Align the common home, worker shell, and admin landing route so role-specific next steps are obvious and the `/admin` route has an intentional landing experience.

## Current Codebase Findings

### Existing routes and flow ownership

| Route | Current owner | Current quality | Notes |
|------|---------------|-----------------|-------|
| `/` | `src/flows/auth-shell/components/RootRedirectPage.tsx` | usable baseline | Already has cards, badge, and role-aware links. |
| `/sign-in` | `src/flows/auth-shell/components/SignInPage.tsx` | scaffold | Bare markup, mojibake copy, plain CTA presentation. |
| `/invite/[token]` | `src/app/invite/[token]/page.tsx` | scaffold | Token-aware action exists, but no invite-specific framing beyond the label. |
| `/onboarding` | `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx` + `ProfileOnboardingForm.tsx` | scaffold | Redirect rules exist, but layout, copy, and feedback are raw. |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | placeholder | One heading only. |
| `/worker` | `src/flows/worker-shell/components/WorkerShellPage.tsx` | thin but raw | Link structure exists and is already tested. |
| `/admin` | `src/app/admin/page.tsx` -> `AdminOperationsDashboardPage` | bypasses shell | `AdminShellPage.tsx` exists but is not the live route today. |

### Existing automated coverage

| File | What it proves | Relevance |
|------|----------------|-----------|
| `src/flows/auth-shell/components/RootRedirectPage.test.tsx` | anonymous redirect, onboarding redirect, role-aware common-home links | strong baseline for `/` |
| `src/mutations/auth/components/GoogleSignInButton.test.tsx` | button invokes `startGoogleSignIn(window.location.origin, inviteToken)` | baseline for sign-in and invite CTA |
| `src/flows/worker-shell/components/WorkerShellPage.test.tsx` | worker-only access and shell link visibility | baseline for worker landing |
| `src/flows/admin-shell/components/AdminShellPage.test.tsx` | only shallow placeholder rendering today | needs stronger shell assertions |

### Shared primitives available now

- `src/shared/ui/button.tsx`
- `src/shared/ui/card.tsx`
- `src/shared/ui/alert.tsx`
- `src/shared/ui/badge.tsx`

These are enough to build a consistent Phase 10 surface without importing a new component library.

## Project Constraints (from CLAUDE.md and codebase conventions)

- Keep route files thin and keep page behavior under `src/flows` and `src/mutations`.
- Use `#` absolute imports only.
- Preserve server-component auth and redirect logic where it already exists.
- Use colocated Vitest tests for route, flow, and component coverage.
- Repository text files must stay UTF-8 without BOM and LF line endings.

## Standard Stack

### Core

| Library | Version Source | Purpose | Why Standard |
|---------|----------------|---------|--------------|
| Next.js App Router | repo `package.json` | route files, loading/error boundaries, server redirects | Entry and shell work lives in App Router routes today. |
| React 19 | repo `package.json` | client-side onboarding and sign-in button interactions | Current entry controls already use React transitions and client routing. |
| Tailwind utility classes | existing components | layout and visual polish | Shared UI primitives already assume Tailwind utility styling. |
| Vitest + Testing Library | existing test suite | route, flow, and component regression coverage | Current entry and shell tests already use this stack. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Reusing the current card pattern | Build an all-new design system wrapper first | Too much scope for a surface-completion phase. |
| Route-level loading/error files | Client-only spinners or ad hoc inline text | Harder to keep entry states readable and consistent. |
| A role-aware admin landing page | Continue sending `/admin` straight to the dashboard | Keeps the placeholder `AdminShellPage` dead and makes the admin entry flow feel inconsistent with worker routing. |

## Architecture Patterns

### Pattern 1: Thin routes, flow-owned surfaces
**What:** Keep `src/app/*/page.tsx` files minimal and place the actual UI surface in flow components.

**When to use:** For sign-in, onboarding, root, worker, and any new admin landing route work.

**Why:** This matches the current repo structure and keeps route ownership aligned with server-side auth logic.

### Pattern 2: Shared entry surface frame
**What:** Create one reusable entry-frame layout for sign-in, invite, onboarding, unauthorized, and route-level failure states.

**When to use:** Whenever a page needs a single-column entry card with title, supporting copy, CTA region, and optional alert content.

**Why:** The current gap is inconsistency. A small shared frame keeps copy, spacing, and CTA treatment aligned without inventing a large abstraction.

### Pattern 3: Status surfaces are first-class routes
**What:** Implement loading and failure surfaces as App Router `loading.tsx` and `error.tsx` files, not as silent console failures or blank shells.

**When to use:** For `/`, `/onboarding`, `/worker`, `/admin`, and any route where auth/profile fetching can pause or fail.

**Why:** `ENTRY-04` is explicitly about readable loading, unauthorized, empty, and failure states on entry surfaces.

### Pattern 4: Root stays the gatekeeper, shells stay role-specific
**What:** Keep `RootRedirectPage` as the auth/profile gatekeeper, then give `/worker` and `/admin` clear role-specific landing surfaces for next actions.

**When to use:** For the role-aware shell portion of this phase.

**Why:** `/` should decide where the user belongs, but each role route still needs a readable home once the user gets there.

### Anti-Patterns to Avoid

- Styling sign-in and invite independently with different hierarchy, spacing, or button treatments.
- Leaving mojibake strings in production-facing entry routes.
- Adding new auth behavior when the current sign-in flow already works.
- Keeping `AdminShellPage` as dead placeholder code after planning a role-aware shell phase.
- Solving loading/failure states with plain text nodes that bypass the established card pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Entry CTA styling | Custom button markup in every page | `Button` or `GoogleSignInButton` using the existing button tokens | Keeps focus, sizing, and disabled states consistent. |
| Surface framing | One-off `<main><h1>...` markup on every route | `Card`, `Badge`, `Alert`, and one shared entry-frame composition | Faster and more consistent. |
| Loading/error messaging | Hidden suspense fallback or blank route output | Route-level `loading.tsx` and `error.tsx` surfaces with explicit copy | Matches `ENTRY-04`. |

## Common Pitfalls

### Pitfall 1: Fixing copy but leaving structure raw
**What goes wrong:** The Korean copy is repaired, but the route still renders like a prototype because the layout remains bare.
**How to avoid:** Treat structure, CTA hierarchy, and spacing as part of the deliverable, not just translation cleanup.

### Pitfall 2: Making `/admin` the odd route out
**What goes wrong:** `/worker` gets a shell, but `/admin` still drops directly into a dashboard scaffold.
**How to avoid:** Decide explicitly whether `/admin` becomes the admin home or whether the dashboard is wrapped in a readable landing shell.

### Pitfall 3: Forgetting failure states for server-rendered routes
**What goes wrong:** The happy path pages look better, but loading or thrown errors still surface as raw framework fallbacks.
**How to avoid:** Include route-level loading and error files in the same phase instead of leaving them for later.

### Pitfall 4: Testing only redirects and not the new copy hierarchy
**What goes wrong:** Existing redirect tests stay green while the new surfaces regress or disappear.
**How to avoid:** Add render assertions for headings, CTA labels, alert text, and primary links on the new entry and shell surfaces.

## Code Examples

### Current sign-in surface
```tsx
export function SignInPage() {
  return (
    <main>
      <h1>...</h1>
      <p>...</p>
      <GoogleSignInButton label="..." />
    </main>
  );
}
```

### Recommended direction
```tsx
return (
  <main className="min-h-screen bg-background px-4 py-8">
    <EntrySurfaceFrame
      badge="Sign in"
      title="Continue with Google"
      description="Use your invited account to sign in and finish profile setup."
    >
      <GoogleSignInButton label="Continue with Google" />
    </EntrySurfaceFrame>
  </main>
);
```

### Current unauthorized route
```tsx
export default function UnauthorizedPage() {
  return (
    <main>
      <h1>...</h1>
    </main>
  );
}
```

### Recommended direction
```tsx
return (
  <EntrySurfaceFrame
    badge="Access required"
    title="You do not have access to this area"
    description="Sign in with an invited account or return to the common home."
  >
    <Alert variant="destructive">...</Alert>
    <Link href="/">Return home</Link>
  </EntrySurfaceFrame>
);
```

## Environment Availability

| Capability | Status | Notes |
|------------|--------|-------|
| Local UI unit tests | Available | Existing route and flow tests already run under Vitest + Testing Library. |
| App Router route files | Available | No `loading.tsx` or `error.tsx` files exist yet under `src/app`. |
| Shared UI primitives | Available | Enough to build Phase 10 surfaces without extra packages. |
| Browser-only auth callback proof | Manual | Google OAuth callback still needs live browser validation later. |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm exec vitest run src/mutations/auth/components/GoogleSignInButton.test.tsx src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx` |
| Full suite command | `pnpm test` |
| Estimated runtime | ~20 seconds |

### Phase Requirements -> Test Map

| Requirement | Proof Target | Test Type | Command | Notes |
|-------------|--------------|-----------|---------|-------|
| ENTRY-01 | sign-in entry surface and Google CTA | component | `pnpm exec vitest run src/flows/auth-shell/components/SignInPage.test.tsx src/mutations/auth/components/GoogleSignInButton.test.tsx` | `SignInPage.test.tsx` is expected to be added in this phase. |
| ENTRY-02 | invite acceptance route copy and CTA | route + component | `pnpm exec vitest run src/app/invite/[token]/page.test.tsx src/mutations/auth/components/GoogleSignInButton.test.tsx` | Invite route test is expected to be added in this phase. |
| ENTRY-03 | root, worker, and admin landing shells | flow | `pnpm exec vitest run src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx` | Existing tests already provide a baseline; admin shell assertions need expansion. |
| ENTRY-04 | onboarding and route-state surfaces | flow + route | `pnpm exec vitest run src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx src/app/unauthorized/page.test.tsx` | Route-state tests are expected to be added in this phase. |

### Sampling Rate

- **After every task commit:** Run the test command for the files touched by that task.
- **After every plan wave:** Run `pnpm exec vitest run src/mutations/auth/components/GoogleSignInButton.test.tsx src/flows/auth-shell/components/RootRedirectPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx src/flows/admin-shell/components/AdminShellPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 20 seconds.

### Wave 0 Gaps

- [ ] `src/flows/auth-shell/components/SignInPage.test.tsx` - sign-in layout, CTA label, and explanatory copy
- [ ] `src/app/invite/[token]/page.test.tsx` - invite-specific copy, token-aware CTA label, and supporting text
- [ ] `src/flows/profile-onboarding/components/ProfileOnboardingPage.test.tsx` - onboarding redirect and readable shell copy
- [ ] `src/app/unauthorized/page.test.tsx` - unauthorized route heading, supporting text, and recovery link

### Manual-Only Checks

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth browser round-trip returns the user to the correct next route | ENTRY-01, ENTRY-02 | Vitest can prove the action call, not the live provider redirect | From both `/sign-in` and `/invite/<token>`, click the Google CTA and confirm the browser begins the correct auth flow and returns to the app. |
| Admin landing choice feels coherent after the Phase 10 route handoff | ENTRY-03 | Final UX quality depends on live route transitions and perceived clarity | Sign in as an admin and confirm `/`, `/admin`, and any dashboard child route feel like one coherent entry flow. |
| Loading and error surfaces appear during slow or failed profile fetches | ENTRY-04 | Triggering real suspense and runtime failures is easiest in a live app | Simulate a slow or failed session/profile fetch and confirm the user sees a readable loading or recovery surface rather than a blank screen. |

## Sources

### Local Codebase Inspection
- `src/app/page.tsx`
- `src/app/sign-in/page.tsx`
- `src/app/invite/[token]/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/unauthorized/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/worker/page.tsx`
- `src/flows/auth-shell/components/SignInPage.tsx`
- `src/flows/auth-shell/components/RootRedirectPage.tsx`
- `src/flows/profile-onboarding/components/ProfileOnboardingPage.tsx`
- `src/mutations/auth/components/ProfileOnboardingForm.tsx`
- `src/mutations/auth/components/GoogleSignInButton.tsx`
- `src/mutations/auth/components/GoogleSignInButton.test.tsx`
- `src/flows/worker-shell/components/WorkerShellPage.tsx`
- `src/flows/worker-shell/components/WorkerShellPage.test.tsx`
- `src/flows/admin-shell/components/AdminShellPage.tsx`
- `src/flows/admin-shell/components/AdminShellPage.test.tsx`
- `src/flows/auth-shell/components/RootRedirectPage.test.tsx`
- `src/shared/ui/button.tsx`
- `src/shared/ui/card.tsx`
- `src/shared/ui/alert.tsx`
- `src/shared/ui/badge.tsx`

## Metadata

- Research mode: local fallback; no subagents used for this planning run
- Scope: entry and role-aware shell surface completion for shipped v1 behavior
- Recommended plan count: 3
