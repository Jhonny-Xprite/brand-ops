# Brand-Ops MVP — Fullstack Architecture

**Versão:** 1.0.0  
**Status:** Design Ready  
**Arquiteto:** Aria (Architect)  
**Data:** 2026-04-03  
**Linguagem:** Português (Brasil)

---

## 📊 Executive Summary

Complete system architecture for **offline-first creative production management**. Frontend handles all presentation + local state, backend (SQLite) handles persistence, rclone handles distributed sync. Zero server required. Architecture supports 1K-10K files with <500ms search, <1s upload, <400ms timeline renders.

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Next.js 14 + React 18)                        │
│ ├─ UI Components (shadcn/ui)                               │
│ ├─ State Management (Redux Toolkit + RTK Query)           │
│ ├─ Service Worker (offline sync, background tasks)        │
│ └─ Local Cache (IndexedDB)                                │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│ DATA LAYER (SQLite + Prisma ORM)                            │
│ ├─ Schema: Creative, Metadata, Version, Tags              │
│ ├─ Indexes on: type, created_at, status, tags            │
│ ├─ FULL-TEXT search (SQLite FTS5)                         │
│ └─ Local file: brand-ops.db                               │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│ STORAGE LAYER (Filesystem + Git)                            │
│ ├─ Primary: E:\BRAND-OPS-STORAGE\ (SSD)                   │
│ ├─ Versioning: Git (1 repo per collection type)           │
│ ├─ Metadata: .sync-metadata/ (JSON files)                 │
│ └─ Lock files: .sync-locks/ (concurrent access)           │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│ SYNC LAYER (rclone daemon)                                  │
│ ├─ Push: Daily 23:00 UTC (configurable)                    │
│ ├─ Strategy: Bi-directional (local wins on conflict)      │
│ ├─ Service: rclone serve + systemd timer (Windows Task)  │
│ └─ Destination: Google Drive /Brand-Ops-Backup/           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 FRONTEND ARCHITECTURE

### Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR-capable, offline PWA support, file system routes |
| **UI Library** | React 18 | Hooks, concurrent rendering for smooth scrolling |
| **Component System** | shadcn/ui | Headless, accessible, Tailwind-native, dark mode |
| **Styling** | Tailwind CSS v3 | Utility-first, design tokens (Violet #9333EA + Gold #FBBF24) |
| **Icons** | Lucide React | Lightweight, tree-shakable, accessible |
| **Charts** | Recharts | React-native, responsive, minimal dependencies |

### State Management Architecture

#### Layer 1: Redux Toolkit + RTK Query (Global State)

```typescript
// Store structure
store/
├── slices/
│   ├── creativeSlice.ts        // Creative list, filters, search
│   ├── metadataSlice.ts        // Metadata editor state
│   ├── versionsSlice.ts        // Version history
│   ├── settingsSlice.ts        // User preferences (theme, layout)
│   └── syncSlice.ts            // Sync status, online/offline
├── api/
│   ├── creativeApi.ts          // RTK Query endpoints
│   ├── metadataApi.ts
│   └── versionApi.ts
└── hooks.ts                    // useAppDispatch, useAppSelector
```

**Why RTK Query for local SQLite:**
- Caching out-of-box
- Automatic background refetch when connection restored
- Optimistic updates (show result immediately, validate later)
- Abort on unmount (no memory leaks)

#### Layer 2: React Context (Feature-Scoped)

```typescript
// For features that don't need global state
contexts/
├── SearchContext.tsx           // Search query + filters
├── ViewContext.tsx             // Grid/List toggle, sort order
└── FileUploadContext.tsx       // Drag-drop, progress
```

#### Layer 3: Component State (React hooks)

```typescript
// For UI-only state (modals, tooltips, focus)
const [isModalOpen, setIsModalOpen] = useState(false);
const [hoveredCardId, setHoveredCardId] = useState(null);
```

### Offline-First Sync Strategy

#### Service Worker Flow

```
User opens app
  ↓
Service Worker activates
  ├─ Check: is online?
  ├─ YES: Load from IndexedDB + fetch from SQLite (local API)
  └─ NO: Load from IndexedDB only
  ↓
User makes change (e.g., edit metadata)
  ├─ Optimistic update: update Redux store immediately
  ├─ Write to SQLite (local)
  └─ If online: sync to Google Drive via rclone (background)
  ↓
User goes offline
  ├─ All reads/writes continue from IndexedDB + SQLite
  ├─ Service Worker queues pending syncs
  └─ When online: batched sync to Google Drive
```

#### IndexedDB Cache Strategy

```typescript
// Persistent offline cache (IndexedDB)
db.creatives
  ├─ id (primary key)
  ├─ content (file data, blob)
  ├─ metadata (JSON: type, status, tags, notes)
  ├─ lastSynced (timestamp)
  └─ needsSync (boolean)
```

### Component Architecture (Atomic Design)

#### Atoms
- `Button`, `Input`, `Label`, `Card`, `Badge`, `Icon`
- Styled with Tailwind, all with dark mode

#### Molecules
- `FormField` (Label + Input + Error)
- `FilterChip` (Badge + X button)
- `FileCard` (Image + Metadata)
- `StatusPill` (Status badge)

#### Organisms
- `CreativeGrid` (Grid of FileCards)
- `CreativeList` (Table view)
- `MetadataEditor` (Form with 6 fields)
- `VersionTimeline` (List of version entries)
- `FilterBar` (Combo filter UI)
- `SearchBox` (Search + autocomplete)

#### Templates
- `LibraryPage` (Sidebar + SearchBar + FilterBar + CreativeGrid)
- `DashboardPage` (Sidebar + Timeline + Summary Cards)
- `SettingsPage` (Sidebar + Settings form)

### Performance Optimizations

#### 1. Virtual Scrolling
```typescript
// For 1K+ files, use react-window
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={4}
  columnWidth={250}
  height={800}
  rowCount={items.length / 4}
  rowHeight={300}
  width={1000}
  itemData={items}
>
  {({ columnIndex, rowIndex, style }) => (
    <FileCard item={items[rowIndex * 4 + columnIndex]} style={style} />
  )}
</FixedSizeGrid>
```

#### 2. Memoization
```typescript
const FileCard = React.memo(({ item }) => (...), 
  (prev, next) => prev.item.id === next.item.id);
```

#### 3. Code Splitting
```typescript
const DashboardPage = lazy(() => import('./pages/dashboard'));
const SettingsPage = lazy(() => import('./pages/settings'));
```

#### 4. Image Optimization
- Next.js Image component with `loading="lazy"` + `sizes`
- WebP with fallback
- Thumbnail caching in IndexedDB

---

## 🗄️ DATA LAYER (SQLite + Prisma)

### Database Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./brand-ops.db"
}

