# Technical Decisions & Stack

**Document:** Architecture decisions, tech stack, performance targets  
**Status:** Ready for Development  
**Date:** 2026-04-03  
**Owner:** @architect (Aria)  

---

## 🎯 Tech Stack (MVP)

### Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Framework** | Next.js 14 | SSR-capable, file system routes, offline PWA support |
| **Library** | React 18 | Hooks, concurrent rendering for smooth scrolling |
| **Components** | shadcn/ui | Headless, accessible, Tailwind-native, dark mode |
| **Styling** | Tailwind CSS v3 | Utility-first, design tokens (Violet+Gold), responsive |
| **Icons** | Lucide React | Lightweight, tree-shakable, accessible |
| **Charts** | Recharts | React-native, responsive, minimal dependencies |
| **State** | Redux Toolkit + RTK Query | Offline-first patterns, caching, optimistic updates |
| **Forms** | React Hook Form | Lightweight, performant, zero dependencies |
| **Storage (Cache)** | IndexedDB | Persistent offline cache, 50-100MB capacity |
| **Service Worker** | Workbox | Auto-generated SW, cache-first strategy |

### Backend (Local)

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Database** | SQLite | Single-file, zero server, reliable for local use |
| **ORM** | Prisma | Type-safe, migrations, relation management |
| **Query Language** | SQL + Prisma | Performance, flexibility, type safety |
| **Search** | SQLite FTS5 | Full-text search, indexed, <500ms performance |
| **Versioning** | Git | Automatic, proven, built-in history + rollback |

### Sync & Storage

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **File Sync** | rclone | Cloud-agnostic, bi-directional, reliable |
| **Backup** | Google Drive + 2TB Google One | Personal, versioned, accessible anywhere |
| **Sync Schedule** | Windows Task Scheduler | Native, reliable, non-intrusive (23:00 UTC) |
| **File Watch** | chokidar | Detects file system changes in real-time |

### Export & Utilities

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **ZIP Creation** | node-zip | Lightweight, streaming support |
| **CSV Export** | json2csv | Simple, handles special chars |
| **JSON Export** | Native JSON | Standard, no dependencies |

---

## 📊 Performance Targets (MVP)

| Metric | Target | Rationale | Confidence |
|--------|--------|-----------|------------|
| **App load** | <2s | Electron cold start | 95% |
| **Search 1K files** | <500ms | SQLite FTS5 + indexes | 98% |
| **Filter combo (3+)** | <300ms | Indexed WHERE clause | 96% |
| **File upload (50MB)** | <1s | Local FS write (HW dependent) | 99% |
| **Timeline render** | <400ms | SQL GROUP BY + Recharts memoization | 93% |
| **Export 1K files to ZIP** | <5s | Async compression | 90% |
| **Offline capability** | 100% for 8+ hours | IndexedDB + SQLite local | 99% |
| **Sync time (1K files)** | <2 min | rclone bi-directional | 95% |

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (React Components)               │
│ - Atomic design (atoms → molecules → organisms)     │
│ - Redux state, RTK Query caching                    │
│ - Redux Toolkit reducers + thunks                   │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ LOCAL DATA LAYER (SQLite + Prisma)                  │
│ - Creative, Metadata, Version, SyncMetadata tables │
│ - Indexes on type, status, created_at, tags       │
│ - FTS5 for search (name + notes)                   │
│ - Migrations for schema evolution                   │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ OFFLINE LAYER (Service Worker + IndexedDB)         │
│ - Cache-first for assets (JS, CSS)                 │
│ - Network-first for API calls (fallback to cache)  │
│ - IndexedDB for structured data persistence        │
│ - Sync queue for pending changes                   │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ STORAGE LAYER (Filesystem + Git)                    │
│ - Primary: E:\BRAND-OPS-STORAGE\ (SSD)             │
│ - Git repo for versioning                          │
│ - .sync-metadata/ for tracking hashes              │
│ - brand-ops.db for SQLite                          │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ SYNC LAYER (rclone)                                │
│ - Bi-directional sync to Google Drive              │
│ - Conflict resolution (local wins)                 │
│ - Daily 23:00 UTC schedule                         │
│ - Manual "Backup now" trigger                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Write Operation (Create/Edit File)

```
User uploads file (drag-drop)
  ↓
Optimistic UI update (show in Redux)
  ↓
Write to SQLite (Prisma)
  ↓
Create git commit (auto)
  ↓
Update .sync-metadata (SHA256)
  ↓
If online: queue for rclone sync (background)
If offline: queue in IndexedDB, sync when online
  ↓
Success toast / error dialog
```

