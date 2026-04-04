# Epic 6: Database Schema & Metadata

**Status:** MVP  
**Esforço Estimado:** 70 horas  
**Owner:** @data-engineer (Dara) + @dev (Dex)  
**Data:** 2026-04-03  

---

## 🎯 Overview

SQLite database schema (brand-ops.db) for all creative data. Prisma ORM for type-safe access. Migrations for schema evolution. Validation rules for data integrity.

---

## 📦 Features

### Feature 6.1: SQLite Schema
- **Database:** Single file (brand-ops.db) in E:\BRAND-OPS-STORAGE\
- **Tables:** Creative, Metadata, Version, SyncMetadata
- **ORM:** Prisma (schema.prisma)
- **Relationships:** Creative → Version (1-many), Creative → Metadata (1-1)

**Acceptance Criteria:**
- [ ] Schema defined in prisma/schema.prisma
- [ ] Database creates on first run
- [ ] Tables created with correct columns + types
- [ ] Indexes on: type, status, created_at, tags
- [ ] Foreign keys enforce referential integrity

---

### Feature 6.2: Creative Table
- **Fields:** id, name, type, filePath, fileSize, mimeType, status, tags (JSON), notes, createdAt, updatedAt
- **Indexes:** type, status, createdAt
- **Constraints:** id unique, filePath unique, status in (draft, approved, done)
- **Full-text:** Enable FTS5 on name + notes

**Acceptance Criteria:**
- [ ] All required fields present
- [ ] Correct data types (string, int, datetime, json)
- [ ] Indexes created and used in queries
- [ ] FTS5 table created for search
- [ ] Constraints enforced at DB level

---

### Feature 6.3: Metadata Table
- **Fields:** id, creativeId, designer, campaign, targetAudience, format, customFields (JSON)
- **Relationship:** 1-to-1 with Creative
- **Purpose:** Extensible metadata without bloating Creative table
- **Custom fields:** JSON for future flexibility

**Acceptance Criteria:**
- [ ] Schema defined correctly
- [ ] Foreign key to Creative enforced
- [ ] Custom fields JSON validated
- [ ] Queries use JOIN efficiently
- [ ] Indexes on creativeId, designer, campaign

---

### Feature 6.4: Version Table
- **Fields:** id, creativeId, versionNumber, commitHash, message, createdAt
- **Relationship:** Many versions per creative
- **Purpose:** Track Git history in database
- **Queries:** Get all versions for file, specific version by number

**Acceptance Criteria:**
- [ ] versionNumber increments correctly
- [ ] commitHash unique per version
- [ ] createdAt matches git commit timestamp
- [ ] Query "get all versions by file" <100ms
- [ ] Indexes on creativeId, versionNumber

---

### Feature 6.5: SyncMetadata Table
- **Fields:** id, entityId, lastSyncAt, syncHash (SHA256), isSynced
- **Purpose:** Track rclone sync state + conflict detection
- **Updates:** Atomic with every file change
- **Queries:** Find unsynced files, detect changes

**Acceptance Criteria:**
- [ ] Hash computed on every update
- [ ] Atomic updates (no partial syncs)
- [ ] Query "get unsynced files" <200ms
- [ ] Conflict detection works (hash mismatch)
- [ ] Sync status always accurate

---

### Feature 6.6: Prisma ORM Setup
- **Config:** prisma/schema.prisma
- **Client:** Auto-generated Prisma Client
- **Type safety:** TypeScript types for all models
- **Queries:** Prisma methods for CRUD + aggregations

**Acceptance Criteria:**
- [ ] Prisma schema compiles without errors
- [ ] Prisma Client generates correctly
- [ ] All TypeScript types available
- [ ] CRUD operations work (create, read, update, delete)
- [ ] Aggregate queries work (count, group by)

---

### Feature 6.7: Migrations
- **Tool:** Prisma Migrate
- **Strategy:** Version-controlled migrations
- **Testing:** Test migrations on clean DB
- **Rollback:** Support rollback to previous version

**Acceptance Criteria:**
- [ ] Migration files created for schema changes
- [ ] `prisma migrate dev` works locally
- [ ] `prisma migrate deploy` works on fresh install
- [ ] Rollback tested (go back 1 version)
- [ ] No data loss on migration (where applicable)

---

### Feature 6.8: Data Validation
- **Layer 1:** Prisma schema validation (type, constraints)
- **Layer 2:** Application code (business logic validation)
- **Rules:** Type required, status in (draft/approved/done), tags array
- **Errors:** Clear validation messages to user

**Acceptance Criteria:**
- [ ] Type field required (cannot be null)
- [ ] Status field has enum constraint
- [ ] Tags field is JSON array (validated on insert)
- [ ] filePath unique constraint prevents duplicates
- [ ] Validation errors logged + shown to user

---

## 🔄 Success Criteria (Story Acceptance)

**Developer Signs Off When:**
- [ ] All 8 features implemented + acceptance criteria pass
- [ ] Database creates on first run (zero manual setup)
- [ ] Prisma ORM fully functional + type-safe
- [ ] All indexes created and used in queries
- [ ] FTS5 search works (<500ms for 1K files)
- [ ] Data validation comprehensive + accurate
- [ ] Migrations tested (schema evolves correctly)
- [ ] Unit tests for all Prisma queries
- [ ] Integration tests with SQLite

---

**Epic Owner:** @data-engineer (Dara)  
**QA Gate:** @qa (Quinn)  
**Related:** All epics (data source), Epic 1-5 (use data), Epic 4 (SyncMetadata)
