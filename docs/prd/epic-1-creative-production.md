# Epic 1: Creative Production Foundation

**Status:** Ready for Development (after blockers remediated)  
**Priority:** P0 - MVP Core Spine  
**Esforco Estimado:** 120 horas baseline de produto; story sequencing refined with a pre-versioning MVP checkpoint  
**Owner:** @dev (Dex)  
**QA Gate:** @qa (Quinn)  
**Architecture Review:** @architect (Aria)  
**Database Design:** @data-engineer (Dara)  
**Data:** 2026-04-04  

---

## Overview

Core MVP functionality: file browser + metadata editor + automatic versioning. This is the spine of Brand-Ops where creative files are organized with local persistence, full history tracking, and rollback.

**What Users Can Do:**
- Upload files with drag-drop
- Edit metadata inline
- See complete version history with local git commits
- Roll back to previous versions
- Browse the creative library with a stable navigation surface

**Success Metrics:**
- File upload: <1s
- Metadata edit: <200ms
- Version history load (1K+ files): <300ms
- Rollback: <2s

---

## Objectives

| # | Objective | Success Metric | Status |
|---|-----------|----------------|--------|
| 1 | File browser with drag-drop | Upload any file type in <1s | MVP |
| 2 | Metadata editor | Edit type, tags, status, notes instantly | MVP |
| 3 | Auto-versioning | Every meaningful change creates v1, v2, v3... | MVP |
| 4 | Version history viewer | See all versions with dates and compare/view behavior | MVP |
| 5 | Instant rollback | Restore to any previous version in <2s | MVP |
| 6 | Bulk tagging | Deferred until explicitly story-mapped after Epic 1 MVP | Post-MVP |

---

## Features

### Feature 1.1: File Browser UI

**Purpose:** Central location for browsing, uploading, and managing creative files with a stable UI shell before git/versioning is layered in.

**Epic 1 Scope Across Stories:**
- `1.0` validates the MVP checkpoint first: upload -> metadata edit -> persist -> reload, still without git.
- `1.1a` delivers the file-browser shell, ingest path, thumbnails, selection model, view toggles, and baseline browse controls.
- `1.1c` hardens the integrated no-git flow.
- `1.1d` captures the remaining browse ergonomics still kept inside Epic 1: navigation, breadcrumbs, contextual actions, and richer keyboard behavior.

**Acceptance Criteria:**
- [ ] Upload into the approved local creative storage root succeeds with approved validation and error semantics
- [ ] Grid/List browse shell works with selection, thumbnails/fallbacks, and baseline keyboard flow
- [ ] Search/filter/sort behavior required for the MVP browse surface is available
- [ ] The library remains stable after reload and after metadata changes
- [ ] Richer navigation and browse ergonomics are completed before versioning work begins

**Technical Notes:**
- Reuse the approved filesystem/error semantics from `docs/error-handling-spec.md`
- Keep the pre-versioning creative-library surface stable before `1.2`
- Do not pull sync/rclone concerns into this feature

---

### Feature 1.2: Metadata Editor

**Purpose:** Inline editing of file metadata with a stable contract before versioning and history depend on it.

**Epic 1 Scope Across Stories:**
- `1.1b` delivers metadata-editor core for type, status, tags, and notes.
- Tag suggestions/history remain inside Epic 1 and belong in the metadata-editor track rather than being deferred implicitly.
- Undo/redo remains conceptually part of Epic 1 only when explicitly story-mapped; it is not silently assumed as complete.

**Acceptance Criteria:**
- [ ] Edit metadata without leaving the library flow
- [ ] Validation uses the approved schema and error semantics
- [ ] Save behavior respects dirty-state discipline
- [ ] Metadata persists across reload/app restart
- [ ] Tags use the approved `string[]` contract and support the Epic 1 metadata ergonomics that are explicitly story-mapped

**Technical Notes:**
- Reuse final schema contract from `docs/database-schema.md`
- Keep metadata behavior compatible with later versioning commits

---

### Feature 1.3: Auto-Versioning (Git Integration)

**Purpose:** Automatic immutable local version tracking for meaningful changes.

**Epic 1 Scope Across Stories:**
- `1.2` owns repository bootstrap, queueing, commit generation, retry behavior, and `FileVersion` persistence.
- `1.2b` owns the richer user-facing async states, recovery UX, refresh-required behavior, and stale-state handling built on top of the `1.2` pipeline.