model Creative {
  id            String   @id @default(cuid())
  name          String
  type          String   // "image", "video", "carousel", etc
  filePath      String   @unique
  fileSize      Int
  mimeType      String
  
  status        String   @default("draft")  // draft, approved, done
  tags          String   // JSON array: ["tag1", "tag2"]
  notes         String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  versions      Version[]
  metadata      Metadata?
  
  @@index([type])
  @@index([status])
  @@index([createdAt])
  @@fulltext([name, notes])  // SQLite FTS5
}

model Metadata {
  id            String   @id @default(cuid())
  creativeId    String   @unique
  creative      Creative @relation(fields: [creativeId], references: [id])
  
  designer      String?
  campaign      String?
  targetAudience String?
  format        String?
  
  customFields  String   // JSON object for extensibility
  
  @@index([designer])
  @@index([campaign])
}

model Version {
  id            String   @id @default(cuid())
  creativeId    String
  creative      Creative @relation(fields: [creativeId], references: [id])
  
  versionNumber Int
  commitHash    String   // Git commit SHA for traceability
  message       String?  // Why this version
  createdAt     DateTime @default(now())
  
  @@index([creativeId, versionNumber])
}

model SyncMetadata {
  id            String   @id @default(cuid())
  entityId      String   // Creative or other entity ID
  lastSyncAt    DateTime
  syncHash      String   // SHA256 of synced content
  isSynced      Boolean  @default(false)
}
```

### Query Optimization

```typescript
// Indexed queries for performance
// 1. Get creatives with filters
const creatives = await prisma.creative.findMany({
  where: {
    type: "image",
    status: "approved",
    createdAt: { gte: startDate, lte: endDate }
  },
  include: { versions: { orderBy: { versionNumber: "desc" } } }
});

// 2. Full-text search with filters
const results = await prisma.$queryRaw`
  SELECT * FROM Creative 
  WHERE (name MATCH ${query} OR notes MATCH ${query})
    AND type = ${type}
    AND status = ${status}
  LIMIT 50
`;

