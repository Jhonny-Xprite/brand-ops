# Brand Operations — Modernization & Feature Development Roadmap

**Extracted from:** brownfield-architecture.md  
**Date:** 2026-04-05  
**Status:** Ready for Planning Phase

---

## Executive Summary

The brand-ops project is a **modern, well-structured Next.js 16 application** with solid fundamentals:
- ✅ Latest frameworks (Next.js 16, React 18, TypeScript 5.9)
- ✅ Organized codebase (Atomic Design, Redux Toolkit, Prisma ORM)
- ✅ Reasonable test coverage (28 test files)
- ✅ Clean API routes (REST-based)
- ⚠️ 10 known technical debt items (none blocking)
- 🎯 Clear upgrade path for feature development

**Recommendation:** Ready for new feature development. Upgrade dependencies incrementally.

---

## Modernization Priorities (Sorted by Impact/Effort Ratio)

### 🔴 CRITICAL (Do Soon)

#### 1. Add Error Boundaries
**Effort:** LOW (2-3 hours)  
**Benefit:** Prevent full app crash on component errors  
**Impact:** MEDIUM (UX + reliability)

**Action:**
```bash
# Create src/components/ErrorBoundary.tsx
# Wrap in src/pages/_app.tsx
```

**Files Affected:**
- src/components/ (new ErrorBoundary component)
- src/pages/_app.tsx (wrap App)

---

#### 2. Formalize File Upload Validation
**Effort:** LOW (4 hours)  
**Benefit:** Prevent invalid files, security hardening  
**Impact:** MEDIUM (security + stability)

**Action:**
```bash
# Add file size limits to .env
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=jpg,png,mp4,mov,psd

# Validate in src/pages/api/files/
```

**Files Affected:**
- src/pages/api/files/ (all upload handlers)
- .env.example (document new variables)

---

#### 3. Document Environment Variables
**Effort:** TRIVIAL (1 hour)  
**Benefit:** Onboarding, fewer "why is it failing?" issues  
**Impact:** LOW (developer experience)

**Action:**
```bash
# Update .env.example with all variables
DATABASE_URL=file:./prisma/dev.db
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=jpg,png,mp4,mov,psd
LOG_LEVEL=debug
NODE_ENV=development
```

**Files Affected:**
- .env.example (document all options)

---

### 🟠 HIGH PRIORITY (Next Sprint)

#### 4. Increase Test Coverage (Target: 70%)
**Effort:** MEDIUM (5-10 days)  
**Benefit:** Confidence in refactoring, fewer regressions  
**Impact:** HIGH (quality)

**Priority Areas:**
1. API route handlers (files, projects, versioning) — ~40% of work
2. Redux slice logic — ~30% of work
3. File utilities and transformations — ~30% of work

**Action:**
```bash
npm test -- --coverage    # Baseline
# Target: 70% coverage for api/, store/, lib/
```

**Files Affected:**
- src/pages/api/ (add comprehensive tests)
- src/store/ (test slice logic)
- src/lib/ (test utilities)

---

#### 5. Introduce Schema Validation (Zod or Valibot)
**Effort:** MEDIUM (1-2 days)  
**Benefit:** Type-safe forms, reusable schemas, better error messages  
**Impact:** MEDIUM (code quality, maintainability)

**Current State:**
```typescript
// Manual validation scattered in API routes
if (typeof notes === 'string' && notes.length > 500) {
  return res.status(400).json({ error: 'Notes can have up to 500 characters.' })
}
```

**Target State:**
```typescript
import { z } from 'zod'

const UpdateFileMetadataSchema = z.object({
  type: z.string().min(1),
  status: z.string().min(1),
  tags: z.array(z.string()).max(20),
  notes: z.string().max(500).optional(),
})

// Reuse in API routes + frontend forms
const parsed = UpdateFileMetadataSchema.parse(req.body)
```

