---
template:
  id: story-template-v2
  version: 2.0

metadata:
  epic: 1
  story_num: "PRE-1.1"
  title: "Database Schema Migration - Creative Files"
  priority: P0
  effort_minutes: 240
  blocker: true
  blocks: ["1.1", "1.2", "1.3", "1.4", "1.5"]
---

# Story PRE-1.1: Database Schema Migration - Creative Files

## Status
Done

## Executor Assignment

```yaml
executor: "@data-engineer"
quality_gate: "@dev"
quality_gate_tools:
  - npx prisma validate
  - npx prisma migrate status
  - npm run typecheck
```

## Story

**As a** data engineer,  
**I want** to migrate the current Prisma schema to the Epic 1 creative-file model,  
**so that** Epic 1 features can persist files, metadata, and version history on the approved SQLite baseline

---

## Acceptance Criteria

1. The current Prisma baseline in `prisma/schema.prisma` is reviewed and the migration scope explicitly accounts for the existing `Creative`, `Metadata`, `Version`, and `SyncMetadata` models.
2. The target Prisma schema defines `CreativeFile`, `FileMetadata`, and `FileVersion` with relationships consistent with the Epic 1 PRD.
3. `SyncMetadata` is handled explicitly in the migration plan: it is preserved as an existing sync-oriented model for later epics unless the implementation documents a safe replacement path approved in this story record.
4. Because SQLite is the approved database baseline, `FileMetadata.tags` is persisted in a SQLite-compatible form while preserving the Epic 1 array semantics at the application contract level; the chosen representation is documented in the schema notes.
5. Referential integrity is defined correctly, including cascade behavior for deleting a file and its dependent metadata/version records.
6. The target schema includes the indexes needed for Epic 1 query patterns, including file lookup, filtering, and version-history access.
7. A Prisma migration is generated for the new schema and checked into `prisma/migrations/`.
8. `npx prisma validate` passes on the updated schema.
9. `npx prisma migrate status` reports a valid migration state after the change.
10. Prisma client types regenerate successfully against the migrated schema, and any repository type layer that mirrors Prisma models is updated or explicitly flagged for immediate follow-up.
11. For this pre-feature local foundation, resetting the local development database is acceptable if needed; the implementation must explicitly record whether it reset local data or transformed it, and `docs/database-schema.md` must document the resulting schema state for Epic 1 implementers.

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Database  
**Secondary Type(s):** Migration, foundation alignment  
**Complexity:** High

### Specialized Agent Assignment

**Primary Agents:**
- @data-engineer
- @dev