### Read Operation (Search/Filter)

```
User searches "Instagram"
  ↓
RTK Query checks cache (5-min stale time)
  ↓
If cached + fresh: return from cache
If stale/missing: query SQLite (FTS5)
  ↓
Results in <500ms (1K files)
  ↓
Update Redux store + cache
  ↓
UI renders results
```

### Sync Operation (Daily rclone)

```
23:00 UTC daily trigger (Windows Task Scheduler)
  ↓
rclone bisync local ↔ Google Drive
  ↓
Detect changes (.sync-metadata hashes)
  ↓
Conflict detected?
  ├─ YES: Local wins (keep local file)
  └─ NO: Normal bi-directional sync
  ↓
Update .sync-metadata
  ↓
Log sync event
```

---

## 🔐 Security Architecture

### Local Security
- **File permissions:** SQLite db with 0600 (user-only)
- **No secrets:** Zero API keys in code (rclone OAuth in system keyring)
- **No telemetry:** No tracking, no analytics

### Sync Security
- **OAuth 2.0:** Google Drive auth via rclone
- **HTTPS:** All rclone sync over encrypted transport
- **Versioning:** Google Drive native versioning (30-day history)

### No External APIs
- **Zero network calls** (except rclone → Google Drive)
- **No webhooks** or event subscriptions
- **No third-party SDKs**

---

## 📈 Scalability Plan

### Phase 1 (MVP)
- **File capacity:** 1K-10K files comfortable
- **Storage:** 50-200GB typical (HW dependent)
- **Database:** SQLite handles 100K+ records easily
- **Limitation:** Single-user only (no multi-tenant)

### Phase 2+ (If approved)
- **Multi-user:** Switch to PostgreSQL (if needed)
- **Real-time sync:** WebSocket for collaboration
- **Mobile app:** React Native (iOS/Android)
- **Advanced search:** Semantic search with embeddings

---

## 🎯 Trade-Offs & Decisions

| Decision | Chosen | Alternative | Why |
|----------|--------|-------------|-----|
| **Database** | SQLite local | PostgreSQL cloud | Zero server, offline-first MVP |
| **Sync** | rclone | Google API SDK | Cloud-agnostic, proven |
| **Frontend** | Next.js + React | Vue.js | React ecosystem + TypeScript |
| **State** | Redux Toolkit | Zustand | RTK Query caching + offline patterns |
| **Components** | shadcn/ui | Material-UI | Headless, Tailwind, lightweight |
| **Styling** | Tailwind | CSS Modules | Utility-first, design tokens (Violet+Gold) |
| **Charts** | Recharts | Chart.js | React-native, minimal config |
| **Versioning** | Git local | Manual snapshots | Automatic, complete history |
| **Mobile** | Defer to Phase 2 | React Native MVP | Desktop-first priority |
| **Collab** | Single-user MVP | Real-time MVP | Simplicity, clear scope |

---

## 🚀 Deployment Strategy

### Phase 1 (MVP)
- **Distribution:** Web app (localhost:3000)
- **User runs:** `npm install && npm run dev`
- **Setup:** Minimal (create E:\BRAND-OPS-STORAGE\ folder)

### Phase 2
- **Desktop App:** Electron wrapper
- **Auto-updates:** GitHub releases + electron-updater
- **Installer:** Windows installer (chocolatey optional)

---

## 📋 Success Criteria (Tech Stack)

- [ ] All technologies chosen and rationale documented
- [ ] Performance targets achievable with chosen stack
- [ ] Offline-first architecture proven on tech stack
- [ ] No breaking dependencies (check npm advisories)
- [ ] TypeScript strict mode enabled
- [ ] Testing framework ready (Jest + React Testing Library)
- [ ] Build & deployment pipeline documented

---

## 📚 Related Documentation

- **Fullstack Architecture:** docs/fullstack-architecture.md (detailed layer descriptions)
- **Frontend Spec:** docs/front-end-spec.md (UI/UX based on this tech stack)
- **Storage Strategy:** docs/storage-sync-strategy.md (rclone + Git implementation)
- **Epic Specs:** docs/prd/epic-*.md (feature implementations per epic)

---

**Document Owner:** @architect (Aria)  
**Approved By:** @pm (Morgan)  
**Ready For:** Development Cycle (PHASE 3)
