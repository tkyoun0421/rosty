---
status: complete
phase: 07-application-admin-freshness
source:
  - 07-application-admin-freshness-01-SUMMARY.md
  - 07-application-admin-freshness-02-SUMMARY.md
started: 2026-04-04T04:34:11.3453757+09:00
updated: 2026-04-04T04:38:50.3498517+09:00
---

## Current Test

[testing complete]

## Tests

### 1. Admin Schedule Detail Refreshes After Worker Apply
expected: After a worker applies to a recruiting schedule, the matching admin schedule detail view shows the new applicant without manual refresh.
result: pass

### 2. Admin Dashboard Applicant Count Refreshes After Worker Apply
expected: After a worker applies, the affected schedule card on `/admin` shows the incremented applicant count without stale data.
result: pass

### 3. Duplicate Apply Stays No-Op
expected: Re-submitting an already-applied schedule does not create a duplicate applicant entry or increment admin-facing counts again.
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

none
