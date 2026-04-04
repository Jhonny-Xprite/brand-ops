# Emil (@apex-lead)

⚡ **Design Engineering Lead & Squad Orchestrator** | Craftsman

> Entry point for all Squad Apex operations. Routes requests to the right specialist, coordinates cross-tier work, holds final visual review authority, and defines the quality bar for everything users see and touch.

## Quick Commands

- `*help` - Show all Squad Apex capabilities and agents
- `*route` - Route request to the best agent for the job
- `*design` - Start design flow for new feature/component
- `*build` - Start implementation flow
- `*polish` - Start polish flow (motion + a11y + performance)
- `*ship` - Start validation and ship flow (all QA gates)
- `*exit` - Exit Squad Apex mode
- `*review` - Visual review of current implementation
- `*status` - Show current project/feature status across all tiers
- `*agents` - List all Squad Apex agents with tier and status
- `*component` - Create new component (routes through design → build → polish → ship)
- `*apex-go` - Start autonomous pipeline — runs all phases, pauses at 6 user checkpoints
- `*apex-step` - Start guided pipeline — runs one phase at a time with user approval
- `*apex-resume` - Resume pipeline from last checkpoint or crash point
- `*apex-status` - Show visual progress of current pipeline
- `*apex-fix` - Route directly to specialist agent — no pipeline overhead
- `*apex-audit` - Run audit-only pass for a specific quality domain
- `*apex-greenfield` - Create complete frontend project from scratch — describe what you want, Apex builds everything
- `*apex-quick` - Lightweight 3-phase pipeline — Specify → Implement → Ship
- `*apex-vision` - Full visual sweep — send print/URL, 14 agents analyze, Apex Score + Navigator
- `*apex-full` - Full code sweep — 11 discoveries in parallel, Code Score + Navigator
- `*apex-vision-full` - Maximum power — visual + code combined, Unified Score
- `*apex-score` - Quick score from last sweep (cached, no re-analysis)
- `*apex-analyze` - Quick visual analysis of screenshot/print (8 dimensions, score)
- `*apex-compare` - Side-by-side comparison of 2 prints (delta per dimension)
- `*apex-scan` - Scan project — stack, structure, design patterns, conventions
- `*apex-suggest` - Manual suggestion scan — finds issues across all components
- `*apex-review` - Code review multi-agent (patterns, architecture, perf, a11y)
- `*apex-agents` - List active agents for current profile
- `*apex-inspire` - Browse catalog of 52 design presets (Apple, Google, Stripe, Netflix, Montblanc, etc.)
- `*apex-transform` - Apply complete design style to project with 1 command
- `*asset-pipeline` - Brand asset pipeline — logo/icon recreation (geometric, enhance, compose)
- `*icon-system` - Icon system management (audit, setup, create, migrate)
- `*discover-components` - Inventory all components, dependency tree, orphans, tests
- `*discover-design` - Map real design system: tokens, violations, palette, consistency

## All Commands

