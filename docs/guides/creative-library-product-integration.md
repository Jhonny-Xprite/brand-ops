# Creative Library Product Integration

**Purpose:** Define the canonical role of Creative Library in the product architecture and prevent duplicate media experiences.  
**Status:** Approved for implementation planning  
**Owner:** Shared across Architect, PO, Dev, and QA  
**Source Story:** `docs/stories/epic-0/0.11.integracao-creative-library-arquitetura-produto.md`

---

## Executive Decision

Brand-Ops will adopt a **shared Creative Library workspace strategy**.

The canonical product rule is:

1. `/creative-library` remains the current operational baseline for the library experience;
2. `/projeto/[id]/media` must not evolve as a second, bespoke media browser;
3. the long-term product architecture is a **shared workspace composition** that can serve both the global route and the project-context route.

This is the same strategic direction recommended during Story 0.8, now converted into an explicit implementation contract for the backlog.

---

## Canonical Surface Roles

### `/creative-library`
- Current operational baseline
- Holds the most mature implementation of upload, selection, metadata, and versioning flows
- May remain as a global or technical workspace while the shared composition is extracted

### `/projeto/[id]/media`
- Canonical project-context entry point for media in the final IA
- Must evolve by consuming the shared library experience
- Must not become a separate greenfield implementation with its own file-browser logic

### Shared Workspace Target
- The intended steady state is a reusable `CreativeLibraryWorkspace`-style composition
- It should encapsulate the core browse, select, metadata, and versioning experience
- Route-specific chrome can differ, but the operational library flow must be shared

---

## Architecture Choice

## Decision: Option C

Adopt **Option C: shared component/workspace used in both contexts**.

The rejected alternatives were:

- **Option A: keep `/creative-library` as the only meaningful route forever**
  - Rejected because product IA still needs a coherent media entry inside the project shell

- **Option B: rebuild media fully under `/projeto/[id]/media`**
  - Rejected because it duplicates the existing mature Creative Library and recreates state, tests, and UI for no product gain

Option C preserves implementation value while still aligning the product to the project-centric navigation model.

---

## Immediate Product Contract

Until the shared workspace extraction is implemented:

- `/creative-library` is the operational source of truth for the library flow
- `/projeto/[id]/media` should act as an integration surface, not as a second library
- any project-media implementation work must reuse the Creative Library behavior instead of cloning it

This temporary split is an **accepted exception**, not the final architecture.

---

## Implementation Phases

### Phase 1: Architecture Freeze
- Record the canonical decision in repo-first documentation
- Update backlog dependencies so future stories cannot drift back into duplicate media work
- Adjust current placeholder media route to reflect the canonical direction

### Phase 2: Shared Workspace Extraction
- Extract the main Creative Library composition from `src/pages/creative-library.tsx`
- Preserve Redux contracts, upload behavior, metadata editing, and versioning flow
- Keep route-specific chrome separate from the shared operational workspace

### Phase 3: Project Context Consumption
- Mount the shared library experience inside `/projeto/[id]/media`
- Add project-context framing without forking the library implementation
- Only introduce project-specific filtering when the data model and metadata rules support it cleanly

---

## Constraints

- Do not create a second upload flow for project media
- Do not create a separate metadata editor for project media
- Do not fork versioning UI between global and project routes
- Do not promise project-scoped file isolation until the data model supports it explicitly

---

## Backlog Impact

### Story 0.12
- Must treat Home, Project Shell, and project media as consumers of the shared design-system and the shared library architecture
- Must not redesign `/projeto/[id]/media` as a bespoke browser

### Story 0.13
- Must keep any config/upload harmonization compatible with the shared library direction

### Legacy Story 0.6
- The original greenfield media assumptions are no longer canonical
- Any future implementation under Story 0.6 must follow this guide and reuse the shared library path

---

## Product Owner Validation

**PO Outcome:** PASS  
**Date:** 2026-04-04

The backlog is now aligned around a single media/library strategy:
- protect the existing Creative Library investment
- keep the project shell as the long-term product IA
- bridge the two through a shared workspace, not duplicate implementation

---

## Final Rule

Any future story that changes media, library, upload, metadata, or versioning behavior must respect this guide. If a story proposes a second media implementation, that proposal is considered invalid until explicitly reconciled in the backlog.
