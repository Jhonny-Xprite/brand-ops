# Epic 1 Git Integration Flow

**Status:** Draft complete for blocker story `PRE-1.4`  
**Date:** 2026-04-03  
**Owner:** @architect (Aria)  
**Depends On:** `PRE-1.1`, `PRE-1.2`, `PRE-1.3`  
**Feeds:** `PRE-1.5`, Epic 1 implementation for auto-versioning, history, and rollback

## 1. Purpose

This document defines the implementation-facing architecture for Epic 1 git-backed versioning.

It covers:

- the end-to-end flow from user action to persisted version record
- commit generation rules
- batching and retry behavior
- queue and lock boundaries
- UI update timing
- module responsibilities and pseudocode for downstream implementation

This document must be read together with:

- [PRE-1.1 schema baseline](./database-schema.md)
- [PRE-1.3 error semantics](./error-handling-spec.md)
- Story `0.4` repository and backup boundary clarifications

## 2. Architectural Boundaries

### 2.1 Repositories and storage roles

Epic 1 uses two distinct git-related contexts:

1. **Product source repository**
   - This repository, where the application source code lives.
   - It is not the repository used for creative-file version history.

2. **Creative storage repository**
   - A local git repository rooted in the creative storage area.
   - This is the repository that `simple-git` uses for Epic 1 version history.
   - It is local-first and later backed up through the one-way local-primary sync model already documented in Story `0.4`.

### 2.2 Non-negotiable boundary rules

- Epic 1 must not assume the product source repository and the creative storage repository are the same thing.
- Epic 1 must not assume bi-directional sync behavior.
- Epic 1 versioning is local-first. Remote backup is outside the user-facing commit path.
- External sync artifacts such as `.sync-metadata/` and `.sync-locks/` remain external filesystem artifacts, not product-repository-managed app state.

## 3. Design Goals

- Non-blocking UI for ordinary metadata edits and file replacement.
- Immutable version history for uploads, metadata saves, file replacement, and rollback.
- Deterministic commit message generation.
- Safe batching of rapid metadata changes.
- Retry for transient git failures without hiding terminal failure.
- Clear separation between app-managed coordination and git-native lock behavior.
- Enough specificity for `@dev` to implement without inventing missing flow.

## 4. Core Flow

### 4.1 Triggering operations

Epic 1 versioning flow is triggered by:

- first upload of a `CreativeFile`
- metadata save for an existing `CreativeFile`
- file replacement for an existing `CreativeFile`
- rollback of an existing `CreativeFile` to a historical version

### 4.2 End-to-end sequence

1. User action occurs in the UI.
2. App validates the request.
3. App writes the primary state change to local storage and SQLite.
4. App enqueues a versioning job.
5. App updates UI immediately to show local success state plus versioning status.
6. Versioning worker batches eligible jobs for up to 5 seconds.
7. Worker acquires app-managed coordination for the target file set.
8. Worker checks git-native lock state before running git commands.
9. Worker stages the affected file paths and commit metadata.
10. Worker runs git operations through `simple-git`.
11. On success, worker creates the corresponding `FileVersion` record and publishes a UI refresh event.
12. On retryable failure, worker schedules retry with backoff.
13. On terminal failure, worker records structured logs and surfaces the `PRE-1.3` error semantics to the user.

## 5. UI Timing and User-Visible States

### Immediate UI behavior

- Metadata edits should feel saved locally as soon as the database write succeeds.
- The UI should not wait for git commit completion before reflecting the edited metadata values.
- The UI should show a versioning state indicator once a versioning job has been queued.

### Visible states

| State | Meaning | UI behavior |
|---|---|---|
| `idle` | No pending git work for the current file | No status indicator |
| `queued` | Change saved locally and waiting for batch flush | Subtle badge or inline text such as `Version save queued` |
| `committing` | Worker is actively staging and committing | Blocking or disabled versioning-related actions; show `Saving version...` |
| `retrying` | Previous attempt failed but is within retry budget | Show non-destructive status like `Retrying version save...` |
| `failed` | Retry budget exhausted or failure is terminal | Show toast or modal per error code from `PRE-1.3` |
| `complete` | Commit and `FileVersion` persistence succeeded | Refresh version history views and clear transient status |

### UI rules

