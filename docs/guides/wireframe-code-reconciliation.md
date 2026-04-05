# Wireframe-Code Reconciliation

**Purpose:** Establish the canonical mapping between the new wireframe direction and the product surfaces that already exist in the repository.  
**Status:** Approved for corrective execution  
**Owner:** Shared across PO, Architect, Dev, and QA  
**Source Story:** `docs/stories/epic-0/0.8.reconciliacao-wireframe-codigo.md`

---

## Executive Decision

The project must stop treating the new wireframe as if it were starting from an empty product. The codebase already contains meaningful operational surfaces, especially:
- the Home Global project hub
- the Project Shell
- the Creative Library
- the Brand Config flow

The canonical rule from this point forward is:

1. **implemented product surfaces outrank speculative wireframe interpretation** until an explicit reconciliation decision is recorded;
2. **Creative Library is an implemented product asset** and must be integrated into the main IA;
3. **no new media experience may duplicate what the current Creative Library already solves**.

---

## Surface Matrix

| Product Surface | Current Route | Current State | Wireframe Alignment | Decision |
|---|---|---|---|---|
| Home Global / Project Selection | `/` | Implemented, functional, visually divergent from shared baseline | Partial | Keep as canonical entry hub and refactor onto the shared semantic system |
| Project Shell | `/projeto/[id]/*` | Implemented, functional skeleton, multiple placeholder pages | Partial | Keep as canonical project navigation shell and upgrade instead of replacing |
| Dashboard | `/projeto/[id]` | Placeholder content | Low | Keep route, but treat as placeholder until real dashboard work lands |
| Strategy | `/projeto/[id]/strategy` | Placeholder content | Low | Keep route, but reconcile scope against actual file/library behavior before deeper implementation |
| Media | `/projeto/[id]/media` | Placeholder content | Low | Do not build a separate media experience before Creative Library integration is decided |
| Social | `/projeto/[id]/social` | Placeholder content | Low | Keep route placeholder; no large refactor before shared IA is stable |
| Copy | `/projeto/[id]/copy` | Placeholder content | Low | Keep route placeholder; no large refactor before shared IA is stable |
| Config | `/projeto/[id]/config` | Implemented with functional baseline, visually inconsistent | Partial | Keep route and harmonize with shared system |
| Creative Library | `/creative-library` | Mature, operational, integrated with store and tests | High implementation value, low IA alignment | Treat as canonical operational asset and integrate into product architecture |
| Design System Lab | `/design-system` | Lab/reference surface | Not a product flow | Keep as internal reference, not canonical user flow |

---

## Canonical Classification

### Canonical Now
- Home Global
- Project Shell
- Config
- Creative Library

### Implemented but Placeholder
- Dashboard
- Strategy
- Media
- Social
- Copy

### Reference-Only Surface
- Design System Lab

---

## Core Architecture Decision

## Decision: Shared Creative Library architecture

The media/library experience must not be reimplemented separately under `/projeto/[id]/media` while `/creative-library` continues to evolve independently.

The recommended product architecture is:

- keep the existing **Creative Library behavior** as the operational baseline;
- extract its main workspace into a shared product component when implementation begins;
- allow `/creative-library` to remain as a global or technical workspace only if still useful;
- make `/projeto/[id]/media` consume the same core library experience in project context, instead of becoming a second library.

### Why this decision was chosen

- The current Creative Library is already tested and operational.
- The project shell media route is still mostly placeholder.
- Rebuilding media inside the project shell would duplicate logic, styling, and state paths.
- This approach preserves existing work while aligning IA with the wireframe-driven project flow.

---

## What Must Be Preserved

- Existing Redux/state behaviors already working in the Creative Library
- Existing upload, selection, metadata, and versioning flows hardened in Epic 1
- Project selection and project context model already present in the Home and Project Shell
- PT-BR baseline and repo-native design-system assets already in the repository

---

## What Must Change

- The Home and Project Shell must stop using an ad hoc visual language disconnected from the shared system.
- Shared semantic CSS classes already used in the app must be formally defined.
- Home -> Project navigation must stop using full page reload semantics.
- Project creation must stop bypassing the existing Redux thunk/hook path.
- The backlog must stop treating Media as an empty greenfield area while the Creative Library already exists.

---

## Backlog Consequences

### Story 0.9
- Complete the missing semantic CSS foundation used by current surfaces

### Story 0.10
- Unify project navigation and state flow

### Story 0.11
- Convert this architecture decision into an explicit implementation strategy for Creative Library integration

### Story 0.12
- Migrate Home and Project Shell surfaces onto the real shared design-system

### Story 0.13
- Harmonize Config and close remaining quality drift

---

## Non-Goals

- Rebuilding the Creative Library from scratch
- Inventing additional product routes not already represented in the repo
- Replacing the project shell before its canonical role is reconciled
- Treating the wireframe as a complete replacement for already working product surfaces

---

## Final Rule

From this point on, any Epic 0 or Epic 1 change that affects navigation, media/library UX, or project shell structure must first respect this reconciliation guide. If a future story contradicts it, that contradiction must be explicitly resolved in the backlog before implementation proceeds.
