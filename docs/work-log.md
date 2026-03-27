# Work Log

## Purpose

Track what was completed, what was in progress at the end of a session, and what should be resumed next.

## Update Rules

- Add a new entry at the top when a meaningful session ends.
- Update `docs/prd.md` together with this log whenever feature status changes.
- Record the last in-progress task and the immediate next task, not only completed items.
- Include the related commit hash when work is committed. Use `uncommitted` until a commit exists.

## Current Handoff

### 2026-03-27

- Completed
  - Release 0 scaffold was verified through foundation checks, unit tests, and production build.
  - Role-based auth shell for employee and admin entry was added.
  - Application source code was moved under `src` and alias/config/docs were aligned.
- Last In Progress
  - Release 1 scope was narrowed to the first employee schedule slice: request creation and request list/status.
- Next Up
  - Implement the employee schedule request form.
  - Implement the employee schedule request list and status view.
  - Start the admin approval slice after the employee loop is green.
- Blockers / Notes
  - Google OAuth is not wired to a real Supabase project yet.
  - `.env` cleanup and secret rotation are being handled separately.
- Related Commit
  - `uncommitted`