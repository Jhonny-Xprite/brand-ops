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
Ready for Review

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
**I want** the Epic 1 package set aligned with the current repository baseline,  
**so that** file browsing, metadata editing, git versioning, and related tests can be implemented without package drift or redundant installs

---

## Acceptance Criteria

1. The dependency review explicitly compares the Epic 1 package requirements with the packages already present in `package.json`.
2. `simple-git`, `sharp`, `chokidar`, and `react-hook-form` are installed at compatible versions and recorded in `package.json`.
3. Existing testing packages that are already present are kept compatible with the repository baseline instead of being blindly downgraded or duplicated.
4. `package-lock.json` reflects the final dependency set after the update.
5. `npm list` completes without unresolved dependency conflicts for the Epic 1 package set.
6. `npm run typecheck` passes after the dependency change.
7. `npm run build` passes after the dependency change.
8. Any native-package caveats or install notes needed for `sharp` are documented for the team.
9. The story output records which dependencies were newly added versus already satisfied by the current baseline.
10. A dependency reference artifact exists for Epic 1 implementers, either by updating the existing documentation target in this story or by recording the final package set clearly in the implementation notes.

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Infrastructure  
**Secondary Type(s):** Dependency management  
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev
- @architect

**Supporting Agents:**
- @qa
- @github-devops

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Verify package additions, lockfile integrity, and zero dependency conflicts.
- [ ] Pre-PR (@github-devops): Review package manifest and lockfile consistency before PR creation.
- [ ] Pre-Deployment (@github-devops): Not applicable for this blocker story.

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 10 minutes
- Severity Filter: CRITICAL

**Predicted Behavior:**
- CRITICAL issues: auto_fix
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus:**
- Dependency compatibility with the existing baseline
- Lockfile consistency

**Secondary Focus:**
- Native-package install risks
- Unnecessary downgrades or duplicate packages

---

## Tasks / Subtasks

- [x] Audit the current dependency baseline (AC: 1, 3, 9)
  - [x] Compare `package.json` against the Epic 1 dependency list from the PRD.
  - [x] Distinguish between missing packages, already-satisfied packages, and versions that need adjustment.

- [x] Apply the Epic 1 dependency changes (AC: 2, 4)
  - [x] Add `simple-git`, `sharp`, `chokidar`, and `react-hook-form` at compatible versions.
  - [x] Preserve or reconcile testing-library packages already present in the repo.
  - [x] Update `package-lock.json`.

- [x] Validate the dependency state (AC: 5, 6, 7)
  - [x] Run `npm list`.
  - [x] Run `npm run typecheck`.
  - [x] Run `npm run build`.

- [x] Capture operational notes for implementers (AC: 8, 10)
  - [x] Record any `sharp` install caveats or platform notes.
  - [x] Document the final Epic 1 dependency set and what changed from baseline.

---

## Dev Notes

### Relevant Context

[Source: `docs/prd/epic-1-creative-production.md`]
- Epic 1 requires `simple-git`, `sharp`, `chokidar`, and `react-hook-form`.
- The PRD also references testing support for DOM and component workflows.

[Source: `package.json`]
- The current repository already includes Prisma, Redux, Next, React, and some testing packages.
- This story should align the missing Epic 1 libraries without treating the repo as an empty baseline.

[Source: `docs/tech-stack.md`]
- The existing stack documentation already references some of the target packages, so this story should reconcile documentation and actual install state rather than duplicate intent.

### Sequencing Notes

- This story can run in parallel with `PRE-1.1`.
- `PRE-1.3` should use the final dependency state from this story when naming runtime and testing assumptions.
- Feature implementation should not begin until this package baseline is stable.

### Testing

- Run `npm list` to verify the final package graph.
- Run `npm run typecheck`.
- Run `npm run build`.
- If install-time issues occur for native packages such as `sharp`, record them explicitly in the implementation notes.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-03 | 1.0 | Story created (PRE-1.2) | @sm (River) |
| 2026-04-03 | 1.2 | Reworked sequencing and normalized story structure to template v2 expectations | @sm (River) |
| 2026-04-03 | 2.0 | Installed missing Epic 1 dependencies, preserved existing test baseline, and validated dependency health | @dev (Dex) |

---

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm list simple-git sharp chokidar react-hook-form @testing-library/react @testing-library/jest-dom jest-environment-jsdom --depth=0`
- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build`

### Completion Notes List

- Added missing Epic 1 runtime dependencies: `simple-git@^3.33.0`, `sharp@^0.34.5`, `chokidar@^5.0.0`, and `react-hook-form@^7.72.1`.
- Confirmed existing test baseline was already satisfied and preserved: `@testing-library/react@^16.3.2`, `@testing-library/jest-dom@^6.9.1`, and `jest-environment-jsdom@^30.3.0`.
- `package-lock.json` was regenerated by `npm install` and `npm list` completed without unresolved dependency conflicts for the Epic 1 package set.
- `sharp` installed successfully on Windows using the published prebuilt binary; if a future Node upgrade causes a native mismatch, the first recovery step should be `npm rebuild sharp`.
- This story's implementation notes are the dependency reference artifact for Epic 1 implementers: newly added packages are the four runtime libraries above, while the testing libraries were already satisfied by the repository baseline.

### File List

- `package.json`
- `package-lock.json`
- `docs/stories/PRE-1.2.update-dependencies.md`

---

## QA Results

To be completed by QA agent.
