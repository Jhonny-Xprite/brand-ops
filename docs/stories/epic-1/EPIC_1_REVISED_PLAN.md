# Epic 1 - Revised Delivery Plan

**Updated:** 2026-04-04  
**Status:** Reorganized around the active `1.0` MVP checkpoint  
**Planning Rule:** Keep hidden Epic 1 work inside Epic 1, but redistribute it into explicit stories instead of reopening `1.0`

---

## Delivery Sequence

| Order | Story | Focus | Effort |
|---|---|---|---|
| 1 | `1.0` | MVP checkpoint: upload -> metadata edit -> persist -> reload | 8h |
| 2 | `1.1a` | File browser shell and ingest | 30h |
| 3 | `1.1b` | Metadata editor core | 20h |
| 4 | `1.1c` | Creative-library integration hardening | 10h |
| 5 | `1.1d` | Library ergonomics and navigation | 12h |
| 6 | `1.2` | Auto-versioning git pipeline | 25h |
| 7 | `1.2b` | Versioning UX and recovery states | 8h |
| 8 | `1.3` | Version history viewer | 20h |
| 9 | `1.4` | Instant rollback | 15h |

**Total Epic 1:** 148h

---

## Redistribution of Hidden Scope

### Browse and ingest scope

`1.1a` owns the browser shell, ingest path, selection model, view toggles, thumbnails, empty states, and baseline keyboard flow.

`1.1d` owns the browse ergonomics that were present in Epic 1 docs but were not mapped cleanly: folder navigation, breadcrumbs, richer keyboard flow, context actions, rename, duplicate, and properties.

### Metadata scope

`1.1b` remains the metadata-editor core and now explicitly carries the Epic 1 metadata ergonomics that were previously floating in docs: tag suggestions/history and disciplined dirty-state/save behavior.

### Versioning scope

`1.2` owns repository bootstrap, queueing, commit creation, batching, retry semantics, and `FileVersion` persistence.

`1.2b` owns the user-facing async-state layer that was previously hidden inside docs: queued, retrying, failed, completed, refresh-required, and stale-state behavior before history and rollback are built on top.

---

## Scope Boundaries Preserved

The following items remain outside this Epic 1 reorganization and should not be silently pulled back in:

- rclone / Google Drive sync UX
- IndexedDB-heavy offline queue persistence that survives reload
- dashboard / timeline analytics
- export flows
- wider Epic 7 offline-first behavior

---

## Execution Guidance

1. Finish `1.0` without reopening its scope.
2. Start `1.1a`, then continue through `1.1b` and `1.1c`.
3. Execute `1.1d` before any git/versioning work so the browse surface is stable first.
4. Implement `1.2`, then `1.2b`, before starting history and rollback.
5. Close Epic 1 with `1.3` and `1.4`.

---

## Why This Direction

- It keeps the hidden work inside Epic 1 as requested.
- It protects `1.0`, which is already near completion.
- It avoids mixing versioning pipeline work with recovery UX in a single overloaded story.
- It restores a clean AIOS backlog shape: explicit story, explicit acceptance criteria, explicit dependency.