**Action:**
```bash
npm install zod
# Create src/lib/schemas/ for all validation schemas
# Update src/pages/api/files/ to use schemas
# Update React Hook Form to use Zod integration
```

**Files Affected:**
- src/lib/schemas/ (new directory with all schemas)
- src/pages/api/ (update all route handlers)
- src/components/ (update form validation)

---

#### 6. Setup Husky + Lint-Staged
**Effort:** LOW (30 minutes)  
**Benefit:** Auto-lint before commits, prevent bad commits  
**Impact:** LOW-MEDIUM (developer experience, code quality)

**Action:**
```bash
npm install husky lint-staged --save-dev
npx husky install

# Create .husky/pre-commit
# Run: lint-staged + typecheck
```

**Files Affected:**
- .husky/ (new)
- package.json (husky/lint-staged config)

---

### 🟡 MEDIUM PRIORITY (Future Sprints)

#### 7. Extract API Client Layer
**Effort:** MEDIUM (3-4 days)  
**Benefit:** Easier testing, better TypeScript, reusable client  
**Impact:** MEDIUM (architecture, maintainability)

**Current State:**
```typescript
// RTK Query directly in slices
export const api = createApi({...})
```

**Target State:**
```typescript
// Separate client service
// src/lib/api/creativeFilesClient.ts
export const creativeFilesClient = {
  fetchFile: (id: string) => fetch(...),
  updateMetadata: (id: string, data) => fetch(...),
}

// Used in slices + components with proper typing
```

**Files Affected:**
- src/lib/api/ (new directory)
- src/store/ (update slices to use client)

---

#### 8. Component Library Package (@brand-ops/ui)
**Effort:** HIGH (5-7 days)  
**Benefit:** Reusable components, design system clarity, versioning  
**Impact:** MEDIUM (architecture, future-proofing)

**Current State:**
```
src/components/atoms/
├── MotionButton.tsx
├── Skeleton.tsx
├── ... (10 components)
```

**Target State:**
```
packages/ui/
├── components/
│   ├── Button.tsx
│   ├── Skeleton.tsx
│   └── index.ts
├── package.json
└── tsconfig.json

src/ imports from @brand-ops/ui
```

**Action:**
```bash
# Create workspace monorepo structure
# Move atoms/molecules to packages/ui
# Export as npm package (internal)
```

---

#### 9. Caching Strategy (Stale-While-Revalidate)
**Effort:** LOW-MEDIUM (2-3 days)  
**Benefit:** Faster perceived load times, better offline UX  
**Impact:** MEDIUM (performance, UX)

**Current State:**
```typescript
// Default RTK Query caching
const api = createApi({...})
```

**Target State:**
```typescript
const api = createApi({
  baseQuery: baseQueryWithRevalidation({
    staleTime: 60000, // Serve stale data for 1 min
    refetchOnWindowFocus: true,
  }),
  endpoints: (builder) => ({...})
})
```

---

#### 10. Centralized Error Handling & Logging
**Effort:** MEDIUM (3-4 days)  
**Benefit:** Better debugging, error tracking, consistent UX  
**Impact:** MEDIUM (operations, debugging)

**Action:**
```bash
# Create src/lib/errors/ and src/lib/logger/
# Implement structured logging
# Setup error boundaries + error UI
# Consider integrating Sentry or Rollbar
```

---

## Feature Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Creative library (asset upload, organization)
- ✅ Project management (create/manage projects)
- ✅ Basic metadata (tags, status, notes)
- ✅ Version history (track changes)

### Phase 2: Enhancements (Next 2-3 Sprints)

#### Feature: Collaborative Workflow
**Impact:** HIGH (core value)  
**Stories:** 3-4 stories
- Project sharing with team members
- Permission levels (viewer, editor, admin)
- Activity feed for changes
- Comments on assets

**Technical Preparation:**
- [ ] Add User/Team models to Prisma
- [ ] Implement auth (optional: OAuth)
- [ ] Add permission checks to API routes
- [ ] Schema validation for team operations

