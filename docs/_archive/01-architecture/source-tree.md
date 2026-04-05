# Source Tree & Project Structure

**Document:** Complete source code map + directory structure  
**Status:** Development Reference  
**Date:** 2026-04-03  
**Owner:** @architect (Aria)  

---

## 📁 Directory Structure (MVP)

```
brand-ops/
│
├── .claude/                        # Claude Code configuration
│   ├── CLAUDE.md                   # Claude-specific rules
│   ├── rules/                      # Context-aware rules
│   │   ├── agent-authority.md
│   │   ├── coderabbit-integration.md
│   │   └── ids-principles.md
│   └── settings.json               # Permission rules
│
├── .aiox/                          # AIOX Framework (governance)
│   ├── environment-report.json     # Setup verification
│   ├── PROJECT-EXECUTION-LOG.md    # Phase tracking
│   ├── PO-VALIDATION-REPORT.md     # Quality gate
│   └── BOOTSTRAP.md                # Bootstrap process
│
├── docs/                           # Documentation
│   ├── project-brief.md            # Problem context + vision
│   ├── front-end-spec.md           # UI/UX specification
│   ├── fullstack-architecture.md   # Complete system design
│   ├── deep-research-report.md     # Market validation
│   ├── storage-sync-strategy.md    # Storage architecture
│   ├── source-tree.md              # (this file)
│   ├── tech-stack.md               # Tech decisions
│   ├── coding-standards.md         # Dev guidelines
│   ├── prd/
│   │   ├── brand-ops-mvp.md        # Master PRD
│   │   ├── epic-1-creative-production.md
│   │   ├── epic-2-search-filtering.md
│   │   ├── epic-3-timeline-analytics.md
│   │   ├── epic-4-sync-versioning.md
│   │   ├── epic-5-exports.md
│   │   ├── epic-6-database-schema.md
│   │   ├── epic-7-offline-first.md
│   │   └── tech-decisions.md
│   ├── research/
│   │   └── market-research-award-winners.md
│   ├── architecture/                # (Phase 3 - generated)
│   │   ├── api-design.md
│   │   ├── database-schema.md
│   │   └── deployment.md
│   ├── qa/
│   │   ├── test-plan.md
│   │   ├── acceptance-criteria.md
│   │   └── coderabbit-reports/
│   │       └── (reports auto-generated)
│   └── guides/
│       ├── getting-started.md
│       ├── development-workflow.md
│       └── troubleshooting.md
│
├── packages/                       # Monorepo workspaces (Phase 3)
│   └── web/                        # Next.js 14 app
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── prisma/
│       │   ├── schema.prisma       # Database schema
│       │   └── migrations/         # Schema versions
│       ├── src/
│       │   ├── app/                # Next.js app router
│       │   │   ├── layout.tsx       # Root layout
│       │   │   ├── page.tsx         # Home page
│       │   │   ├── dashboard/       # Dashboard route
│       │   │   ├── library/         # Creative library
│       │   │   ├── settings/        # Settings page
│       │   │   └── api/             # API routes (local)
│       │   │       ├── creatives/
│       │   │       ├── metadata/
│       │   │       └── sync/
│       │   ├── components/          # React components (atomic design)
│       │   │   ├── atoms/           # Base components
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Card.tsx
│       │   │   │   └── ...
│       │   │   ├── molecules/       # Combined components
│       │   │   │   ├── FormField.tsx
│       │   │   │   ├── FilterChip.tsx
│       │   │   │   ├── FileCard.tsx
│       │   │   │   └── ...
│       │   │   ├── organisms/       # Complex UI sections
│       │   │   │   ├── CreativeGrid.tsx
│       │   │   │   ├── FilterBar.tsx
│       │   │   │   ├── MetadataEditor.tsx
│       │   │   │   ├── VersionTimeline.tsx
│       │   │   │   └── ...
│       │   │   └── templates/       # Page layouts
│       │   │       ├── LibraryLayout.tsx
│       │   │       └── DashboardLayout.tsx
│       │   ├── lib/                 # Utilities + helpers
│       │   │   ├── db.ts            # Prisma client singleton
│       │   │   ├── api.ts           # API client
│       │   │   ├── git.ts           # Git integration
│       │   │   ├── rclone.ts        # Sync integration
│       │   │   ├── validation.ts    # Data validation
│       │   │   └── utils.ts         # Misc utilities
│       │   ├── hooks/               # Custom React hooks
│       │   │   ├── useCreatives.ts  # Fetch creatives
│       │   │   ├── useSearch.ts     # Search logic
│       │   │   ├── useOffline.ts    # Offline detection
│       │   │   └── ...
│       │   ├── store/               # Redux store
│       │   │   ├── index.ts         # Store config
│       │   │   ├── slices/
│       │   │   │   ├── creativeSlice.ts
│       │   │   │   ├── metadataSlice.ts
│       │   │   │   ├── versionsSlice.ts
│       │   │   │   ├── settingsSlice.ts
│       │   │   │   └── syncSlice.ts
│       │   │   ├── api/             # RTK Query endpoints
│       │   │   │   ├── creativeApi.ts
│       │   │   │   ├── metadataApi.ts
│       │   │   │   └── versionApi.ts
│       │   │   └── hooks.ts         # Redux selectors
│       │   ├── contexts/            # React contexts
│       │   │   ├── SearchContext.tsx
│       │   │   ├── ViewContext.tsx
│       │   │   └── FileUploadContext.tsx
│       │   ├── styles/              # Global styles
│       │   │   ├── globals.css      # Tailwind globals
│       │   │   ├── tokens.css       # Design tokens (Violet+Gold)
│       │   │   └── animations.css   # Reusable animations
│       │   ├── types/               # TypeScript types
│       │   │   ├── index.ts         # All types
│       │   │   └── api.ts           # API response types
│       │   ├── services/            # Business logic
│       │   │   ├── creativeService.ts
│       │   │   ├── syncService.ts
│       │   │   ├── exportService.ts
│       │   │   └── versionService.ts
│       │   └── public/              # Static assets
│       │       ├── icons/
│       │       ├── images/
│       │       └── fonts/
│       ├── tests/                   # Test files (mirror src/)
│       │   ├── components/
│       │   ├── lib/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── integration/
│       ├── .env.example             # Environment template
│       ├── .env.local               # Local secrets (gitignored)
│       └── README.md                # Package-specific readme
│
├── squads/                         # Team organization (optional)
│   ├── frontend/
│   │   └── README.md               # Frontend squad notes
│   └── backend/
│       └── README.md               # Backend squad notes
│
├── tests/                          # E2E and integration tests
│   ├── e2e/
│   │   ├── creative-flow.test.ts   # Create → Edit → Search → Export
│   │   ├── offline.test.ts         # Offline mode tests
│   │   └── sync.test.ts            # Sync with Drive tests
│   └── integration/
│       ├── git.test.ts
│       ├── rclone.test.ts
│       └── database.test.ts
│
├── qa/                             # QA artifacts
│   ├── test-plan.md                # Complete test plan
│   ├── test-cases/
│   │   ├── epic-1-cases.md
│   │   ├── epic-2-cases.md
│   │   └── ...
│   ├── coderabbit-reports/         # Auto-generated
│   │   └── (reports by PR)
│   └── bug-log.md                  # Known issues
│
├── bin/                            # Scripts + CLI
│   ├── setup.sh                    # Dev environment setup
│   ├── dev.sh                      # Start dev server
│   ├── build.sh                    # Build for production
│   └── test.sh                     # Run all tests
│
├── .gitignore                      # Git ignore rules
├── .env.example                    # Environment template
├── .eslintrc.json                  # Linting rules
├── .prettierrc.json                # Code formatting
├── tsconfig.json                   # TypeScript config (root)
├── package.json                    # Root dependencies
├── package-lock.json               # Dependency lock
├── README.md                        # Project overview
└── CLAUDE.md                        # Claude Code config (this project)
```

