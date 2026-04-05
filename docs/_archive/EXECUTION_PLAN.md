# Epic 1 — Execution Plan & Roadmap

**Date:** 2026-04-05  
**Status:** Ready to Execute  
**Owner:** @dev (Dex) + @qa (Quinn)  
**Total Effort:** 148 hours  
**Timeline:** 3-4 weeks  

---

## 📋 Executive Summary

Epic 1 transforms the Brand-Ops app from a basic file uploader into a production-ready Creative Library with versioning, history, and rollback. The execution is structured around **9 stories** with **critical dependencies** that must be sequenced carefully.

**Key Decision:** Story 1.0 is a **validation checkpoint** that must complete and pass QA before investing 140+ hours in Stories 1.1-1.4. If fundamentals fail, we stop and fix before proceeding.

---

## 🎯 Critical Success Factors

| Factor | Requirement | Owner |
|--------|-------------|-------|
| **Foundation Solid** | Story 1.0 must PASS before 1.1a starts | @qa |
| **No Scope Creep** | Each story has explicit AC boundary | @po |
| **Sequential Execution** | Dependencies strictly enforced | @sm |
| **Quality Gates** | All quality checks pass before next story | @qa |
| **User Validation** | User test checklist completed for each story | @pm |

---

## 🗂️ Delivery Sequence (9 Stories, 148h)

### Phase 1: Foundation Validation ⚡

#### **Story 1.0** — MVP Checkpoint (8h) | **P0 - BLOCKER**
**Owner:** @dev | **QA:** @qa | **Status:** Ready for Review

**What:** Upload → metadata edit → persist → reload (end-to-end validation)

**Why:** Tests database, file I/O, state management, API structure BEFORE investing 140h

**Acceptance Criteria:**
- ✅ File upload to `E:\BRAND-OPS-STORAGE\{filename}`
- ✅ `CreativeFile` record created with auto-detected type
- ✅ Metadata form (Type, Status, Tags, Notes) fully editable
- ✅ Persistence on reload (no data loss)
- ✅ All quality gates pass (lint, typecheck, test, build)

**Dependencies:** PRE-1.1 (database), PRE-1.2 (env), PRE-1.3 (error spec), PRE-1.4, PRE-1.5

**Deliverables:**
- `pages/api/files/upload.ts` — Upload endpoint
- `components/CreativeLibrary/*` — FileUploadInput, FileList, MetadataForm
- `pages/creative-library.tsx` — Main page
- Integration tests + user validation checklist

**Success Gate:** 
```
User can: Upload → Edit metadata → Close app → Reopen → See same data ✅
```

**Next Action:** After QA PASS → Start 1.1a immediately

---

### Phase 2: Core Browse & Edit (62h)

#### **Story 1.1a** — File Browser UI & Ingest (30h) | **P0**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.0 ✅

**What:** Rich file browser with shell, ingest path, selection model, view toggles, thumbnails

**AC:**
- ✅ Browse multiple files with visual distinction (thumbnail preview)
- ✅ Toggle between grid and list view (persistent preference)
- ✅ Empty state messaging
- ✅ File selection model (single select for metadata edit)
- ✅ Baseline keyboard flow (arrows, enter to select)

**Key Scope Boundaries:**
- ✅ IN: Browser shell, thumbnails, view toggles
- ❌ OUT: Folder navigation, breadcrumbs, rename, duplicate (→ 1.1d)
- ❌ OUT: Versioning git pipeline (→ 1.2)

---

#### **Story 1.1b** — Metadata Editor Core (20h) | **P0**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.1a ✅

**What:** Disciplined metadata editor with tag suggestions, dirty-state tracking, save behavior

**AC:**
- ✅ Form fields: Type, Status, Tags (with history/suggestions), Notes
- ✅ Dirty-state tracking (unsaved changes warning)
- ✅ Save/Cancel with validation
- ✅ Tag history from previous entries
- ✅ Zero console errors

**Key Scope Boundaries:**
- ✅ IN: Core editing, dirty tracking, tag suggestions
- ❌ OUT: Folder/properties panel (→ 1.1d)