// 3. Timeline aggregation
const timeline = await prisma.$queryRaw`
  SELECT 
    DATE(createdAt) as date,
    type,
    COUNT(*) as count
  FROM Creative
  WHERE createdAt >= ${startDate}
  GROUP BY date, type
  ORDER BY date DESC
`;
```

---

## 📂 STORAGE LAYER (Filesystem + Git)

### Directory Structure

```
E:\BRAND-OPS-STORAGE\
│
├── .git/                          // Git repo for versioning
├── .sync-metadata/
│   ├── creative-production.json   // SHA256 hashes for conflict detection
│   ├── brand-core.json
│   └── media-library.json
├── .sync-locks/
│   └── creative-production.lock   // Prevent concurrent edits
│
├── strategy/                      // 7 JSON files
├── brand-core/                    // Logos, typography, colors
├── creative-production/           // PRIMARY: Images, videos, carousels
├── media-library/                 // Raw footage, photos
├── social-assets/                 // Instagram, Facebook, LinkedIn
├── copy-messaging/                // Ads copy, headlines, scripts
│
└── brand-ops.db                   // SQLite (also synced)
```

### Git Integration

```bash
# Initialization (one-time)
cd E:\BRAND-OPS-STORAGE\
git init
git config user.email "you@example.com"
git config user.name "Brand-Ops"
git add .
git commit -m "Initial commit: Brand-Ops repository"

# On every file change (automatic via app)
git add <changed-file>
git commit -m "Update: <creative-name> - <change-reason>"

# Enable local Git history
git config --local core.maxSize 10gb  // For large files

# Verify (CLI)
git log --oneline --graph          // View version history
```

### Sync Strategy (rclone)

#### Configuration
```toml
# .config/rclone/rclone.conf
[google-drive-backup]
type = drive
client_id = {YOUR_CLIENT_ID}
client_secret = {YOUR_CLIENT_SECRET}
token = {OAUTH_TOKEN}
```

#### Sync Job (Windows Task Scheduler)
```powershell
# C:\tasks\brand-ops-sync.ps1
$rcloneConfig = "$env:APPDATA\.config\rclone\rclone.conf"
$localPath = "E:\BRAND-OPS-STORAGE\"
$remotePath = "google-drive-backup:/Brand-Ops-Backup/"

# Bi-directional sync (local wins on conflict)
& 'C:\Program Files\rclone\rclone.exe' bisync `
  --skip-dir-links `
  --conflict "local" `
  --create-empty-src-dirs `
  --checkers 8 `
  "$localPath" "$remotePath" `
  --log-file "C:\logs\brand-ops-sync.log"

# Send completion webhook (optional)
Invoke-WebRequest -Uri "http://localhost:3000/api/sync-complete" `
  -Method POST -Body @{ timestamp = Get-Date } -ContentType "application/json"
```

#### Scheduling
```
Windows Task Scheduler
├─ Name: Brand-Ops Daily Sync
├─ Trigger: Daily at 23:00 UTC
├─ Action: C:\tasks\brand-ops-sync.ps1
├─ Run with: Highest privileges
└─ Condition: If idle > 10 minutes (non-intrusive)
```

---

## 🔄 SYNC LAYER & CONFLICT RESOLUTION

### Sync Decision Tree

```
File changed (local or remote)?
├─ NO: Keep as-is
└─ YES: Compare hashes
    ├─ Hash match: Synced already (skip)
    └─ Hash mismatch: Conflict
        ├─ If created locally > 5 min ago: Local wins (user's recent work)
        ├─ If created remotely: Remote wins (backup source of truth)
        └─ Else: Manual resolution (show conflict dialog)
```

### Conflict Resolution UI

```typescript
// If sync detects conflict:
<ConflictDialog>
  <div>
    <h2>Conflict Detected: {filename}</h2>
    <p>Local version modified 2 hours ago</p>
    <p>Remote version modified 30 minutes ago</p>
    <button onClick={() => keepLocal()}>Keep Local</button>
    <button onClick={() => keepRemote()}>Keep Remote</button>
    <button onClick={() => viewDiff()}>View Diff</button>
  </div>
</ConflictDialog>
```

---

## 🔐 SECURITY ARCHITECTURE

### Local Security
- **File Permissions:** SQLite db with 0600 (user-only)
- **Encryption at Rest:** Optional BitLocker (Windows) on storage drive
- **Secrets:** None stored locally (rclone OAuth token in system keyring)

### Sync Security
- **OAuth 2.0:** Google Drive authentication via rclone
- **HTTPS:** All rclone sync over encrypted transport
- **Version History:** Google Drive's native versioning + recycle bin (30 days)

