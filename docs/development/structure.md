# Development Structure Rules

## Purpose

Define one stable project shape so new code lands in predictable places and layer ownership stays obvious.

## Source Root

All application source code lives under `src`.

`src/app / src/flows / src/mutations / src/queries / src/shared`

Keep `docs`, `tests`, `public`, and project config files at the repository root.

## Top-Level Layers

- `app`: route entry, layout, provider wiring, and framework-facing composition only
- `flows`: usecase orchestration, screen state, and screen adapters
- `mutations`: write-oriented domain slices for input, submit, and write-side UI
- `queries`: read-oriented domain slices for fetch, read types, and read-side UI
- `shared`: foundation-only code such as base UI, generic hooks, pure utilities, third-party adapters, and global constants

## Layer Shapes

- `src/app/_providers` is the home for app-only providers such as `QueryClientProvider.client.tsx`
- `flows/<usecase>/hooks + components + types + schemas + utils + lib`
- `mutations/<domain>/actions + hooks + components + types + schemas + dal + constants + utils + lib`
- `queries/<domain>/hooks + components? + types + schemas + dal + constants + utils + lib`

`queries/<domain>/components` is allowed only for read-only UI tied to query output.

## Dependency Direction

`app -> flows -> mutations/queries -> shared`

- `app` imports from `flows`, `shared`, and `src/app/_providers`, but should not hold business logic.
- `flows` is the only layer allowed to compose read and write behavior together.
- mutations and queries do not import each other directly.
- `shared` is the leaf layer and should not depend on project-specific domain slices.

## Shared Rules

- `shared/ui` is for reusable presentation primitives only.
- `shared/hooks` is for domain-independent hooks only.
- `shared/utils` is for domain-independent pure functions.
- `shared/lib` is for domain-independent third-party or runtime adapters.
- `shared/constants` is for app-wide foundation constants only.
- shared/utils and shared/lib are the default homes.
- Move `utils` or `lib` into a domain slice only when the code is strongly domain-coupled.

## Examples

```text
src/
  app/
    _providers/
  flows/
    reservation-checkout/
      hooks/
      components/
      types/
      schemas/
      utils/
      lib/
  mutations/
    reservation/
      actions/
      hooks/
      components/
      types/
      schemas/
      dal/
      constants/
      utils/
      lib/
  queries/
    hall/
      hooks/
      components/
      types/
      schemas/
      dal/
      constants/
      utils/
      lib/
  shared/
    ui/
    hooks/
    utils/
    lib/
    constants/
```