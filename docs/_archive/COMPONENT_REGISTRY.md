# Epic 0 — Component Registry & IDS Tracking

**Date:** 2026-04-05  
**Epic:** 0 (Multi-Project Foundation & Design-System Reconciliation)  
**Status:** Components Ready for Registry Sync  
**Owner:** @aiox-master (Orion)

---

## 📋 Overview

This document catalogs all components created during Epic 0 execution and provides registration commands for the AIOX IDS (Incremental Decision System) registry.

**Purpose:** Enable future stories to discover existing components via `*ids check` before creating new ones.

---

## 🎯 Component Inventory by Category

### 1. Pages (Routes)

| File | Type | Created | Story | Status |
|------|------|---------|-------|--------|
| `src/pages/index.tsx` | Page | Epic 0.2 | 0.2 | ✅ Production |
| `src/pages/creative-library.tsx` | Page | Epic 0.6 | 0.6 | ✅ Production |
| `src/pages/projeto/[id]/dashboard.tsx` | Page | Epic 0.5 | 0.5 | ✅ Production |
| `src/pages/projeto/[id]/media.tsx` | Page | Epic 0.6 | 0.6 | ✅ Production |
| `src/pages/projeto/[id]/strategy.tsx` | Page | Epic 0.6 | 0.6 | ✅ Production |
| `src/pages/projeto/[id]/social.tsx` | Page | Epic 0.7 | 0.7 | ✅ Production |
| `src/pages/projeto/[id]/copy.tsx` | Page | Epic 0.7 | 0.7 | ✅ Production |
| `src/pages/projeto/[id]/config.tsx` | Page | Epic 0.4 | 0.4 | ✅ Production |

### 2. Components — Projects Module

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/components/Projects/ProjectCard.tsx` | Component | Epic 0.2 | 0.2 | `ProjectCard` | React, TW |
| `src/components/Projects/ProjectListRow.tsx` | Component | Epic 0.2 | 0.2 | `ProjectListRow` | React, TW |
| `src/components/Projects/ProjectSearch.tsx` | Component | Epic 0.2 | 0.2 | `ProjectSearch` | React, React-Hook-Form |
| `src/components/Projects/CreateProjectModal.tsx` | Component | Epic 0.2 | 0.2 | `CreateProjectModal` | React, React-Redux |
| `src/components/Projects/SyncStatusFooter.tsx` | Component | Epic 0.2 | 0.2 | `SyncStatusFooter` | React, Redux |
| `src/components/Projects/ViewToggle.tsx` | Component | Epic 0.2 | 0.2 | `ViewToggle` | React |

### 3. Components — Creative Library

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/components/CreativeLibrary/FileList.tsx` | Component | Epic 0.6 | 0.6 | `FileList` | React, TW |
| `src/components/CreativeLibrary/FileUploadInput.tsx` | Component | Epic 0.6 | 0.6 | `FileUploadInput` | React |
| `src/components/CreativeLibrary/MetadataForm.tsx` | Component | Epic 0.6 | 0.6 | `MetadataForm` | React-Hook-Form |
| `src/components/CreativeLibrary/VersionHistoryPanel.tsx` | Component | Epic 0.6 | 0.6 | `VersionHistoryPanel` | React |

### 4. Components — Layout & Navigation

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/components/Layout/ProjectShell.tsx` | Component | Epic 0.3 | 0.3 | `ProjectShell` | React |
| `src/components/Layout/Navbar.tsx` | Component | Epic 0.3 | 0.3 | `Navbar` | React, Lucide |
| `src/components/Layout/Sidebar.tsx` | Component | Epic 0.3 | 0.3 | `Sidebar` | React |

### 5. Atomic Components

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/components/atoms/BrandLogo.tsx` | Component | Epic 0.4 | 0.4 | `BrandLogo` | React, Lucide |
| `src/components/molecules/StatusNotice.tsx` | Component | Epic 0.2 | 0.2 | `StatusNotice` | React, TW |

