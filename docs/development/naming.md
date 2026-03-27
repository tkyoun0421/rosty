# Naming Rules

## Purpose

Make file names and symbol names predictable enough that structure, responsibility, and runtime intent are visible before opening the file.

## Folder Names

- Folders use `kebab-case`.
- Generic names such as `common`, `misc`, `temp`, or `helpers` are not allowed as top-level or slice-level folders.
- `index.ts` is almost always forbidden.

## UI Component Files

- All UI components must use `Name.server.tsx` or `Name.client.tsx`.
- `Name.server.tsx` is the default when a component can stay on the server.
- `Name.client.tsx` is used only when the component needs client-side hooks, effects, or browser APIs.
- The exported component symbol uses `PascalCase` and matches `Name`.

Examples:

- `HallListCard.server.tsx`
- `ReservationForm.client.tsx`

## Hooks and Providers

- Hooks use `camelCase` with a `use` prefix.
- Examples: `useHallList.ts`, `useReservationSubmit.ts`
- App-only providers live in `src/app/_providers` and use concern-driven `PascalCase` names.
- Examples: `QueryClientProvider.client.tsx`, `SupabaseProvider.client.tsx`

## Types, Schemas, and Dal Files

- `types` files use concise domain names such as `scheduleRequest.ts` or `employeeScheduleView.ts`.
- `schemas` files use concise domain names such as `scheduleRequest.ts`.
- `dal` files use intent-first `camelCase` names for data access or concise domain names for records.
- Examples: `scheduleRequest.ts`, `fetchScheduleRequests.ts`, `submitScheduleRequest.ts`
- Do not use `Dto`, `Dal`, or `Form` suffix conventions.

## Action, Utility, and Lib Files

- `actions` files use command-style `camelCase` names.
- Example: `createReservation.ts`
- `utils` files use intent-first `camelCase` names for pure logic.
- Example: `buildReservationPayload.ts`
- `lib` files use intent-first `camelCase` names for third-party or runtime adapters.
- Example: `reservationMutationClient.ts`
- The same naming rule applies in both `shared` and domain-local folders.

## Constants and Tests

- `constants` file names stay concise, for example `reservation.ts` or `appRoutes.ts`.
- Constant exports use `SCREAMING_SNAKE_CASE` when they represent real fixed constants.
- Test files mirror the target file and append `.test`.
- Examples: `useHallList.test.ts`, `ReservationForm.client.test.tsx`

## Export Rules

- Named export is the default.
- `default export` is allowed only for framework route-entry files in `app`.
- Barrel re-exports are almost always forbidden.
- Folder imports are forbidden because `index.ts` is almost always forbidden.