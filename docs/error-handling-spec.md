# Epic 1 Error Handling Specification

**Status:** Draft complete for blocker story `PRE-1.3`  
**Date:** 2026-04-03  
**Owner:** @po (Pax)  
**Depends On:** `PRE-1.1`, `PRE-1.2`  
**Feeds:** `PRE-1.4`, `PRE-1.5`, Epic 1 implementation and QA

## 1. Purpose

This document defines the baseline error catalog for Epic 1 Creative Production so implementation, QA, and later architecture work use one shared set of:

- error codes
- user-facing messages
- UI presentation rules
- logging expectations
- recovery behavior

The goal is consistency, not premature over-engineering. `PRE-1.4` will refine git flow details and `PRE-1.5` will refine concurrency and lock behavior, but both must inherit the same error semantics defined here.

## 2. Alignment Baseline

### Final entity names from `PRE-1.1`

- `CreativeFile`
- `FileMetadata`
- `FileVersion`
- `SyncMetadata`

### Runtime/tooling assumptions from `PRE-1.2`

- `react-hook-form` handles metadata form validation state
- `sharp` is available for thumbnail generation
- `chokidar` is available for filesystem watching
- `simple-git` is available for versioning operations

### Storage and boundary assumptions

- SQLite is the local database baseline
- `FileMetadata.tags` is persisted as JSON-encoded text in SQLite, but the app contract exposes `tags: string[]`
- Git-backed versioning is local-first and must not assume impossible repository behavior outside the repository boundary already clarified in Story `0.4`

## 3. Presentation Rules

| UI pattern | Use when | User expectation |
|---|---|---|
| Inline validation | The user can correct a specific field immediately without leaving the current form | The field is highlighted and the user can fix it right away |
| Toast | The action is non-blocking, the failure is recoverable, and the user does not need to make an immediate branching decision | The action failed, but the rest of the screen remains usable |
| Modal | The failure is destructive, ambiguous, or requires the user to choose whether to retry, cancel, or continue carefully | The user must acknowledge the risk before continuing |
| Blocking state | The system is temporarily busy with a lock, queued operation, or in-progress transition that must complete before another action can safely proceed | The user sees that work is in progress and understands why controls are disabled |

### Message writing rules

- Use plain language, not implementation jargon.
- Tell the user what happened, what they can do next, and whether retry is safe.
- Do not expose raw SQLite, filesystem, or git stderr in the primary message.
- Error codes may appear in secondary UI or logs, but the primary UI copy should stay human-readable.

## 4. Logging Contract

Every error surfaced by Epic 1 should log a structured record with these fields whenever the information exists:

- `timestamp`
- `errorCode`
- `category`
- `operation`
- `entityType`
- `fileId`
- `filePath`
- `versionId` or `commitHash`
- `attempt`
- `recoverable`
- `userVisible`
- `rootCauseSummary`

### Logging levels

- `warn`: recoverable validation, transient lock, retryable filesystem/database/git issue
- `error`: user-visible failure that stopped the requested action
- `fatal`: data-integrity or repository-state issue that should halt the current flow until corrected

### Logging rules

- Validation errors should log at `warn` only when they reveal a repeatable problem worth diagnosis; routine user mistakes do not need noisy logs.
- Filesystem, database, git, rollback, and concurrency failures should always log at least `warn`.
- Terminal failures after retries should escalate to `error`.
- When a retry is attempted automatically, each attempt should append `attempt` and `nextAction`.

## 5. Error Catalog

### Validation