**Acceptance Criteria:**
- [ ] First upload and later file/metadata changes create the correct commit categories and `FileVersion` records
- [ ] The creative storage repo in `E:\BRAND-OPS-STORAGE\` is created or verified before first use
- [ ] Commit generation uses deterministic messages and sequential version numbers
- [ ] Retry, terminal failure, and queue semantics follow approved docs
- [ ] User-facing async state is explicit before history and rollback build on top of versioning

**Technical Notes:**
- Follow `docs/git-integration-flow.md`
- Follow `docs/concurrent-editing-strategy.md`
- Follow `docs/error-handling-spec.md`
- Keep offline queue persistence and sync behavior out of this Epic 1 scope unless explicitly story-mapped later

---

### Feature 1.4: Version History Viewer

**Purpose:** Inspect version history for a file with metadata context before compare or restore actions.

**Acceptance Criteria:**
- [ ] The viewer uses `FileVersion` as the primary local timeline source
- [ ] Each entry shows version number, date, commit message, and commit hash
- [ ] Compare/view interactions are supported for the baseline Epic 1 history experience
- [ ] Refresh/unavailable-history behavior follows approved docs
- [ ] The viewer remains compatible with rollback

---

### Feature 1.5: Instant Rollback

**Purpose:** Restore a file to a previous version while preserving immutable history.

**Acceptance Criteria:**
- [ ] Rollback restores file content correctly
- [ ] Rollback creates a new version entry instead of mutating history
- [ ] Confirmation and failure behavior follow approved semantics
- [ ] The rollback flow remains compatible with the history viewer

---

## Success Criteria

**Developer Signs Off When:**
- [ ] All Epic 1 stories mapped to the MVP are implemented against their acceptance criteria
- [ ] Browse, metadata, versioning, history, and rollback flows work end to end
- [ ] Metadata persists across reload/app restart
- [ ] Version history is accurate and complete
- [ ] Lint, typecheck, tests, and build pass

**QA Signs Off When:**
- [ ] Acceptance criteria are verified story by story
- [ ] Error handling and concurrency behavior are tested against approved docs
- [ ] Performance targets are measured using a consistent benchmark approach
- [ ] No CRITICAL or HIGH severity issues remain in review

---

## Feature Sequencing & Story Breakdown

| Story | Focus | Effort | Dependencies | Order |
|---|---|---|---|---|
| `1.0` | MVP foundation checkpoint | 8h | PRE blockers done | 1st |
| `1.1a` | File browser shell + ingest | 30h | `1.0` done | 2nd |
| `1.1b` | Metadata editor core | 20h | `1.1a` done | 3rd |
| `1.1c` | Integration hardening | 10h | `1.1a` + `1.1b` | 4th |
| `1.1d` | Library ergonomics + navigation | 12h | `1.1c` done | 5th |
| `1.2` | Auto-versioning git pipeline | 25h | `1.1d` + DB schema | 6th |
| `1.2b` | Versioning UX + recovery states | 8h | `1.2` done | 7th |
| `1.3` | Version history viewer | 20h | `1.2b` done | 8th |
| `1.4` | Instant rollback | 15h | `1.3` done | 9th |

**Total Epic 1 Baseline:** 148h after hidden-scope redistribution inside the epic

---

## Related Documentation

- `docs/database-schema.md`
- `docs/error-handling-spec.md`
- `docs/git-integration-flow.md`
- `docs/concurrent-editing-strategy.md`
- `docs/front-end-spec.md`
- `docs/stories/epic-1/1.0.mvp-foundation.md`

---

## Blocking Issues

| Issue | Owner | Status |
|---|---|---|
| Database schema migration | @data-engineer | Resolved through PRE-1.1 |
| Dependencies update baseline | @dev | Resolved through PRE-1.2 |
| Error handling documentation | @po | Resolved through PRE-1.3 |
| Git integration flow | @architect | Resolved through PRE-1.4 |
| Concurrent editing strategy | @architect | Resolved through PRE-1.5 |

---

## Ready State

Epic 1 is ready for development sequencing with `1.0` as the active MVP checkpoint and the remaining hidden Epic 1 work redistributed into explicit follow-on stories.

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-04-04 | 2.1 | Reorganized Epic 1 story sequencing around `1.0`, added `1.1d` and `1.2b`, and aligned PRD scope with explicit stories |
| 2026-04-03 | 2.0 | Revised epic after blocker remediation |
| 2026-04-03 | 1.0 | Initial draft |
