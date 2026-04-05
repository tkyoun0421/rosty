# Phase 09: verification-evidence-reconciliation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `09-CONTEXT.md`; this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 09-verification-evidence-reconciliation
**Mode:** Execute fallback defaults (no interactive prompt available)
**Areas discussed:** Evidence scope, Verification method, Manual verification handling, Audit closure

---

## Evidence Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Missing artifact only | Create `02-VERIFICATION.md` and leave other stale evidence untouched. | |
| Audit blockers only | Create the missing Phase 02 verification artifact and refresh only evidence that still misstates current code. | x |
| Full historical rewrite | Rewrite broad planning history until every old artifact is fully normalized. | |

**User's choice:** Audit blockers only
**Notes:** Recommended default because the roadmap frames Phase 09 as reconciliation, not a full documentation cleanup phase. This keeps scope tied to the milestone audit while still fixing materially stale evidence.

---

## Verification Method

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse old summaries | Derive verification mostly from prior plan summaries and audit language. | |
| Current code plus fresh tests | Rebuild verification from present-day code, runnable tests, and explicit wiring evidence. | x |
| Docs-only cleanup | Update wording without rerunning current verification commands. | |

**User's choice:** Current code plus fresh tests
**Notes:** Recommended default because the phase exists specifically to reconcile evidence drift. Old summaries remain useful as breadcrumbs, but they are not the source of truth.

---

## Manual Verification Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Absorb all pending manual checks | Pull all open human-UAT work into Phase 09 so the milestone has one list. | |
| Keep manual checks explicit and separate | Link relevant human checks, but keep unrelated manual-UAT files in their owning phases. | x |
| Suppress manual work where tests exist | Prefer automated evidence and omit human-needed sections whenever possible. | |

**User's choice:** Keep manual checks explicit and separate
**Notes:** Recommended default because this repo already uses honest `human_needed` and dedicated human-UAT files. Folding unrelated manual work into Phase 09 would create scope creep and muddy ownership.

---

## Audit Closure

| Option | Description | Selected |
|--------|-------------|----------|
| Stop at phase artifacts | Refresh the phase evidence only and leave milestone docs for later. | |
| Re-audit after evidence refresh | Refresh affected verification artifacts first, then rerun milestone reconciliation and update top-level planning docs accordingly. | x |
| Rewrite top-level docs first | Normalize roadmap and requirements claims before rebuilding phase evidence. | |

**User's choice:** Re-audit after evidence refresh
**Notes:** Recommended default because milestone-facing docs should follow refreshed phase truth, not precede it. This preserves a clear evidence chain.

---

## the agent's Discretion

- Final split of Phase 09 into one plan or multiple plans.
- Whether refreshed verification exposes a real implementation gap that requires a small code fix.
- Whether `APPL-02` needs a supporting cross-phase traceability note during re-audit.

## Deferred Ideas

- General planning-doc encoding cleanup outside the audit blocker path.
- Repo-wide refresh of stale codebase maps not directly needed for Phase 09.
