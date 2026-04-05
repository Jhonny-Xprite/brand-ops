# Brand-Ops MVP - Frontend Specification

**Versao:** 1.1.0  
**Status:** Ready for Architecture Review  
**Autora:** Uma (UX-Design Expert)  
**Data:** 2026-04-04  
**Linguagem:** Portugues (Brasil)

---

## Executive Summary

This specification defines the **desktop frontend for the Brand-Ops MVP**. It is aligned to the current product source of truth:
- internal tool
- single-user
- offline-first
- desktop-only for MVP
- functional and minimalist visual direction

The frontend exists to help one operator browse, organize, edit metadata, review history, monitor sync, and export assets with low friction and low ambiguity.

**Primary UX priorities**
- Fast search and filtering across local data
- Metadata editing with low cognitive load
- Version history visibility
- Clear sync and offline status
- Predictable export and backup flows
- Accessibility and implementation consistency

**Technology direction:** Next.js 14 + React 18 + SQLite local + Tailwind CSS + shadcn/ui + offline-first patterns

---

## Product Alignment Rules

This document must remain consistent with:
- `docs/project-brief.md`
- `docs/prd/brand-ops-mvp.md`
- `.aiox-core/constitution.md`

### Explicit product constraints
- The MVP is desktop-only. Mobile and tablet are future considerations, not MVP acceptance criteria.
- The UI direction is functional and restrained, not luxury or high-ticket branding work.
- The design-system supports implementation; it does not redefine product scope.
- Collaboration-focused patterns are out of MVP unless later approved in product artifacts.

---

## User Persona and Jobs

### Primary Persona: Brand Operator

- Works alone most of the time
- Uses the app as an internal operational tool
- Often works offline
- Needs confidence that files, metadata, and version history are organized

### Jobs-to-be-done
1. Organize creative output in one place
2. Find assets quickly using search and metadata filters
3. Edit metadata without context switching
4. Review version history and restore safely
5. Monitor sync and export data when needed

---

## Information Architecture

### Application Shell

```
Brand-Ops
├── Navigation
│   ├── Creative Library
│   ├── Strategy
│   ├── Media Library
│   ├── Social Assets
│   ├── Copy & Messaging
│   └── Settings
├── Main Workspace
│   ├── Browser or Dashboard Surface
│   ├── Filters and Search
│   └── Detail / Metadata Surface
└── Status Area
    ├── Offline / online status
    ├── Last sync
    └── Queue / export feedback
```

### Core browsing patterns
- Browse library -> inspect item -> edit metadata -> save
- Search query -> refine by filters -> inspect result -> act
- Open version history -> compare current vs prior state -> restore if needed
- Check sync status -> inspect issues -> retry or continue offline

---

## Core Screens

### Screen 1: Creative Library Browser

**Purpose:** Primary desktop workspace for browsing and organizing assets.

**Key elements**
- Sidebar navigation
- Search field
- Filter bar
- View toggle (grid/list)
- Sort controls
- Main results region
- Metadata/detail panel on selection

**Primary actions**
- Browse by folder or section
- Search by name, notes, and metadata
- Filter by type, status, tags, and date
- Open item details
- Edit metadata
- View version history
- Start export-related actions

### Screen 2: Dashboard and Timeline

**Purpose:** Show production activity and status at a glance.

**Key elements**
- Summary cards
- Timeline visualization
- Status summary
- Quick filters

**Primary actions**
- Adjust date range
- Filter by type or status
- Jump from timeline to filtered library results

### Screen 3: Settings and Sync

**Purpose:** Monitor sync, storage health, exports, and app preferences.

**Key elements**
- Sync status card
- Storage usage
- Export options
- Density and basic interface preferences
- Maintenance actions

**Primary actions**
- Review sync state and logs
- Trigger manual sync
- Trigger export
- Review storage usage

---

## Desktop Layout System

The MVP is not mobile-first. Layout behavior is defined for desktop windows only.

### Desktop window ranges
- **Compact desktop:** 1024-1279px
- **Standard desktop:** 1280-1439px
- **Wide desktop:** 1440px+

### Layout patterns
- **Sidebar + main** for standard browsing
- **Sidebar + main + detail panel** for metadata editing
- **Main + supporting panels** for dashboard/timeline contexts
- **Modal overlays** for rollback, export confirmation, and blocking decisions

### Behavior rules
- Navigation remains persistent at desktop sizes
- Detail panel may collapse in compact desktop but remains available without route loss
- Tables and grids must define overflow behavior explicitly
- Sticky controls are allowed when they reduce scrolling friction

---

## UI Components and Design-System Scope

The design-system should cover the MVP and Epic 1 workflows without inventing collaboration or mobile needs.

### Atoms
- Button
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Chip
- Icon
- Label
- Skeleton

### Molecules
- Search box
- Filter chip bar
- Form field
- Status summary card
- File card
- Sync status row

### Organisms
- File grid
- File list
- Metadata panel
- Filter panel
- Timeline section
- Settings sync section

