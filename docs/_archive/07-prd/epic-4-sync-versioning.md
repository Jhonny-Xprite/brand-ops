# Epic 4: Sync & Versioning (Git + rclone)

**Status:** MVP  
**Esforço Estimado:** 90 horas  
**Owner:** @dev (Dex)  
**Data:** 2026-04-03  

---

## 🎯 Overview

Automatic daily sync to Google Drive via rclone. Git-based versioning for all files. Conflict resolution (local wins), manual backup trigger, and 1-click restore from Drive.

---

## 📦 Features

### Feature 4.1: rclone Daemon Setup
- **Service:** Windows Task Scheduler runs rclone sync daily at 23:00
- **Source:** E:\BRAND-OPS-STORAGE\
- **Destination:** Google Drive /Brand-Ops-Backup/
- **Strategy:** Bi-directional sync (local wins on conflict)
- **Config:** Stored in .config/rclone/rclone.conf

**Acceptance Criteria:**
- [ ] rclone configured via first-run wizard
- [ ] Task Scheduler job created and running
- [ ] Manual sync trigger button in settings
- [ ] Dry-run mode to preview what will sync
- [ ] Logs stored in .sync-logs/

---

### Feature 4.2: Sync Metadata Tracking
- **File:** .sync-metadata/ with JSON tracking
- **Contents:** SHA256 hash, file-id, last-synced timestamp
- **Purpose:** Detect changes, handle conflicts
- **Accuracy:** 100% (no missed changes)

**Acceptance Criteria:**
- [ ] Hash computed on every file change
- [ ] .sync-metadata updated atomically
- [ ] Conflict detected if hashes differ
- [ ] No hash collisions (use SHA256)

---

### Feature 4.3: Conflict Resolution
- **Rule:** Local file always wins on conflict
- **Detection:** Hash mismatch in .sync-metadata
- **UI:** Show conflict dialog if detected
- **Behavior:** Keep local, mark remote as .backup
- **Manual:** User can manually choose remote version

**Acceptance Criteria:**
- [ ] Conflicts detected accurately
- [ ] Dialog shows: "Local modified 2h ago, Remote 30m ago"
- [ ] "Keep local" button (default)
- [ ] "Keep remote" button (overwrite local)
- [ ] "View diff" button for manual comparison
- [ ] Conflict logged for audit

---

### Feature 4.4: Manual Backup Trigger
- **UI:** Button in Settings page
- **Action:** "Backup now" → immediate rclone sync (no wait for 23:00)
- **Feedback:** Progress bar + status messages
- **Logging:** Timestamp + success/fail in sync logs

**Acceptance Criteria:**
- [ ] Button visible + clickable
- [ ] Sync runs to completion
- [ ] Status message: "Synced 234 files in 45 seconds"
- [ ] Error handling + retry logic
- [ ] Can cancel in-progress sync

---

### Feature 4.5: Google Drive Version Restore
- **Access:** Settings → "Restore from Drive"
- **UI:** List of available backups (by date)
- **Action:** Select backup → restore all files
- **Confirmation:** "Restore will replace current files. Confirm?"
- **Result:** Create new version in Git (for rollback if needed)

**Acceptance Criteria:**
- [ ] List shows backups with dates/sizes
- [ ] Select backup → preview what will restore
- [ ] Restore creates Git commit "Restore from Drive backup {date}"
- [ ] <30s restore time for typical backup
- [ ] Can rollback restore (just rollback Git commit)

---

### Feature 4.6: Sync Status Indicator
- **Location:** Status bar (bottom of window)
- **Display:** "Online ✓" or "Offline ✗", "Last sync: 2h ago"
- **Updates:** Real-time (when sync completes)
- **Click:** Show sync details (files synced, time taken, errors)

**Acceptance Criteria:**
- [ ] Shows accurate online/offline status
- [ ] Last sync timestamp always visible
- [ ] Color-coded: green=synced, yellow=pending, red=error
- [ ] Click → details panel with full sync log

---

## 🔄 Success Criteria (Story Acceptance)

**Developer Signs Off When:**
- [ ] All 6 features implemented + acceptance criteria pass
- [ ] rclone configured and tested (dry-run successful)
- [ ] Sync completes 10x without error
- [ ] Conflict resolution tested
- [ ] Restore from Drive tested (files recovered)
- [ ] Logs clean and audit-ready
- [ ] Integration tests with real Google Drive (test account)

---

**Epic Owner:** @dev (Dex)  
**QA Gate:** @qa (Quinn)  
**Related:** Epic 1 (Git for versioning), Epic 6 (Database schema for metadata)
