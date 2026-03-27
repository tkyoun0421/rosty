# Boundary Rules

## Purpose

Make layer ownership explicit so read logic, write logic, flow orchestration, and shared foundations do not bleed into each other.

## Layer Ownership

- `app` owns route entry, layout, and framework wiring only.
- `flows` owns usecase orchestration, multi-step coordination, and screen-level state.
- `mutations` owns write-side interaction, submission behavior, validation wiring, and write-specific UI.
- `queries` owns read-side access, read types, read schemas, and read-only UI.
- `shared` owns non-domain foundations only.

## Form Ownership

- `mutations = input/submit`
- `flows = step/flow state`

If a form submits data, validates input, or manages submit state, it belongs primarily to `mutations`. If it coordinates multi-step progress or screen-level journey state, it belongs to `flows`.

## Subfolder Ownership

- `actions = execution core`
- `hooks = UI binding`
- `types = app-facing shapes`
- `schemas = validation and parsing`
- `dal = data access layer`
- `utils = pure functions`
- `lib = third-party or runtime adapters`
- `components = dummy UI only`

`actions` live under `mutations/<domain>/actions` and hold the write-side execution core. They should stay free of React runtime concerns. `hooks` adapt actions and query results to React state and UI libraries. `types` hold screen-facing or app-facing shapes. `schemas` hold zod validation, parsing, and input contracts. `dal` holds fetch, persist, storage, and other slice-local data access code. `lib` holds SDK wrappers and runtime-bound adapters that are not the slice's main data access path.
Async `dal` functions return successful domain values only. Expected operational failures should throw a shared app error shape, while schema parse failures and contract violations should surface as ordinary errors.
Components must stay presentational. They receive values, formatted strings, and handlers through props, but should not own query, mutation, form, or fetch logic.

## Import Rules

- absolute imports only
- Use `#app`, `#flows`, `#mutations`, `#queries`, and `#shared` as the public import bases.
- Relative imports are not allowed.
- Deep imports are not allowed.
- Folder imports are not allowed.
- Same-slice imports still use absolute paths.
- TanStack Query keys must come from a shared query key factory in `src/shared/constants/queryKeys.ts`.
- Do not inline query key arrays in hooks or mutation invalidation.
- `mutations` and `queries` do not import each other directly.
- `flows` is the only layer that composes `mutations` and `queries` together.

## UI Safety

- Every UI component file must end in `.server.tsx` or `.client.tsx`.
- Every `.server.tsx` UI component must include `import 'server-only'`.
- Every `.client.tsx` UI component must start with `'use client'`.
- New unsuffixed UI component files are not allowed.
- Missing runtime intent markers are treated as a structural defect, not a style issue.
