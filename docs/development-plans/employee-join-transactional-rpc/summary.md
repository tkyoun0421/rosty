# Employee Join Transactional RPC Summary

## Goal

Move employee onboarding completion off the client-side two-step write path so invite validation, profile persistence, and invite consumption happen inside one server-enforced database transaction.

## Shipped

- Added a Supabase migration artifact for `public.complete_employee_join(...)` under `supabase/migrations/20260319190000_complete_employee_join.sql`.
- Designed the RPC as a short `security definer` transaction that validates the invite, enforces `auth.uid()` ownership, upserts the employee profile, and consumes the invitation row.
- Replaced the client-side claim plus rollback flow in `Profile Setup` with a single RPC wrapper for employee onboarding.
- Kept manager or admin candidate profile setup on the existing direct `profiles` upsert path.
- Locked the transactional employee join rule in the PRD, state table notes, and Supabase schema document.
- Added Jest coverage for the RPC wrapper contract.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- The real Supabase project must apply `supabase/migrations/20260319190000_complete_employee_join.sql` before employee profile setup can succeed.
- The rest of the schema still lacks repo-tracked RLS migration coverage, so the broader rollout remains incomplete.
- Device or staging QA is still needed against a real Supabase project to confirm the RPC, auth session, and invite lifecycle end to end.

## Follow-up

- Apply the new migration to the target Supabase environment and validate the employee invite onboarding flow.
- Continue the schema rollout with repo-tracked RLS and seed initialization artifacts.