- Upload and metadata edit flows should remain non-blocking unless a destructive overlap or terminal failure requires escalation.
- History and rollback views should refresh only after the commit result is known, not merely when the job is queued.
- If a user revisits the same file while its versioning work is queued, the UI should show pending status rather than pretending history is already final.

## 6. Commit Generation Rules

### 6.1 Commit categories

| Operation | Commit template |
|---|---|
| First upload | `feat: Upload {filename} (v{n})` |
| Metadata save | `docs: Update {filename} metadata - Type: {type}, Status: {status}` |
| File replacement | `update: Replace {filename} (v{n})` |
| Rollback | `revert: Rollback {filename} to v{old}` |

### 6.2 Commit input rules

- `filename` comes from the current `CreativeFile.filename`
- `v{n}` is derived from the next sequential `FileVersion.versionNum` for that file
- metadata commit messages should include only the stable summary fields required by the PRD, not every diff detail
- rollback messages should reference the restored historical version, not only the new version number

### 6.3 Determinism rules

- Commit message generation happens before git execution and should be logged as part of the job context
- If required message inputs are missing, the job fails with `GIT-007`
- The implementation must not generate different commit formats for the same operation type in different screens

## 7. Batching and Queue Design

### 7.1 Queue model

Use one application-level versioning queue with per-file coalescing behavior.

Each queued job should include:

- `jobId`
- `operationType`
- `fileId`
- `filePath`
- `createdAt`
- `attempt`
- `batchEligible`
- `requiresExclusiveWrite`
- `messagePayload`

### 7.2 Batch window

- Batch window: `5 seconds`
- Goal: coalesce rapid metadata changes into one git commit when safe

### 7.3 Coalescing rules

- Consecutive metadata-only saves for the same `CreativeFile` inside the batch window collapse into one commit job
- File replacement and rollback jobs are never merged into another file's commit
- A destructive operation such as rollback flushes any pending metadata job for the same file first, or blocks until that pending job is resolved

### 7.4 Queue boundaries

- Soft capacity warning at `50` pending jobs
- Hard safety limit at `100` pending jobs, matching the PRD
- When the hard limit is hit, new versioning work fails with `GIT-003` and the UI must tell the user to wait for the queue to drain

## 8. Retry Behavior

### 8.1 Retryable failures

Retry automatically for:

- transient git lock contention
- retryable commit failures that leave the repository in a coherent state
- transient filesystem/database timing issues already classified as retryable by `PRE-1.3`

### 8.2 Non-retryable failures

Do not auto-retry:

- validation failures
- missing permissions
- disk full
- corrupted rollback source version
- repository missing or not initialized

### 8.3 Backoff policy

- Attempt 1: immediate processing
- Retry 1: after `1 second`
- Retry 2: after `3 seconds`
- Retry 3: after `10 seconds`
- After the final failed attempt, mark the job terminal and surface the mapped `PRE-1.3` error code

### 8.4 Terminal failure handling

When a job becomes terminal:

- mark the job `failed`
- preserve structured logs
- surface the correct toast or modal from `PRE-1.3`
- keep the underlying local data state visible to the user, unless the failed operation is rollback and consistency cannot be guaranteed

## 9. Locking Boundary

### 9.1 App-managed coordination

The application is responsible for:

- preventing overlapping destructive operations on the same `CreativeFile`
- serializing queued versioning jobs for the same file
- deciding when a user-facing action must wait, retry, or fail

### 9.2 Git-managed coordination

Git is responsible for:

- repository-level lock files such as `.git/index.lock`
- atomic commit behavior inside the creative storage repository

### 9.3 Boundary rule

The application should check for git lock presence and respond according to the error catalog, but it should not pretend to own git's internals.

That means:

- app-level coordination starts before git command execution
- git-native lock detection influences retry and user messaging
- app-level logic must not silently delete or force-release git locks

`PRE-1.5` will define the full lock lifecycle and ownership model in more detail. This document only defines the git-flow boundary.

## 10. History Loading and Rollback Flow

### 10.1 History read path

1. User opens version history for a `CreativeFile`
2. App reads `FileVersion` records first for fast local timeline display
3. If deeper git detail is needed, app performs repository read operations such as `git log --follow`
4. UI shows timeline entries with version number, commit message, date, and commit hash
5. If history changes while open, the UI refreshes rather than presenting stale certainty

### 10.2 Rollback path

