# Epic 1 Concurrent Editing Strategy

**Status:** Draft complete for blocker story `PRE-1.5`  
**Date:** 2026-04-03  
**Owner:** @architect (Aria)  
**Depends On:** `PRE-1.3`, `PRE-1.4`  
**Feeds:** Epic 1 implementation, QA concurrency coverage, rollback/versioning work

## 1. Purpose

This document defines the Epic 1 concurrency and lock strategy for:

- metadata saves
- version creation
- history reads
- file replacement
- rollback operations

The goal is to prevent corruption and user-visible ambiguity while preserving a non-blocking local-first experience.

This document extends:

- [PRE-1.3 error semantics](./error-handling-spec.md)
- [PRE-1.4 git flow](./git-integration-flow.md)

It does not redefine them.

## 2. Design Principles

- Prefer serialization over silent conflict when the same `CreativeFile` is being mutated.
- Prefer queued retry over destructive force-release.
- Keep read operations available whenever they can be served safely.
- Treat git-native locks as observed constraints, not app-owned resources.
- Keep remote backup and external `.sync-locks/` artifacts outside the in-app versioning concurrency model.
- Make ownership, timeout, and cleanup rules explicit enough that implementation and QA do not invent unsafe shortcuts.

## 3. Scope and Assumptions

### In scope

- coordination inside the app for Epic 1 creative versioning flows
- overlap between local persistence, version queueing, git execution, history refresh, and rollback
- user-visible behavior during contention, wait, retry, timeout, and terminal failure

### Out of scope

- external cloud sync locking
- collaboration between multiple human users
- force-repair of corrupted git repositories

### Operating assumption

Epic 1 is a single-user, local-first desktop flow, but the app must still handle:

- multiple async operations inside one running app session
- filesystem watcher events from outside the UI flow
- git-native lock contention
- stale in-app state after crashes or interrupted operations

## 4. Concurrency Scenario Matrix

| Scenario | Risk | Strategy |
|---|---|---|
| Metadata save overlaps another metadata save on same file | Last edit becomes ambiguous or double-committed | Coalesce into one queued mutation job for that file |
| Metadata save overlaps file replacement on same file | Version content and metadata drift apart | Replacement gets exclusive write lock; metadata save waits or is re-read after replacement |
| Metadata save overlaps rollback on same file | User may overwrite rollback outcome or commit the wrong state | Rollback gets exclusive write lock; metadata save is blocked or cancelled and must refresh |
| File replacement overlaps another replacement on same file | Current content source becomes ambiguous | Serialize with exclusive write lock |
| Rollback overlaps another rollback on same file | Version chain and restored content become ambiguous | Allow only one destructive operation at a time |
| History read overlaps active version write | User may see stale or incomplete history | Reads remain allowed, but show pending/refresh state until commit finalizes |
| Watcher event arrives while queued job is pending | App may commit stale assumptions | Mark file state dirty and force refresh before next write is allowed |
| Git-native lock appears during commit | App-level job cannot safely complete immediately | Transition to retry path without deleting git lock |

## 5. Coordination Model

### 5.1 Operation classes

| Operation class | Examples | Coordination level |
|---|---|---|
| Non-destructive read | history load, version list refresh | shared read allowed |
| Soft write | metadata save, metadata-only version queueing | serialized per file, coalescing allowed |
| Destructive write | file replacement, rollback | exclusive per file, no overlap allowed |
| Repository execution | git stage/commit/checkout inside worker | serialized through queue plus git lock awareness |

### 5.2 Primary model

Use **application-level per-file coordination** with **exclusive write locks** and **queued execution**, plus **git-native lock detection** at execution time.

This means:

- one `CreativeFile` may have multiple queued intents
- only one active write owner may mutate that file at a time
- destructive operations require exclusive ownership
- metadata saves may coalesce before commit
- repository execution still checks git-native lock state separately

### 5.3 Coordination primitives

For implementation, define these primitives:

- `fileLockRegistry`
- `versioningQueue`
- `operationOwnerToken`
- `lockLease`
- `dirtyStateMarker`

## 6. Lock Lifecycle

### 6.1 Lock types

| Lock type | Holder | Used for |
|---|---|---|
| `metadata-write` | metadata save pipeline | short-lived local save and queue enqueue |
| `versioning-write` | versioning worker | stage + commit + `FileVersion` persistence |
| `destructive-write` | replacement or rollback flow | content mutation that must not overlap with another destructive action |

