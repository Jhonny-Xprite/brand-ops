---
template:
  id: story-template-v2
  version: 2.0
  
metadata:
  epic: 1
  story_num: "PRE-1.2"
  title: "Update Dependencies for Epic 1"
  priority: P0
  effort_minutes: 120
  blocker: true
  blocks: ["1.1", "1.2", "1.3", "1.4", "1.5"]
  
---

# Story PRE-1.2: Update Dependencies for Epic 1

## Status
Draft

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm list
  - npm run typecheck
  - npm run build
```

## Story

**As a** developer,  
**I want** all required npm dependencies installed for Epic 1 features,  
**so that** I can implement file browser, metadata editor, git integration, and version history

---

## Acceptance Criteria

- [ ] `simple-git` (v3.22.0+) installed and verified
- [ ] `sharp` (v0.33.0+) installed and verified (image thumbnails)
- [ ] `chokidar` (v3.5.0+) installed and verified (file system watching)
- [ ] `react-hook-form` (v7.51.0+) installed and verified (metadata form)
- [ ] Testing libraries installed: `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`
- [ ] `npm list` shows no conflicts or peer dependency warnings
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run build` succeeds (no errors or warnings)
- [ ] Lock file updated: `package-lock.json` committed
- [ ] Documentation: `docs/DEPENDENCIES.md` created with purpose of each library

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type:** Infrastructure (Dependency Management)  
**Secondary Types:** Backend Setup  
**Complexity:** Low (straightforward package install)

### Specialized Agent Assignment
**Primary Agents:**
- @dev (dependency installation and verification)
- @architect (compatibility validation)

**Supporting Agents:**
- @qa (testing library validation)

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): Run `npm list` and `npm run typecheck` before completion
- [ ] Pre-PR (@architect): CodeRabbit on package.json changes, version constraints

### CodeRabbit Focus Areas
**Primary Focus:**
- Version compatibility (no peer dependency conflicts)
- Security vulnerabilities in new packages
- Breaking changes in dependency upgrades

**Secondary Focus:**
- Lock file consistency
- Version constraints (^ vs ~ vs exact)

---

## Tasks / Subtasks

- [ ] Install Production Dependencies
  - [ ] `npm install simple-git@^3.22.0` (git CLI wrapper)
  - [ ] `npm install sharp@^0.33.0` (image processing)
  - [ ] `npm install chokidar@^3.5.0` (file system watching)
  - [ ] `npm install react-hook-form@^7.51.0` (form state)
  - [ ] Verify each with `npm list {package}`

- [ ] Install Dev Dependencies
  - [ ] `npm install --save-dev @testing-library/react@^14.2.0`
  - [ ] `npm install --save-dev @testing-library/jest-dom@^6.1.0`
  - [ ] `npm install --save-dev jest-environment-jsdom@^29.7.0`

- [ ] Verify Installation
  - [ ] `npm list` shows all packages (no missing or conflicting)
  - [ ] `npm run typecheck` passes with 0 errors
  - [ ] `npm run build` succeeds with no warnings
  - [ ] No peer dependency warnings

- [ ] Documentation
  - [ ] Create `docs/DEPENDENCIES.md`
  - [ ] List each library with purpose and version
  - [ ] Document why each library was chosen
  - [ ] Add troubleshooting section for common issues

---

## Library Purposes

| Library | Purpose | Version |
|---------|---------|---------|
| `simple-git` | Git CLI abstraction | ^3.22.0 |
| `sharp` | Image thumbnail generation | ^0.33.0 |
| `chokidar` | File system watching | ^3.5.0 |
| `react-hook-form` | Form state management | ^7.51.0 |
| `@testing-library/react` | React testing utilities | ^14.2.0 |
| `@testing-library/jest-dom` | Jest DOM matchers | ^6.1.0 |
| `jest-environment-jsdom` | Jest DOM environment | ^29.7.0 |

---

## Success Criteria

✅ All libraries installed without conflicts  
✅ TypeScript strict mode passes  
✅ Build succeeds without errors  
✅ No version conflicts  

---

## Blockers

This story **blocks** all Epic 1 features: 1.1, 1.2, 1.3, 1.4, 1.5

---

**Created:** 2026-04-03  
**Modified:** 2026-04-03 (Formal template v2.0)  
**Depends On:** Epic 0 complete  
**Blocks:** Stories 1.1-1.5
