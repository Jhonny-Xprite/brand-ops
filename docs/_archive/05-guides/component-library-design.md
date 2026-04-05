# Component Library Design

**Purpose:** Define the MVP-scoped component library for the Brand-Ops desktop application  
**Audience:** UX, Dev, QA  
**Status:** In Review  
**Story:** `docs/stories/epic-0/0.2.component-library-design.md`

---

## Overview

This guide documents the local component inventory for the desktop MVP and maps each family to the implementation stack already chosen by the project: semantic tokens, Tailwind CSS, and shadcn/ui primitives or thin project wrappers.

The library is intentionally limited to the surfaces required by Epic 1:
- creative browser
- metadata editing
- version history
- rollback confirmation
- sync status
- export feedback

The library does not include collaboration-only widgets, mobile-first variants, or branding-only showcase components.

---

## Component Families

### Form Controls

| Family | MVP Use | States | Stack Mapping |
|------|------|------|------|
| Text Input | Search, tags, filters | default, hover, focus-visible, disabled, error | `Input` primitive or project wrapper using `.input-field` |
| Textarea | Metadata notes, export notes | default, hover, focus-visible, disabled, error | `Textarea` primitive or wrapper using `.textarea-field` |
| Select | Asset type, status, export options | default, open, hover, focus-visible, disabled, error | `Select` primitive or native fallback wrapped with semantic classes |
| Checkbox | Bulk actions, filters | default, checked, indeterminate, focus-visible, disabled | shadcn `Checkbox` |
| Radio Group | View toggles, mode choice | default, checked, focus-visible, disabled | shadcn `RadioGroup` |
| Switch | Optional preferences | default, checked, focus-visible, disabled | shadcn `Switch` |
| Tag Input | Metadata tags | idle, typing, remove-tag, error, disabled | project wrapper composed from `Input` + badge/chip pattern |

### Actions

| Family | MVP Use | States | Stack Mapping |
|------|------|------|------|
| Primary Button | Save, upload, confirm rollback, export | default, hover, focus-visible, disabled, loading | shadcn `Button` with primary variant or `.btn-primary` wrapper |
| Secondary Button | Cancel, close, secondary flows | default, hover, focus-visible, disabled | shadcn `Button` secondary variant or `.btn-secondary` wrapper |
| Ghost Button | Utility actions in panels and shells | default, hover, focus-visible, disabled | shadcn `Button` ghost variant or `.btn-ghost` wrapper |
| Icon Button | View toggles, quick actions | default, hover, focus-visible, disabled, tooltip | shadcn `Button` icon-size variant |
| Loading Button | Save or upload in progress | loading, disabled, success handoff | project wrapper around button + spinner state |

### Shell and Navigation

| Family | MVP Use | States | Stack Mapping |
|------|------|------|------|
| App Sidebar | Primary navigation and filters | default, collapsed if later approved, active item, focus-visible | project wrapper using desktop shell layout |
| Top Bar | Search, status, global actions | default, sticky, focus-within | project wrapper |
| Tabs | Browser sections and detail tabs | default, active, hover, focus-visible, disabled | shadcn `Tabs` |
| Breadcrumbs | File/context trail when needed | default, hover, focus-visible | shadcn `Breadcrumb` or lightweight wrapper |

### Data Display

| Family | MVP Use | States | Stack Mapping |
|------|------|------|------|
| Card | File card, panel card, summary card | default, hover, selected, active, disabled | project wrapper using `.surface-card` |
| List Row | File list row, timeline row | default, hover, selected, active, focus-visible | project wrapper |
| Table Surface | Dense desktop metadata views | default, sortable, selected row, empty | wrapper around semantic table pattern |
| Badge | Status, state, file type | neutral, success, warning, error, info | project wrapper using `.status-badge*` |
| Chip | Tags and small filters | default, removable, selected | wrapper around badge pattern |
| Empty State | Browser and panel zero states | default only | project wrapper using `.empty-state` |
| Skeleton | Loading placeholders | idle, animated | shadcn `Skeleton` |

### Feedback

| Family | MVP Use | States | Stack Mapping |
|------|------|------|------|
| Alert | Validation and blocking errors | info, warning, error, success | shadcn `Alert` or wrapper |
| Toast | Save/export/sync confirmation | info, success, warning, error | shadcn `Toast` |
| Modal/Dialog | Rollback confirmation, destructive steps | open, focus-trap, loading, error | shadcn `Dialog` |
| Progress | Upload/export progress | determinate, indeterminate, complete | shadcn `Progress` |
| Sync Status | Online/offline and sync state | online, offline, syncing, failed | project wrapper using badge + icon/text |

### Epic 1 Specializations

| Component | MVP Use | Stack Mapping |
|------|------|------|
| File Browser Card | Grid browsing of assets | card wrapper + badge + icon/button slots |
| Metadata Panel | Edit metadata fields and actions | panel shell + form primitives + action buttons |
| Version Timeline | Version history and rollback path | list row wrapper + badge + dialog trigger |
| Rollback Dialog | Confirm revert action | shadcn `Dialog` with primary/secondary actions |
| Export State Panel | Export progress and result feedback | alert/progress/card composition |

---

## State and Variant Rules

Every interactive family must define and preserve:
- default
- hover
- focus-visible
- disabled
- loading when async
- error when validation or system failure applies

Desktop-specific expectations:
- selected and active states must remain distinct in file browsing components
- keyboard focus must remain visible during grid and list navigation
- compact density may be supported, but not at the expense of readability

---

## Accessibility Notes

- Form controls require persistent labels; placeholders are supportive only
- Error states must pair color with text feedback
- Icon-only buttons require `aria-label`
- Dialogs must trap focus and restore it to the trigger
- Status badges must not be the only source of meaning for critical states
- Timeline and file selection controls must support keyboard navigation
- Toasts should not interrupt focus unless the interaction is blocking

---

## Naming and Code Terminology

Design naming should mirror implementation naming whenever possible:

| Design Term | Code Term |
|------|------|
| Primary Button | `Button` variant `primary` |
| Secondary Button | `Button` variant `secondary` |
| Ghost Button | `Button` variant `ghost` |
| Metadata Panel | `MetadataForm` or future `MetadataPanel` wrapper |
| File Browser Card | `FileCard` wrapper within browser views |
| Sync Status | `OfflineIndicator` or future `SyncStatusBadge` |

Avoid design-only naming that has no code equivalent.

---

## Current Repo Alignment

The repository already contains early MVP component implementations that should be treated as seed wrappers, not final bespoke patterns:
- `src/components/CreativeLibrary/FileList.tsx`
- `src/components/CreativeLibrary/MetadataForm.tsx`
- `src/components/CreativeLibrary/FileUploadInput.tsx`
- `src/components/atoms/OfflineIndicator.tsx`

Story 0.2 normalizes these toward the semantic design-system classes introduced in Story 0.1 so the future library can converge instead of fragment.

---

## Repo Deliverables for Story 0.2

- Component inventory and stack mapping in repo docs
- Family-level state, accessibility, and naming guidance
- Semantic class alignment for current Epic 1 seed components

This guide is implementation-ready on its own; any future external design workspace must mirror this family structure and naming model rather than replacing it.
