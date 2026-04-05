# AIOX Brand Operations — Brownfield Architecture Document

**Status:** Current State Analysis (Fase 1-6 Analysis Complete)  
**Last Updated:** 2026-04-05  
**Version:** 1.0  
**Scope:** Complete project documentation focused on discovery and modernization potential

---

## Document Scope

This document captures the **CURRENT STATE** of the brand-ops codebase, including:
- Actual architecture and module organization
- Technology stack with real versions
- Code patterns and conventions
- Data models and API structure
- Test coverage and framework setup
- Integration points and dependencies
- Technical debt and gotchas
- Modernization opportunities (framework, dependencies, refactoring)

This document enables AI agents to understand the full project context for feature development and technical improvements.

---

## Change Log

| Date | Version | Description | Analyst |
|------|---------|-------------|---------|
| 2026-04-05 | 1.0 | Initial brownfield analysis — Full project discovery | Atlas |

---

## Quick Reference — Key Files and Entry Points

### Critical Files for Understanding the System

| Purpose | Location | Notes |
|---------|----------|-------|
| **Application Root** | `src/pages/_app.tsx` | Next.js app wrapper, provider setup |
| **Home Page** | `src/pages/index.tsx` | Main entry point dashboard |
| **Creative Library** | `src/pages/creative-library.tsx` | Asset management interface |
| **Redux Store** | `src/store/index.ts` | State management configuration |
| **Database** | `prisma/schema.prisma` | SQLite schema (CreativeFile, Project, Metadata models) |
| **API Entry** | `src/pages/api/` | Next.js API routes (files, projects, versioning) |
| **Type Definitions** | `src/lib/types/models.ts` | Prisma client models and transformations |
| **Utilities** | `src/lib/` | Core services (versioning, file handling, prisma client) |
| **Components** | `src/components/` | React components (Atomic Design: atoms → molecules → organisms) |
| **Hooks** | `src/hooks/` | Custom React hooks (useOnlineStatus, useProjects) |
| **Configuration** | `src/lib/i18n/`, `src/lib/theme/` | i18n & theme setup |

### Pages and Routes

- **`/`** — Dashboard (home/index.tsx)
- **`/creative-library`** — Creative asset management interface
- **`/design-system`** — Design system showcase (static page)
- **`/projeto/*`** — Project-specific routes (projeto/ folder)

### API Routes Implemented

