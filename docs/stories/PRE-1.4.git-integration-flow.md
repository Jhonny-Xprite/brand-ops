---
template:
  id: story-template-v2
  version: 2.0

metadata:
  epic: 1
  story_num: "PRE-1.4"
  title: "Git Integration Flow Architecture"
  priority: P0
  effort_minutes: 240
  blocker: true
  blocks: ["1.3", "1.4", "1.5"]
---

# Story PRE-1.4: Git Integration Flow Architecture

## Status
Done

## Executor Assignment

```yaml
executor: "@architect"
quality_gate: "@pm"
quality_gate_tools:
  - Documentation review
  - Dependency traceability review
  - Technical feasibility walkthrough
```

## Story

**As an** architect,  
**I want** the git-backed versioning flow designed end to end,  
**so that** implementation of auto-versioning, history, and rollback has one feasible architecture for batching, retry, and UI update behavior

---

## Acceptance Criteria

1. The architecture describes the full flow from user action through persistence, git commit processing, and UI feedback.
2. Commit-generation rules are specified clearly enough for implementation to produce consistent messages.
3. Batching behavior is defined, including queue boundaries, trigger conditions, and expected user-visible behavior.
4. Retry behavior is defined for failed git operations, including backoff and terminal-failure handling.
5. The document is explicitly consistent with the error catalog from `PRE-1.3`.
6. The document defines the boundary between application-level locking/queueing and git's own lock files.
7. Performance expectations are documented for non-blocking UI and versioning throughput.
8. The architecture includes enough pseudocode or component-level breakdown for `@dev` to implement without inventing missing flow.
9. The output is written in a dedicated git-integration architecture document referenced by this story.
10. The design does not assume impossible repository behavior or contradict the repository boundary already established in Story 0.4.

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Architecture  
**Secondary Type(s):** Versioning, async workflow  
**Complexity:** High

### Specialized Agent Assignment

**Primary Agents:**
- @architect
- @dev

**Supporting Agents:**
- @po
- @qa

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Review technical feasibility of queueing, retry, and commit-generation details.
- [ ] Pre-PR (@github-devops): Not applicable for this documentation-first blocker.
- [ ] Pre-Deployment (@github-devops): Not applicable for this blocker story.

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @architect (document_only mode)
- Max Iterations: 1
- Timeout: 15 minutes
- Severity Filter: CRITICAL

**Predicted Behavior:**
- CRITICAL issues: document_only
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus:**
- End-to-end flow correctness
- Retry and batching completeness

**Secondary Focus:**
- Consistency with Story 0.4 repository constraints
- Implementability for downstream development

---

## Tasks / Subtasks

- [x] Design the core versioning flow (AC: 1, 2, 7)
  - [x] Map user actions to persistence and commit creation.
  - [x] Define commit message categories and inputs.
  - [x] Describe UI update timing relative to async git work.

- [x] Define batching and retry behavior (AC: 3, 4)
  - [x] Specify batch window, queue size, and flush triggers.
  - [x] Specify retry/backoff behavior and terminal failure states.
  - [x] Define what the user sees while work is queued or retried.

- [x] Reconcile locking and boundary behavior (AC: 5, 6, 10)
  - [x] Cross-check against the error catalog from `PRE-1.3`.
  - [x] Cross-check against Story 0.4 repository and external-storage constraints.
  - [x] Clarify where app-managed coordination stops and git-native lock behavior starts.

- [x] Publish the implementation-facing design (AC: 8, 9)
  - [x] Write the architecture document.
  - [x] Include pseudocode or module-level responsibilities.
  - [x] Make dependency assumptions explicit for downstream feature work.

---

## Dev Notes

### Relevant Context

[Source: `docs/prd/epic-1-creative-production.md`]
- Epic 1 defines auto-versioning, history, rollback, batching, retry, and commit-message expectations.
- Versioning behavior is the backbone for features 1.3, 1.4, and 1.5.

[Source: `docs/stories/0.4.git-sync-setup.md`]
- Story 0.4 already clarified repository boundaries and the local-primary backup model.
- This architecture must not reintroduce bi-directional or impossible git-tracking assumptions.

[Source: `docs/fullstack-architecture.md`]
- The architecture already points toward async, non-blocking flows and lock-based coordination.

[Source: `docs/git-integration-flow.md`]
- The dedicated architecture defines repository boundaries, the end-to-end queue and commit flow, retry/backoff policy, and the handoff boundary to later lock-strategy work.
- The document explicitly treats the creative storage repository as separate from the product source repository and keeps remote backup outside the synchronous versioning path.

### Sequencing Notes

- Execute this after `PRE-1.3`.
- `PRE-1.5` depends on this design and should refine concurrent-edit behavior rather than redefine the core git flow.
- This story is the last blocker before architecture splits into version-history and rollback implementation work.

### Testing

- This story is validated by documentation review and feasibility review rather than by automated tests.
- The final design should give `@dev` and `@qa` enough specificity to derive implementation tasks and failure-path tests without guessing.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-03 | 2.1 | PM gate passed and the story was formally closed during the pre-Epic 1 backlog wave | @po (Pax) |
| 2026-04-03 | 1.0 | Story created (PRE-1.4) | @sm (River) |
| 2026-04-03 | 1.2 | Reworked sequencing and normalized story structure to template v2 expectations | @sm (River) |
| 2026-04-03 | 2.0 | Authored the dedicated Epic 1 git integration flow architecture and prepared the story for PM quality gate review | @architect (Aria) |

---

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `Get-Content -Raw docs/stories/PRE-1.4.git-integration-flow.md`
- `Get-Content -Raw docs/error-handling-spec.md`
- `Get-Content -Raw docs/stories/0.4.git-sync-setup.md`
- `rg -n "simple-git|batch|retry|commit|rollback|index.lock|version|history|queue" docs/prd/epic-1-creative-production.md docs/fullstack-architecture.md docs/database-schema.md docs/error-handling-spec.md -S`
- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`

### Completion Notes List

- Created `docs/git-integration-flow.md` as the dedicated Epic 1 architecture artifact required by AC9.
- Defined the end-to-end path from user action to local persistence, queued versioning work, git commit execution, and UI refresh behavior.
- Specified deterministic commit message rules, a 5-second metadata batch window, queue boundaries, and retry backoff of `1s`, `3s`, and `10s`.
- Clarified the architectural boundary between the product source repository and the future creative storage repository used for Epic 1 version history.
- Made the document explicitly consistent with the `PRE-1.3` error catalog and Story `0.4` repository constraints.
- Added module responsibilities and pseudocode so downstream implementation can proceed without inventing core flow.

### File List

- `docs/git-integration-flow.md`
- `docs/stories/PRE-1.4.git-integration-flow.md`
- `docs/stories/PRE-1.4/READY_FOR_QUALITY_GATE.md`
- `.aiox/handoffs/orion-to-pm-pre-1.4-quality-gate.yaml`

---

## QA Results

Primary quality gate for this story was the assigned PM review, not a separate QA pass.

- Gate artifact: `docs/stories/PRE-1.4/PM_QUALITY_GATE.md`
- Outcome: PASS
- Closeout note: The approved git-flow architecture is now the canonical implementation baseline for Epic 1.
