# Night Work Runner

## Purpose

`night-work` is a behavior policy, not a background process. The runner exists to keep re-invoking Codex with that policy so work continues after each completed response until a hard stop is reached.

## Commands

- Start: `./scripts/night-work/run.sh "<goal>"`
- Prompt preview: `./scripts/night-work/build-prompt.sh "<goal>"`
- Status: `./scripts/night-work/status.sh`
- Stop: `./scripts/night-work/stop.sh`

## Runtime Files

The runner writes state under `tmp/night-work/`.

- `runner.log`: append-only process log
- `runner.pid`: active process id when running
- `latest.prompt.txt`: prompt sent in the latest iteration
- `latest-response.json`: latest Codex final response payload
- `latest-summary.txt`: latest summary extracted from the response
- `latest.status`: plain-text marker file for operators
- timestamped `.log` files: per-iteration transcripts

## Hard Stops

The runner stops only when Codex returns `BLOCKED` for one of these reasons:

- `approval_required`
- `destructive_change`
- `requirement_conflict`
- `external_blocker`
- `scope_exhausted`

Completed slices must return `CONTINUE` with reason `slice_complete`.

## Document Rules

The runner always loads the core repo documents first, then additive documents from `docs/domain`, `docs/policies`, and `docs/decisions`.

If a new rule is needed during ongoing work:

- add a new document
- do not edit an existing document
- let the next runner iteration pick up the new file automatically