### Specializations for Epic 1
- File browser card
- Metadata editor panel
- Version timeline
- Rollback dialog
- Export feedback state

---

## Design-System Foundations

### Visual direction

Brand-Ops uses a **functional MVP visual language**:
- neutral surfaces
- strong readability
- restrained use of accent color
- clear status semantics
- minimal decoration

The goal is operational clarity, not premium or luxury signaling.

### Color system

Use semantic tokens rather than aesthetic marketing labels.

**Suggested baseline tokens**
- Primary: blue-based action color for clear affordances
- Neutral surfaces: white / slate / gray ranges for structure and legibility
- Success: green
- Warning: amber
- Error: red
- Info: cyan or blue secondary tone

### Typography

- Sans-serif primary for UI reading
- Monospace for hashes, IDs, version references, and file metadata
- Clear hierarchy for page title, section heading, field label, body, caption

### Spacing

- 4px base scale
- Consistent internal padding across controls and panels
- Enough whitespace for desktop readability without a "luxury" framing

### Radius and elevation

- Small, medium, and large radius tokens
- Light elevation used only to separate layers, not as decorative style

---

## Stack Mapping

The design-system must be described in terms the implementation team can use directly.

### Required mapping
- Tokens -> semantic Tailwind variables/classes
- Components -> shadcn/ui primitive or wrapper candidate
- States -> default, hover, focus, disabled, error, loading
- Accessibility rules -> labels, focus, keyboard, aria-live, reduced-motion

### Example mapping expectations
- Button -> shadcn button variants + project variants
- Input / textarea / select -> shadcn form primitives
- Dialog -> shadcn dialog
- Toast -> shadcn toast
- Tabs -> shadcn tabs
- Table -> project wrapper with desktop overflow guidance

---

## Interaction Patterns

### Metadata editing
- Selecting an item opens the detail panel
- Save behavior must be clear and non-destructive
- Validation and error feedback stay close to the edited field

### Filtering
- Filters should be combinable without visual clutter
- Active filters remain visible
- Clear-all behavior is always available

### Version navigation
- Current version must be obvious
- Restore flow must be explicit and safe
- History presentation should favor readability over decoration

### Sync feedback
- Status must always be understandable at a glance
- Offline mode is a supported working state, not just an error state
- Retry and log access should be easy to discover

---

## Accessibility Requirements

### Keyboard
- All interactive elements must be reachable and operable by keyboard
- Focus order must follow layout logic
- Dialogs must trap focus correctly and close predictably

### Screen readers
- Inputs require labels
- Dynamic status changes need accessible announcements where appropriate
- Decorative icons should be hidden from assistive tech

### Contrast and perception
- Text contrast must satisfy WCAG AA
- Focus indication must be visible without relying on color alone
- Status must not depend on color alone

### Motion
- Motion must respect `prefers-reduced-motion`
- Motion is used for clarity, not brand theatrics

---

## Technical Constraints

### Offline-first behavior
- Core browsing and metadata editing must work offline
- Sync state must reflect queued or pending work clearly
- No UI flow should assume immediate network availability

### Performance targets

| Operation | Target |
|-----------|--------|
| App start (cold) | <2s |
| App start (warm) | <500ms |
| Load 1K files | <2s |
| Search/filter | <500ms |
| Combine filters | <300ms |
| Chart render | <400ms |

---

## Implementation Priorities

### Priority 1
- Tokens
- Shell layout
- Search/filter patterns
- File card and metadata panel
- Sync and status feedback

### Priority 2
- Timeline and dashboard components
- Export-related feedback states
- Handoff refinements for Epic 2+

### Future, not MVP criteria
- Mobile layouts
- Tablet specs
- Premium positioning language
- Collaboration indicators such as avatars
- Design-led custom icon system beyond proven need

---

## Design Decisions Log

### Decision 1: Desktop-only MVP
**Why:** Product artifacts define the MVP as a desktop offline-first tool.  
**Impact:** No mobile-first or tablet acceptance criteria in the design-system.

### Decision 2: Functional minimal visual direction
**Why:** The brief explicitly frames this as an internal operational tool, not a premium positioning exercise.  
**Impact:** Tokens and visual guidance emphasize clarity, consistency, and implementation speed.

### Decision 3: Stack-aligned component design
**Why:** The repo already standardizes on Tailwind + shadcn/ui.  
**Impact:** Handoff must map designs to primitives and wrappers instead of generic snippets only.

### Decision 4: Library-first icons
**Why:** MVP does not require a bespoke icon program.  
**Impact:** Adopt a base library and only add custom assets when a concrete gap exists.

---

## Related Documents

- [Product Requirements Document](prd/brand-ops-mvp.md)
- [Project Brief](project-brief.md)
- [Epic 0 PRD](prd/epic-0-design-system.md)
- [Coding Standards](coding-standards.md)
- [Storage & Sync Strategy](storage-sync-strategy.md)

---

**Documento atualizado por:** Codex  
**Status:** Aligned to desktop MVP and AIOX traceability  
**Proximo:** Use this spec as the visual source of truth for corrected Epic 0 stories