1. User selects `Restore to v{n}`
2. App opens confirmation dialog
3. App checks for pending versioning work and destructive overlap on the same file
4. App restores target content from the historical commit into working storage
5. App creates a new rollback commit
6. App creates the new `FileVersion` row representing the rollback result
7. UI refreshes history and current file preview

### 10.3 Rollback safety rule

Rollback is never an in-place deletion of history. It always produces a new version entry that points current state back to older content.

## 11. Performance Expectations

These are architecture targets inherited from the Epic 1 PRD:

- metadata edit remains non-blocking for the user
- commit processing target: `<500ms` under ordinary conditions
- version history load target: `<300ms` for cached/history-indexed views
- rollback target: `<2s`

### Design implications

- queue processing must be asynchronous
- `FileVersion` rows should be indexed and read before expensive git history traversal
- UI should optimistically reflect successful local database writes while still surfacing queued version state
- history refresh should be event-driven after commit completion, not implemented as aggressive polling

## 12. Module Responsibilities

| Module | Responsibility |
|---|---|
| `versioningService` | Accepts app actions and creates versioning jobs |
| `versioningQueue` | Holds pending jobs, coalesces metadata jobs, schedules retries |
| `gitRepositoryAdapter` | Wraps `simple-git` operations for add, commit, log, checkout, and lock detection |
| `versionMessageBuilder` | Creates deterministic commit messages from operation context |
| `versionPersistence` | Writes `FileVersion` records after successful git completion |
| `versioningEvents` | Notifies UI when a job is queued, retried, failed, or completed |
| `historyReader` | Loads version timeline data from `FileVersion` and git reads |
| `rollbackService` | Coordinates rollback validation, content restore, commit creation, and recovery on failure |

## 13. Pseudocode

```ts
async function requestVersionedChange(input: VersioningInput) {
  validateInput(input)
  const localResult = await persistPrimaryState(input)

  const job = buildVersioningJob({
    input,
    localResult,
    commitMessage: buildCommitMessage(input, localResult),
  })

  publishVersioningEvent({ type: 'queued', fileId: input.fileId, jobId: job.jobId })
  enqueueVersioningJob(job)

  return localResult
}

async function processVersioningJob(job: VersioningJob) {
  await acquireAppCoordination(job.fileId)

  try {
    if (await gitRepositoryAdapter.hasIndexLock()) {
      throw retryableError('CON-002')
    }

    await gitRepositoryAdapter.stage(job.filePath)
    const commitHash = await gitRepositoryAdapter.commit(job.commitMessage)

    await versionPersistence.createFileVersion({
      fileId: job.fileId,
      commitHash,
      message: job.commitMessage,
      versionNum: job.nextVersionNum,
    })

    publishVersioningEvent({ type: 'complete', fileId: job.fileId, commitHash })
  } catch (error) {
    const decision = classifyVersioningFailure(error, job.attempt)

    if (decision.retry) {
      scheduleRetry(job, decision.delayMs)
      publishVersioningEvent({ type: 'retrying', fileId: job.fileId, attempt: job.attempt + 1 })
      return
    }

    publishVersioningEvent({ type: 'failed', fileId: job.fileId, errorCode: decision.errorCode })
    throw error
  } finally {
    releaseAppCoordination(job.fileId)
  }
}
```

## 14. Dependency Traceability

- `PRE-1.1` supplies the final persisted entities: `CreativeFile`, `FileMetadata`, `FileVersion`, `SyncMetadata`
- `PRE-1.2` supplies the runtime dependency `simple-git`
- `PRE-1.3` supplies the error semantics and user-facing failure behavior
- `PRE-1.5` must extend this flow with a full concurrency and lock lifecycle strategy, not replace it

## 15. Explicit Decisions

- Use `simple-git` for git command abstraction
- Use a `5 second` batch window for eligible metadata changes
- Use retry backoff of `1s`, `3s`, and `10s`
- Use a hard queue safety limit of `100`
- Keep remote backup outside the synchronous versioning path
- Treat git-native locks as detected state, not app-owned resources
- Never assume destructive force-release of git locks

## 16. Out of Scope For This Story

This story does not finalize:

- the exact stale-lock ownership algorithm
- bulk rollback orchestration across many files
- UI component design details for the history panel
- remote sync repair behavior

Those belong to later stories, especially `PRE-1.5` and feature implementation stories.
