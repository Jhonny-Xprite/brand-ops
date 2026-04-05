# Design Specification and Developer Handoff

**Purpose:** Provide one repo-first handoff package for implementing the Brand-Ops desktop MVP design system  
**Audience:** UX, Dev, QA  
**Status:** In Review  
**Story:** `docs/stories/epic-0/0.4.design-specification-handoff.md`

---

## Handoff Contract

This guide is the implementation-facing handoff package for Epic 0. It consolidates the approved decisions from the supporting guides into one place so future stories can build against a stable contract.

The handoff contract is intentionally:
- repo-first
- desktop MVP scoped
- mapped to Tailwind CSS and shadcn/ui
- explicit about accessibility and QA expectations

External design tooling may mirror this package later, but it is not part of the Epic 0 definition of done.

---

## Source of Truth Map

| Concern | Primary Artifact | Implementation Anchor |
|------|------|------|
| Foundation tokens | `docs/guides/design-system-foundation.md` | `src/styles/globals.css`, `tailwind.config.js` |
| Component families | `docs/guides/component-library-design.md` | Current seed wrappers in `src/components/` |
| Desktop shell patterns | `docs/guides/desktop-layout-system.md` | `src/styles/globals.css`, `src/pages/creative-library.tsx` |
| Accessibility defaults | `docs/guides/accessibility-compliance.md` | Shared classes and form/status components |
| Icon policy | `docs/guides/icon-system-policy.md` | `lucide-react` dependency baseline |

Use this guide to understand how the artifacts connect. Use the linked guides when a story needs deeper family-specific detail.

---

## Token Naming and Export Reference

### CSS Variable Baseline

Tokens are authored in `src/styles/globals.css` using CSS variables:

| Token Group | Examples | Implementation Use |
|------|------|------|
| Surfaces | `--surface-canvas`, `--surface-default`, `--surface-muted` | App backgrounds, cards, panels, subdued containers |
| Text | `--text-default`, `--text-muted`, `--text-inverse` | Standard copy, helper text, inverse action labels |
| Borders | `--border-default`, `--border-strong` | Control borders, panel separation |
| Actions | `--action-primary`, `--action-primary-hover`, `--action-secondary` | Primary and secondary button states |
| Status | `--status-success`, `--status-warning`, `--status-error`, `--status-info` | Operational feedback and status surfaces |
| Shape and depth | `--radius-sm`, `--radius-md`, `--radius-lg`, `--shadow-sm`, `--shadow-md` | Shared component curvature and elevation |
| Typography | `--font-sans`, `--font-display`, `--font-mono` | UI reading, headings, IDs and hashes |

### Tailwind Mapping

The semantic CSS variables are exported into Tailwind in `tailwind.config.js`:

| CSS Variable | Tailwind Token | Typical Usage |
|------|------|------|
| `--surface-default` | `bg-surface` | cards, inputs, panels |
| `--surface-muted` | `bg-surface-muted` | helper surfaces, filter strips |
| `--text-default` | `text-text` | primary text |
| `--text-muted` | `text-text-muted` | secondary text |
| `--border-default` | `border-border` | standard control borders |
| `--action-primary` | `bg-action-primary` | primary button background |
| `--status-error` | `text-status-error` | inline error text and states |

Prefer semantic tokens and shared classes over hardcoded one-off color utilities in new implementation stories.

---

## Component Hierarchy and Naming

### Naming Rules

- Reuse code terminology when it already exists in the repo.
- Prefer component family + variant naming over design-only labels.
- Keep state names implementation-friendly: `default`, `hover`, `focus-visible`, `disabled`, `loading`, `error`, `selected`, `active`.

### Approved Mapping

