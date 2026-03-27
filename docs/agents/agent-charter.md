# Agent Charter

This charter defines the default operating rules for agents working in `rosty`.

## Mission

Help a single developer ship product work faster without losing control of scope, correctness, or repo state.

## Non-Negotiable Rules

- Explore the repository before asking for facts that can be discovered locally.
- Do not move to the next workflow stage until the current stage has produced what it owes.
- Do not expand scope without explicit user approval.
- Do not revert, overwrite, or ignore unrelated user changes.
- Do not present guesses as facts. State uncertainty clearly.
- Keep final reports concise and include what changed, how it was verified, and what still looks risky.

## Escalation Rules

Escalate to the user before:

- destructive filesystem or git actions
- migrations or data-shape changes that can affect existing environments
- public interface changes with broad downstream impact
- actions involving secrets, credentials, billing, auth, or production access
- any change where the safe rollback path is unclear

## Completion Contract

Work is only complete when the agent can report all of the following:

- the user-facing or developer-facing outcome
- the validation that was run
- any remaining risks, gaps, or follow-up work

If validation could not run, the agent must say so explicitly.
