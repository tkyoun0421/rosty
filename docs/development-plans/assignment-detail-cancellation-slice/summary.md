# Assignment Detail And Cancellation Slice Summary

## Goal

Add the first employee-facing `Assignment Detail` route with per-position cancellation requests while keeping grouped `My Assignments` cards as the employee list entry point.

## Shipped

- Added `src/app/assignment-detail.tsx` and extended auth-route access so active employees can open the new detail route.
- Added the assignment-detail grouping model and detail query under `src/features/assignments/`.
- Added `src/features/assignments/ui/assignment-detail-screen.tsx`.
- Added `supabase/migrations/20260320133000_assignment_cancellation_request.sql`.
- The new migration adds:
  - `cancellation_request_status`
  - `cancellation_requests`
  - the `request_assignment_cancellation(...)` employee RPC
  - the active-request unique index and RLS policies
- Added `src/features/assignments/api/request-assignment-cancellation.ts` and its mutation hook.
- Updated `My Assignments` cards to open the new detail route by schedule context.
- Updated the screen IA note to describe the first shipped cancellation flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains an employee assignment-detail route plus limited per-position cancellation requests.

## Residual Risk

- The shared scheduling/payroll read migration and the new cancellation-request migration still need to be applied to the real Supabase project before the live flows stop falling back or the real request RPC can work there.
- Manager or admin cancellation approval and rejection flows are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll read migration and the new cancellation-request migration to the real Supabase project.
- Implement the manager or admin cancellation review queue and approval or rejection flows.
- Continue the scheduling feature rollout on top of the tracked schema.