**Supporting Agents:**
- @architect
- @qa

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Review migration safety, generated Prisma types, and downstream type impact.
- [ ] Pre-PR (@github-devops): Review migration artifact integrity before PR creation.
- [ ] Pre-Deployment (@github-devops): Not applicable for this local-first blocker story.

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @data-engineer (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL

**Predicted Behavior:**
- CRITICAL issues: auto_fix
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus:**
- Schema correctness against the current Prisma baseline
- Relation integrity and cascade behavior

**Secondary Focus:**
- Migration safety and naming alignment
- Downstream type parity risks

---

## Tasks / Subtasks

- [x] Review the current schema baseline (AC: 1)
  - [x] Inspect `prisma/schema.prisma` and capture the exact delta from `Creative`/`Metadata`/`Version`/`SyncMetadata` to the Epic 1 target models.
  - [x] Record the chosen migration path for the local foundation database: transform existing local data where practical, or reset the local dev baseline if that is the safer path.

- [x] Implement the target Epic 1 Prisma schema (AC: 2, 3, 4, 5, 6)
  - [x] Add `CreativeFile`, `FileMetadata`, and `FileVersion`.
  - [x] Preserve `SyncMetadata` explicitly or document an approved replacement path instead of dropping it implicitly.
  - [x] Represent `tags` in a SQLite-compatible persisted form while keeping array semantics documented for Epic 1 consumers.
  - [x] Define required relations, uniqueness rules, and cascade behavior.
  - [x] Add indexes needed for filename, type/status filtering, and version retrieval.

- [x] Generate and verify migration artifacts (AC: 7, 8, 9, 10)
  - [x] Run `npx prisma validate`.
  - [x] Generate the migration in `prisma/migrations/`.
  - [x] Run `npx prisma migrate status`.
  - [x] Regenerate Prisma client types.

- [x] Reconcile downstream type usage (AC: 10)
  - [x] Review any app-level model mirrors or tests that still reference the old schema names.
  - [x] Update them or explicitly record follow-up if a dependent story must handle part of the rename.

- [x] Document the final schema and migration choice for Epic 1 consumers (AC: 4, 11)
  - [x] Create or update `docs/database-schema.md`.
  - [x] Record model intent, key fields, relationships, query-oriented indexes, and the chosen SQLite representation for tags.
  - [x] Record whether the implementation reset local development data or transformed the existing local baseline.

---

## Dev Notes

### Relevant Context

[Source: `docs/prd/epic-1-creative-production.md`]
- Epic 1 expects `CreativeFile`, `FileMetadata`, and `FileVersion` as the persisted creative-production model.
- Epic 1 depends on version history and rollback behavior, so schema names and relations must be stable before feature stories begin.

[Source: `prisma/schema.prisma`]
- The current repository baseline already contains Prisma models with different names, so this story is a migration/alignment task, not a greenfield schema creation task.
- The current baseline also includes `SyncMetadata`, which is still relevant to later sync-oriented epics and should not disappear silently during this blocker.

[Source: `docs/stories/0.1.prisma-setup.md` and `docs/stories/0.2.project-structure.md`]
- Foundation work already established Prisma, SQLite, generated client usage, and a type layer.
- This blocker must leave those foundations coherent rather than reintroducing model/type drift.

[Source: `docs/prd/epic-6-database-schema.md`]
- Sync metadata remains part of the broader product data model, so this story should preserve or consciously bridge that concern instead of dropping it as an accidental side effect of the Epic 1 rename.

### Product Clarifications

- SQLite compatibility takes precedence over the raw PRD example syntax; if Prisma on SQLite cannot persist `tags` as a scalar list, the persisted representation should be a JSON-encoded text field with array semantics preserved in the app contract and documentation.
- Because the repository is still in pre-feature local foundation mode, resetting local development data is acceptable for this blocker if it is the safest migration path. The implementation must record which path was taken.
- `SyncMetadata` is not the primary focus of Epic 1, but it remains relevant to later sync/versioning work and must be preserved or deliberately bridged during this migration.

### Sequencing Notes

- This is the first blocker and must complete before Epic 1 implementation starts.
- `PRE-1.3`, `PRE-1.4`, and `PRE-1.5` should use the final entity names from this story.
- `PRE-1.2` can run in parallel because it is package-management work rather than schema work.

### Testing

- Validate with `npx prisma validate`.
- Validate migration state with `npx prisma migrate status`.
- Run `npm run typecheck` after Prisma client regeneration.
- If app-level types change, update or extend the existing type tests so renamed models are not left stale.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-03 | 2.2 | Story formally closed after QA re-review PASS and pre-Epic 1 backlog normalization | @po (Pax) |
| 2026-04-03 | 1.0 | Story created (PRE-1.1) | @sm (River) |
| 2026-04-03 | 1.2 | Reworked sequencing and normalized story structure to template v2 expectations | @sm (River) |
| 2026-04-03 | 1.3 | PO validation: clarified tags persistence, SyncMetadata handling, and local reset policy | @po (Pax) |
| 2026-04-03 | 1.4 | PO validation complete: story approved for execution | @po (Pax) |
| 2026-04-03 | 2.0 | Implemented Epic 1 schema migration, regenerated Prisma client, updated type/test contracts, and documented reset baseline | @data-engineer (Dara) |
| 2026-04-03 | 2.1 | Added explicit app-level tags boundary with array semantics and persistence bridge helpers for QA follow-up | @data-engineer (Dara) |

---

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Snapshot created before schema change at `.aiox/snapshots/pre-1.1-20260403-161012`
- Prisma migration generated: `20260403191210_pre_1_1_creative_file_schema`
- Local development database reset and migrations re-applied via `npx prisma migrate reset --force --skip-seed`
- Validation rerun: `npx prisma validate`, `npx prisma migrate status`, `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, `npm run build`
- QA follow-up implemented via `docs/stories/PRE-1.1/qa/QA_FIX_REQUEST.md`

### Completion Notes List

1. Migrated Prisma model names from `Creative`/`Metadata`/`Version` to `CreativeFile`/`FileMetadata`/`FileVersion`.
2. Preserved `SyncMetadata` as the sync-oriented table and re-bound it to the new `CreativeFile` identity via `fileId`.
3. Stored `FileMetadata.tags` as a JSON-encoded string for SQLite compatibility while documenting array semantics for the app contract.
4. Chose the approved local reset path for the pre-feature database baseline and re-applied migrations from a clean state.
5. Updated repository type mirrors and Prisma CRUD/type tests so the codebase no longer depends on the old model names.
6. Authored `docs/database-schema.md` to document the final schema and migration outcome for downstream Epic 1 work.
7. All required validation gates passed after the migration.
8. Added an explicit app-facing `FileMetadata` contract with `tags: string[]`, plus named bridge helpers to convert to and from the persisted Prisma/SQLite representation.
9. Updated type tests so they now assert the `tags` contract boundary instead of enforcing raw persisted parity for that field.

### File List

**Created:**
- `.aiox/snapshots/pre-1.1-20260403-161012/brand-ops.db`
- `.aiox/snapshots/pre-1.1-20260403-161012/schema.prisma`
- `.aiox/snapshots/pre-1.1-20260403-161012/migrations/`
- `docs/database-schema.md`
- `prisma/migrations/20260403191210_pre_1_1_creative_file_schema/migration.sql`

**Modified:**
- `data/brand-ops.db`
- `docs/stories/PRE-1.1.database-schema-migration.md`
- `docs/stories/PRE-1.1/qa/QA_FIX_REQUEST.md`
- `prisma/schema.prisma`
- `src/lib/__tests__/prisma.test.ts`
- `src/lib/__tests__/types.test.ts`
- `src/lib/types/index.ts`
- `src/lib/types/models.ts`
- `src/store/api/index.ts`

**Created After QA Follow-Up:**
- `docs/stories/PRE-1.1/qa/READY_FOR_REREVIEW.md`

---

## QA Results

### QA Review - 2026-04-03

Gate Decision: CONCERNS

Summary:
- `npx prisma validate` passes.
- `npx prisma migrate status` reports the database schema is up to date.
- `npm run typecheck` passes.
- The schema, migration artifact, and downstream renames are largely coherent.
- One acceptance-criteria gap remains around the application contract for `FileMetadata.tags`.

Findings:
1. High: AC4 requires `FileMetadata.tags` to use a SQLite-compatible persisted form while preserving Epic 1 array semantics at the application contract level, but the exposed repository type layer still models `tags` as a raw `string`, and the type tests enforce exact parity with the persisted Prisma scalar instead of an array-facing contract. That means the persistence workaround leaked into the app contract rather than being bridged behind it.
   - Story requirement: `docs/stories/PRE-1.1.database-schema-migration.md:45`
   - Persisted schema: `prisma/schema.prisma:38`
   - Repository contract: `src/lib/types/models.ts:31`
   - Contract test parity: `src/lib/__tests__/types.test.ts:30`
   - Documentation claim: `docs/database-schema.md:57`

Required Follow-Up:
- Introduce or document a real app-level contract for `FileMetadata.tags` with array semantics, while keeping the Prisma/SQLite persistence field encoded as text.
- Update the relevant type/test layer so it validates the intended contract boundary instead of asserting that app-facing types must exactly equal the persisted Prisma scalar type.

Residual Risk:
- If left as-is, downstream Epic 1 stories may implement metadata editing and filtering against a stringly-typed `tags` contract, creating avoidable rework when the app layer eventually needs true array semantics.

### QA Re-Review - 2026-04-03

Gate Decision: PASS

Summary:
- The previous AC4 concern is resolved.
- `FileMetadata` now exposes `tags` as `string[]` at the app contract boundary.
- The persisted Prisma/SQLite representation remains explicitly modeled as JSON-encoded text through `PersistedFileMetadata`.
- Bridge helpers and tests now validate the intended contract boundary instead of enforcing raw parity for `tags`.
- `npx prisma validate`, `npx prisma migrate status`, `npm run lint`, `npm run typecheck`, and `npm test -- --runInBand` all pass.

Verified Evidence:
- App-facing contract: `src/lib/types/models.ts`
- Persisted boundary type and helpers: `src/lib/types/models.ts`
- Boundary validation tests: `src/lib/__tests__/types.test.ts`
- Re-review handback: `docs/stories/PRE-1.1/qa/READY_FOR_REREVIEW.md`

Outcome:
- `PRE-1.1` is approved from QA's perspective and no blocking findings remain for this story.
