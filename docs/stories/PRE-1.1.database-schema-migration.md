---
template:
  id: story-template-v2
  version: 2.0
  
metadata:
  epic: 1
  story_num: "PRE-1.1"
  title: "Database Schema Migration — Creative Files"
  priority: P0
  effort_minutes: 240
  blocker: true
  blocks: ["1.1", "1.2", "1.3", "1.4", "1.5"]
  
---

# Story PRE-1.1: Database Schema Migration — Creative Files

## Status
Draft

## Executor Assignment

```yaml
executor: "@data-engineer"
quality_gate: "@architect"
quality_gate_tools:
  - npx prisma migrate status
  - npx prisma validate
  - npm run typecheck
```

## Story

**As a** data engineer,  
**I want** to create Prisma models and migrations for creative file storage,  
**so that** Epic 1 features can persist metadata, files, and versions to SQLite

---

## Acceptance Criteria

- [ ] Three Prisma models created: CreativeFile, FileMetadata, FileVersion
- [ ] Relations defined: CreativeFile → FileMetadata (1:1), CreativeFile → FileVersion (1:n)
- [ ] Cascade delete configured (deleting file removes metadata + versions)
- [ ] Indexes created: fileId, filename, type, status (for query performance)
- [ ] Migration file generated: `prisma/migrations/{timestamp}_add-creative-files/migration.sql`
- [ ] Migration applied: `npx prisma migrate dev` succeeds without errors
- [ ] Tables verified in SQLite: `sqlite3 data/brand-ops.db ".tables"` shows 3 new tables
- [ ] Prisma Client types auto-generated (in node_modules/.prisma/client)
- [ ] TypeScript strict mode: 0 errors
- [ ] Documentation added: `docs/database-schema.md` with ER diagram and field descriptions

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type:** Database (Schema Migration)  
**Secondary Types:** Backend Infrastructure  
**Complexity:** Medium (schema design + migrations)

### Specialized Agent Assignment
**Primary Agents:**
- @data-engineer (schema design, migrations)
- @architect (data model validation, performance)

**Supporting Agents:**
- @dev (TypeScript validation after migration)

### Quality Gate Tasks
- [ ] Pre-Commit (@data-engineer): Run `npx prisma validate` before completing
- [ ] Pre-PR (@architect): CodeRabbit on schema design, migration safety

### Self-Healing Configuration
**Expected Self-Healing:**
- Primary Agent: @data-engineer (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

**Predicted Behavior:**
- CRITICAL issues: auto_fix (schema syntax, migration errors)
- HIGH issues: document_only if auto_fix fails

### CodeRabbit Focus Areas
**Primary Focus:**
- Schema correctness (valid Prisma syntax)
- Index performance (appropriate indexes for queries)
- Relation integrity (FK constraints, cascade delete)
- Migration safety (no data loss, reversible)

**Secondary Focus:**
- Naming conventions (PascalCase models, camelCase fields)
- Constraint definitions
- Type definitions in Prisma

---

## Tasks / Subtasks

- [ ] Create Prisma Models
  - [ ] Model: CreativeFile (id, path, filename, type, size, mimeType, createdAt, updatedAt)
  - [ ] Model: FileMetadata (id, fileId, type, status, tags[], notes, updatedAt)
  - [ ] Model: FileVersion (id, fileId, versionNum, commitHash, message, createdAt)
  - [ ] Define relations (1:1, 1:n, cascade delete)
  - [ ] Verify schema syntax: `npx prisma validate`
  - [ ] Generate Prisma Client: `npx prisma generate`

- [ ] Create and Apply Migration
  - [ ] Create migration: `npx prisma migrate dev --name add-creative-files`
  - [ ] Review generated SQL in `prisma/migrations/`
  - [ ] Verify tables created in SQLite
  - [ ] Confirm no data loss (existing data preserved)

- [ ] Add Performance Indexes
  - [ ] Index on fileId (for FK lookups)
  - [ ] Index on type (for filtering by file type)
  - [ ] Index on status (for filtering by status)
  - [ ] Composite index on (fileId, versionNum) for version lookups
  - [ ] Verify indexes: `sqlite3 data/brand-ops.db ".indices"`

- [ ] Documentation
  - [ ] Create `docs/database-schema.md`
  - [ ] Document each model: fields, relationships, constraints
  - [ ] Add ER diagram (Mermaid or ASCII)
  - [ ] Document indexes and performance considerations

---

## Dev Notes

### Prisma Schema (Reference)

```prisma
model CreativeFile {
  id          String   @id @default(cuid())
  path        String   @unique
  filename    String
  type        String
  size        BigInt
  mimeType    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  metadata    FileMetadata?
  versions    FileVersion[]
  
  @@index([type])
  @@index([filename])
}

model FileMetadata {
  id         String   @id @default(cuid())
  fileId     String   @unique
  file       CreativeFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  type       String
  status     String
  tags       String[]
  notes      String?
  updatedAt  DateTime @updatedAt
  
  @@index([fileId])
}

model FileVersion {
  id         String   @id @default(cuid())
  fileId     String
  file       CreativeFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  versionNum Int
  commitHash String
  message    String
  createdAt  DateTime @default(now())
  
  @@unique([fileId, versionNum])
  @@index([fileId])
}
```

### Testing Standards
- [ ] Migration rollback test (can reverse safely)
- [ ] Cascade delete test (orphaned records handled)
- [ ] Index performance test (queries <100ms)

---

## Success Criteria

✅ All 3 models created and migrated  
✅ Indexes optimized for Epic 1 queries  
✅ Zero TypeScript errors in consuming code  
✅ Epic 1 Features 1.1-1.5 can build on this schema

---

## Blockers

This story **blocks** all Epic 1 features: 1.1, 1.2, 1.3, 1.4, 1.5

---

**Created:** 2026-04-03  
**Modified:** 2026-04-03 (Formal template v2.0)  
**Depends On:** Epic 0 complete  
**Blocks:** Stories 1.1-1.5
