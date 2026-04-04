# Database Schema

## Purpose

This document records the approved SQLite/Prisma schema baseline after `PRE-1.1`.
It exists so Epic 1 implementers can build on stable model names and not infer the
migration outcome from scattered PRD excerpts.

## Migration Outcome

- Migration story: `PRE-1.1`
- Database engine: SQLite via Prisma
- Local database path: `./data/brand-ops.db`
- Migration path chosen: local development baseline reset is acceptable for this pre-feature blocker and was used to apply the new schema cleanly

## Model Summary

### `CreativeFile`

Primary persisted file record for Epic 1 creative production flows.

| Field | Type | Notes |
|------|------|------|
| `id` | `String` | Primary key (`cuid()`) |
| `path` | `String` | Unique file-system path |
| `filename` | `String` | Display and lookup filename |
| `type` | `String` | File/media classification |
| `size` | `BigInt` | File size in bytes |
| `mimeType` | `String?` | Optional MIME type |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Relations:
- 1:1 with `FileMetadata`
- 1:n with `FileVersion`
- 1:1 with `SyncMetadata`

Indexes:
- unique `path`
- index `filename`
- index `type`

### `FileMetadata`

User-editable metadata associated with a creative file.

| Field | Type | Notes |
|------|------|------|
| `id` | `String` | Primary key (`cuid()`) |
| `fileId` | `String` | Unique FK to `CreativeFile.id` |
| `type` | `String` | Metadata-level type/category |
| `status` | `String` | Workflow status |
| `tags` | `String` | JSON-encoded array persisted as text for SQLite compatibility |
| `notes` | `String?` | Optional notes |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Tag representation:
- App contract: array semantics
- SQLite persistence: JSON-encoded string, e.g. `["tag-1","tag-2"]`

Indexes:
- unique `fileId`
- index `type`
- index `status`

### `FileVersion`

Immutable version-history entry for file and metadata changes.

| Field | Type | Notes |
|------|------|------|
| `id` | `String` | Primary key (`cuid()`) |
| `fileId` | `String` | FK to `CreativeFile.id` |
| `versionNum` | `Int` | Sequential version number per file |
| `commitHash` | `String` | Git commit reference |
| `message` | `String` | Version message |
| `createdAt` | `DateTime` | Creation timestamp |

Indexes:
- unique `(fileId, versionNum)`
- index `fileId`

### `SyncMetadata`

Existing sync-oriented model preserved for later sync/versioning epics.

| Field | Type | Notes |
|------|------|------|
| `id` | `String` | Primary key (`cuid()`) |
| `lastSyncTime` | `DateTime?` | Last successful sync time |
| `syncStatus` | `String` | Pending/syncing/synced/failed state |
| `syncError` | `String?` | Last sync failure detail |
| `externalId` | `String?` | External-system identifier |
| `externalSource` | `String?` | Source/target system label |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |
| `fileId` | `String` | Unique FK to `CreativeFile.id` |

Indexes:
- unique `fileId`
- index `(fileId, syncStatus)`

## Relationship Notes

- Deleting a `CreativeFile` cascades to `FileMetadata`, `FileVersion`, and `SyncMetadata`.
- `FileMetadata` remains unique per file.
- `FileVersion` supports multiple entries per file and enforces version uniqueness by `(fileId, versionNum)`.

## Implementation Notes

- The old `Creative`, `Metadata`, and `Version` model names were replaced to match the Epic 1 feature language.
- `SyncMetadata` was preserved rather than silently dropped because later sync/versioning epics still depend on that concern.
- Repository type mirrors and Prisma CRUD tests must use the new model names from this point forward.
