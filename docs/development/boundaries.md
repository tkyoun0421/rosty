# Boundary Rules

## Purpose

Make layer ownership explicit so read logic, write logic, flow orchestration, and shared foundations do not bleed into each other.

## Layer Ownership

- `app` owns route entry, layout, and framework wiring only.
- `flows` owns usecase orchestration, multi-step coordination, and screen-level state.
- `mutations` owns write-side interaction, submission behavior, validation wiring, and write-specific UI.
- `queries` owns read-side access, read models, and read-only UI.
- `shared` owns non-domain foundations only.

## Form Ownership

- `mutations = input/submit`
- `flows = step/flow state`

If a form submits data, validates input, or manages submit state, it belongs primarily to `mutations`. If it coordinates multi-step progress or screen-level journey state, it belongs to `flows`.

## Subfolder Ownership

- `actions = execution core`
- `hooks = UI binding`
- `utils = pure functions`
- `lib = third-party or IO adapters`

`actions` live under `mutations/<domain>/actions` and hold the write-side execution core. They should stay free of React runtime concerns. `hooks` adapt actions and query results to React state and UI libraries. `utils` hold pure calculations and deterministic transformations. `lib` holds SDK wrappers, network clients, storage adapters, and other runtime-bound integrations.

## Import Rules

- absolute imports only
- Use `#app`, `#flows`, `#mutations`, `#queries`, and `#shared` as the public import bases.
- Relative imports are not allowed.
- Deep imports are not allowed.
- Folder imports are not allowed.
- Same-slice imports still use absolute paths.
- `mutations` and `queries` do not import each other directly.
- `flows` is the only layer that composes `mutations` and `queries` together.

## UI Safety

- Every UI component file must end in `.server.tsx` or `.client.tsx`.
- Every `.server.tsx` UI component must include `import 'server-only'`.
- Every `.client.tsx` UI component must start with `'use client'`.
- New unsuffixed UI component files are not allowed.
- Missing runtime intent markers are treated as a structural defect, not a style issue.