**Files Affected:**
- prisma/schema.prisma (User, Team, Permission models)
- src/pages/api/projects/ (add permission checks)
- src/store/ (add team slice)

---

#### Feature: Advanced Search & Filtering
**Impact:** MEDIUM (nice to have)  
**Stories:** 2 stories
- Full-text search on asset metadata
- Filter by type, status, date, tags
- Saved searches/filters

**Technical Preparation:**
- [ ] Add search index (FTS or Meilisearch if scaling)
- [ ] Create filter query builder
- [ ] Add fuzzy search for tag autocomplete

**Files Affected:**
- src/pages/api/files/ (add search endpoint)
- src/lib/ (search/filter utilities)
- src/components/CreativeLibrary/ (UI components)

---

#### Feature: Bulk Operations
**Impact:** MEDIUM  
**Stories:** 2 stories
- Select multiple assets
- Bulk tag/status update
- Bulk delete with confirmation
- Bulk export

**Technical Preparation:**
- [ ] Add multi-select UI pattern
- [ ] Create bulk API endpoints
- [ ] Implement progress tracking

---

### Phase 3: Scaling (3-6 Months Out)

#### Database Migration: SQLite → PostgreSQL
**When:** If multi-user features launched  
**Effort:** HIGH  
**Strategy:**
1. Set up PostgreSQL locally
2. Prisma schema migration (minimal changes)
3. Data export from SQLite
4. Data import to PostgreSQL
5. Switch connection string

---

#### Cloud Storage Integration: Local → AWS S3/GCS
**When:** If storage needs exceed local disk  
**Effort:** MEDIUM  
**Strategy:**
1. Update file upload to S3
2. Keep local fallback for development
3. Update CDN for asset serving
4. Consider image transformation pipelines

---

## Dependency Update Plan

### Immediate (Next 2 Weeks)
```bash
npm install --save-dev @next/eslint
npm install --save-dev typescript@latest
npm install zod  # For schema validation
npm install husky lint-staged --save-dev
```

### Next Month
```bash
npm update  # Get all patch updates
npm install @reduxjs/toolkit@latest
npm install jest@latest
```

### Q2 2026 (Consider)
```bash
npm install react@19  # When stable
npm install tailwindcss@4  # Check breaking changes
```

---

## Testing Improvement Roadmap

### Current State
- 28 test files
- Unknown coverage (estimated 30-40%)

### Phase 1: Core Coverage (This Sprint)
**Target:** 50%+ coverage

1. **API Routes (Priority 1)**
   - [ ] Test all CRUD endpoints
   - [ ] Test validation errors
   - [ ] Test missing records (404)
   - Estimated: 12-15 test files

2. **Redux Slices (Priority 2)**
   - [ ] Test reducers
   - [ ] Test async thunks
   - [ ] Test selectors
   - Estimated: 4-6 test files

3. **Utilities (Priority 3)**
   - [ ] Test file operations
   - [ ] Test transformations
   - [ ] Test data parsing
   - Estimated: 6-8 test files

### Phase 2: Advanced Coverage (Next Sprint)
**Target:** 70%+ coverage
- E2E tests for critical workflows (Playwright)
- Visual regression tests (Chromatic)
- Performance tests for large file lists

---

## Quick Start for New Features

### Adding a New API Endpoint

1. **Define Prisma model** (if needed in `prisma/schema.prisma`)
   ```prisma
   model NewResource {
     id String @id @default(cuid())
     // ... fields
   }
   ```

2. **Define schema validation** (in `src/lib/schemas/`)
   ```typescript
   import { z } from 'zod'
   
   export const CreateResourceSchema = z.object({
     // ... fields
   })
   ```

