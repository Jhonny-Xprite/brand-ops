# PRE-1 Integration Batch A

**Date:** 2026-04-03  
**Prepared By:** @aios-master (Orion)

## Purpose

Define the smallest safe remote integration unit that respects the current local baseline and avoids pushing `PRE-1.2` in isolation from prerequisites it now depends on.

## Decision

`PRE-1.2` should not be pushed alone from the current repository state.

The safe integration unit is:
- `PRE-1.1` approved migration baseline
- `PRE-1.2` approved dependency baseline
- the minimum supporting toolchain/config files required for the shared quality gates that now pass locally

## Included Stories

- `PRE-1.1` - QA PASS
- `PRE-1.2` - implementation complete + architect quality gate PASS

## Required Supporting Files

These are not treated as separate feature scope. They are baseline prerequisites for the current validated local state:

- `package.json`
- `tsconfig.json`
- `eslint.config.js`
- `next-env.d.ts`

## Core PRE-1.1 Files

- `prisma/schema.prisma`
- `prisma/migrations/20260403191210_pre_1_1_creative_file_schema/migration.sql`
- `docs/database-schema.md`
- `src/lib/types/models.ts`
- `src/lib/types/index.ts`
- `src/lib/__tests__/types.test.ts`
- `src/lib/__tests__/prisma.test.ts`
- `src/store/api/index.ts`
- `docs/stories/PRE-1.1.database-schema-migration.md`
- `docs/stories/PRE-1.1/qa/qa_report.md`
- `docs/stories/PRE-1.1/qa/QA_FIX_REQUEST.md`
- `docs/stories/PRE-1.1/qa/READY_FOR_REREVIEW.md`

## Core PRE-1.2 Files

- `package.json`
- `package-lock.json` if diff exists in the isolated branch/worktree
- `docs/stories/PRE-1.2.update-dependencies.md`
- `docs/stories/PRE-1.2/READY_FOR_QUALITY_GATE.md`
- `docs/stories/PRE-1.2/ARCHITECT_QUALITY_GATE.md`
- `docs/stories/PRE-1.2/DEVOPS_PRE_PUSH_BLOCK.md`

## Explicitly Excluded

Do not bundle unrelated agent-sync churn, broad documentation generation, or other PRE stories that have not yet completed their own cycle.

Examples of excluded areas from the current mixed worktree:
- `.agent/`
- `.codex/`
- `.claude/`
- `.gemini/`
- unrelated docs under `docs/` not tied to PRE-1.1 / PRE-1.2
- PRE-1.3, PRE-1.4, PRE-1.5 draft rewrites unless separately approved

## Why This Batch Is Correct

- `PRE-1.1` and `PRE-1.2` are the two validated blockers that now form the effective local foundation for Epic 1.
- The current passing gates depend on toolchain/config state that is not fully represented by the old `HEAD`.
- Shipping only `PRE-1.2` would misrepresent the actual validated baseline and risks breaking quality gates remotely.

## Next Step

Create a clean integration branch/worktree from the current local baseline, isolate this batch only, rerun devops pre-push checks inside that isolated scope, and then proceed to remote operations.