### 6. Hooks (Custom)

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/hooks/useProjects.ts` | Hook | Epic 0.2 | 0.2 | `useProjects()` | React, Redux, Prisma Client |
| `src/hooks/useOnlineStatus.ts` | Hook | Epic 0.1 | 0.1 | `useOnlineStatus()` | React |

### 7. Redux Store Slices

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/store/projects/projects.slice.ts` | Redux Slice | Epic 0.2 | 0.2 | `projectsSlice` | @reduxjs/toolkit |
| `src/store/creativeLibrary/files.slice.ts` | Redux Slice | Epic 0.6 | 0.6 | `filesSlice` | @reduxjs/toolkit |
| `src/store/index.ts` | Store Setup | Epic 0.2 | 0.2 | Redux store | Redux Toolkit |

### 8. API Routes

| File | Type | Created | Story | Endpoint | Purpose |
|------|------|---------|-------|----------|---------|
| `src/pages/api/projects/index.ts` | API Route | Epic 0.2 | 0.2 | `GET/POST /api/projects` | List/create projects |
| `src/pages/api/projects/create.ts` | API Route | Epic 0.2 | 0.2 | `POST /api/projects/create` | Create project |
| `src/pages/api/files/index.ts` | API Route | Epic 0.6 | 0.6 | `GET /api/files` | List files |
| `src/pages/api/files/upload.ts` | API Route | Epic 0.6 | 0.6 | `POST /api/files/upload` | Upload file |
| `src/pages/api/files/[id]/actions.ts` | API Route | Epic 0.6 | 0.6 | `POST /api/files/[id]/actions` | File actions |
| `src/pages/api/files/[id]/replace.ts` | API Route | Epic 0.6 | 0.6 | `POST /api/files/[id]/replace` | Replace file |

### 9. Utilities & Libraries

| File | Type | Created | Story | Exports | Dependencies |
|------|------|---------|-------|---------|--------------|
| `src/lib/i18n/TranslationContext.tsx` | Context | Epic 0.1 | 0.1 | `TranslationProvider` | React, i18next |
| `src/lib/versioning/service.ts` | Utility | Epic 0.6 | 0.6 | Version control functions | Prisma |
| `src/lib/versioning/historyReader.ts` | Utility | Epic 0.6 | 0.6 | History reading functions | Prisma |

### 10. Database Migrations

| File | Type | Created | Story | Status |
|------|------|---------|-------|--------|
| `prisma/migrations/20260404_add_project_model/migration.sql` | Migration | Epic 0.2 | 0.2 | ✅ Applied |
| `prisma/migrations/20260404_add_creative_file_model/migration.sql` | Migration | Epic 0.6 | 0.6 | ✅ Applied |

### 11. Translations (PT-BR)

| File | Type | Created | Story | Scope |
|------|------|---------|-------|-------|
| `public/locales/pt-BR/common.json` | i18n | Epic 0.1 | 0.1 | Common terms, all surfaces |

---

## 📊 Registry Entry Template

For each component, the IDS registry entry should contain:

```yaml
entity:
  id: "{category}:{name}"
  type: "component|page|hook|slice|route|util|migration"
  filePath: "{src/path}"
  createdBy: "Epic 0"
  createdAt: "2026-04-04"
  story: "0.X"
  
  description: "{purpose of component}"
  
  exports:
    - "{exported name}"
  
  dependencies:
    - "react"
    - "redux" # if applicable
    - "prisma" # if applicable
  
  usedBy: []  # Will be populated as components are referenced
  
  metrics:
    linesOfCode: NNN
    testCoverage: XX%
```

---

## 🔄 IDS Registry Sync Commands

To sync all Epic 0 components into the AIOX IDS registry, run:

