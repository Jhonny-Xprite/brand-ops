# Design System Foundation

**Purpose:** Define the local, versioned design-system foundation for the Brand-Ops desktop MVP  
**Audience:** UX, Dev, QA  
**Status:** In Review  
**Story:** `docs/stories/epic-0/0.1.design-system-foundation.md`

---

## Overview

This guide documents the semantic token foundation for the desktop MVP. It is the repo-based handoff artifact for Story 0.1 and part of the source-of-truth package consolidated by the design handoff guide.

The foundation is intentionally:
- desktop-first
- functional and minimalist
- aligned with Tailwind + shadcn/ui
- semantic rather than aesthetic-only

---

## Visual Direction

- Brand-Ops MVP uses neutral surfaces with clear action emphasis
- Primary actions use a restrained blue system for clarity and affordance
- Status colors communicate operational state: success, warning, error, info
- Typography and spacing optimize legibility and implementation consistency
- The foundation does not use premium/luxury positioning rules

---

## Semantic Tokens

### Surfaces

| Token | Purpose | Value |
|------|---------|-------|
| `surface-canvas` | App background | `slate-50` |
| `surface-default` | Cards, panels, primary surfaces | `white` |
| `surface-muted` | Soft section backgrounds | `slate-100` |
| `surface-subtle` | Dividers or subdued accents | `slate-200` |

### Text

| Token | Purpose | Value |
|------|---------|-------|
| `text-default` | Main content | `slate-900` |
| `text-muted` | Supporting content | `slate-600` |
| `text-inverse` | Text on solid actions | `slate-50` |

### Borders and Focus

| Token | Purpose | Value |
|------|---------|-------|
| `border-default` | Standard control/panel border | `slate-300` |
| `border-strong` | Stronger separation | `slate-400` |
| `focus-ring` | Keyboard focus ring | `blue-600` |

### Actions

| Token | Purpose | Value |
|------|---------|-------|
| `action-primary` | Primary buttons and key actions | `blue-600` |
| `action-primary-hover` | Hover for primary actions | `blue-700` |
| `action-secondary` | Secondary button background | `white` |
| `action-secondary-hover` | Hover for secondary actions | `slate-50` |

### Status

| Token | Purpose |
|------|---------|
| `status-success` | Online, completed, healthy |
| `status-warning` | Pending, caution, queued |
| `status-error` | Offline, failed, blocked |
| `status-info` | Informational system feedback |

---

## Typography Roles

| Role | Font | Usage |
|------|------|-------|
| Display / Page Title | `Sora` | Main page headings |
| Section Heading | `Sora` | Panel and section headers |
| Body | `Inter` | Standard reading content |
| Label | `Inter` medium | Form and field labels |
| Helper Text | `Inter` | Supporting text and guidance |
| Monospace | `Fira Code` fallback stack | IDs, hashes, version refs |

---

## Spacing and Radius

### Spacing Scale

- `4px` micro spacing
- `8px` compact internal spacing
- `12px` helper spacing
- `16px` standard spacing
- `24px` section spacing
- `32px` panel spacing
- `48px` large section separation

### Radius Scale

- `radius-sm` = 6px
- `radius-md` = 8px
- `radius-lg` = 12px

---

## Default States

Every interactive component family should define:
- default
- hover
- focus-visible
- disabled
- error where applicable
- loading where applicable

Focus must use the semantic `focus-ring` token and remain visible without relying on color alone.

---

## Implementation Mapping

### CSS / Tailwind layer

- Tokens live in `src/styles/globals.css`
- Semantic naming should be preferred over one-off color literals
- Shared classes should define the baseline for common action and status patterns

### shadcn/ui alignment

- Button primitives map to `btn-primary` and `btn-secondary` behavior
- Dialog, toast, tabs, and form primitives should consume these same semantic tokens
- Future wrappers should reuse semantic token names in props, docs, and tests

---

## Accessibility Notes

- Primary and secondary action states must maintain visible focus treatment
- Status surfaces should combine color with text labels
- Text/background combinations must remain WCAG AA compliant
- Decorative icons should not carry required meaning on their own

---

## Repo Deliverables for Story 0.1

- Semantic token foundation in `src/styles/globals.css`
- Tailwind-aligned design guidance in repo docs
- Local handoff artifact for UX/Dev/QA review

This guide is implementation-ready on its own; any future external design workspace must follow this naming and structure rather than redefining it.