---

#### **Story 1.1c** — Creative Library Integration Hardening (10h) | **P0**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.1b ✅

**What:** Integration points between file browser, metadata editor, and project shell

**AC:**
- ✅ Seamless handoff from Project Shell → Creative Library
- ✅ Project context preserved during library operations
- ✅ State sync between browse and edit
- ✅ No data loss during context switch

---

#### **Story 1.1d** — Library Ergonomics & Navigation (12h) | **P1**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.1c ✅

**What:** Advanced browse UX (folder nav, breadcrumbs, context actions, rename, duplicate, properties)

**AC:**
- ✅ Folder navigation with breadcrumbs
- ✅ Context menu (rename, duplicate, properties)
- ✅ Richer keyboard flow
- ✅ Properties panel

**Must Complete Before:** Story 1.2 (versioning needs stable browse surface)

---

### Phase 3: Versioning Pipeline (48h)

#### **Story 1.2** — Auto-Versioning Git Pipeline (25h) | **P0 - BLOCKER**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.1d ✅

**What:** Repository bootstrap, queueing, commit creation, batching, retry semantics, `FileVersion` persistence

**AC:**
- ✅ Git repo initialized on first file versioning action
- ✅ Commits queued reliably (survives reload before push)
- ✅ Batch commits (multiple files → one commit)
- ✅ Retry semantics for failed pushes
- ✅ `FileVersion` table populated correctly

**Critical:** This is a **git pipeline blocker**. Must work reliably before 1.2b.

---

#### **Story 1.2b** — Versioning UX & Recovery States (8h) | **P0**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.2 ✅

**What:** User-facing async-state layer (queued, retrying, failed, completed, refresh-required, stale)

**AC:**
- ✅ Queued state with spinner
- ✅ Retry UI for failed commits
- ✅ Completion notification
- ✅ Refresh-required indicator
- ✅ Stale-state behavior

---

### Phase 4: History & Rollback (38h)

#### **Story 1.3** — Version History Viewer (20h) | **P0**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.2b ✅

**What:** Timeline UI, version list, diff preview, restore capability

**AC:**
- ✅ Version timeline with dates/authors
- ✅ Version list with commit messages
- ✅ Diff preview between versions
- ✅ Restore button (prepare for rollback)

---

#### **Story 1.4** — Instant Rollback (15h) | **P0**
**Owner:** @dev | **QA:** @qa | **Depends On:** 1.3 ✅

**What:** One-click rollback to any version with undo capability

**AC:**
- ✅ Rollback button in history viewer
- ✅ Confirmation dialog
- ✅ Undo rollback (restore previous)
- ✅ Instant file restoration

---

## 📊 Dependency Graph

```
PRE-1.1-1.5 (Database, Config, Specs)
         ↓
      1.0 ⚡ (Validation Checkpoint — MUST PASS)
         ↓
    1.1a (Browse UI)
         ↓
    1.1b (Metadata Editor)
         ↓
    1.1c (Integration Hardening)
         ↓
    1.1d (Advanced UX) ← Must complete before versioning
         ↓
    1.2 ⚡ (Git Pipeline — BLOCKER)
         ↓
    1.2b (Versioning UX)
         ↓
    1.3 (History Viewer)
         ↓
    1.4 (Instant Rollback)
```

**Critical Path:** 1.0 → 1.1a → 1.1b → 1.1c → 1.1d → 1.2 → 1.2b → 1.3 → 1.4

**Key Blockers:**
- 🚫 1.0 must PASS before 1.1a
- 🚫 1.1d must complete before 1.2 (stable browse surface needed)
- 🚫 1.2 must PASS before 1.2b (git pipeline stability)

---

## ⏱️ Timeline Estimate