```bash
# Individual registrations (in category order)

# Pages
*ids register src/pages/index.tsx --type page --agent @dev
*ids register src/pages/creative-library.tsx --type page --agent @dev
*ids register src/pages/projeto/[id]/dashboard.tsx --type page --agent @dev
*ids register src/pages/projeto/[id]/media.tsx --type page --agent @dev
*ids register src/pages/projeto/[id]/strategy.tsx --type page --agent @dev
*ids register src/pages/projeto/[id]/social.tsx --type page --agent @dev
*ids register src/pages/projeto/[id]/copy.tsx --type page --agent @dev
*ids register src/pages/projeto/[id]/config.tsx --type page --agent @dev

# Projects Module Components
*ids register src/components/Projects/ProjectCard.tsx --type component --agent @dev
*ids register src/components/Projects/ProjectListRow.tsx --type component --agent @dev
*ids register src/components/Projects/ProjectSearch.tsx --type component --agent @dev
*ids register src/components/Projects/CreateProjectModal.tsx --type component --agent @dev
*ids register src/components/Projects/SyncStatusFooter.tsx --type component --agent @dev
*ids register src/components/Projects/ViewToggle.tsx --type component --agent @dev

# Creative Library Components
*ids register src/components/CreativeLibrary/FileList.tsx --type component --agent @dev
*ids register src/components/CreativeLibrary/FileUploadInput.tsx --type component --agent @dev
*ids register src/components/CreativeLibrary/MetadataForm.tsx --type component --agent @dev
*ids register src/components/CreativeLibrary/VersionHistoryPanel.tsx --type component --agent @dev

# Layout Components
*ids register src/components/Layout/ProjectShell.tsx --type component --agent @dev
*ids register src/components/Layout/Navbar.tsx --type component --agent @dev
*ids register src/components/Layout/Sidebar.tsx --type component --agent @dev

# Atomic Components
*ids register src/components/atoms/BrandLogo.tsx --type component --agent @dev
*ids register src/components/molecules/StatusNotice.tsx --type component --agent @dev

# Hooks
*ids register src/hooks/useProjects.ts --type hook --agent @dev
*ids register src/hooks/useOnlineStatus.ts --type hook --agent @dev

# Redux Store
*ids register src/store/projects/projects.slice.ts --type slice --agent @dev
*ids register src/store/creativeLibrary/files.slice.ts --type slice --agent @dev
*ids register src/store/index.ts --type slice --agent @dev

# API Routes
*ids register src/pages/api/projects/index.ts --type route --agent @dev
*ids register src/pages/api/projects/create.ts --type route --agent @dev
*ids register src/pages/api/files/index.ts --type route --agent @dev
*ids register src/pages/api/files/upload.ts --type route --agent @dev
*ids register src/pages/api/files/[id]/actions.ts --type route --agent @dev
*ids register src/pages/api/files/[id]/replace.ts --type route --agent @dev

# Utilities
*ids register src/lib/i18n/TranslationContext.tsx --type util --agent @dev
*ids register src/lib/versioning/service.ts --type util --agent @dev
*ids register src/lib/versioning/historyReader.ts --type util --agent @dev

# Database Migrations
*ids register prisma/migrations/20260404_add_project_model/migration.sql --type migration --agent @dev
*ids register prisma/migrations/20260404_add_creative_file_model/migration.sql --type migration --agent @dev

# Translations
*ids register public/locales/pt-BR/common.json --type translation --agent @dev
```

Or run bulk registration:

```bash
*ids sync-registry-intel --full
```

---

## ✅ Registry Sync Checklist

- [ ] Entity registry accessible at `.aiox-core/data/entity-registry.yaml`
- [ ] All component file paths verified
- [ ] Export names validated (match actual exports)
- [ ] Dependencies cross-checked
- [ ] Component categories consistent
- [ ] Registry synced with all 60+ Epic 0 components

---

## 🎯 Expected Registry State After Sync

```yaml
Entities by Type:
  Pages:           8
  Components:      14
  Hooks:           2
  Slices:          3
  API Routes:      6
  Utilities:       3
  Migrations:      2
  Translations:    1
  
Total Epic 0 Entities: 39+

Health Check:
  All entities have descriptions: ✅
  All entities linked to stories: ✅
  All entities have dependencies: ✅
  No orphaned entities: ✅
  Coverage: 100% of created artifacts
```

---

## 📞 Next Steps

1. **Verify Registry:** Check `.aiox-core/data/entity-registry.yaml` contains all entries
2. **Enable IDS Check:** Future stories can now run `*ids check {intent}` to discover these components
3. **Track Usage:** As Epic 1 stories reference these components, `usedBy` fields will populate
4. **Impact Analysis:** Run `*ids impact {entity-id}` to see component dependencies

---

## 📋 Sign-Off

- **Documented By:** @aiox-master (Orion)
- **Date:** 2026-04-05
- **Status:** Ready for Registry Sync
- **Target:** Before Epic 1 Story 1.0 kickoff

---

**Epic 0 Component Registry — Complete Inventory v1.0**

