# Design-System Adoption Audit

**Purpose:** Audit real adoption of the approved Epic 0 design-system across the currently implemented MVP UI  
**Audience:** UX, Dev, QA, PO  
**Status:** Approved  
**Story:** `docs/stories/epic-0/0.7.design-system-adoption-audit.md`

---

## Scope

This audit covers the currently implemented MVP UI surfaces:
- `src/pages/index.tsx`
- `src/pages/creative-library.tsx`
- `src/components/CreativeLibrary/FileList.tsx`
- `src/components/CreativeLibrary/MetadataForm.tsx`
- `src/components/CreativeLibrary/FileUploadInput.tsx`
- `src/components/atoms/OfflineIndicator.tsx`

Out of scope for this audit:
- future MVP screens not yet implemented
- backend routes and data-layer files
- `_app.tsx` and `_document.tsx` as framework scaffolding rather than product surfaces

---

## Audit Method

Each surface is classified as:
- `aligned`: follows the approved design-system baseline in practice
- `partial`: uses the design-system substantially, but still contains drift or repeated local patterns
- `non-compliant`: remains outside the approved semantic baseline in meaningful ways

Drift is grouped into these categories:
- semantic token usage
- reusable component absence
- layout shell drift
- accessibility drift
- icon-policy drift

---

## Audit Matrix

| Surface | Status | Summary | Primary Drift Categories | Expected Baseline |
|------|------|------|------|------|
| `src/pages/index.tsx` | `non-compliant` | Still uses direct `gray/white` utilities and a generic landing layout outside the semantic Epic 0 baseline | semantic token usage, layout shell drift, icon-policy drift | semantic tokens, approved typography, repo-first home surface alignment |
| `src/pages/creative-library.tsx` | `partial` | Core shell is aligned, but repeated alert, dialog, action-group, and info-block patterns remain embedded inline | reusable component absence, icon-policy drift | desktop shell classes + reusable surface wrappers |
| `src/components/CreativeLibrary/FileList.tsx` | `partial` | Uses semantic text/surface/status patterns, but still embeds repeated card/list shell composition and local motion treatment | reusable component absence, icon-policy drift | file-card/list wrappers aligned to component-library guide |
| `src/components/CreativeLibrary/MetadataForm.tsx` | `partial` | Strong semantic form and accessibility alignment, but repeated status surfaces and panel states are still local to the component | reusable component absence | metadata panel pattern + shared feedback/status surfaces |
| `src/components/CreativeLibrary/FileUploadInput.tsx` | `partial` | Primary action pattern is aligned, but the loading affordance and action grouping are still bespoke | reusable component absence, icon-policy drift | shared async action or upload action pattern |
| `src/components/atoms/OfflineIndicator.tsx` | `aligned` | Semantic status badge, live-region behavior, and naming are consistent with approved guides | none | approved sync/status baseline |

---

## Detailed Findings

### 1. Semantic Token Usage

**Compliant**
- `creative-library.tsx`, `FileList.tsx`, `MetadataForm.tsx`, and `OfflineIndicator.tsx` already rely heavily on semantic classes such as `text-text`, `bg-surface-muted`, `border-border`, and `status-badge*`

**Drift**
- `index.tsx` still uses direct utility values such as `bg-white`, `border-gray-200`, `text-gray-900`, `text-gray-600`, and `text-gray-500`
- `index.tsx` does not present itself as part of the approved desktop MVP visual system yet

### 2. Reusable Component Absence

**Confirmed repetition**
- alert and status surfaces appear inline in both `creative-library.tsx` and `MetadataForm.tsx`
- dialog shell structure appears more than once in `creative-library.tsx`
- action-group and info-card patterns are repeated in page-level UI
- atomic exports are still mostly placeholders, even though repeated UI patterns already exist

**Implication**
- the design-system is being used as classes, but not yet consistently elevated into reusable UI primitives where duplication is already meaningful

### 3. Layout Shell Drift

**Compliant**
- `creative-library.tsx` follows the approved desktop shell baseline with `desktop-app-shell`, `desktop-sidebar`, `workspace-header`, `workspace-scroll-region`, and `desktop-detail-panel`

**Drift**
- `index.tsx` remains disconnected from the shell and semantic surface language established by Epic 0

### 4. Accessibility Drift

**Strong baseline already present**
- `MetadataForm.tsx` uses explicit labels, `aria-invalid`, `aria-describedby`, and `role="alert"`
- `FileUploadInput.tsx` uses `aria-busy`
- `OfflineIndicator.tsx` uses `role="status"` and `aria-live="polite"`

**Follow-up risk**
- when repeated status and dialog patterns are extracted in Story 0.8, these semantics must be preserved rather than simplified away

### 5. Icon-Policy Drift

**Policy baseline**
- Epic 0 approved `lucide-react` as the default icon library when icons are needed

**Drift**
- current UI still relies on text surrogates and emoji-like affordances in places where icon policy should eventually be applied more intentionally
- `index.tsx` uses emoji in headline and helper copy, which is not aligned with the functional, library-first icon baseline
- some placeholder marks such as `BO`, `New`, and `Panel` remain acceptable as temporary labels, but should be evaluated in Story 0.8 rather than treated as final iconography

---

## Remediation Priority

### P0
- Remediate `src/pages/index.tsx` to the approved semantic baseline
- Remove direct gray/white utility drift where approved semantic equivalents already exist

### P1
- Extract shared alert/status surface patterns used across `creative-library.tsx` and `MetadataForm.tsx`
- Extract reusable dialog shell structure from `creative-library.tsx`
- Normalize repeated action-group and shell/info-card structures where duplication is already meaningful

### P2
- Normalize icon-policy adoption for current UI affordances
- Update atomic exports to reflect real reusable components introduced during remediation
- Reduce remaining local composition drift in `FileList.tsx` and `FileUploadInput.tsx`

---

## Final Status by Category

| Category | Status | Notes |
|------|------|------|
| Semantic token baseline | `partial` | Strong in Creative Library, weak on home page |
| Reusable component maturity | `partial` | Real repetition exists, but extraction has not happened yet |
| Desktop shell alignment | `partial` | Strong in Creative Library, absent on home page |
| Accessibility baseline | `aligned` | Current drift is mostly about preservation through remediation |
| Icon-policy adoption | `partial` | Policy exists, but current UI still uses ad hoc surrogates |

---

## Recommendation for Story 0.8

Story 0.8 should execute in this order:
1. Remediate `src/pages/index.tsx`
2. Extract shared feedback/status surfaces
3. Extract shared dialog shell structure
4. Normalize repeated action-group and shell support patterns
5. Update atomic exports and tests to reflect the new reusable baseline

This audit is the source of truth for Story 0.8 remediation scope and Story 0.9 compliance review.
