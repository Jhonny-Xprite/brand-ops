# Technical Stack — Current Versions

## Frontend Framework & Runtime

| Category | Technology | Version | Status | Notes |
|----------|-----------|---------|--------|-------|
| **Runtime** | Node.js | (via .nvmrc or package.json engines) | ✅ Modern | ES2020 target |
| **Web Framework** | Next.js | 16.2.2 | ✅ Latest | App Router + API routes |
| **UI Framework** | React | 18.3.1 | ✅ Modern | React Server Components ready |
| **React DOM** | react-dom | 18.3.1 | ✅ Modern | Client-side rendering |
| **Language** | TypeScript | 5.9.3 | ✅ Modern | Strict mode enabled |

## State Management

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Redux Toolkit** | 2.11.2 | Global state management | ✅ Modern |
| **React Redux** | 9.2.0 | React bindings for Redux | ✅ Current |
| **RTK Query** | (bundled in @reduxjs/toolkit) | Async API calls + caching | ✅ Integrated |

**Pattern:** Redux Toolkit with custom hooks (useAppDispatch, useAppSelector)

## Styling & Layout

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework | ✅ Latest |
| **PostCSS** | 8.4.35 | CSS transformations | ✅ Current |
| **Autoprefixer** | 10.4.17 | Vendor prefixes | ✅ Current |

**Pattern:** Tailwind classes + custom CSS-in-JS via Framer Motion

## Animation & UI Polish

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Framer Motion** | 12.38.0 | React animation library | ✅ Latest |
| **Lucide React** | 1.7.0 | Icon library | ✅ Modern |

## Data Persistence

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Prisma** | 5.22.0 | ORM + migrations | ✅ Modern |
| **@prisma/client** | 5.22.0 | Runtime client | ✅ Current |
| **SQLite** | (embedded) | Local-first database | ✅ Zero-config |

**Database Provider:** SQLite (file-based, self-hosted)  
**Schema Location:** `prisma/schema.prisma`  
**Migrations:** Prisma managed (`prisma migrate`)

## Internationalization (i18n)

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **i18next** | 26.0.3 | i18n framework | ✅ Modern |
| **react-i18next** | 17.0.2 | React bindings | ✅ Current |

**Pattern:** Context-based translation, configured in `src/lib/i18n/TranslationContext.tsx`

## Forms & Input Handling

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **React Hook Form** | 7.72.1 | Form state management | ✅ Current |
| **busboy** | 1.6.0 | File upload parsing | ✅ Current |
| **AJV + AJV Formats** | 3.0.1 | Schema validation | ✅ Current |

## File Processing

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Sharp** | 0.34.5 | Image optimization/transformation | ✅ Modern |
| **chokidar** | 5.0.0 | File system watcher | ✅ Current |
| **proper-lockfile** | 4.1.2 | File locking (concurrent access) | ✅ Current |

## Version Control Integration

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **simple-git** | 3.33.0 | Git operations (versioning service) | ✅ Current |

**Note:** Used by versioning service for git-based metadata tracking

## Testing Framework

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Jest** | 29.7.0 | Test runner | ✅ Modern |
| **ts-jest** | 29.4.9 | TypeScript support for Jest | ✅ Current |
| **@testing-library/react** | 16.3.2 | Component testing | ✅ Modern |
| **@testing-library/jest-dom** | 6.9.1 | Jest matchers for DOM | ✅ Current |
| **jest-environment-jsdom** | 30.3.0 | DOM environment for tests | ✅ Current |

**Test Files Found:** 28 test files across codebase  
**Configuration:** `jest.config.js` (root)

## Code Quality & Linting

| Technology | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **ESLint** | 10.2.0 | Linting | ✅ Modern |
| **typescript-eslint** | 8.58.0 | TypeScript linting | ✅ Modern |
| **@eslint/js** | 10.0.1 | ESLint config | ✅ Modern |
| **globals** | 17.4.0 | Global variable definitions | ✅ Current |

**Configuration:** `eslint.config.js` (ESLint flat config)  
**Command:** `npm run lint`

## TypeScript Configuration

**Target:** ES2020  
**Strict Mode:** ✅ Enabled  
**Path Aliases:** `@/*` → `src/*`, `@pages/*` → `pages/*`  
**JSX:** react-jsx (automatic JSX transform)  
**Module:** ESNext with bundler resolution

---