| Endpoint | Method | Purpose | Location |
|----------|--------|---------|----------|
| `/api/files/{id}` | GET, PATCH | Fetch/update creative file metadata | `src/pages/api/files/[id].ts` |
| `/api/files/*` | Various | File operations (upload, delete, versioning) | `src/pages/api/files/` |
| `/api/projects/*` | GET, POST, PATCH | Project management | `src/pages/api/projects/` |
| `/api/projeto/*` | Various | Project-specific operations | `src/pages/api/projeto/` |
| `/api/versioning/*` | GET, POST | Version history and control | `src/pages/api/versioning/` |

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React 18 + Next.js 16)                   │
│  ├─ Components (Atomic Design: atoms/molecules/organisms)
│  ├─ Redux Store (Redux Toolkit + RTK Query)         │
│  ├─ Custom Hooks (useOnlineStatus, useProjects)     │
│  ├─ i18n (i18next + react-i18next)                  │
│  └─ Theme System (Context + CSS variables)          │
├─────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                     │
│  ├─ File operations (/api/files)                    │
│  ├─ Project management (/api/projects)              │
│  ├─ Version control (/api/versioning)               │
│  └─ Versioning service (git-based metadata)         │
├─────────────────────────────────────────────────────┤
│  Database Layer (Prisma ORM)                        │
│  ├─ SQLite database (local-first)                   │
│  ├─ Models: CreativeFile, FileMetadata, FileVersion │
│  ├─ Models: SyncMetadata, Project, ProjectConfig    │
│  └─ Models: ProjectLibrary, ProjectDomain           │
└─────────────────────────────────────────────────────┘
```

### Purpose & Scope

**Primary Purpose:** Hybrid asset management platform + creative workflow orchestration

**Key Features:**
- **Creative Library:** Upload, organize, version, and manage creative assets (images, videos, designs)
- **Project Management:** Create and manage brand/client projects with associated assets
- **Metadata Tagging:** File classification, status tracking, and searchable metadata
- **Version History:** Immutable version tracking with git-based commit messages
- **Theme System:** Brand color management and theme customization
- **Internationalization:** Multi-language UI support (i18n configured)

---

## Technical Stack — Current Versions

### Frontend Framework & Runtime

| Category | Technology | Version | Status | Notes |
|----------|-----------|---------|--------|-------|
| **Runtime** | Node.js | (via .nvmrc or package.json engines) | ✅ Modern | ES2020 target |
| **Web Framework** | Next.js | 16.2.2 | ✅ Latest | App Router + API routes |
| **UI Framework** | React | 18.3.1 | ✅ Modern | React Server Components ready |
| **React DOM** | react-dom | 18.3.1 | ✅ Modern | Client-side rendering |
| **Language** | TypeScript | 5.9.3 | ✅ Modern | Strict mode enabled |

### State Management

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Redux Toolkit** | 2.11.2 | Global state management | ✅ Modern |
| **React Redux** | 9.2.0 | React bindings for Redux | ✅ Current |
| **RTK Query** | (bundled in @reduxjs/toolkit) | Async API calls + caching | ✅ Integrated |

**Pattern:** Redux Toolkit with custom hooks (useAppDispatch, useAppSelector)

### Styling & Layout

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework | ✅ Latest |
| **PostCSS** | 8.4.35 | CSS transformations | ✅ Current |
| **Autoprefixer** | 10.4.17 | Vendor prefixes | ✅ Current |

**Pattern:** Tailwind classes + custom CSS-in-JS via Framer Motion

### Animation & UI Polish

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Framer Motion** | 12.38.0 | React animation library | ✅ Latest |
| **Lucide React** | 1.7.0 | Icon library | ✅ Modern |

### Data Persistence

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Prisma** | 5.22.0 | ORM + migrations | ✅ Modern |
| **@prisma/client** | 5.22.0 | Runtime client | ✅ Current |
| **SQLite** | (embedded) | Local-first database | ✅ Zero-config |

**Database Provider:** SQLite (file-based, self-hosted)  
**Schema Location:** `prisma/schema.prisma`  
**Migrations:** Prisma managed (`prisma migrate`)

### Internationalization (i18n)

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **i18next** | 26.0.3 | i18n framework | ✅ Modern |
| **react-i18next** | 17.0.2 | React bindings | ✅ Current |

**Pattern:** Context-based translation, configured in `src/lib/i18n/TranslationContext.tsx`

### Forms & Input Handling

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **React Hook Form** | 7.72.1 | Form state management | ✅ Current |
| **busboy** | 1.6.0 | File upload parsing | ✅ Current |
| **AJV + AJV Formats** | 3.0.1 | Schema validation | ✅ Current |

### File Processing

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Sharp** | 0.34.5 | Image optimization/transformation | ✅ Modern |
| **chokidar** | 5.0.0 | File system watcher | ✅ Current |
| **proper-lockfile** | 4.1.2 | File locking (concurrent access) | ✅ Current |

### Version Control Integration

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **simple-git** | 3.33.0 | Git operations (versioning service) | ✅ Current |

**Note:** Used by versioning service for git-based metadata tracking

### Testing Framework

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Jest** | 29.7.0 | Test runner | ✅ Modern |
| **ts-jest** | 29.4.9 | TypeScript support for Jest | ✅ Current |
| **@testing-library/react** | 16.3.2 | Component testing | ✅ Modern |
| **@testing-library/jest-dom** | 6.9.1 | Jest matchers for DOM | ✅ Current |
| **jest-environment-jsdom** | 30.3.0 | DOM environment for tests | ✅ Current |

**Test Files Found:** 28 test files across codebase  
**Configuration:** `jest.config.js` (root)

### Code Quality & Linting

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **ESLint** | 10.2.0 | Linting | ✅ Modern |
| **typescript-eslint** | 8.58.0 | TypeScript linting | ✅ Modern |
| **@eslint/js** | 10.0.1 | ESLint config | ✅ Modern |
| **globals** | 17.4.0 | Global variable definitions | ✅ Current |

**Configuration:** `eslint.config.js` (ESLint flat config)  
**Command:** `npm run lint`

### TypeScript Configuration

**Target:** ES2020  
**Strict Mode:** ✅ Enabled  
**Path Aliases:** `@/*` → `src/*`, `@pages/*` → `pages/*`  
**JSX:** react-jsx (automatic JSX transform)  
**Module:** ESNext with bundler resolution

---

## Source Tree and Module Organization

### Directory Structure (Actual)

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

### Key Modules & Their Purpose

#### Frontend Layer

| Module | Files | Purpose | Key Exports |
|--------|-------|---------|-------------|
| **Atoms** | `src/components/atoms/` | Base UI components | OfflineIndicator, Skeleton, MotionButton, etc. |
| **Molecules** | `src/components/molecules/` | Simple composed components | MotionSandbox, StatusNotice |
| **Organisms** | `src/components/organisms/` | Complex feature components | Full screens, workflows |
| **Custom Hooks** | `src/hooks/` | Reusable React logic | useOnlineStatus, useProjects |
| **Redux Store** | `src/store/` | State management | appStore, useAppDispatch, useAppSelector |
| **Theme System** | `src/lib/theme/` | Brand theming | ThemeContext, productBrand colors |
| **i18n System** | `src/lib/i18n/` | Multi-language support | TranslationContext, translations |

#### Backend Layer

| Module | Files | Purpose | Key Exports |
|--------|-------|---------|-------------|
| **File API** | `src/pages/api/files/` | Creative file operations | GET/PATCH file, upload, delete |
| **Projects API** | `src/pages/api/projects/` | Project CRUD | Create, read, update projects |
| **Versioning API** | `src/pages/api/versioning/` | Version tracking | Get versions, commit changes |
| **Prisma Client** | `src/lib/prisma.ts` | Database connection | PrismaClient singleton |

#### Data Layer

| Module | Files | Purpose | Key Exports |
|--------|-------|---------|-------------|
| **Type Models** | `src/lib/types/models.ts` | TypeScript interfaces | CreativeFile, FileMetadata, etc. |
| **File Operations** | `src/lib/creativeFiles.ts` | File utilities | Serialization, parsing |
| **Versioning Service** | `src/lib/versioning/` | Git-based versioning | versioningService, version operations |
| **Project Operations** | `src/lib/projectDomain.ts` | Project logic | Project manipulation, validation |

---

## Data Models and APIs

### Prisma Schema Overview

**Database:** SQLite (file-based, self-hosted)  
**Connection:** Environment variable `DATABASE_URL`  
**Migrations:** Managed by Prisma

#### Core Models

**CreativeFile** — Main asset record
```prisma
model CreativeFile {
  id        String   @id @default(cuid())
  path      String   @unique
  filename  String
  type      String
  size      BigInt
  mimeType  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  metadata     FileMetadata?
  versions     FileVersion[]
  syncMetadata SyncMetadata?
  projects     Project[]
  projectLogos ProjectConfig[]
}
```

**FileMetadata** — User-editable metadata
```prisma
model FileMetadata {
  id        String   @id @default(cuid())
  fileId    String   @unique
  type      String   // Asset type (image, video, design, etc.)
  status    String   // Draft, Final, Archived, etc.
  tags      String   // JSON-encoded array for SQLite persistence
  notes     String?
  updatedAt DateTime @updatedAt
}
```

**FileVersion** — Immutable version history
```prisma
model FileVersion {
  id         String   @id @default(cuid())
  fileId     String
  versionNum Int
  commitHash String // Git commit hash for tracking
  message    String // Commit message
  createdAt  DateTime @default(now())
  
  @@unique([fileId, versionNum])
}
```

**SyncMetadata** — Future sync/versioning integration
```prisma
model SyncMetadata {
  id             String   @id @default(cuid())
  fileId         String   @unique
  lastSyncTime   DateTime?
  syncStatus     String   @default("pending")
  syncError      String?
  externalId     String?
  externalSource String?
  // Reserved for future sync integration
}
```

**Project** — Brand/client projects
```prisma
model Project {
  id            String   @id @default(cuid())
  name          String
  niche         String        @default("")
  businessModel String        @default("INFOPRODUTO")
  instagramUrl  String?
  youtubeUrl    String?
  facebookUrl   String?
  tiktokUrl     String?
  logoFileId    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**ProjectConfig** — Project branding configuration
```prisma
model ProjectConfig {
  // Logo, icon, color scheme, etc.
  logoFileId      String? // References CreativeFile
  iconFileId      String?
  symbolFileId    String?
  wordmarkFileId  String?
  // Color definitions
}
```

### API Routes

**GET `/api/files/{id}`** — Fetch creative file  
Returns file metadata + versioning state

**PATCH `/api/files/{id}`** — Update file metadata  
Validates type, status, tags (max 20), notes (max 500)

**GET `/api/files/{id}?asset=preview`** — Download file  
Streams file from disk

**POST/GET `/api/projects/*`** — Project management  
CRUD operations for projects

**GET/POST `/api/versioning/*`** — Version operations  
Request version changes, commit history

---

## Code Patterns & Conventions

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Components** | PascalCase | `CreativeLibraryWorkspace.tsx` |
| **Hooks** | camelCase with `use` prefix | `useOnlineStatus.ts` |
| **Files/Utils** | camelCase or hyphenated | `creativeFiles.ts`, `file-utils.ts` |
| **Types/Interfaces** | PascalCase | `CreativeFile`, `FileMetadata` |
| **Constants** | UPPER_SNAKE_CASE | (in utils/constants) |
| **CSS Classes** | Tailwind utility classes | `flex items-center justify-between` |

### Component Patterns (Atomic Design)

**Atoms** — Standalone, reusable base components
```typescript
export function MotionButton({ children, ...props }) {
  return <motion.button {...props}>{children}</motion.button>
}
```

**Molecules** — Small groups of atoms
```typescript
function StatusNotice({ status, message }) {
  return (
    <div>
      <Badge>{status}</Badge>
      <p>{message}</p>
    </div>
  )
}
```

**Organisms** — Complex features combining multiple molecules
```typescript
function CreativeLibraryWorkspace() {
  // Full featured workspace component
  return (
    <section>
      <FileList />
      <MetadataForm />
      <VersionHistoryPanel />
    </section>
  )
}
```

### Redux Patterns

**Store Configuration:**
```typescript
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    files: filesReducer,
    metadata: metadataReducer,
    versioning: versioningReducer,
    projects: projectsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({...}).concat(apiSlice.middleware),
})
```

**Typed Hooks:**
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

**Custom Hooks for Redux:**
```typescript
function useProjects() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.projects.data)
  return { projects, dispatch }
}
```

### Data Transformation Patterns

**Prisma ↔ App Type Mapping:**
```typescript
// Bridge persisted SQLite format to app-facing contract
export function toAppFileMetadata(metadata: PersistedFileMetadata): FileMetadata {
  return {
    ...metadata,
    tags: parseFileMetadataTags(metadata.tags), // JSON.parse from string
  }
}

export function toPersistedFileMetadata(metadata: FileMetadata): PersistedFileMetadata {
  return {
    ...metadata,
    tags: serializeFileMetadataTags(metadata.tags), // JSON.stringify
  }
}
```

**Note:** SQLite stores tags as JSON-encoded string; app works with string arrays

### API Route Patterns

**Standard Handler:**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }
  
  if (req.method === 'GET') {
    try {
      const file = await prisma.creativeFile.findUnique({
        where: { id },
        include: { metadata: true },
      })
      return res.status(200).json(file)
    } catch (err) {
      console.error('Error:', err)
      return res.status(500).json({ error: 'Internal error' })
    }
  }
}
```

**Validation Pattern:**
```typescript
if (typeof notes === 'string' && notes.length > 500) {
  return res.status(400).json({ error: 'Notes can have up to 500 characters.' })
}

if (Array.isArray(tags) && tags.length > 20) {
  return res.status(400).json({ error: 'You can add up to 20 tags.' })
}
```

### Theme and i18n Patterns

**Theme Context:**
```typescript
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Brand Colors:**
```typescript
export const productBrand = {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  accent: '#EC4899',     // Pink
  // ...
}
```

**i18n Translation:**
```typescript
function Component() {
  const { t } = useTranslation()
  return <h1>{t('creative_library.title')}</h1>
}
```

### Custom Hook Patterns

**Online Status Hook:**
```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
    // Cleanup...
  }, [])
  
  return isOnline
}
```

**Data Fetching Hook:**
```typescript
export function useProjects() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.projects.data)
  
  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])
  
  return projects
}
```

---

## Testing Reality

### Test Coverage Status

**Test Files Found:** 28 .test.ts(x) files across codebase  
**Framework:** Jest + React Testing Library  
**Coverage:** Unknown (requires `npm test -- --coverage`)

### Test Organization

Tests are **colocated** with components:
```
src/components/atoms/__tests__/theme-toggle.test.tsx
src/components/CreativeLibrary/__tests__/creative-library.integration.test.ts
src/store/creativeLibrary/__tests__/metadata.slice.test.ts
src/lib/__tests__/fileUtils.test.ts
```

### Test File Inventory

| Area | Found | Examples |
|------|-------|----------|
| **Component Tests** | ~12 | theme-toggle.test.tsx, copy-card.test.tsx, branding-form.test.tsx |
| **Integration Tests** | ~4 | creative-library.integration.test.ts |
| **Utility Tests** | ~8 | fileUtils, metadataEditor, versionHistory |
| **Hook Tests** | ~2 | useOnlineStatus, useProjects |
| **Store Tests** | ~2 | Redux slices |

### Jest Configuration

**Config File:** `jest.config.js`  
**Environments:** jsdom (browser environment)  
**Extensions:** .ts, .tsx, .js  
**Setup Files:** Configured for jest-dom matchers

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage     # With coverage report
npm test -- --watch       # Watch mode
```

---

## Technical Debt and Known Issues

### 1. **Prisma Custom Serialization (Workaround)**
**Severity:** MEDIUM  
**Location:** `src/store/index.ts`, `src/lib/types/models.ts`

**Issue:** Redux requires serializable state. Prisma models include Date objects and BigInt.

**Workaround:**
- Custom `isReduxSerializable()` function handles Date, BigInt, and plain objects
- Warned after 128 levels of immutability checks (performance tradeoff)

**Recommendation:** Consider RTK Query for cleaner async data handling, or migrate to a REST API layer that handles serialization.

### 2. **SQLite JSON Storage for Tags**
**Severity:** LOW  
**Location:** `src/lib/types/models.ts`, `prisma/schema.prisma`

**Issue:** SQLite doesn't have native JSON array support; tags stored as JSON-encoded string.

**Workaround:**
- Parse/serialize JSON strings on app side
- `parseFileMetadataTags()` and `serializeFileMetadataTags()` handle conversion

**Note:** This is acceptable for current scale; revisit if tags become heavily used.

### 3. **File Path as Unique Identifier**
**Severity:** LOW  
**Location:** `prisma/schema.prisma`, `src/pages/api/files/[id].ts`

**Issue:** File paths stored uniquely; if filesystem structure changes, lookups fail.

**Current Handling:** Files read directly from disk using stored path.

**Risk:** Moving files externally breaks references. No path normalization across OSes (Windows vs Linux).

**Recommendation:** Consider file content hash or UUID-based storage instead of file paths.

### 4. **No Error Boundaries**
**Severity:** MEDIUM  
**Location:** `src/pages/_app.tsx`, components/

**Issue:** No React error boundaries; component errors crash entire app.

**Recommendation:** Implement Error Boundary component for graceful error handling.

### 5. **File Upload Validation**
**Severity:** MEDIUM  
**Location:** `src/pages/api/files/` 

**Issue:** File type and size validation could be more comprehensive.

**Current:** Validates notes (500 char), tags (20 max), but file size limits unclear.

**Recommendation:** Add explicit file size limits and MIME type whitelist.

### 6. **Version Control Integration (simple-git)**
**Severity:** LOW  
**Location:** `src/lib/versioning/`, versioningService

**Issue:** Uses simple-git to track version metadata. Git operations add latency.

**Current Behavior:** Version numbers and commit hashes tracked in database, actual commits might not exist.

**Recommendation:** Clarify if full git history is maintained or just metadata.

### 7. **Missing Environment Variables Documentation**
**Severity:** MEDIUM  
**Location:** `.env.example`

**Issue:** `.env.example` minimal; unclear which variables are required vs optional.

**Recommendation:** Document all environment variables with defaults and examples.

### 8. **Type Safety in API Routes**
**Severity:** LOW  
**Location:** `src/pages/api/`

**Issue:** Some API routes have manual type checking (`typeof id !== 'string'`) instead of validation schema.

**Better Pattern:** Use AJV + schema validation for consistency.

### 9. **No Centralized Logging**
**Severity:** LOW  
**Location:** Various files

**Issue:** `console.error()` used directly; no structured logging or error tracking.

**Recommendation:** Implement centralized logger for debugging and monitoring.

### 10. **CSS-in-JS vs Tailwind Mixing**
**Severity:** LOW  
**Location:** `src/components/`

**Issue:** Both Tailwind classes and Framer Motion inline styles used.

**Recommendation:** Standardize on Tailwind for consistency; use CSS variables for dynamic theming.

---

## Modernization Opportunities & Upgrade Path

### 1. Framework Upgrades

#### Next.js: 16.2.2 → Latest (Strategy)
**Current Version:** 16.2.2 (Latest)  
**Status:** ✅ Already on latest  
**Action:** No upgrade needed; monitor for patch updates

#### React: 18.3.1 → 19.x (Future)
**Current Version:** 18.3.1 (Latest in 18.x)  
**Recommendations:**
- React 19 is out; plan migration for performance improvements (Server Components, React Compiler)
- Breaking changes: PropTypes removed, old lifecycle methods
- **Priority:** LOW (current version stable)

#### TypeScript: 5.9.3 → 5.10+ (Recommended)
**Current Version:** 5.9.3  
**Latest:** 5.10+  
**Benefits:** Type inference improvements, new features  
**Breaking:** Minimal  
**Priority:** MEDIUM (next patch cycle)

### 2. State Management Modernization

#### Redux Toolkit → TanStack Query (Async Only)
**Current State:** Redux Toolkit + RTK Query for async  
**Alternative:** Keep Redux for UI state, use TanStack Query exclusively for server data  
**Effort:** MEDIUM (refactor async slices)  
**Benefit:** Simpler caching, less boilerplate  
**Priority:** MEDIUM (consider for next feature iteration)

#### Redux Persist (Add for UX)
**Current State:** No persistence across sessions  
**Opportunity:** Add redux-persist to cache projects/metadata  
**Effort:** LOW  
**Benefit:** Faster reload, better offline experience  
**Priority:** LOW

### 3. Database Migrations

#### SQLite → PostgreSQL (Optional)
**Current:** SQLite file-based  
**Consideration:** Multi-user scenarios need DB server  
**Effort:** HIGH (schema migration, data export, Docker setup)  
**Benefit:** Concurrent access, better for team  
**Priority:** LOW (only if multi-user required)

#### Prisma Schema Improvements
- Add unique constraint on `Project(name)` if needed
- Consider partitioning CreativeFile by type/status for large datasets
- Add audit log table for file changes
**Effort:** LOW

### 4. Component Library Refactoring

#### Consolidate Atoms (Reduce Duplication)
**Current:** 10+ atom components manually maintained  
**Opportunity:** Create `@brand-ops/ui` package with reusable components  
**Effort:** MEDIUM  
**Benefit:** Consistency, reusability, design system clarity  
**Priority:** MEDIUM

#### Form Validation (Introduce Zod or Valibot)
**Current:** Manual validation in API routes  
**Alternative:** Use Zod or Valibot for schema validation  
**Effort:** MEDIUM (1-2 days)  
**Benefit:** Type-safe forms, reusable schemas  
**Priority:** MEDIUM

### 5. Performance Optimizations

#### Image Optimization (Sharp → Next.js Image)
**Current:** Sharp for transformations; Next.js images unoptimized  
**Opportunity:** Use Next.js Image component with ISR  
**Effort:** LOW  
**Benefit:** Automatic format conversion, responsive images  
**Priority:** LOW

#### Code Splitting & Bundle Analysis
**Current:** No webpack bundle analysis  
**Opportunity:** Add bundle analyzer, code-split routes  
**Effort:** LOW  
**Benefit:** Faster initial load  
**Priority:** MEDIUM

#### Memoization of Expensive Components
**Current:** No React.memo usage observed  
**Opportunity:** Memoize CreativeLibraryWorkspace, FileList to prevent unnecessary renders  
**Effort:** LOW  
**Benefit:** Better performance with large file lists  
**Priority:** MEDIUM

### 6. Testing Improvements

#### Increase Test Coverage
**Current:** 28 test files, unknown coverage %  
**Target:** 70%+ coverage for critical paths  
**Focus Areas:**  
- API route handlers (files, projects, versioning)
- Redux slice logic
- File utilities and transformations
**Effort:** MEDIUM (5-10 days)  
**Priority:** MEDIUM

#### E2E Testing (Add Playwright or Cypress)
**Current:** None  
**Opportunity:** Add E2E tests for creative library workflow  
**Effort:** HIGH (10-20 days)  
**Benefit:** Confidence in full workflows  
**Priority:** LOW (start with critical path)

#### Visual Regression Testing
**Current:** None  
**Opportunity:** Add Chromatic or Percy for visual testing  
**Effort:** LOW (integration)  
**Benefit:** Prevent UI regressions  
**Priority:** LOW

### 7. Dependency Updates (Immediate Opportunities)

#### Minor/Patch Updates
**Status:** Run `npm update` to fetch latest patches  
**Recommendation:** Monthly dependency audit

#### Major Updates (Review First)

| Package | Current | Latest | Breaking | Priority |
|---------|---------|--------|----------|----------|
| jest | 29.7.0 | 30+ | Minor | LOW |
| tailwindcss | 3.4.1 | 4.x | Possible | MEDIUM |
| framer-motion | 12.38.0 | 11.x+ | Low | LOW |
| i18next | 26.0.3 | 27+ | Low | LOW |

### 8. Architecture Improvements

#### Extract API Client Layer
**Current:** Direct RTK Query in components  
**Opportunity:** Create typed API client service  
**Effort:** MEDIUM  
**Benefit:** Easier testing, better TypeScript inference  
**Priority:** MEDIUM

#### Centralized Error Handling
**Current:** Individual try/catch in handlers  
**Opportunity:** Create error boundary + error logger  
**Effort:** LOW  
**Benefit:** Consistent error UI, better debugging  
**Priority:** MEDIUM

#### Caching Strategy for CreativeLibrary
**Current:** RTK Query default cache  
**Opportunity:** Implement stale-while-revalidate  
**Effort:** LOW  
**Benefit:** Faster perceived load times  
**Priority:** LOW

### 9. Development Experience (DX) Improvements

#### Add Husky + Lint-Staged
**Current:** Manual `npm run lint`  
**Opportunity:** Auto-lint on commit  
**Effort:** LOW (30 min)  
**Benefit:** Prevent linting issues in commits  
**Priority:** MEDIUM

#### Improve ESLint Config
**Current:** Basic config  
**Opportunity:** Add @next/eslint, react-hooks plugin  
**Effort:** LOW  
**Benefit:** Catch more errors at dev time  
**Priority:** MEDIUM

#### Add TypeScript Strict Mode Enforcement
**Current:** Strict mode enabled, but `checkJs: false`  
**Opportunity:** Enable `checkJs` for .js files too  
**Effort:** LOW (may require fixes)  
**Benefit:** Consistent type safety  
**Priority:** LOW

### Recommended Upgrade Sequence

**Phase 1 (This Sprint):** Dependencies + Testing
1. Update TypeScript to 5.10+
2. Add Zod/Valibot for form validation
3. Increase test coverage to 50%+

**Phase 2 (Next Sprint):** Refactoring
1. Extract API client layer
2. Consolidate component library
3. Add error boundaries

**Phase 3 (Future):** Scaling
1. Component library as separate package (@brand-ops/ui)
2. E2E testing
3. Consider PostgreSQL if multi-user needed

---

## Integration Points and External Dependencies

### Service Integrations (Current)

**File System**
- Direct filesystem read/write for creative files
- Location: `src/lib/creativeFiles.ts`, `src/pages/api/files/`
- Pattern: Store file path in DB, serve from disk

**Git Integration** (simple-git)
- Version control via simple-git library
- Versioning service creates commits for metadata changes
- Location: `src/lib/versioning/`
- Pattern: Lightweight version tracking without full git history

**Prisma ORM**
- All database operations through Prisma client
- Single prisma.ts singleton instance
- Location: `src/lib/prisma.ts`

### API Design Pattern

**REST-based API routes** in Next.js
- File operations: `/api/files/{id}`
- Project management: `/api/projects/{id}`
- Versioning: `/api/versioning/{endpoint}`
- File uploads: `POST /api/files` (busboy parser)

### External Service Readiness

**Current:** Minimal external dependencies (local-first)  
**Future Integration Points:**
- Cloud storage (AWS S3, Google Cloud Storage) — for file storage
- OAuth providers — for user authentication
- Image processing APIs — for thumbnail generation
- Analytics services — for usage tracking

---

## Development Setup and Commands

### Required Environment Variables

```
DATABASE_URL="file:./prisma/dev.db"  # SQLite database path
NODE_ENV=development|production
```

### Local Development Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations (if needed)
npm run prisma:migrate

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build and Production

```bash
npm run build              # Production build
npm run start              # Start production server
npm run typecheck          # Type checking
npm run lint               # Linting
```

### Database Management

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Create/run migrations
npm run prisma:studio     # Open Prisma Studio GUI
```

### Testing

```bash
npm test                   # Run all tests
npm test -- --coverage    # With coverage report
npm test -- --watch       # Watch mode
```

### Sync Tools (AIOX Framework)

```bash
npm run sync:ide          # Sync IDE configuration
npm run sync:skills:codex # Sync skills
npm run validate:structure # Validate project structure
npm run validate:agents   # Validate AIOX agents
```

---

## Appendix — Useful Commands and Patterns

### File Upload Pattern (Frontend)

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'image')
  
  const response = await fetch('/api/files', {
    method: 'POST',
    body: formData,
  })
  
  const result = await response.json()
  return result.fileId
}
```

### Metadata Update Pattern

```typescript
const updateMetadata = async (fileId: string, metadata: FileMetadata) => {
  const response = await fetch(`/api/files/${fileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  })
  
  return response.json()
}
```

### Component Integration with Redux

```typescript
function CreativeLibraryWorkspace() {
  const dispatch = useAppDispatch()
  const files = useAppSelector(state => state.creativeLibrary.files)
  
  useEffect(() => {
    dispatch(fetchFiles()) // Async thunk from RTK Query
  }, [dispatch])
  
  return (
    <>
      {files.map(file => (
        <FileCard key={file.id} file={file} />
      ))}
    </>
  )
}
```

### API Route Error Handling

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Operation
  } catch (error) {
    console.error('Operation failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

---

## Quality Assurance Checklist

Before future enhancements, verify:

- [ ] TypeScript strict mode checks pass (`npm run typecheck`)
- [ ] ESLint passes without warnings (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage > 50% for modified files
- [ ] No console.errors or warnings in dev console
- [ ] Prisma schema changes migrated (`npm run prisma:migrate`)
- [ ] File paths are OS-agnostic (use path module)
- [ ] API responses validated against types
- [ ] Error messages clear and actionable
- [ ] File uploads validated (type, size)
- [ ] Metadata tags and notes bounded
- [ ] Database transactions considered for multi-step operations

---

## Document Summary

This brownfield architecture document provides a complete snapshot of the brand-ops project as of 2026-04-05. It captures:

✅ **Current State:** 148 TS/TSX files, 28 test files, 1 Prisma model set  
✅ **Tech Stack:** Next.js 16, React 18, Redux Toolkit, Prisma + SQLite, Jest  
✅ **Patterns:** Atomic Design, RTK Query, Custom Hooks, Context API  
✅ **Data Layer:** Prisma ORM with CreativeFile, FileMetadata, FileVersion, Project models  
✅ **API Layer:** 10+ REST routes for files, projects, versioning  
✅ **Testing:** 28 test files using Jest + React Testing Library  
✅ **Known Issues:** 10 documented technical debt items with recommendations  
✅ **Upgrade Path:** Prioritized modernization opportunities (TypeScript, testing, refactoring)  
✅ **Integration Points:** File system, git (simple-git), Prisma ORM  

**For New Feature Development:**  
- Reference Architecture → Quick Reference for entry points
- Code Patterns section for implementation guidelines
- API Design section for endpoint patterns
- Testing section for test structure

**For Modernization Work:**  
- Technical Debt section identifies issues
- Modernization Opportunities section prioritizes upgrades
- Recommended Upgrade Sequence provides roadmap

---

**End of Brownfield Architecture Document**

*Generated by @atlas (Analyst) for AIOX Brand Operations project*
