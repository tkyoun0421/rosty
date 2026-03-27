# Quality Rules

## Purpose

Define the minimum engineering bar for structure, verification, and review so that new code stays safe to extend.

## Done Criteria

- The intended outcome is stated.
- Validation is run or the exact reason it could not run is reported.
- Remaining risks or follow-up work are surfaced explicitly.
- Related development or product docs are updated when behavior rules changed.

## Testing Rules

- Put tests next to the code they protect unless a feature-local test folder is clearly better.
- Pure transformation logic, validators, and mappers should have fast automated tests.
- Bug fixes should add a regression check whenever practical.
- Do not replace repeatable automated checks with manual testing when automation is reasonable.

## Text Encoding Rules

- Markdown, docs, and text-based config files must stay in UTF-8.
- PowerShell-based file writes must specify -Encoding UTF8 or use an explicit UTF-8 writer.
- Garbled text or invalid UTF-8 is treated as a repository defect and must be fixed before closing the task.
- PowerShell scripts with non-ASCII text should use UTF-8 BOM so Windows PowerShell can parse them safely.

## Structural Review Checks

- absolute imports only
- cycle imports are not allowed
- The file sits in the correct layer for its responsibility.
- `mutations` and `queries` are not directly coupled.
- `default export` appears only in `app` route-entry files.
- `index.ts` and barrel exports have not been introduced as convenience shortcuts.
- app-only providers stay under `src/app/_providers` and are named by concern.
- actions must stay React-free
- utils must stay pure
- `dal` owns slice-local data access.
- `lib` should be reserved for third-party or runtime adapters.
- components should stay dumb and prop-driven.
- Do not call useQuery, useMutation, useForm, or fetch directly inside components folders.

## UI Safety Checks

- Every UI component is named with `.server.tsx` or `.client.tsx`.
- Every `.server.tsx` component includes `import 'server-only'`.
- Every `.client.tsx` component includes `'use client'`.
- Review treats a missing server/client runtime guard as a correctness issue.