# Desktop Layout System

**Purpose:** Define desktop-only layout rules for the Brand-Ops MVP shell and core work surfaces  
**Audience:** UX, Dev, QA  
**Status:** In Review  
**Story:** `docs/stories/epic-0/0.3.layout-system-responsive.md`

---

## Overview

This guide documents the desktop layout system for the Brand-Ops MVP. It translates the frontend specification into implementation-oriented shell patterns, spacing rules, and overflow behavior for the repository codebase.

The layout system is intentionally:
- desktop-only for MVP
- offline-first and low-friction
- optimized for persistent navigation and side-by-side work
- focused on operational clarity rather than responsive marketing layouts

It does not define mobile-first breakpoints, tablet acceptance criteria, or touch-first interaction assumptions.

---

## Desktop Window Ranges

| Range | Width | Intent |
|------|------|------|
| Compact desktop | `1024px - 1279px` | Keep persistent navigation, reduce panel widths, preserve core editing flow |
| Standard desktop | `1280px - 1439px` | Default working layout for daily browsing and metadata editing |
| Wide desktop | `1440px+` | Add comfortable whitespace and fuller detail-panel width |

These ranges are implementation targets, not marketing breakpoints.

---

## Primary Shell Patterns

### 1. Sidebar + Main

**Use for**
- dashboard overview
- settings
- sync monitoring
- sections without an always-open detail panel

**Structure**
- persistent left navigation
- main workspace with sticky header
- one primary scroll region in the content area

### 2. Sidebar + Main + Detail Panel

**Use for**
- creative library browsing with metadata editing
- version inspection with side context
- flows where selection changes the supporting panel without route churn

**Structure**
- persistent left navigation
- main browsing workspace
- right detail panel with independent scroll

**Behavior by range**
- Compact desktop: detail panel narrows but remains available
- Standard desktop: detail panel supports full metadata editing comfortably
- Wide desktop: detail panel widens for longer forms and richer status context

### 3. Main + Supporting Panels

**Use for**
- dashboard + timeline
- analytics or activity views
- sync and export status overviews

**Structure**
- primary content area
- summary/support cards arranged beside or below based on density
- keep timeline or activity stream readable before decorative balance

### 4. Modal Overlay

**Use for**
- rollback confirmation
- export confirmation
- blocking maintenance or destructive decisions

**Rule**
- modal overlays supplement the desktop shell; they do not replace it as the primary layout mode

---

## Shell Sizing Guidance

| Area | Compact | Standard | Wide |
|------|------|------|------|
| Sidebar | `240px` | `248px` | `256px` |
| Detail Panel | `320px` | `352px` | `384px` |
| Workspace Padding | `24px` | `32px` | `40px` |

Implementation should preserve these relationships even if exact pixel values vary slightly.

---

## Context Layout Rules

### Creative Library

**Default pattern**
- sidebar + main + detail panel

**Rules**
- search, filters, and view toggle live in the sticky workspace header
- results region owns the primary scroll
- metadata panel owns its own scroll and does not steal main scroll behavior
- drag-and-drop overlay sits above the workspace only, not over the entire app shell

### Metadata Editing

**Default pattern**
- detail panel stays attached to the selected item context

**Rules**
- form footer actions remain visible at the bottom of the panel when possible
- long forms scroll inside the panel, not inside the full page
- validation stays close to the edited field

### Dashboard and Timeline

**Default pattern**
- sidebar + main
- supporting summary cards above or beside the timeline based on available width

**Rules**
- timeline prefers horizontal room over ornamental spacing
- summary cards should wrap before forcing unreadable chart widths
- sticky filters are acceptable when they reduce long-scroll friction

### Sync and Settings

**Default pattern**
- sidebar + main
- main content may split into a primary settings column plus support/status column

**Rules**
- maintenance actions must stay visually separated from passive status cards
- storage, sync health, and export states should not compete in one dense card wall

---

## Overflow and Scroll Rules

- The app shell itself should not create competing document scrollbars when a local scroll region can be owned more clearly
- The main workspace uses one primary scroll region below the header
- Detail panels use independent vertical scroll
- Sidebars should remain readable without horizontal scroll
- Grid and table surfaces must declare containment explicitly; no accidental viewport overflow
- Empty states and drag overlays should respect shell padding rather than edge-to-edge floating

---

## Sticky Behavior

- Workspace headers may be sticky when filters or summary state need to remain visible
- Sticky behavior must not hide content under the header
- Detail panel action areas may be pinned when this improves long-form editing
- Sticky sidebars are optional because the app shell is already persistent in desktop layouts

---

## Density Guidance

### Compact Desktop
- Use tighter gaps, but keep controls at comfortable desktop sizes
- Prefer two-row filter bars over cramped single-row controls
- Preserve the detail panel rather than forcing route-based editing

### Standard Desktop
- This is the baseline density for implementation and QA review
- Most controls, cards, and panel widths should be tuned here first

### Wide Desktop
- Add breathing room to panels and content gutters
- Do not inflate every control size; prefer spacing gains over component enlargement

---

## Implementation Mapping

The repository uses semantic shell classes to express this system:

| Layout Need | Semantic Class |
|------|------|
| Desktop app shell | `.desktop-app-shell` |
| Desktop sidebar | `.desktop-sidebar` |
| Workspace area | `.desktop-workspace` |
| Sticky workspace header | `.workspace-header` |
| Main scroll region | `.workspace-scroll-region` |
| Detail panel | `.desktop-detail-panel` |
| Filter bar grid | `.filter-bar-grid` |
| Drop overlay | `.dropzone-overlay` / `.dropzone-card` |

These classes are intended as implementation seeds for future wrappers and layout components.

---

## Accessibility Notes

- Focus order should follow visual reading order: sidebar -> header controls -> workspace -> detail panel
- Sticky headers must preserve visible focus rings and not clip keyboard outlines
- Scrollable regions should remain understandable to screen reader and keyboard users
- Drag-and-drop overlays must not hide the underlying state without clear text feedback

---

## Repo Deliverables for Story 0.3

- Desktop window range documentation
- Shell pattern guidance for main MVP contexts
- Overflow, sticky, and density rules
- Semantic shell classes applied to the Creative Library page

The repo guide is the implementation-facing source of truth; any future external design workspace must mirror these layout names rather than redefining them.
