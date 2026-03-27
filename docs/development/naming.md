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

## Hooks and Model Files

- Hooks use `camelCase` with a `use` prefix.
- Examples: `useHallList.ts`, `useReservationSubmit.ts`
- `models/dto` files use concise domain names such as `hallSummary.ts`.
- DTO type names use the `Dto` suffix, for example `HallSummaryDto`.
- `models/dal` files use concise domain names such as `hallSummary.ts`.
- DAL type names use the `Dal` suffix, for example `HallSummaryDal`.
- `models/form` files use the `Form` suffix, for example `ReservationForm.ts`.

## Action, Utility, and Lib Files

- `actions` files use command-style `camelCase` names.
- Example: `createReservation.ts`
- `utils` files use intent-first `camelCase` names for pure logic.
- Example: `buildReservationPayload.ts`
- `lib` files use intent-first `camelCase` names for third-party or IO adapters.
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
