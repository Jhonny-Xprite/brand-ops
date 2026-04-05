# Epic 7: Offline-First Architecture

**Status:** MVP  
**Esforço Estimado:** 100 horas  
**Owner:** @dev (Dex)  
**Data:** 2026-04-03  

---

## 🎯 Overview

Complete offline-first implementation. Users can work 8+ hours without internet. All reads/writes hit local DB first. When online, background sync queues pending changes. Service Worker handles asset serving and offline resilience.

---

## 📦 Features

### Feature 7.1: IndexedDB Cache Layer
- **Purpose:** Persistent offline cache (structured data + file metadata)
- **Contents:** Creativeitems, metadata, search results, UI state
- **Scope:** Recent 100 items, lazy-loaded rest
- **Invalidation:** Cache invalidated on sync completion
- **Storage limit:** ~50-100MB (user's device)

**Acceptance Criteria:**
- [ ] IndexedDB database creates on first run
- [ ] All queries cache results automatically
- [ ] Cache TTL: 5 minutes (RTK Query stale time)
- [ ] Manual "clear cache" option in settings
- [ ] No data loss when cache cleared
- [ ] <100ms read from cache

---

### Feature 7.2: Service Worker
- **Purpose:** Intercept network requests, serve offline
- **Scope:** Static assets (JS, CSS, images)
- **Caching Strategy:** Cache-first for assets, network-first for API
- **Installation:** Auto-install on first load, auto-update

**Acceptance Criteria:**
- [ ] Service Worker registers successfully
- [ ] Assets cached on first load
- [ ] Offline → serve cached assets (no 404s)
- [ ] Online → fetch fresh assets
- [ ] Update check happens daily (or on app load)
- [ ] Uninstall option in settings

---

### Feature 7.3: Background Sync Queue
- **Trigger:** Changes made while offline, user goes online
- **Queue:** Pending changes stored in IndexedDB
- **Sync:** Automatic push to SQLite + Google Drive when online
- **Retry:** Failed syncs retry with exponential backoff

**Acceptance Criteria:**
- [ ] Pending changes persisted in IndexedDB
- [ ] Queue processes on online detection (navigator.onLine)
- [ ] Changes sync to SQLite + Drive in correct order
- [ ] Retry logic: 3 attempts, 1s → 5s → 30s delays
- [ ] User notified of sync status (badge on button)
- [ ] Manual "Sync now" option

---

### Feature 7.4: Sync Status Indicator
- **Location:** Top bar or status bar
- **States:** Online (✓), Offline (✗), Syncing (⟳), Pending (!)
- **Details:** Click → show queue size + last sync time
- **Color:** Green online, red offline, blue syncing, orange pending

**Acceptance Criteria:**
- [ ] Always visible + accurate
- [ ] Updates in real-time (online/offline transitions)
- [ ] Shows pending count ("5 pending changes")
- [ ] Last sync time displayed
- [ ] Click to show details panel
- [ ] Badges + icons accessible (colorblind safe)

---

### Feature 7.5: Offline Mode UX
- **Read operations:** Work perfectly offline (all from cache)
- **Write operations:** Queue changes, UI shows "pending" state
- **Constraints:** Cannot sync to Google Drive (no internet)
- **UX clarity:** Show "offline mode" banner when offline

**Acceptance Criteria:**
- [ ] Browse, search, filter all work offline
- [ ] Edit metadata → "pending" state shown
- [ ] Upload files → queued, not saved yet
- [ ] Delete files → queued, not deleted yet
- [ ] Offline banner shown at top of page
- [ ] Warning before navigation with pending changes

---

### Feature 7.6: Sync-on-Online Detection
- **Trigger:** navigator.onLine changes from false → true
- **Behavior:** Automatic sync starts (no user action needed)
- **Feedback:** Toast notification "Syncing... X pending changes"
- **Timeout:** 30s timeout per sync attempt

**Acceptance Criteria:**
- [ ] Offline detection reliable (tested on real network disconnect)
- [ ] Auto-sync on online detection
- [ ] Sync completes without manual trigger
- [ ] User notified of status (toast + badge)
- [ ] Offline → online → offline transitions handled
- [ ] No duplicate syncs (deduplication)

---

## 🔄 Success Criteria (Story Acceptance)

**Developer Signs Off When:**
- [ ] All 6 features implemented + acceptance criteria pass
- [ ] Offline for 8+ hours without crashes
- [ ] All edits queued correctly while offline
- [ ] Changes sync without data loss when online
- [ ] Service Worker works on real offline (WiFi disconnect)
- [ ] IndexedDB cache efficient (<50MB typical)
- [ ] Zero memory leaks in offline mode
- [ ] Comprehensive offline end-to-end tests
- [ ] UX clear about offline state + pending changes

---

**Epic Owner:** @dev (Dex)  
**QA Gate:** @qa (Quinn)  
**Related:** All epics (all work in offline mode), Epic 4 (sync), Epic 7 (cache)
