# Assignment Exception Slice Summary

## Goal

Add the explicit duplicate-assignee exception path to `Assignment Workspace` so operators must confirm before assigning the same employee to multiple slots on one schedule.

## Shipped

- Extended assignment workspace reads and writes so `is_exception_case` is preserved.
- Added explicit duplicate-assignee detection in `src/features/assignments/model/assignment-workspace.ts`.
- Added the confirmation UI inside `src/features/assignments/ui/assignment-workspace-screen.tsx`.
- Added focused regression coverage for duplicate-assignee exception saves and snapshot behavior.
- Updated current archive notes for the richer staffing flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and `Assignment Workspace` now requires explicit confirmation before duplicate same-schedule assignee saves.

## Residual Risk

- Live workspace reads/writes still depend on the shared scheduling/payroll migration plus the confirm RPC migration being applied to the real Supabase project.
- Exception saves still do not trigger notifications or downstream staffing alerts.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling migrations to the real Supabase project.
- Decide whether the next staffing slice is exception notifications, richer vacancy review, or push registration.
