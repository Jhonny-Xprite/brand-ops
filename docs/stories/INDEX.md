# Development Stories

**Documentation Index for User Stories**  
**Status:** Foundations and PRE blockers closed; Epic 1 implementation batch validated and ready  
**Owner:** @sm (River — Scrum Master)  

---

## 📁 Stories Structure

```
stories/
├── INDEX.md
├── epic-1/
│   ├── 1.1a.file-browser-ui.md
│   ├── 1.1b.metadata-editor.md
│   ├── 1.1c.creative-library-integration.md
│   ├── 1.2.auto-versioning-git.md
│   ├── 1.3.version-history-viewer.md
│   └── 1.4.instant-rollback.md
├── 0.x foundation stories
└── PRE-1.x blocker stories
```

---

## Closed Story Waves

### Foundations Closed

| Story | Title | Status |
|---|---|---|
| `0.1` | Prisma Setup & Database Foundation | Done |
| `0.2` | Project Structure & TypeScript Types | Done |
| `0.3` | Service Worker & Offline Detection | Done |
| `0.4` | Git Repository & Sync Configuration | Done |

### PRE Blockers Closed

| Story | Title | Status |
|---|---|---|
| `PRE-1.1` | Database Schema Migration | Done |
| `PRE-1.2` | Update Dependencies | Done |
| `PRE-1.3` | Error Handling Specs | Done |
| `PRE-1.4` | Git Integration Flow | Done |
| `PRE-1.5` | Concurrent Editing Strategy | Done |

---

## Current Epic 1 Story Set

### Created On 2026-04-03

| Order | Story | Status | Depends On |
|---|---|---|---|
| 1 | `1.1a` File Browser UI | Ready | Foundations + PRE blockers complete |
| 2 | `1.1b` Metadata Editor | Ready | `1.1a` |
| 3 | `1.1c` Creative Library Integration Hardening | Ready | `1.1a`, `1.1b` |
| 4 | `1.2` Auto-Versioning Git Integration | Ready | `1.1c`, `PRE-1.4`, `PRE-1.5` |
| 5 | `1.3` Version History Viewer | Ready | `1.2` |
| 6 | `1.4` Instant Rollback | Ready | `1.3` |

### Story Files

- [1.1a.file-browser-ui.md](./epic-1/1.1a.file-browser-ui.md)
- [1.1b.metadata-editor.md](./epic-1/1.1b.metadata-editor.md)
- [1.1c.creative-library-integration.md](./epic-1/1.1c.creative-library-integration.md)
- [1.2.auto-versioning-git.md](./epic-1/1.2.auto-versioning-git.md)
- [1.3.version-history-viewer.md](./epic-1/1.3.version-history-viewer.md)
- [1.4.instant-rollback.md](./epic-1/1.4.instant-rollback.md)

## ⏳ When This Index Updates

**PHASE 3 (Development Cycle):**

1. **@sm creates story batches** from the validated epic docs
2. **@po validates each batch** before execution starts
3. **Stories stored** in `docs/stories/epic-{N}/`
4. **Each story links** to parent epic and active prerequisites
5. **This INDEX updates** as new epic batches are added

---

## 📋 Expected Story Breakdown

| Epic | Stories Expected | Total Hours | Story Size |
|------|-----------------|-------------|-----------|
| 1 - Creative Production | 6 created | 120h | 10-30h each |
| 2 - Search & Filtering | 4-5 | 80h | 15-20h each |
| 3 - Timeline & Analytics | 3-4 | 60h | 15-20h each |
| 4 - Sync & Versioning | 4-5 | 90h | 18-22h each |
| 5 - Multi-Format Exports | 2-3 | 50h | 15-25h each |
| 6 - Database Schema | 3-4 | 70h | 18-23h each |
| 7 - Offline-First | 5-6 | 100h | 17-20h each |
| **TOTAL** | **30-40 stories** | **~1000h** | **18-22h avg** |

---

## 🎯 Story Template (To Be Used)

Each story will follow AIOX-CORE template:

```markdown
# Story 1.1: Create File Browser UI

**Epic:** 1 - Creative Production  
**Effort:** 20 hours  
**Owner:** @dev (Dex)  
**Status:** ⏳ Pending  

## Overview
[What this story does]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

## Technical Details
[Implementation notes]

## Testing
[How to verify it works]

## Dependencies
- Story 1.0 (prerequisite)
- Epic 6 Database Schema (data layer ready)

## Files Modified
[List as progress]
```