| Phase | Stories | Effort | Weeks | Start | End |
|-------|---------|--------|-------|-------|-----|
| **Foundation** | 1.0 | 8h | 1 | Week 1 | Week 1 |
| **Browse & Edit** | 1.1a-d | 62h | 2 | Week 1 | Week 3 |
| **Versioning** | 1.2-2b | 48h | 1.5 | Week 3 | Week 4+ |
| **History & Rollback** | 1.3-4 | 38h | 1 | Week 4+ | Week 5 |
| **Total** | 9 stories | 148h | 3-4 weeks | — | — |

---

## 🚀 Start Today

### Story 1.0 is Ready to Execute

**Prerequisites Checklist:**
- ✅ Database schema (Prisma) prepared (PRE-1.1)
- ✅ Environment variables configured (PRE-1.2)
- ✅ Error message specs defined (PRE-1.3)
- ✅ Component style guide available (PRE-1.4)
- ✅ API design specs ready (PRE-1.5)

**Next Action:**
1. **Read:** `docs/stories/epic-1/START_TODAY.md`
2. **Clarify:** Any AC questions?
3. **Start:** `docs/stories/epic-1/1.0.mvp-foundation.md`
4. **Execute:** 4 tasks over 8 hours
5. **Validate:** User test checklist
6. **Proceed:** 1.1a (if PASS)

---

## 📌 Execution Rules

### ✅ Story Start Checklist
- [ ] All dependencies completed
- [ ] Story fully read and understood
- [ ] AC clarified (ask questions before coding)
- [ ] No scope creep beyond stated AC

### ✅ Story Completion Checklist
- [ ] All AC met
- [ ] Code passes: lint, typecheck, test, build
- [ ] Tests written (>70% coverage on new files)
- [ ] User test checklist completed
- [ ] Handed off to @qa for gate review

### ✅ QA Gate Checklist
- [ ] Code review ✅
- [ ] Tests all passing ✅
- [ ] No regressions ✅
- [ ] Performance acceptable ✅
- [ ] Security basics verified ✅
- [ ] Verdict: PASS / CONCERNS / FAIL

---

## 🎯 Success Metrics

| Metric | Target | Owner |
|--------|--------|-------|
| **Story Completion Rate** | 100% on critical path | @sm |
| **QA Gate Pass Rate** | 100% on first review | @qa |
| **User Validation** | 100% checklists ✅ | @pm |
| **Code Quality** | Zero regressions | @dev |
| **Timeline Adherence** | Within estimated hours | @sm |

---

## 🚨 Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| 1.0 validation fails | Project blocker | Stop, diagnose, fix before 1.1a |
| Git integration breaks | 1.2+ blocked | Test git pipeline early in 1.2 |
| Scope creep in 1.1a-d | Timeline slip | Strict AC boundary enforcement |
| Database schema mismatch | 1.0 blockers | Verify schema exists before start |

---

## 📞 Communication Plan

### Weekly Sync
- **Monday:** Review blockers, plan week's work
- **Wednesday:** Mid-week check on Story N progress
- **Friday:** Closeout, validate completion, plan next

### Daily Standups (during active story)
- Story status (% complete)
- Blockers or risks
- Plan for today

### Story Transitions
- **End of Story N:** Notify @qa for gate review
- **QA Completes:** Notify @sm for next story
- **Start of Story N+1:** Kickoff with @dev + @qa

---

## 📄 Documentation

All story files ready in `docs/stories/epic-1/`:
- ✅ `1.0.mvp-foundation.md` — Start here
- ✅ `START_TODAY.md` — Quick start guide
- ✅ `USER_TEST_CHECKLIST_1.0.md` — Validation template
- ✅ `EPIC_1_REVISED_PLAN.md` — Original revised plan
- ✅ `1.1a.file-browser-ui.md` through `1.4.instant-rollback.md` — Full story set

---

## 🎬 Ready to Begin?

**Next Step:** @dev reads `docs/stories/epic-1/START_TODAY.md` and reports readiness status

**Timeline:** Story 1.0 target completion by **end of week 1** ✅

---

**Epic 1 Execution Plan v1.0**  
**Owner:** @sm (River), @dev (Dex), @qa (Quinn)  
**Last Updated:** 2026-04-05

