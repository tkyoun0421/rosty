# Specialist Contracts

Specialists are callable helpers. This document is the summary hub; the detailed execution rules live in `docs/agents/roles/*.md`.

## Lead Agent

Summary:

- owns the user conversation and workflow stage
- decides whether specialist help is worth the overhead
- integrates all specialist output before acting on it
- delivers the final answer and carries final quality responsibility

Detailed rules: `docs/agents/roles/lead.md`

## Research Specialist

Summary:

- investigates code, docs, repo history, and other local evidence
- returns facts that reduce ambiguity for planning or implementation
- stops at evidence instead of drifting into implementation

Detailed rules: `docs/agents/roles/research.md`

## Implementation Specialist

Summary:

- executes an approved change set inside a narrow write scope
- reports exactly what changed and how it was verified
- returns control when scope, evidence, or safety assumptions break

Detailed rules: `docs/agents/roles/implementation.md`

## Review Specialist

Summary:

- inspects for regressions, missing tests, risky assumptions, and contract violations
- reports evidence-backed findings ordered by severity
- avoids generic approval language and stays focused on risk

Detailed rules: `docs/agents/roles/review.md`