---

## 📖 Reading Guide (PHASE 3)

### As a Developer
1. Find your assigned epic: `stories/epic-{N}/`
2. Read stories in order (dependencies matter)
3. Each story has acceptance criteria
4. Link to parent epic for context: `docs/prd/epic-{N}.md`
5. Reference coding standards: `docs/architecture/coding-standards.md`

### As a Scrum Master
1. Create stories from: `docs/prd/epic-*.md`
2. Organize in `docs/stories/epic-{N}/`
3. Update this INDEX with story list
4. Track via task list (30-40 stories)

### As a QA Lead
1. Read acceptance criteria in each story
2. Reference testing standards: `docs/architecture/coding-standards.md#🧪-testing-standards`
3. Verify story completion before sign-off

---

## 🔄 Dependencies Between Stories

### Epic 1 (Creative Production) → Epic 4 (Sync)
- Story 1.1 (File upload) must complete before 4.1 (Git integration)
- Story 1.2 (Metadata) must complete before 4.2 (Metadata tracking)

### Epic 6 (Database) → All Epics
- Stories in Epic 6 should start first (foundation)
- All other epics depend on database schema

### Epic 7 (Offline) → Epic 4 (Sync)
- Service Worker setup (7.2) needed for background sync (4.3)
- IndexedDB cache (7.1) needed for offline metadata (Epic 1)

---

## 📊 Estimated Timeline (PHASE 3)

### Current Progress
- Epic 1 implementation stories created after PRE blockers completion
- Next authority: `@po` validation of the new Epic 1 batch
- Other epics still pending story creation

### Week 3-6: Active Development (Waves)
- **Wave 1:** Epic 6 (Database) + Epic 1 (Creative Production)
- **Wave 2:** Epic 4 (Sync) + Epic 7 (Offline)
- **Wave 3:** Epics 2, 3, 5 (UI features)
- Parallel development across teams

### Week 7-8: Integration + QA
- Feature integration
- Cross-epic testing
- Bug fixes + polish
- Prepare for launch

---

## 📋 Quality Gates (Per Story)

Each story is "Done" when:
- [x] Code written + reviewed
- [x] Unit tests passing (>70% coverage)
- [x] Integration tests passing
- [x] Lint + typecheck passing
- [x] CodeRabbit review (no CRITICAL issues)
- [x] Acceptance criteria verified
- [x] QA sign-off

---

## 🔗 Cross-References

### From Epic Specs
- [Epic 1](../prd/epic-1-creative-production.md) → 5-6 stories
- [Epic 2](../prd/epic-2-search-filtering.md) → 4-5 stories
- [Epic 3](../prd/epic-3-timeline-analytics.md) → 3-4 stories
- [Epic 4](../prd/epic-4-sync-versioning.md) → 4-5 stories
- [Epic 5](../prd/epic-5-exports.md) → 2-3 stories
- [Epic 6](../prd/epic-6-database-schema.md) → 3-4 stories
- [Epic 7](../prd/epic-7-offline-first.md) → 5-6 stories

### To Development Guides
- [Coding Standards](../architecture/coding-standards.md) — Code rules
- [Source Tree](../architecture/source-tree.md) — File organization
- [Tech Stack](../architecture/tech-stack.md) — Dependencies

---

## 📊 Metrics (To Be Populated PHASE 3)

| Metric | Target | Status |
|--------|--------|--------|
| **Stories Created** | 30-40 | ⏳ Pending |
| **Average Size** | 18-22h | ⏳ Pending |
| **Epic Coverage** | 100% | ⏳ Pending |
| **Dependencies Mapped** | Yes | ⏳ Pending |
| **Estimates Verified** | Yes | ⏳ Pending |

---

## 🚀 Next Steps

### Immediate Next Step
1. `@master` sequences the first Epic 1 implementation wave
2. `@dev` begins with `1.1a`
3. `@qa` prepares the story-level execution gate once implementation starts

### This INDEX Updates When
- [x] PHASE 3 starts for Epic 1
- [x] Epic 1 stories created (update story list)
- [ ] First wave completes (celebrate!)
- [ ] Each epic's stories complete (mark done)

---

**Index Owner:** @sm (River — Scrum Master)  
**Framework:** AIOX-CORE  
**Status:** Pre-Epic 1 closeout complete; Epic 1 batch ready for execution sequencing  
**Next Action:** Start Story `1.1a` as the first Epic 1 implementation story
