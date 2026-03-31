# Coding Conventions

**Analysis Date:** 2026-03-31

## Source Of Truth

- This document captures the current agreed codebase contract for new implementation work.
- If older phase plans or codebase docs mention `src/lib/*`, `tests/access/*`, or route-group assumptions such as `src/app/(admin)/*`, treat those as stale until replanned.

## Top-Level Structure

- Source code lives under `src/`.
- Top-level layers are:
  - `src/app`
  - `src/flows`
  - `src/mutations`
  - `src/queries`
  - `src/shared`

## Layer Responsibilities

- `app`: route files, layouts, metadata, and provider wiring only.
- `flows`: page-level and user-flow composition. A flow owns composed UI for a route.
- `mutations`: write commands, server actions, submit handlers, and write-side side effects.
- `queries`: read models, read-side DAL, server-safe read functions, and client query hooks.
- `shared`: cross-cutting primitives and third-party wrappers only.

## Dependency Direction

- Dependency flow is strict: `app -> flows -> mutations -> queries -> shared`.
- `app` may import from every lower layer.
- `flows` may import from `mutations`, `queries`, and `shared`.
- `mutations` may import from `queries` and `shared`.
- `queries` may import from `shared`.
- `shared` may not import from any higher layer.
- Enforce this with lint rules, not just review discipline.

## Routing Rules

- `src/app` stays thin.
- Route structure follows actual page structure; it is not pre-optimized around fixed route groups.
- One route maps to one flow.
- `app` files render or compose the matching flow entry and should not own business logic.
- Global providers live under `src/app/_providers/*`.

## Shared Layer Rules

**`shared/ui`:**
- Design-system level primitives only.
- Examples: button, input, modal, table shell, badge, form field shell.
- Domain-aware UI does not belong here.
- UI components must stay presentation-focused and must not know business logic.
- Shared UI components may depend on shared generic helpers only.

**UI logic placement:**
- Domain-specific logic must live under the owning domain slice in `flows`, `mutations`, or `queries`.
- Cross-domain reusable logic must live under `shared`.
- Do not embed domain behavior directly inside UI component files just because the component renders that behavior.

**`shared/lib`:**
- Third-party wrappers and adapters only.
- Examples: Supabase client setup, React Query client setup, framework adapters.
- Do not place domain DAL in this layer.

**`shared/model`:**
- App-wide primitive contracts only.
- Allowed: shared enums, base schemas, generic form models, cross-app primitive types.
- Domain-specific models stay in the owning `queries`, `mutations`, or `flows` slice.

**`shared/config`:**
- Runtime configuration only.
- Allowed: env parsing, route constants, feature flags, app constants.
- Domain-specific constants stay in the owning layer.

## Slice Structure

- Organize `flows`, `mutations`, and `queries` by domain slice, then by role.

**`flows/{flow}` commonly contains:**
- `components/`
- `hooks/`
- `types/`
- `utils/`

**`mutations/{domain}` commonly contains:**
- `components/`
- `actions/`
- `dal/`
- `hooks/`
- `schemas/`
- `utils/`

**Mutation-scoped UI:**
- UI that exists mainly to trigger or wrap a single domain mutation may live under `mutations/{domain}/components`.
- Use this for small domain-specific trigger components such as auth buttons or submit controls tied to one mutation slice.
- Keep route composition and page-level layout in `flows`.

**`queries/{domain}` commonly contains:**
- `dal/`
- `hooks/`
- `types/`
- `schemas/`
- `utils/`

## Server And Client Boundaries

- Server actions live only in `mutations/*/actions`.
- `app` and `flows` may call actions but do not define them.
- Action files orchestrate writes and invalidation only.
- Keep `zod` schema declarations, parsing helpers, and normalization logic in `schemas/`, not inline inside action files.
- `queries` expose a dual API:
  - server-safe read functions from the query slice
  - client hooks from `queries/*/hooks`
- The project is server-first for reads. Use React Query when client cache, refetching, or sync behavior is needed.
- When query hooks are introduced, query keys must come from a query-key factory owned by the query slice. Do not scatter inline query key arrays across components.
- Prefer tag-based invalidation over `revalidatePath`. Use path invalidation only when a concrete tag strategy is not viable.

## DAL Rules

- Read DAL lives in `queries/*/dal`.
- Write DAL lives in `mutations/*/dal`.
- Do not create shared DAL modules in `shared/lib`.

## Hooks Rules

- Hooks stay in the owner layer.
- Use:
  - `flows/*/hooks`
  - `mutations/*/hooks`
  - `queries/*/hooks`
- `shared` may contain only truly generic hooks.

## State And Forms

- Client state standard: `zustand`.
- Form standard: `react-hook-form` with `zod`.
- Keep form schemas in the owner layer unless they are truly app-wide primitives.

## Pure Logic Placement

- Do not leave pure helper functions such as formatters, mappers, or summary builders inside component files.
- Domain-specific pure logic belongs under the owning domain slice, typically in `utils/` or another explicit non-UI folder.
- Cross-domain reusable pure logic belongs under `shared`.

## Naming

- Directories use `kebab-case`.
- Non-component files use `camelCase`.
- React component files use `PascalCase`.
- Prefer explicit filenames such as `createInvite.ts`, `listWork.ts`, and `AdminWorkPage.tsx`.

## Imports

- Use top-level `#` aliases only:
  - `#app/*`
  - `#flows/*`
  - `#mutations/*`
  - `#queries/*`
  - `#shared/*`
- Prefer direct file imports.
- Barrel files are forbidden.
- Import order:
  1. Node built-ins
  2. Third-party packages
  3. Internal `#` aliases
  4. Relative imports when truly local

## Testing

- Tests are co-located with the code they validate.
- Preferred examples:
  - `queries/work/dal/listWork.test.ts`
  - `mutations/invite/actions/createInvite.test.ts`
  - `flows/admin-work/components/AdminWorkPage.test.tsx`
- Root-level test folders are exceptions, not the default.

## Tooling Guidance

- Formatting is handled by Prettier and repository editor settings.
- Add lint rules that enforce the layer dependency contract before significant implementation begins.
- Treat `tsconfig.json` aliases as part of the architectural contract, not just convenience.

## Git Workflow

- When a meaningful unit of work is complete, finish by committing and pushing the branch unless the user explicitly says not to.
- Commit messages should be detailed enough to explain the actual scope of the change, not just a vague one-line label.
- Prefer commit messages that make the changed area, the intent, and the major technical outcome obvious.

---

*Convention analysis: 2026-03-31*