| Design Term | Code Term | Stack Direction | Notes |
|------|------|------|------|
| Primary Button | `Button` variant `primary` or `.btn-primary` | shadcn `Button` or thin wrapper | Primary actions only |
| Secondary Button | `Button` variant `secondary` or `.btn-secondary` | shadcn `Button` or thin wrapper | Dismissive and secondary flows |
| Ghost Button | `Button` variant `ghost` or `.btn-ghost` | shadcn `Button` or thin wrapper | Utility shell actions |
| Text Input | `Input` or `.input-field` | shadcn `Input` or wrapper | Use explicit labels |
| Textarea | `Textarea` or `.textarea-field` | shadcn `Textarea` or wrapper | Validation remains inline |
| Metadata Panel | `MetadataForm` or future `MetadataPanel` | panel wrapper + form primitives | Detail-panel editing pattern |
| File Browser Card | `FileCard` or list/grid row wrapper | wrapper composition | Selected state must differ from active |
| Sync Status | `OfflineIndicator` or future `SyncStatusBadge` | wrapper with status text + icon | Status must not be icon-only |
| Rollback Dialog | `Dialog` pattern | shadcn `Dialog` | Restore focus to trigger |

---

## State Rules by Family

### Universal States

Every interactive family should account for:
- `default`
- `hover`
- `focus-visible`
- `disabled`
- `loading` when async
- `error` when validation or system failure applies

### Desktop-Specific States

- Browsing surfaces should distinguish `selected` from `active`.
- Detail panel actions must remain usable inside split layouts.
- Sticky controls cannot hide visible focus treatment.
- Dense desktop layouts may reduce spacing, but not remove state clarity.

---

## Layout and Shell Mapping

| Layout Need | Semantic Class | Primary Surface |
|------|------|------|
| App shell | `.desktop-app-shell` | Desktop-only shell layouts |
| Sidebar | `.desktop-sidebar` | Navigation and filter rail |
| Workspace | `.desktop-workspace` | Main browsing or dashboard area |
| Sticky header | `.workspace-header` | Search, filters, and summary actions |
| Main scroll region | `.workspace-scroll-region` | Results and primary content |
| Detail panel | `.desktop-detail-panel` | Metadata editing and side context |
| Drop overlay | `.dropzone-overlay`, `.dropzone-card` | Upload interaction feedback |

Treat `src/pages/creative-library.tsx` as the current reference implementation for this shell contract.

---

## Accessibility Implementation Notes

| Family | Required Behavior |
|------|------|
| Buttons and controls | Visible `focus-visible`, keyboard reachable, no hover-only actions |
| Forms | Explicit labels, `aria-invalid` on invalid state, `aria-describedby` for helper/error text |
| Dialogs | Focus trap, `Escape` support, return focus to trigger |
| Status surfaces | Text label accompanies color and icon, use live region when status changes matter |
| Icon-only controls | Must include `aria-label` |
| Motion | Respect reduced-motion preferences for non-essential animation |

When in doubt, the accessibility guide is the tie-breaker for implementation and QA.

---

## Implementation Checklist for `@dev`

- Use semantic tokens or shared semantic classes before introducing new styling primitives.
- Prefer shadcn/ui primitives or thin project wrappers over bespoke component systems.
- Match design names to existing code terms where possible.
- Reuse the approved desktop shell classes for split-panel and workspace flows.
- Apply accessibility semantics during implementation, not as a late pass.
- Use `lucide-react` as the default icon library when icons are needed.
- Document any new variant, wrapper, or exception in the corresponding guide or story.

---

## QA Handoff Checklist

- Token names used in implementation map back to the approved semantic baseline.
- Component states match the documented family rules.
- Desktop shell behavior matches the approved layout patterns.
- Accessibility semantics are present in code, not only in design notes.
- Icon usage follows the approved library-first policy.
- No implementation story reintroduces mobile-first, collaboration, or premium-brand scope.

---

## Delivery Boundaries

- This story does not require UX to ship production React components directly.
- This story does require implementation-ready documentation with code-facing naming.
- Repo guides are the source of truth for Epic 0 handoff.
- External design work is optional follow-on work and must not block MVP execution.