### No Network Services
- **Zero inbound ports** — app is 100% local
- **Zero outbound APIs** — only rclone sync to Google Drive
- **No telemetry** — no tracking, no analytics

---

## ⚡ PERFORMANCE OPTIMIZATION

### Search Performance Target: <500ms

#### Approach
1. **SQLite FTS5 (Full-Text Search)**
   ```sql
   CREATE VIRTUAL TABLE creative_fts USING fts5(
     name, notes, tags, 
     content=creative,
     content_rowid=id
   );
   ```

2. **Indexed WHERE clauses**
   ```sql
   CREATE INDEX idx_creative_type_status_date 
     ON creative(type, status, createdAt DESC);
   ```

3. **Query batching**
   - Server: 50 items per query
   - Client: Virtual scrolling (render 12 visible, buffer 36)

4. **Caching**
   - RTK Query: 5-minute stale time
   - IndexedDB: Permanent cache (validate on sync)

### Upload Performance: <1s for 50MB

#### Approach
1. **Local filesystem write:** OS-handled (hardware IOPS)
2. **Database insert:** Prisma async + indexed on ID
3. **Version creation:** Git commit (async, non-blocking UI)
4. **Sync:** Background task, not user-blocking

### Timeline Render: <400ms for 100+ points

#### Approach
1. **Data aggregation:** SQL GROUP BY on creation date
2. **Chart library:** Recharts (optimized for React)
3. **Memoization:** useMemo on chart data transform
4. **Lazy loading:** Load only visible month range

---

## 🚀 DEPLOYMENT STRATEGY

### Desktop Distribution (Electron - Phase 2)

For MVP, web app running on `http://localhost:3000`:

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Phase 1: Web-based (No Distribution)
- User runs `npm run dev` locally
- Opens browser to `http://localhost:3000`
- App manages E:\BRAND-OPS-STORAGE\ directly

### Phase 2: Electron Wrapper
- Electron bundle
- Auto-update from GitHub releases
- System tray integration
- Dock/taskbar icon

---

## 📋 INTEGRATION PATTERNS

### Creative Production Workflow

```
1. Upload file → chokidar detects → Add to SQLite
2. Edit metadata → Redux optimistic update → SQLite insert
3. Auto-version → Git commit (background) → Version record
4. Tag/filter → RTK Query with WHERE clause
5. Timeline view → SQL aggregation query
6. Export → Collect records → ZIP + CSV + JSON → Download
```

### Sync Workflow

```
1. Daily 23:00 → rclone bisync triggered
2. Compare hashes → Conflict detection
3. If conflict → Show user modal → Apply resolution
4. If clear → Sync SQLite + files to Google Drive
5. Webhook → Update sync metadata in app
6. RTK Query → Invalidate cache → Fresh data
```

---

## 🎯 SUCCESS CRITERIA

| Métrica | Target | Medição |
|---------|--------|---------|
| **App Load** | <2s | lighthouse / dev tools |
| **Search** | <500ms | redux logger + network tab |
| **Filter Combo** | <300ms | user action → render complete |
| **File Upload** | <1s (50MB) | elapsed time from select to confirm |
| **Timeline Render** | <400ms | recharts render time |
| **Export 1K files** | <5s | zip creation + download |
| **Offline Capability** | 100% | disconnect network + use app |
| **Sync Reliability** | 99.9% | log successful syncs |

---

## 🔮 FUTURE EXTENSIONS

**Phase 2 Candidates (Out of MVP scope):**
- Multi-user collaboration (real-time sync via WebSocket)
- Mobile app (React Native)
- AI-powered tagging (metadata auto-population)
- Advanced integrations (Airtable, Notion, Zapier)
- Custom plugin system
- Advanced search (semantic search)

---

## 📚 Architecture Decision Records (ADRs)

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| **SQLite not PostgreSQL** | Zero server, zero cost, full offline | PostgreSQL (requires server) |
| **Electron not web** | Desktop-first UX, file system access | Web (Phase 2) |
| **rclone not Google API** | Provider-agnostic (works with any cloud), proven stability | Google API SDK (vendor lock) |
| **Redux Toolkit** | Boilerplate reduction, RTK Query for APIs | Zustand (simpler but less ecosystem) |
| **shadcn/ui** | Headless, tailwind, accessible | Material-UI (heavyweight) |
| **Prisma** | Type-safe ORM, SQLite support, migrations | Knex (lower-level) |

---

**Documento Proprietário — Brand-Ops Project**  
**Próximas Etapas:** Review @po (validation) → Conditional updates @pm (PRD) → PHASE 2 (Document Sharding)
