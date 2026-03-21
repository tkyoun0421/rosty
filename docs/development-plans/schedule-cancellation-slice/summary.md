# Schedule Cancellation Slice Summary

## Goal

Add the first manager/admin action for canceling `collecting` or `assigned` schedules from `Schedule Detail`.

## Shipped

- Added `supabase/migrations/20260321133000_cancel_schedule_operation_rpc.sql`.
- Added the schedule-cancellation API and mutation path in `src/features/schedules/api/`.
- Updated `src/features/schedules/ui/schedule-detail-screen.tsx` so managers/admins can cancel eligible schedules with inline confirmation.
- Updated the seed fallback so local schedule, workspace, assignment, and queue snapshots stay aligned after cancellation.
- Updated current archive notes for the richer scheduling interruption flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and the app now contains the first limited schedule-cancellation path.

## Residual Risk

- Live behavior still depends on applying the cancellation RPC migration to the real Supabase project.
- Schedule-cancel notifications and automatic requester notifications are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked schedule cancellation migration to the real Supabase project.
- Decide whether the next scheduling slice is requester notifications, payroll closeout, or another staffing interruption flow.
