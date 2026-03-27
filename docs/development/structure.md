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
- `queries`: read-oriented domain slices for fetch, read models, and read-side UI
- `shared`: foundation-only code such as base UI, generic hooks, pure utilities, third-party adapters, and global constants

## Layer Shapes

- `flows/<usecase>/hooks + models + components + utils + lib`
- `mutations/<domain>/actions + hooks + models + utils + lib + constants + components`
- `mutations/<domain>/models/dto + dal + form`
- `queries/<domain>/hooks + models + utils + lib + constants`
- `queries/<domain>/models/dto + dal`

`queries/<domain>/components` is allowed only for read-only UI tied to query output.

## Dependency Direction

`app -> flows -> mutations/queries -> shared`

- `app` imports from `flows` and `shared`, but should not hold business logic.
- `flows` is the only layer allowed to compose read and write behavior together.
- mutations and queries do not import each other directly.
- `shared` is the leaf layer and should not depend on project-specific domain slices.

## Shared Rules

- `shared/ui` is for reusable presentation primitives only.
- `shared/hooks` is for domain-independent hooks only.
- `shared/utils` is for domain-independent pure functions.
- `shared/lib` is for domain-independent third-party or IO adapters.
- `shared/constants` is for app-wide foundation constants only.
- shared/utils and shared/lib are the default homes.
- Move `utils` or `lib` into a domain slice only when the code is strongly domain-coupled.

## Examples

```text
src/
  app/
  flows/
    reservation-checkout/
      hooks/
      models/
      components/
      utils/
      lib/
  mutations/
    reservation/
      actions/
      hooks/
      models/
        dto/
        dal/
        form/
      utils/
      lib/
      constants/
      components/
  queries/
    hall/
      hooks/
      models/
        dto/
        dal/
      utils/
      lib/
      constants/
      components/
  shared/
    ui/
    hooks/
    utils/
    lib/
    constants/
```