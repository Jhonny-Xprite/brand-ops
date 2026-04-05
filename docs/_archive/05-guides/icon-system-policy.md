# Icon System Policy

**Purpose:** Define the icon policy for the Brand-Ops desktop MVP  
**Audience:** UX, Dev, QA  
**Status:** In Review  
**Story:** `docs/stories/epic-0/0.6.icon-system.md`

---

## Overview

This guide defines the MVP icon policy for Brand-Ops. The goal is consistency and implementation speed, not a bespoke icon program.

The icon system is intentionally:
- library-first
- desktop MVP scoped
- functional rather than expressive
- implementation-friendly for Tailwind + shadcn/ui workflows

---

## Approved Base Library

### Primary Choice

**Approved MVP library:** `lucide-react`

### Why this library

- It aligns naturally with shadcn/ui usage patterns
- It is lightweight and already familiar in the chosen stack
- It covers the common action, navigation, file, and status metaphors needed in the MVP
- It avoids the cost and governance overhead of a custom icon set

### Policy

- New implementation stories should use `lucide-react` by default when icons are needed
- Do not introduce multiple icon libraries without an explicit exception
- Do not draw or commission custom icons for the MVP unless a real workflow gap is proven

---

## Approved MVP Coverage

The base set must cover the needs of current Epic 1 and MVP operational flows.

### Navigation and Shell

- Library
- Dashboard
- Settings
- Search
- Filter
- Grid view
- List view
- More actions / overflow

### File and Content Workflows

- Image
- Video
- Document
- Carousel or collection surrogate
- Upload / add
- Edit metadata
- History / timeline
- Restore / rollback
- Export / download

### Status and System Feedback

- Online / connected
- Offline / disconnected
- Success
- Warning
- Error
- Info
- Sync / refresh
- Pending / queue

If a workflow needs an icon outside this set, the implementation story should first check whether Lucide already has a close semantic match before requesting anything custom.

---

## Naming Rules

- Use library export names directly when the icon stays close to its semantic meaning
- Prefer semantic wrapper names only when the app meaning differs from the raw icon name
- Keep design naming and code naming aligned

### Examples

| Use Case | Preferred Naming |
|------|------|
| Search field icon | `Search` |
| Offline status icon | `WifiOff` or equivalent semantic wrapper |
| Success state icon | `CheckCircle` or semantic status wrapper |
| Export action icon | `Download` or semantic export wrapper |

Avoid creating design-only names that do not map cleanly to code.

---

## Size, Stroke, and Spacing Rules

### Approved Sizes

- `14px` for compact inline support usage
- `16px` for default control and status usage
- `20px` for prominent actions or section headers when needed
- `24px` only for larger empty states or summary surfaces

### Stroke Rule

- Use the library default stroke unless a specific accessibility or visual consistency reason requires change
- Keep stroke weight consistent within the same surface

### Placement Rules

- Icons inside buttons should align with text baselines and keep readable spacing
- Leading icons should not crowd labels
- Status icons should appear with supporting text, not as the only indicator
- Decorative icons should not be added just to fill empty space

---

## Accessibility Rules

### Decorative Icons

- Mark decorative icons as hidden from assistive technology
- Do not rely on decorative icons to communicate required meaning

### Meaningful Icons

- Pair meaningful icons with visible text whenever possible
- Icon-only controls require an accessible name
- Status icons must be supported by text labels or status messaging

### State Communication

- Icon + color alone is not enough for success, warning, or error states
- Pair iconography with semantic text and, when needed, live region messaging

---

## Exception Path for Custom Icons

Custom icons are not a default MVP deliverable.

An exception may be opened only when all of the following are true:
- a real workflow need exists in an approved story
- `lucide-react` does not provide a usable semantic match
- the icon meaning is important enough to justify governance overhead
- UX and Dev agree on naming, accessibility behavior, and maintenance ownership

### Required record for an exception

- workflow context
- missing concept
- why the base library is insufficient
- proposed name
- accessibility behavior
- owner for implementation and maintenance

---

## Current Repo Alignment

The current repository uses almost no formal icon infrastructure yet, which is acceptable for this story.

Current alignment points:
- `OfflineIndicator` already behaves as a semantic status surface, even before a formal icon library is introduced
- Component guides already require icon accessibility rules for meaningful vs decorative usage
- The frontend specification already prefers library-first icon adoption

This story formalizes the policy so future implementation stories can adopt icons consistently without inventing a custom icon program.