---

## 🗂️ Key Files & Their Purpose

### Configuration Files

| File | Purpose | Owner |
|------|---------|-------|
| `package.json` | Dependencies + scripts | @dev |
| `tsconfig.json` | TypeScript configuration | @architect |
| `.eslintrc.json` | Code linting rules | @qa |
| `.prettierrc.json` | Code formatting | @qa |
| `prisma/schema.prisma` | Database schema | @data-engineer |
| `.env.example` | Environment variables template | @dev |
| `.env.local` | Secrets (gitignored) | Developer |

### Documentation Files

| File | Purpose | Owner |
|------|---------|-------|
| `README.md` | Project overview | @architect |
| `docs/project-brief.md` | Problem context | @analyst |
| `docs/front-end-spec.md` | UI/UX specification | @ux-design-expert |
| `docs/prd/epic-*.md` | Feature specifications | @pm |
| `docs/tech-stack.md` | Technology decisions | @architect |
| `docs/coding-standards.md` | Development guidelines | @qa |
| `docs/source-tree.md` | This file | @architect |

### Source Code Structure

| Path | Purpose | Language |
|------|---------|----------|
| `src/app/` | Next.js routes | TypeScript + React |
| `src/components/` | React components (atomic) | TypeScript + React |
| `src/store/` | Redux state + RTK Query | TypeScript |
| `src/lib/` | Utility functions | TypeScript |
| `src/services/` | Business logic | TypeScript |
| `prisma/` | Database schema | Prisma SDL |
| `tests/` | Test files | Jest + React Testing Library |

