# Quick Reference — Key Files and Entry Points

## Critical Files for Understanding the System

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

## Pages and Routes

- **`/`** — Dashboard (home/index.tsx)
- **`/creative-library`** — Creative asset management interface
- **`/design-system`** — Design system showcase (static page)
- **`/projeto/*`** — Project-specific routes (projeto/ folder)

## API Routes Implemented

| Endpoint | Method | Purpose | Location |
|----------|--------|---------|----------|
| `/api/files/{id}` | GET, PATCH | Fetch/update creative file metadata | `src/pages/api/files/[id].ts` |
| `/api/files/*` | Various | File operations (upload, delete, versioning) | `src/pages/api/files/` |
| `/api/projects/*` | GET, POST, PATCH | Project management | `src/pages/api/projects/` |
| `/api/projeto/*` | Various | Project-specific operations | `src/pages/api/projeto/` |
| `/api/versioning/*` | GET, POST | Version history and control | `src/pages/api/versioning/` |

---
