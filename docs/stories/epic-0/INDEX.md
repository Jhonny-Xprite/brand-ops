# EPIC 0: Desktop MVP Design System Foundation - Stories Index

**Status:** In Progress  
**Owner:** @ux-design-expert (Uma)  
**Timeline:** 5 weeks total (extension adds 2 weeks)  
**Total Effort:** 121 hours  
**Last Updated:** 2026-04-04

---

## Purpose

This index tracks the corrected Epic 0 story set after scope normalization. Epic 0 now exists to support the **desktop MVP only**, using the repo's existing Tailwind + shadcn/ui direction and the operational story structure already used elsewhere in the project.

The original foundation package in Stories 0.1-0.6 is complete. The new extension Stories 0.7-0.9 exist to verify and enforce **real adoption of that design-system in the implemented MVP UI**.

---

## Story Overview

### Story 0.1: Design System Foundation (15h)
**Owner:** @ux-design-expert  
**Status:** Done  
**Link:** [0.1.design-system-foundation.md](0.1.design-system-foundation.md)

**Delivers:**
- Semantic tokens
- Visual rules for desktop MVP
- Foundation guidance for implementation

### Story 0.2: Component Library Design (30h)
**Owner:** @ux-design-expert  
**Status:** Done  
**Link:** [0.2.component-library-design.md](0.2.component-library-design.md)

**Delivers:**
- MVP-scoped component inventory
- Stack mapping to shadcn/ui or project wrappers
- Accessibility and state rules per family

### Story 0.3: Desktop Layout System (10h)
**Owner:** @ux-design-expert  
**Status:** Done  
**Link:** [0.3.layout-system-responsive.md](0.3.layout-system-responsive.md)

**Delivers:**
- Desktop window-size patterns
- App shell layout rules
- Overflow and density guidance

### Story 0.4: Design Specification and Developer Handoff (10h)
**Owner:** @ux-design-expert  
**Status:** Done  
**Link:** [0.4.design-specification-handoff.md](0.4.design-specification-handoff.md)

**Delivers:**
- Handoff mapped to Tailwind + shadcn/ui
- Token and component naming guidance
- Implementation and QA checklists

### Story 0.5: Accessibility Audit and Compliance (8h)
**Owner:** @ux-design-expert  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.5.accessibility-compliance.md](0.5.accessibility-compliance.md)

**Delivers:**
- WCAG AA guidance
- Keyboard/focus rules
- Accessible form and icon guidance

### Story 0.6: Icon System Policy (6h)
**Owner:** @ux-design-expert  
**Status:** Done  
**Link:** [0.6.icon-system.md](0.6.icon-system.md)

**Delivers:**
- Library-first icon policy
- Naming, size, and accessibility rules
- Exception path for future custom icons

### Story 0.7: Design-System Adoption Audit (10h)
**Owner:** @ux-design-expert  
**Status:** Done  
**Link:** [0.7.design-system-adoption-audit.md](0.7.design-system-adoption-audit.md)

**Delivers:**
- Repo-first audit matrix of current design-system adoption
- Classification of aligned, partial, and non-compliant surfaces
- Remediation priority order for implementation

### Story 0.8: Design-System Remediation and Component Extraction (24h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.8.design-system-remediation.md](0.8.design-system-remediation.md)

**Delivers:**
- Remediated design-system usage in current MVP UI
- Pragmatic component extraction for repeated patterns
- Updated atomic exports and reduced UI drift

### Story 0.9: Design-System Compliance QA Gate (8h)
**Owner:** @qa  
**Quality Gate:** @po  
**Status:** Ready  
**Link:** [0.9.design-system-compliance-gate.md](0.9.design-system-compliance-gate.md)

**Delivers:**
- Formal compliance review against the approved Epic 0 guides
- Reusable compliance checklist or QA artifact
- Final gate decision on design-system adoption

---

## Execution Order

### Week 1
- Story 0.1: Design System Foundation
- Story 0.2: Component Library Design starts

### Week 2
- Story 0.2: Continue component coverage
- Story 0.3: Desktop Layout System
- Story 0.4: Handoff structure starts

### Week 3
- Story 0.4: Finalize developer handoff
- Story 0.5: Accessibility audit
- Story 0.6: Icon system policy

### Week 4
- Story 0.7: Design-System Adoption Audit
- Story 0.8: Remediation planning handoff

### Week 5
- Story 0.8: Design-System Remediation and Component Extraction
- Story 0.9: Design-System Compliance QA Gate

---

## Relationship to Epic 1

Epic 0 now supports Epic 1 without expanding product scope.

**Epic 1 surfaces that must be covered by Epic 0**
- File browser card
- Metadata panel
- Version timeline
- Rollback dialog
- Sync status
- Export feedback states

**Epic 0 no longer claims**
- Mobile-first design
- Tablet acceptance criteria
- Premium positioning work
- Collaboration-focused components
- Mandatory custom icon production

**Epic 0 extension now adds**
- Adoption governance for currently implemented MVP UI
- Repo-first audit of actual design-system usage
- Remediation of design drift already present in the codebase
- Formal QA gate for real-world compliance

---

## AIOX Governance Checklist

- [x] All stories use the repo's operational structure
- [x] All stories include `Dev Agent Record`
- [x] All stories include `File List`
- [x] All stories include `QA Results`
- [x] All stories are traceable to brief, PRD MVP, or frontend spec
- [x] No story invents mobile, premium-brand, or collaboration scope

---

## Deliverables Checklist

- [x] Repo-based foundation and component handoff guides
- [x] Desktop layout rules
- [x] Token mapping notes for implementation
- [x] Component mapping to stack primitives
- [x] Accessibility checklist
- [x] Icon policy
- [x] QA-ready handoff notes
- [x] Design-system adoption audit matrix
- [x] Design-system remediation pass on current MVP UI
- [ ] Compliance checklist and final QA gate

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-04 | 1.7 | Executed Story 0.8, remediated current MVP UI drift, and moved the extension to the final compliance gate | Codex |
| 2026-04-04 | 1.6 | Executed Story 0.7, published the design-system adoption audit, and moved the extension into active remediation | Codex |
| 2026-04-04 | 1.5 | Added Stories 0.7-0.9 for design-system adoption governance, remediation, and compliance gating | Codex |
| 2026-04-04 | 1.4 | Completed Story 0.4 handoff package, aligned repo-first artifacts, and closed Epic 0 execution | Codex |
| 2026-04-04 | 1.3 | Recorded QA PASS for Stories 0.1, 0.2, 0.3, 0.5, and 0.6; Epic 0 now waits on Story 0.4 handoff completion | Codex |
| 2026-04-04 | 1.2 | Removed Figma as a blocker, promoted 0.1 and 0.2 to QA, and updated Epic 0 next actions | Codex |
| 2026-04-04 | 1.1 | Rewritten for desktop-only MVP scope and AIOX-aligned story governance | Codex |
| 2026-04-04 | 1.0 | Index created | @ux-design-expert |

---

**Epic 0 Owner:** @ux-design-expert (Uma)  
**Status:** In Progress  
**Next Action:** Execute Story 0.9 to perform the formal design-system compliance gate on the remediated MVP UI
