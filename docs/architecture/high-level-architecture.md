# High-Level Architecture

## System Overview

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

## Purpose & Scope

**Primary Purpose:** Hybrid asset management platform + creative workflow orchestration

**Key Features:**
- **Creative Library:** Upload, organize, version, and manage creative assets (images, videos, designs)
- **Project Management:** Create and manage brand/client projects with associated assets
- **Metadata Tagging:** File classification, status tracking, and searchable metadata
- **Version History:** Immutable version tracking with git-based commit messages
- **Theme System:** Brand color management and theme customization
- **Internationalization:** Multi-language UI support (i18n configured)

---
