# Accessibility Compliance

**Purpose:** Define accessible defaults for the Brand-Ops desktop MVP design system  
**Audience:** UX, Dev, QA  
**Status:** In Review  
**Story:** `docs/stories/epic-0/0.5.accessibility-compliance.md`

---

## Overview

This guide documents the accessibility baseline for the Brand-Ops desktop MVP. It turns the frontend specification into implementation-oriented rules that can be verified in code review, QA, and future component work.

The goal is to make accessibility a system default, not a late visual pass.

This guide is scoped to:
- desktop workflows
- keyboard and assistive technology compatibility
- WCAG AA-oriented defaults
- reduced-motion-safe interactions

---

## Contrast Rules

### Text and Surface Expectations

- Primary text on primary surfaces must meet WCAG AA contrast for normal text
- Muted/supporting text must still remain readable against the surface it sits on
- Status surfaces must pair readable text with sufficient border/surface contrast
- Focus rings must be visible against both neutral surfaces and action-heavy regions

### Token-Level Guidance

The current semantic baseline should be used as the minimum accessible pairing:

| Pairing | Intent |
|------|------|
| `text-default` on `surface-default` | Main readable UI text |
| `text-muted` on `surface-default` or `surface-muted` | Secondary text only when still legible |
| `text-inverse` on `action-primary` | Primary action label |
| `status-*` text on `status-*-surface` | Status badges and inline state feedback |
| `focus-ring` on all interactive surfaces | Keyboard-visible focus treatment |

### Contrast Audit Rule

When introducing a new semantic token or component variant:
- verify normal text contrast
- verify focus ring visibility
- verify disabled treatment does not erase legibility
- verify status meaning is not color-only

---

## Keyboard and Focus Rules

### Global Expectations

- Every interactive element must be reachable by keyboard
- Focus order must follow the desktop shell reading order
- Focus indicators must remain visible with `focus-visible`
- Keyboard operation cannot depend on hover-only affordances

### Component Family Expectations

| Family | Keyboard Rule |
|------|------|
| Buttons | Trigger with `Enter` and `Space` where native button behavior applies |
| Inputs / Selects / Textareas | Reachable by tab order with visible focus ring |
| Tabs | Support arrow-key navigation when implemented as a tabset |
| Dialogs | Trap focus, support `Escape`, restore focus to trigger |
| File list/grid items | Support directional navigation where desktop browsing benefits from it |
| Filter controls | Preserve logical tab order from search to sort/view controls |

### Shell-Level Focus Order

Recommended desktop order:
1. Sidebar navigation
2. Workspace header controls
3. Main results region
4. Detail panel controls

Sticky headers and split panels must not visually hide the currently focused control.

---

## Forms, Labels, and Error Messaging

### Labels

- Every form control must have a persistent accessible name
- Visual labels should be explicitly associated to controls where possible
- Placeholder text is supportive only and must not replace labels

### Validation

- Errors must be shown near the field that caused them
- Error text must be programmatically associated through `aria-describedby` when practical
- Invalid controls should expose `aria-invalid="true"`

### Assistive Text

- Helper text should clarify expected format, limits, or local-only behavior
- Character counts should not be the only signal of a limit risk
- Required fields should be visually and semantically clear

---

## Screen Reader Rules

### Status and Live Regions

- Connection and sync status changes should use polite live regions unless urgent interruption is required
- Save, upload, and sync feedback should be announced when the user needs confirmation or remediation

### Icons

- Decorative icons must be hidden from assistive technology
- Meaningful icons must be paired with text or accessible labels
- Icon-only controls require `aria-label`

### Dialogs and Overlays

- Dialog titles and purpose must be announced clearly
- Drop overlays should provide text feedback, not just visual treatment
- Modal content must not rely on background context remaining accessible

---

## Motion and Reduced Motion

### Rules

- Motion must help orientation, not decorate the interface
- Hover zoom, shake, fade, and slide patterns must degrade safely under reduced-motion preferences
- Reduced motion should remove transform-heavy or repeated animations first

### Current Scope

For the MVP shell:
- error shake should be disabled when reduced motion is requested
- drag/drop and panel transitions should avoid motion dependence
- hover scale on preview cards should not be required to understand state

---

## QA Checklist

- Text contrast and focus visibility are verified on all primary surfaces
- Keyboard-only navigation can reach shell, filters, results, and panel controls
- Form labels remain available without placeholder text
- Error feedback is visible and associated to the relevant control
- Status updates provide screen-reader-friendly text
- Decorative icons are hidden from assistive technology
- Reduced-motion preference removes non-essential animation

---

## Current Repo Alignment

The repository already contains accessibility-relevant patterns that should remain the baseline:
- semantic focus ring usage in shared button and field classes
- `role="status"` and `aria-live="polite"` in `OfflineIndicator`
- keyboard navigation in `FileList`
- explicit metadata control labels and validation messaging in `MetadataForm`

This guide formalizes those patterns for future component work and QA review.