3. **Create API route** (in `src/pages/api/newresource/`)
   ```typescript
   export default async function handler(req, res) {
     if (req.method === 'GET') {
       // GET logic
     } else if (req.method === 'POST') {
       const parsed = CreateResourceSchema.parse(req.body)
       // POST logic
     }
   }
   ```

4. **Add Redux slice** (if state needed in `src/store/`)
   ```typescript
   export const newResourceSlice = createSlice({
     name: 'newresource',
     initialState: { data: [] },
     reducers: { /* ... */ }
   })
   ```

5. **Create component** (in `src/components/`)
   ```typescript
   function NewResourceUI() {
     const dispatch = useAppDispatch()
     const data = useAppSelector(state => state.newresource.data)
     // ... component logic
   }
   ```

6. **Write tests** (in `src/__tests__/`)
   - API route tests
   - Component tests
   - Integration tests

---

## Architecture Decision Points

### When Adding Features, Consider:

1. **Does it need persistent state?**
   - Yes → Add Prisma model + API route
   - No → Use React local state

2. **Is it shared across components?**
   - Yes → Add Redux slice
   - No → Use React hooks

3. **Does it fetch from API?**
   - Yes → Use RTK Query + Redux slice
   - No → Use local state

4. **Does it modify files?**
   - Yes → Implement in API route (server-side)
   - No → Can be client-side

5. **Does it need validation?**
   - Always → Use Zod schemas
   - Reusable → Define in `src/lib/schemas/`
   - One-off → Inline validation okay

---

## Known Constraints & Gotchas

### File Management
- Files stored by path on disk
- Moving files externally breaks references
- No file hash-based deduplication
- Recommendation: Use UUID-based storage for future features

### Redux + Prisma
- Custom serialization for Date/BigInt
- Use mappers to convert Prisma models to Redux state
- See: `src/lib/types/models.ts` for patterns

### SQLite Limitations
- No concurrent writers (file locking)
- JSON stored as strings, parsed on access
- Good for single-user, local development
- Plan PostgreSQL migration if multi-user needed

### TypeScript Configuration
- Strict mode enabled (good!)
- noUnusedLocals/Parameters enabled (good!)
- May break on quick prototyping; disable temporarily if needed

---

## Success Metrics

### Code Quality
- [ ] TypeScript strict mode passes
- [ ] ESLint passes without warnings
- [ ] Jest coverage > 50%
- [ ] No console errors in development

### Performance
- [ ] Home page load < 2s
- [ ] Creative library load < 3s
- [ ] File upload progress visible
- [ ] No layout shifts (CLS)

### User Experience
- [ ] Clear error messages
- [ ] Form validation feedback
- [ ] Loading states visible
- [ ] Keyboard navigation works

---

## Next Steps

### For New Feature Development

1. ✅ **Read** `docs/brownfield-architecture.md` (this directory)
2. ✅ **Reference** Quick Reference section for entry points
3. ✅ **Follow** Code Patterns section for implementation style
4. ✅ **Use** Data Models section for API design
5. ✅ **Review** Technical Debt section to avoid known issues
6. ✅ **Implement** following the Quick Start guide above
7. ✅ **Test** with 70%+ coverage
8. ✅ **Iterate** with feedback from @qa and @po

### For Modernization Work

1. ✅ **Prioritize** from the Modernization Priorities section
2. ✅ **Create** stories in AIOX workflow
3. ✅ **Assign** to @dev for implementation
4. ✅ **Review** with @qa for quality gate
5. ✅ **Deploy** with @devops

---

## Questions & Clarifications

For questions about this document, refer to:
- **Architecture:** `docs/brownfield-architecture.md` (main document)
- **Code:** `src/` (actual implementation)
- **Tests:** `src/**/__tests__/` (patterns)
- **Agents:** Use `@architect` (Aria) for design questions, `@dev` (Dex) for implementation

---

**Document Status:** ✅ Complete & Ready  
**Last Updated:** 2026-04-05  
**Next Review:** After first new feature implementation