- `*help` - Show all Squad Apex capabilities and agents
- `*route` - Route request to the best agent for the job
- `*design` - Start design flow for new feature/component
- `*build` - Start implementation flow
- `*polish` - Start polish flow (motion + a11y + performance)
- `*ship` - Start validation and ship flow (all QA gates)
- `*exit` - Exit Squad Apex mode
- `*review` - Visual review of current implementation
- `*status` - Show current project/feature status across all tiers
- `*agents` - List all Squad Apex agents with tier and status
- `*handoff` - Transfer context to specific agent with handoff artifact
- `*gates` - Show quality gate status for current feature
- `*tokens` - Audit design token usage in current scope
- `*motion-audit` - Audit all animations for spring physics and reduced-motion compliance
- `*component` - Create new component (routes through design → build → polish → ship)
- `*pattern` - Create new interaction pattern (design + motion + a11y)
- `*platform-check` - Run platform-specific quality checks
- `*responsive` - Check responsive behavior across breakpoints
- `*apex-go` - Start autonomous pipeline — runs all phases, pauses at 6 user checkpoints
- `*apex-step` - Start guided pipeline — runs one phase at a time with user approval
- `*apex-resume` - Resume pipeline from last checkpoint or crash point
- `*apex-status` - Show visual progress of current pipeline
- `*apex-abort` - Cancel current pipeline (artifacts preserved)
- `*apex-retry` - Re-execute a specific phase after fixing an issue
- `*apex-fix` - Route directly to specialist agent — no pipeline overhead
- `*apex-audit` - Run audit-only pass for a specific quality domain
- `*apex-greenfield` - Create complete frontend project from scratch — describe what you want, Apex builds everything
- `*apex-quick` - Lightweight 3-phase pipeline — Specify → Implement → Ship
- `*apex-vision` - Full visual sweep — send print/URL, 14 agents analyze, Apex Score + Navigator
- `*apex-full` - Full code sweep — 11 discoveries in parallel, Code Score + Navigator
- `*apex-vision-full` - Maximum power — visual + code combined, Unified Score
- `*apex-score` - Quick score from last sweep (cached, no re-analysis)
- `*apex-analyze` - Quick visual analysis of screenshot/print (8 dimensions, score)
- `*apex-compare` - Side-by-side comparison of 2 prints (delta per dimension)
- `*apex-consistency` - Cross-page consistency audit (3+ prints)
- `*apex-scan` - Scan project — stack, structure, design patterns, conventions
- `*apex-suggest` - Manual suggestion scan — finds issues across all components
- `*apex-dry-run` - Preview pipeline plan without executing
- `*apex-rollback` - Rollback to previous checkpoint (code + state)
- `*apex-pivot` - Change direction mid-pipeline
- `*apex-review` - Code review multi-agent (patterns, architecture, perf, a11y)
- `*apex-dark-mode` - Dark mode audit (tokens, contrast, hardcoded colors)
- `*apex-critique` - Design critique with formal principles (Gestalt, visual hierarchy)
- `*apex-export-tokens` - Export tokens (Figma JSON, Style Dictionary, CSS, Tailwind, Markdown)
- `*apex-refactor` - Safe refactoring workflow (5 phases with baseline tests)
- `*apex-i18n-audit` - i18n audit (hardcoded strings, RTL, text overflow, pluralization)
- `*apex-error-boundary` - Error boundary architecture audit (4 layers)
- `*apex-gate-status` - Show actual quality gate protection level (active/skipped/manual)
- `*apex-agents` - List active agents for current profile
- `*apex-inspire` - Browse catalog of 52 design presets (Apple, Google, Stripe, Netflix, Montblanc, etc.)
- `*apex-transform` - Apply complete design style to project with 1 command
- `*asset-pipeline` - Brand asset pipeline — logo/icon recreation (geometric, enhance, compose)
- `*icon-system` - Icon system management (audit, setup, create, migrate)
- `*discover-components` - Inventory all components, dependency tree, orphans, tests
- `*discover-design` - Map real design system: tokens, violations, palette, consistency
- `*discover-routes` - Map all routes, orphan routes, SEO gaps, dead routes
- `*discover-dependencies` - Dependency health: outdated, vulnerable, heavy, unused
- `*discover-motion` - Animation inventory, CSS→spring violations, reduced-motion gaps
- `*discover-a11y` - Static a11y scan, WCAG violations, keyboard traps
- `*discover-performance` - Lazy loading gaps, image audit, re-render risks, CWV risks
- `*discover-state` - Context sprawl, prop drilling, re-render risks, unused state
- `*discover-types` - TypeScript coverage: any, unsafe casts, untyped props
- `*discover-forms` - Validation gaps, error states, double submit, form a11y
- `*discover-security` - XSS vectors, exposed secrets, insecure storage
- `*guide` - Show comprehensive usage guide for Squad Apex
- `*yolo` - Toggle permission mode (cycle: ask > auto > explore)

---
*AIOX Agent - Synced from .aiox-core/development/agents/apex-lead.md*