### 6.2 Lock identity

Each acquired lock must have:

- `lockId`
- `fileId`
- `lockType`
- `ownerToken`
- `acquiredAt`
- `expiresAt`
- `state`

### 6.3 Acquisition rules

- Acquire by `fileId`, not only by path, because paths may change over time.
- Metadata save may acquire a short lease for local persistence, then hand off to queue ownership.
- Replacement and rollback must acquire exclusive `destructive-write` before mutating content.
- A job may not upgrade silently from soft write to destructive write; it must reacquire under the stricter rule.

### 6.4 Hold rules

- Lock holds should be as short as possible.
- UI-level editing should not keep a file lock open while the user simply has a form focused.
- The queue/worker owns versioning locks only while actively processing or awaiting a bounded retry.

### 6.5 Release rules

- Release happens only by the current `ownerToken`.
- Successful completion releases immediately after the app state and worker state are consistent.
- Terminal failure releases after the failure has been recorded and the UI has been notified.
- Ownership handoff from local save to queue worker must be explicit in logs/events.

## 7. Timeout and Cleanup Rules

### 7.1 Timeout targets

- metadata-write lease: short, intended only for local save handoff
- destructive-write lease: longer, bounded by replacement or rollback execution
- versioning-write lease: bounded by commit execution plus retry scheduling state

Exact timer values may be tuned in implementation, but the user-visible timeout rule from `PRE-1.3` remains:

- if safe ownership cannot be confirmed after the wait budget expires, fail with `CON-005`

### 7.2 Cleanup rules

- Expired locks move to `expired` state before cleanup, not directly to silent deletion.
- Cleanup must verify the owner is no longer active before the registry entry is removed.
- If the app restarts and finds unfinished queue state, the first action is reconciliation, not immediate lock reuse.
- Reconciliation should prefer `refresh and retry` semantics over assuming that prior work completed.

### 7.3 Explicit prohibition

The app must not:

- silently delete `.git/index.lock`
- assume ownership of a lock it did not create
- force-release another active operation without an ownership check

## 8. Conflict Handling Rules

### 8.1 Metadata save vs metadata save

- Same-file rapid edits coalesce into one queued mutation when they occur within the batch window.
- The UI continues showing the latest local form state.
- If the persisted base changed externally before commit, mark dirty and require refresh before another save.

### 8.2 Metadata save vs replacement

- Replacement wins exclusive execution for content mutation.
- Pending metadata save for the same file must either:
  - flush before replacement starts, or
  - be cancelled and re-based on fresh file state after replacement

Implementation should prefer flush-first when the metadata job is already committed locally and safe to finish quickly.

### 8.3 Metadata save vs rollback

- Rollback has exclusive priority because it changes the effective current content version.
- Any pending metadata job for that file must be resolved before rollback starts.
- If rollback begins first, metadata editing UI must move to blocked/refresh-required state.

### 8.4 Rollback vs rollback

- Never overlap two rollback executions for the same file.
- The second request should fail fast with the `CON-003` semantics rather than waiting indefinitely.

### 8.5 History read vs active write

- History reads are allowed while writes are queued.
- If the selected file has active queued or committing work, the history UI must show that the timeline may refresh after commit completion.
- Do not present a pending commit as final history.

### 8.6 External change while queued

- If watcher signals that the same file changed externally while a queued versioning job is pending, set `dirtyStateMarker`.
- New writes are blocked until the file is reloaded.
- Existing queued job should either:
  - be cancelled safely before git execution, or
  - fail with refresh-required semantics if assumptions are no longer valid

## 9. User-Facing States

| State | Trigger | User-facing behavior |
|---|---|---|
| `saving` | local save accepted and being persisted | inline saving indicator |
| `queued` | versioning work is waiting for batch flush or prior job | inline status such as `Version save queued` |
| `waiting` | lock held by another safe in-app operation | controls disabled with explanatory text |
| `retrying` | retryable git or coordination issue occurred | non-destructive status plus no duplicate destructive actions |
| `refresh-required` | queued assumptions are stale after external or conflicting change | modal or blocking toast requiring reload |
| `failed` | retry budget exhausted or timeout unsafe | toast or modal mapped from `PRE-1.3` |

