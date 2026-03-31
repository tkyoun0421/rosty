# Codebase Structure

**Analysis Date:** 2026-03-31

## Directory Layout

```text
rosty/
+-- .planning/         # Planning system, roadmap, state, and phase artifacts
+-- .codex/            # Embedded GSD framework, workflows, and skills
+-- .agents/           # Local skill/reference material
+-- .next/             # Generated Next.js metadata
+-- node_modules/      # Installed dependencies
+-- src/               # Reserved application source root
|   +-- app/           # Thin route layer and global provider wiring
|   +-- flows/         # Route-level composed UI and user flows
|   +-- mutations/     # Write commands and server actions
|   +-- queries/       # Read models and read-side DAL
|   `-- shared/        # UI primitives, wrappers, primitive contracts, runtime config
+-- CLAUDE.md          # Repository-specific workflow guardrails
+-- package.json       # Scripts and dependency manifest
+-- tsconfig.json      # TypeScript settings and top-level aliases
+-- next.config.ts     # Next.js runtime config
+-- vitest.config.ts   # Test runner config
`-- postcss.config.mjs # PostCSS/Tailwind integration
```

## Directory Purposes

**`src/app/`:**
- Purpose: own route files, layouts, metadata, and app-level providers.
- Expected substructure: route segments plus `_providers/`.
- Rule: thin layer only.

**`src/flows/`:**
- Purpose: own page and user-flow composition.
- Expected substructure per flow: `components/`, `hooks/`, `types/`.
- Rule: one route maps to one flow entry.

**`src/mutations/`:**
- Purpose: own write commands.
- Expected substructure per domain: `actions/`, `dal/`, `hooks/`, `schemas/`.
- Rule: server actions are defined only here.

**`src/queries/`:**
- Purpose: own read models.
- Expected substructure per domain: `dal/`, `hooks/`, `types/`, `schemas/`, `utils/`.
- Rule: expose server-safe reads and client hooks from the same slice.

**`src/shared/`:**
- Purpose: hold cross-cutting, non-domain-specific assets.
- Fixed substructure:
  - `ui/`
  - `lib/`
  - `model/`
  - `config/`

## Current State Notes

- The `src/` tree is the intended implementation target and architectural contract.
- The repository may not yet contain every directory shown above.
- Older planning docs may still mention earlier target paths such as `src/lib/*` or root-level `tests/*`; those are not the current preferred structure.

## Key File Locations

**Planning:**
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

**Codebase Rules:**
- `.planning/codebase/CONVENTIONS.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STRUCTURE.md`

**Configuration:**
- `tsconfig.json`
- `next.config.ts`
- `vitest.config.ts`
- `postcss.config.mjs`
- `.planning/config.json`

## Naming Conventions

- Layer and domain directories use `kebab-case`.
- Utility, schema, action, and hook files use `kebab-case`.
- React component files use `PascalCase`.
- Barrel files are not part of the preferred structure.

## Import Surface

- Use only top-level `#` aliases:
  - `#app/*`
  - `#flows/*`
  - `#mutations/*`
  - `#queries/*`
  - `#shared/*`
- Prefer direct file imports instead of `index.ts` re-export chains.

## Where To Add New Code

**New route:**
- Add the route entry under `src/app/*`.
- Add the matching composed flow under `src/flows/*`.

**New read behavior:**
- Add it under `src/queries/{domain}/*`.

**New write behavior:**
- Add it under `src/mutations/{domain}/*`.

**New shared primitive or wrapper:**
- Add it under the relevant `src/shared/*` subdirectory.

## Testing Placement

- Default test placement is co-located with implementation files.
- Examples:
  - `src/queries/work/dal/list-work.test.ts`
  - `src/mutations/invite/actions/create-invite.test.ts`
  - `src/flows/admin-work/components/AdminWorkPage.test.tsx`

## Special Directories

**`.planning/`:**
- Purpose: planning source of truth
- Generated: No
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: generated and maintained codebase reference docs
- Generated: Yes
- Committed: Yes

**`.codex/`:**
- Purpose: embedded GSD workflow system
- Generated: No
- Committed: Yes

**`.agents/`:**
- Purpose: local skill/reference library
- Generated: No
- Committed: Yes

**`.next/`:**
- Purpose: Next.js generated output
- Generated: Yes
- Committed: No

**`node_modules/`:**
- Purpose: installed dependencies
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-03-31*
