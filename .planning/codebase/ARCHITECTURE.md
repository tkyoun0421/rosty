# Architecture

**Analysis Date:** 2026-03-31

## Pattern Overview

**Overall:** Planning-first Next.js workspace with a custom hybrid application architecture reserved but not fully implemented yet

**Key Characteristics:**
- The repository is still planning-heavy, with project state and execution artifacts living under `.planning/`.
- Runtime code should follow a custom hybrid layered structure under `src/`: `app / flows / mutations / queries / shared`.
- The architecture is intentionally server-first for reads, with React Query used as a client-side cache and synchronization aid rather than the default data path.
- The route layer is intentionally thin. Business logic and composed UI belong below it.

## Application Layers

**`app`:**
- Purpose: own routing, layouts, metadata, route entry files, and provider composition.
- Scope: thin entry layer only.
- Contains: route files, layouts, loading/error shells, and `app/_providers/*`.
- Must not contain: business logic, domain DAL, or server action definitions.

**`flows`:**
- Purpose: own route-level and user-flow composition.
- Scope: composed UI and orchestration for a single route flow.
- Contains: `components`, `hooks`, `types`.
- Pattern: one route maps to one flow.
- Rule: UI components render state and user interaction, but domain logic stays in the owning domain files under the same slice or lower layers.

**`mutations`:**
- Purpose: own write commands.
- Scope: server actions, mutation DAL, submit logic, write hooks, write schemas, and mutation-scoped trigger UI.
- Contains: `components`, `actions`, `dal`, `hooks`, `schemas`.
- Rule: server actions live only here.
- Rule: small domain UI that directly wraps one mutation may live here, while route composition stays in `flows`.

**`queries`:**
- Purpose: own read models.
- Scope: read DAL, server-safe read functions, client hooks, read schemas, and read-side utilities.
- Contains: `dal`, `hooks`, `types`, `schemas`, `utils`.
- Pattern: dual API for server and client callers.

**`shared`:**
- Purpose: hold cross-cutting primitives and third-party wrappers.
- Scope: `ui`, `lib`, `model`, `config`.
- Rule: no domain DAL or higher-layer logic.
- Rule: shared reusable logic belongs here only when it is not owned by a single domain.

## Dependency Graph

- The dependency direction is strict: `app -> flows -> mutations -> queries -> shared`.
- This is a hard architectural rule and should be enforced by lint configuration.
- The graph implies:
  - `mutations` may depend on read-side modules in `queries`.
  - `queries` may not depend on `mutations`.
  - `shared` is terminal and depends only on itself and third-party packages.

## Current Repository State

- The architectural contract is partially encoded in `tsconfig.json` via `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, and `#shared/*`.
- The repository does not yet contain the full `src/` implementation matching that contract.
- Several older planning artifacts still reference earlier ideas such as `src/lib/*` and route groups; those references should be treated as stale until the phase is replanned.

## Data Flow

**Read path:**
1. A route entry in `app` renders its matching flow.
2. The flow composes read needs through the query slice.
3. Server-first reads use query-side server-safe functions and DAL.
4. Client-side cache or live sync needs use `queries/*/hooks`.

**Write path:**
1. A flow triggers a write interaction.
2. The write goes through `mutations/*/actions` or related mutation-layer entry points.
3. Mutation logic may consult `queries` read models when needed.
4. Persistence happens through `mutations/*/dal`.

## State Model

- Server state strategy: server-first.
- Client server-cache strategy: React Query when client-side caching or synchronization is needed.
- Client UI/shared state strategy: Zustand as the standard client state container.
- Form handling strategy: React Hook Form plus Zod.

## Key Abstractions

**Route Entry:**
- A file in `src/app/*` that binds Next.js routing to one flow.

**Flow Entry:**
- A composed UI entry in `src/flows/*` that owns the page-level experience for a route.

**Query Slice:**
- A read-model module exposing server-safe reads plus client hooks.

**Mutation Slice:**
- A write-command module exposing server actions and write-side behavior.

**Shared Primitive:**
- A cross-app UI primitive, adapter, model primitive, or runtime config object that does not encode domain workflow.

## Entry Points

**Planning Entry Point:**
- `.planning/STATE.md`
- Used to understand active phase status and unresolved planning assumptions.

**Tooling Entry Point:**
- `package.json`
- Defines the development, build, test, and formatting commands.

**Runtime Entry Point:**
- Future `src/app/*` route files.
- These are expected to stay thin and delegate to `flows`.

## Cross-Cutting Concerns

**Providers:**
- Global providers live under `src/app/_providers/*`.
- Low-level provider helpers may exist in `shared`, but app-level composition remains in `app`.

**Validation:**
- Use Zod as the standard validation layer.
- Keep domain validation close to the owner slice.

**Imports:**
- Use top-level `#` aliases only.
- Avoid barrel exports.

**Testing:**
- Co-locate tests with the source they verify.

---

*Architecture analysis: 2026-03-31*
