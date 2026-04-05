# Source Tree and Module Organization

## Directory Structure (Actual)

```
brand-ops/
├── .aiox-core/                    # AIOX Framework (DO NOT MODIFY L1-L2)
├── .claude/                       # Claude Code configuration
├── docs/                          # Project documentation
│   ├── stories/                   # User stories (Story Development Cycle)
│   ├── prd/                       # Product Requirement Documents
│   ├── architecture/              # Architecture documentation
│   └── guides/                    # Usage guides
├── prisma/
│   └── schema.prisma              # Prisma schema (SQLite models)
├── src/                           # Main source code (148 .ts/.tsx files, 59 directories)
│   ├── __tests__/                 # Root-level tests
│   ├── components/                # React components (Atomic Design)
│   │   ├── atoms/                 # Base components (Button, Input, Badge, etc.)
│   │   ├── molecules/             # Simple components (groups of atoms)
│   │   ├── organisms/             # Complex components (full features)
│   │   ├── Config/                # Configuration components
│   │   ├── Copy/                  # Copy/copywriting components
│   │   ├── CreativeLibrary/       # Asset management workspace
│   │   ├── Dashboard/             # Dashboard components
│   │   ├── Layout/                # Layout wrappers
│   │   ├── Overview/              # Overview components
│   │   ├── Projects/              # Project management UI
│   │   ├── ProjectDomain/         # Project domain-specific components
│   │   ├── Social/                # Social media components
│   │   └── __tests__/             # Component tests (colocated)
│   ├── hooks/                     # Custom React hooks
│   │   ├── useOnlineStatus.ts     # Network status hook
│   │   ├── useProjects.ts         # Projects data hook
│   │   └── __tests__/             # Hook tests
│   ├── lib/                       # Utility libraries and services (10+ files)
│   │   ├── creativeFiles.ts       # Creative file operations
│   │   ├── creativeLibraryActions.ts
│   │   ├── creativeLibraryBrowser.ts
│   │   ├── fileUtils.ts           # File manipulation utilities
│   │   ├── metadataEditor.ts      # Metadata editing logic
│   │   ├── overview.ts            # Overview data aggregation
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── projectDomain.ts       # Project domain logic
│   │   ├── projectLibrary.ts      # Project library management
│   │   ├── projectWorkspace.ts    # Project workspace operations
│   │   ├── storageRoot.ts         # Storage root management
│   │   ├── versionHistory.ts      # Version history operations
│   │   ├── i18n/                  # Internationalization setup
│   │   │   └── TranslationContext.tsx
│   │   ├── icons/                 # Icon definitions and utilities
│   │   ├── theme/                 # Theme system
│   │   │   ├── ThemeContext.tsx   # Theme context provider
│   │   │   ├── productBrand.ts    # Brand color definitions
│   │   │   └── themeResolver.ts   # Theme resolution logic
│   │   ├── types/                 # TypeScript type definitions
│   │   │   ├── index.ts
│   │   │   └── models.ts          # Prisma client models
│   │   ├── utils/                 # General utilities
│   │   ├── versioning/            # Version control integration
│   │   └── __tests__/             # Utility tests
│   ├── pages/                     # Next.js pages and API routes
│   │   ├── _app.tsx               # Next.js app wrapper
│   │   ├── index.tsx              # Home/dashboard page
│   │   ├── creative-library.tsx   # Creative library page
│   │   ├── design-system.tsx      # Design system showcase
│   │   ├── projeto/               # Project-specific pages
│   │   ├── api/                   # API routes
│   │   │   ├── files/             # File operations
│   │   │   ├── projects/          # Project operations
│   │   │   ├── projeto/           # Project-specific APIs
│   │   │   └── versioning/        # Versioning APIs
│   │   └── __tests__/             # Page tests
│   ├── store/                     # Redux state management
│   │   ├── index.ts               # Store configuration + hooks
│   │   ├── api/                   # RTK Query slices
│   │   ├── creativeLibrary/       # Creative library state
│   │   │   ├── files.slice.ts
│   │   │   ├── metadata.slice.ts
│   │   │   └── versioning.slice.ts
│   │   ├── projects/              # Projects state
│   │   │   └── projects.slice.ts
│   │   └── slices/                # Other slices
│   ├── styles/                    # Global styles
│   ├── test/                      # Shared test utilities
│   └── __tests__/                 # Root-level tests
├── packages/                      # (Currently empty — future shared packages)
├── tests/                         # Additional test files
├── qa/                            # QA reports and test results
├── squads/                        # Team organization (AIOX framework)
├── bin/                           # CLI scripts
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Example environment template
├── .env.local                     # Local overrides (gitignored)
├── .next/                         # Next.js build output
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
├── jest.config.js                 # Jest configuration
├── eslint.config.js               # ESLint configuration
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # Project README
```

## Key Modules & Their Purpose

### Frontend Layer

| Module | Files | Purpose | Key Exports |
|--------|-------|---------|-------------|
| **Atoms** | `src/components/atoms/` | Base UI components | OfflineIndicator, Skeleton, MotionButton, etc. |
| **Molecules** | `src/components/molecules/` | Simple composed components | MotionSandbox, StatusNotice |
| **Organisms** | `src/components/organisms/` | Complex feature components | Full screens, workflows |
| **Custom Hooks** | `src/hooks/` | Reusable React logic | useOnlineStatus, useProjects |
| **Redux Store** | `src/store/` | State management | appStore, useAppDispatch, useAppSelector |
| **Theme System** | `src/lib/theme/` | Brand theming | ThemeContext, productBrand colors |
| **i18n System** | `src/lib/i18n/` | Multi-language support | TranslationContext, translations |

### Backend Layer

| Module | Files | Purpose | Key Exports |
|--------|-------|---------|-------------|
| **File API** | `src/pages/api/files/` | Creative file operations | GET/PATCH file, upload, delete |
| **Projects API** | `src/pages/api/projects/` | Project CRUD | Create, read, update projects |
| **Versioning API** | `src/pages/api/versioning/` | Version tracking | Get versions, commit changes |
| **Prisma Client** | `src/lib/prisma.ts` | Database connection | PrismaClient singleton |

### Data Layer

| Module | Files | Purpose | Key Exports |
|--------|-------|---------|-------------|
| **Type Models** | `src/lib/types/models.ts` | TypeScript interfaces | CreativeFile, FileMetadata, etc. |
| **File Operations** | `src/lib/creativeFiles.ts` | File utilities | Serialization, parsing |
| **Versioning Service** | `src/lib/versioning/` | Git-based versioning | versioningService, version operations |
| **Project Operations** | `src/lib/projectDomain.ts` | Project logic | Project manipulation, validation |

---