| Code | Trigger | User-facing message | UI presentation | Recovery path | Logging |
|---|---|---|---|---|---|
| `VAL-001` | Upload file type is unsupported for the current flow | `This file type is not supported here.` | Inline validation near upload zone | User selects a supported file type | No log by default; `warn` only if repeated import source issue is being diagnosed |
| `VAL-002` | File exceeds the Epic 1 size limit | `File too large. Maximum size is 100 MB.` | Inline validation near upload zone | User chooses a smaller file | No log by default |
| `VAL-003` | `type` is missing in metadata form | `Please select a file type.` | Inline validation | User selects a type and saves again | No log by default |
| `VAL-004` | `status` is missing in metadata form | `Status is required.` | Inline validation | User selects a status and saves again | No log by default |
| `VAL-005` | Tag count exceeds allowed limit | `You can add up to 20 tags.` | Inline validation | User removes tags and retries save | `warn` only if the limit check itself fails unexpectedly |
| `VAL-006` | Notes exceed allowed length | `Notes can have up to 500 characters.` | Inline validation with counter | User shortens notes and retries save | No log by default |
| `VAL-007` | `tags` payload cannot be parsed into the app contract `string[]` | `Tags could not be read. Refresh and try again.` | Toast | Refresh current file state; if it persists, treat as data-repair issue | `error` with persisted value snapshot and parse failure summary |

### Filesystem

| Code | Trigger | User-facing message | UI presentation | Recovery path | Logging |
|---|---|---|---|---|---|
| `FS-001` | Storage root or target folder is missing/unavailable | `Storage folder is unavailable. Check the local storage path and try again.` | Modal | User restores the local storage path, then retries | `error` with path and operation |
| `FS-002` | OS denies write/read permission to the target path | `Permission denied. Check folder permissions and try again.` | Modal | User adjusts permissions or chooses a valid writable location | `error` with path, operation, and OS error summary |
| `FS-003` | Disk is full during upload, replacement, or rollback | `Storage is full. Free up space and try again.` | Modal | User frees disk space, then retries the failed action | `error` |
| `FS-004` | File disappears between selection and processing | `The file is no longer available. Choose the file again.` | Toast | User re-selects or refreshes the file list | `warn` |
| `FS-005` | Thumbnail generation fails for a valid file | `Preview unavailable for this file.` | Toast with graceful fallback icon | Keep file usable without thumbnail; no retry required unless user requests refresh | `warn` with `sharp` error summary |

### Database

| Code | Trigger | User-facing message | UI presentation | Recovery path | Logging |
|---|---|---|---|---|---|
| `DB-001` | SQLite is temporarily locked during metadata save or version record write | `Save is waiting for the database. Please hold on.` | Blocking inline state while retrying, then toast if retry budget is exhausted | System retries automatically; if it still fails, user can retry manually | `warn` on retry, `error` on terminal failure |
| `DB-002` | Prisma schema or migration state does not match the running app expectation | `Database setup is out of date. Update the local database and try again.` | Modal | Operator runs the required migration or resets the local dev baseline according to documented procedures | `fatal` |
| `DB-003` | Write fails for non-lock reasons during metadata or version persistence | `Failed to save your changes. Try again.` | Toast with retry action | User retries save; if repeated, escalation to diagnostics | `error` |
| `DB-004` | Required `CreativeFile`, `FileMetadata`, or `FileVersion` record is missing during a follow-up action | `This item could not be loaded. Refresh and try again.` | Toast | Refresh list or navigate back to reload state | `error` with missing entity type and identifier |

### Git / Versioning / Rollback

| Code | Trigger | User-facing message | UI presentation | Recovery path | Logging |
|---|---|---|---|---|---|
| `GIT-001` | Local repository is missing, uninitialized, or otherwise unavailable for Epic 1 versioning | `Version history is unavailable because the local repository is not ready.` | Modal | Reinitialize or repair the local repository before retrying versioned actions | `fatal` |
| `GIT-002` | Commit creation fails during upload, metadata save, or file replacement | `Versioning failed. Try again. If it keeps failing, check storage and repository state.` | Toast first, modal if retries are exhausted | Queue for retry according to versioning policy; escalate to modal on terminal failure | `warn` per retry, `error` on terminal failure |
| `GIT-003` | Versioning queue reaches its safety limit | `Too many pending version saves. Wait for the queue to clear before making more edits.` | Blocking state plus toast | User waits; system keeps draining queue in background | `error` with queue depth |
| `GIT-004` | Version history cannot be read | `Version history is unavailable right now. Try again.` | Toast | User retries history load; if repeated, inspect repository state | `error` |
| `GIT-005` | Rollback source version cannot be restored because the historical content is unavailable or corrupted | `That version cannot be restored. Choose another version.` | Modal | User selects a different version; no destructive partial rollback should occur | `error` with target commit/version details |
| `GIT-006` | Rollback commit fails after content restore has been staged | `Rollback could not be finalized. Your current version was not replaced.` | Modal | System should restore pre-rollback working state if possible, then offer retry | `fatal` if consistency cannot be guaranteed, otherwise `error` |
| `GIT-007` | Commit message or version metadata cannot be generated from the requested action | `Version details could not be prepared. Try again.` | Toast | Retry the action after regenerating context from current state | `error` |

