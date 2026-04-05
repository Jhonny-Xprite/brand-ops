# Guides Index

**Purpose:** Track repo-based guides that support implementation and QA  
**Status:** Active  
**Owner:** Shared across UX, Dev, and QA

---

## Available Guides

| Guide | Purpose | Owner | Status |
|------|------|------|------|
| `design-system-foundation.md` | Semantic token foundation for the desktop MVP | `@ux-design-expert` | Approved |
| `component-library-design.md` | Component inventory, state rules, and stack mapping for Epic 1 | `@ux-design-expert` | Approved |
| `desktop-layout-system.md` | Desktop shell patterns, window ranges, and overflow guidance for MVP work surfaces | `@ux-design-expert` | Approved |
| `accessibility-compliance.md` | WCAG AA-oriented defaults for contrast, keyboard, labeling, and reduced motion | `@ux-design-expert` | Approved |
| `icon-system-policy.md` | Library-first MVP icon policy, sizing rules, and exception path for custom icons | `@ux-design-expert` | Approved |
| `design-specification-handoff.md` | Consolidated implementation handoff across tokens, components, layout, accessibility, and icons | `@ux-design-expert` | Approved |
| `design-system-adoption-audit.md` | Audit matrix of current design-system adoption across implemented MVP UI surfaces | `@ux-design-expert` | Approved |
| `wireframe-code-reconciliation.md` | Canonical mapping between the new wireframe direction and the implemented product surfaces | `@po` | Approved |
| `creative-library-product-integration.md` | Canonical architecture guide for integrating Creative Library into the project-centric product flow | `@architect` | Approved |

---

## How to Use These Guides

### UX
- Keep the repo guides as the canonical naming and grouping source
- Keep component families scoped to the MVP flows already defined in the PRD

### Dev
- Reuse semantic classes and token names before introducing new one-off styling
- Prefer shadcn/ui primitives or thin project wrappers over bespoke component systems

### QA
- Validate states, accessibility notes, and naming against these guides during story review
- Treat these guides as the local source of truth when external design artifacts lag behind

---

## Relationship to Epic 0

- Story 0.1 establishes the token foundation
- Story 0.2 defines the component library structure
- Story 0.3 defines the desktop shell and layout behavior
- Story 0.4 consolidates the repo-first handoff contract for implementation and QA
- Story 0.5 defines the accessibility baseline for implementation and QA
- Story 0.6 defines the MVP icon policy and custom-icon exception path
- Story 0.7 audits real design-system adoption across the current implemented MVP UI
- Story 0.8 reconciles the new wireframe with the implemented project hub, project shell, and Creative Library
- Story 0.9 completes the shared semantic CSS layer required by the current Home, Project Shell, and Creative Library surfaces
- Story 0.11 defines the canonical integration path between Creative Library and the project media route

---

## Next Additions

Planned future guides should only be added when backed by an approved story or epic deliverable.