### UX rules

- Waiting states should explain whether the system is still working or whether the user must act.
- Retry states should not look identical to success states.
- Destructive overlaps should use modal-level interruption, not a subtle toast.
- Timeout and stale-state failures should always explain that the stop was intentional to avoid conflicting changes.

## 10. Relationship To PRE-1.3 Error Codes

This strategy directly depends on these error semantics:

- `CON-001` for active in-app write ownership
- `CON-002` for git-native lock detection and automatic retry path
- `CON-003` for overlapping destructive actions
- `CON-004` for external change while queued
- `CON-005` for timeout without safe ownership confirmation
- `GIT-002` and `GIT-006` for terminal git/rollback failure
- `DB-001` for retryable SQLite lock waits

The lock strategy must surface these codes consistently instead of creating parallel ad hoc messages.

## 11. QA Scenario Set

QA should derive at least the following scenarios:

1. Same file receives five rapid metadata changes within the batch window and results in one coalesced version commit.
2. User starts metadata save, then triggers replacement on the same file before commit flush.
3. User attempts rollback while another rollback is already in progress for that file.
4. History panel is open while versioning job is queued, then refreshes after commit completion.
5. Git-native lock appears during commit execution and the job retries with visible status.
6. Timeout expires without safe ownership confirmation and the UI surfaces `CON-005`.
7. External filesystem change lands while metadata job is queued and the app requires refresh before more edits.
8. Rollback commit fails after restore staging and the system surfaces the correct blocking failure without pretending success.

For each scenario QA should verify:

- lock state transition
- user-visible state transition
- retry or fail decision
- error code mapping
- final consistency of current file state and version history

## 12. Module Responsibilities

| Module | Responsibility |
|---|---|
| `fileLockRegistry` | create, track, expire, and release app-managed file locks |
| `queueConflictResolver` | decide whether queued jobs coalesce, flush first, cancel, or require refresh |
| `versioningQueue` | preserve ordering and retry semantics from `PRE-1.4` |
| `gitRepositoryAdapter` | expose lock detection without taking ownership of git lock repair |
| `rollbackCoordinator` | enforce exclusive destructive access for rollback |
| `historyRefreshCoordinator` | reconcile pending write state with visible history UI |
| `watcherReconciliation` | react to external change notifications and set dirty markers |

## 13. Pseudocode

```ts
async function withFileWriteLock(input: LockRequest, run: () => Promise<void>) {
  const lease = await fileLockRegistry.acquire(input)

  if (!lease.acquired) {
    throw appConcurrencyError('CON-001')
  }

  try {
    return await run()
  } finally {
    await fileLockRegistry.release({
      fileId: input.fileId,
      ownerToken: lease.ownerToken,
    })
  }
}

async function scheduleFileMutation(job: MutationJob) {
  const resolution = queueConflictResolver.resolve(job)

  if (resolution.type === 'coalesce') {
    return versioningQueue.replacePending(job.fileId, resolution.job)
  }

  if (resolution.type === 'refresh-required') {
    throw appConcurrencyError('CON-004')
  }

  return versioningQueue.enqueue(job)
}

async function performRollback(job: RollbackJob) {
  return withFileWriteLock(
    { fileId: job.fileId, lockType: 'destructive-write', timeoutPolicy: 'bounded' },
    async () => {
      if (await gitRepositoryAdapter.hasIndexLock()) {
        throw retryableError('CON-002')
      }

      await rollbackCoordinator.ensureNoPendingWrites(job.fileId)
      await rollbackCoordinator.restoreHistoricalContent(job)
      await rollbackCoordinator.commitRollback(job)
    },
  )
}
```

## 14. Explicit Decisions

- Use per-file app-managed coordination as the primary concurrency mechanism
- Use exclusive destructive locks for replacement and rollback
- Allow metadata-save coalescing inside the existing batch window
- Keep history reads available, but mark them refresh-sensitive during active writes
- Use owner tokens and lease state for safe release
- Prefer reconciliation and retry over force-release
- Treat external `.sync-locks/` artifacts as unrelated to in-app Epic 1 write ownership

## 15. Out of Scope

This story does not define:

- multi-user collaborative editing
- remote lock replication
- automatic git lock repair
- performance tuning numbers beyond the inherited Epic 1 targets

Those are outside the Epic 1 blocker scope.