### Concurrency / Locking

| Code | Trigger | User-facing message | UI presentation | Recovery path | Logging |
|---|---|---|---|---|---|
| `CON-001` | App-managed write lock is already held by another save, replace, or rollback operation | `Another save is already in progress. Please wait.` | Blocking state on affected controls | Wait for lock release; user can retry once UI returns to idle | `warn` |
| `CON-002` | Git-native lock or repository lock is detected while version work is starting | `Versioning is busy. Your change will retry automatically.` | Blocking state while queued, then toast if delayed | Automatic retry with queue policy; terminal failure falls back to `GIT-002` | `warn` |
| `CON-003` | Concurrent rollback or replace request overlaps with another destructive operation on the same `CreativeFile` | `This file is busy with another version action. Try again when it finishes.` | Modal | User waits for current action to finish; do not allow overlapping destructive actions | `error` |
| `CON-004` | File changed externally while a queued metadata/version action was waiting | `This file changed before your save finished. Refresh to review the latest version.` | Modal | Reload current file state before allowing another edit | `error` with watcher event context |
| `CON-005` | Lock timeout expires and ownership cannot be safely confirmed | `The operation took too long and was stopped to avoid conflicting changes.` | Modal | User retries after refresh; no force-release unless later strategy defines safe ownership checks | `error` |

## 6. Recovery Rules

### Automatic retry is allowed for

- transient SQLite lock waits
- temporary git lock contention
- retryable commit failures that do not leave the repository in an ambiguous state

### Automatic retry is not allowed for

- validation mistakes the user must correct
- missing permissions
- disk full conditions
- migration/schema mismatch
- corrupted or unavailable rollback source versions

### Rollback-specific rules

- Rollback must either complete as a new versioned action or fail without silently replacing current content.
- If rollback content is restored locally but commit finalization fails, the user must see a modal and the system must prefer restoring the pre-rollback working state before exposing the file as successful.
- Rollback failures are always user-visible and always logged.

## 7. QA-Derivable Scenarios

QA should be able to derive at least these scenario groups directly from this document:

1. Validation: required metadata fields, tag limit, notes limit, unsupported upload, oversized upload.
2. Filesystem: missing storage path, permission denied, disk full, missing source file, thumbnail fallback.
3. Database: transient SQLite lock, non-lock persistence failure, missing entity during refresh, migration mismatch.
4. Git/versioning: repo unavailable, commit retry then success, commit retry then terminal failure, queue overflow, history load failure.
5. Rollback: missing source version, rollback finalization failure, safe user messaging after failed rollback.
6. Concurrency: overlapping save requests, overlapping rollback requests, git lock wait, timeout without unsafe force-release, external file change while queued.

For each scenario QA should verify:

- correct error code
- correct user-facing message
- correct UI pattern
- correct retry availability
- correct log severity
- correct state after failure

## 8. Open Boundaries For Later Stories

This specification intentionally does not finalize:

- exact queue/backoff timing details for git retries beyond the existence of retry behavior
- exact lock ownership implementation and stale-lock cleanup algorithm
- low-level repository repair mechanics

Those details belong to:

- `PRE-1.4` for git flow, batching, and retry mechanics
- `PRE-1.5` for lock lifecycle, timeout ownership, and concurrency control

They must remain consistent with the error codes and user-facing semantics defined here.