---

## 🔄 Data Flow in Codebase

### Create/Edit Creative File

```
src/app/library/page.tsx (UI)
  ↓
src/components/organisms/CreativeGrid.tsx (Grid)
  ↓
src/components/molecules/FileCard.tsx (Card)
  ↓
User clicks → triggers action
  ↓
src/hooks/useCreatives.ts (Hook)
  ↓
src/store/api/creativeApi.ts (RTK Query)
  ↓
src/services/creativeService.ts (Business logic)
  ↓
src/lib/git.ts (Git commit)
src/lib/db.ts (Prisma insert)
  ↓
Database update + Git commit
```

### Search Operation

```
User types in search box
  ↓
src/components/molecules/SearchBox.tsx
  ↓
src/store/slices/creativeSlice.ts (Redux)
  ↓
src/store/api/creativeApi.ts (RTK Query FTS5)
  ↓
src/lib/db.ts (Prisma FTS5 query)
  ↓
Results in Redux store
  ↓
UI re-renders with results
```

---

## 🚀 Getting Started (Developer Path)

1. **Clone repo**
   ```bash
   git clone https://github.com/your-org/brand-ops.git
   cd brand-ops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   npm run setup  # Creates E:\BRAND-OPS-STORAGE\, initializes DB
   ```

4. **Start development**
   ```bash
   npm run dev  # Starts Next.js on http://localhost:3000
   ```

5. **Run tests**
   ```bash
   npm test    # Jest + React Testing Library
   npm run lint
   npm run typecheck
   ```

---

## 📊 File Statistics (MVP Completion)

| Directory | Files | Size | Status |
|-----------|-------|------|--------|
| `docs/` | 14 | ~50 KB | ✅ Complete |
| `packages/web/src/` | ~50 | TBD | ⏳ Phase 3 |
| `prisma/` | 5 | TBD | ⏳ Phase 3 |
| `tests/` | ~30 | TBD | ⏳ Phase 3 |
| `.claude/` | 4 | ~15 KB | ✅ Complete |
| `.aiox/` | 3 | ~20 KB | ✅ Complete |

---

## 🔐 Important Files to Protect

| File | Why | Action |
|------|-----|--------|
| `.env.local` | Contains secrets | Add to .gitignore (never commit) |
| `prisma/migrations/` | DB history | Always commit (no .gitignore) |
| `.git/` | Version history | Never delete |
| `E:\BRAND-OPS-STORAGE\` | Source of truth | Regular backups via rclone |

---

## 📚 Related Documentation

- **Tech Stack:** docs/tech-stack.md (technologies used)
- **Coding Standards:** docs/coding-standards.md (development guidelines)
- **Architecture:** docs/fullstack-architecture.md (complete design)
- **Frontend Spec:** docs/front-end-spec.md (UI/UX specification)

---

**Document Owner:** @architect (Aria)  
**Last Updated:** 2026-04-03  
**Status:** Ready for Development
