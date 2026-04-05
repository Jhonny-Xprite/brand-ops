# rclone Sync Configuration Guide

## 1. Overview

This document describes the rclone local-primary backup synchronization setup for the Brand Ops project.

**Purpose:** Maintain automatic backups of local creative assets to Google Drive while keeping the local storage as the single source of truth.

**Architecture:**
- **Source (Local):** `E:\BRAND-OPS-STORAGE\` — Primary working directory on local SSD
- **Destination (Remote):** `Google Drive /Brand-Ops-Backup/` — Cloud backup destination
- **Direction:** One-way sync (`local -> remote backup`)
- **Source of Truth:** Local storage always wins because the remote is treated as backup, not as a second writable replica
- **Schedule:** Daily at 23:00 UTC via Windows Task Scheduler

---

## 2. rclone Configuration Setup

### OAuth Configuration for Google Drive

rclone requires OAuth authentication to access Google Drive. Follow these steps:

1. **Install rclone** (if not already installed):
   ```bash
   # Download from: https://rclone.org/downloads/
   # Extract to a known location (e.g., C:\Program Files\rclone)
   ```

2. **Create rclone config for Google Drive:**
   ```bash
   rclone config
   ```
   
3. **Interactive setup steps:**
   - Choose: "Create new remote"
   - Name: `gdrive`
   - Storage type: Select `Google Drive` (option number varies)
   - Client ID: Leave blank (use rclone's default)
   - Client Secret: Leave blank
   - Scope: Select `Full access` for all files
   - Service Account: No (use personal account)
   - Edit advanced config: No
   
4. **OAuth approval:**
   - rclone will open browser for Google authentication
   - Approve access to Google Drive
   - rclone will display confirmation token
   - Verify connection works: `rclone ls gdrive:`

5. **Config file location:**
   - Windows: `%APPDATA%\rclone\rclone.conf`
   - Linux: `~/.config/rclone/rclone.conf`
   - macOS: `~/.config/rclone/rclone.conf`

### Folder Structure in Google Drive

Create the following folder structure in Google Drive:

```
My Drive/
└── Brand-Ops-Backup/
    ├── creative-assets/
    ├── project-files/
    ├── archives/
    └── .sync-metadata/   (for sync tracking)
```

**Note:** Use forward slashes in rclone commands for consistency across platforms.

---

## 3. Sync Command & Strategy

### One-Way Backup Sync Configuration

**Command structure for manual testing:**

```bash
rclone sync \
  --create-empty-src-dirs \
  --delete-during \
  --backup-dir=gdrive:Brand-Ops-Backup/.trash \
  --suffix=.conflict-{LocalTime} \
  --drive-chunk-size=256M \
  --transfers=4 \
  --checkers=8 \
  --verbose \
  E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/
```

**Parameters explained:**

| Parameter | Purpose |
|-----------|---------|
| `--create-empty-src-dirs` | Preserve empty folders in sync |
| `--delete-during` | Delete files on remote that don't exist locally |
| `--backup-dir` | Move overwritten or deleted remote files to trash instead of permanently deleting |
| `--suffix=.conflict-{LocalTime}` | Add timestamp suffix to preserved remote backup copies before replacement |
| `--drive-chunk-size=256M` | Upload chunk size for large files |
| `--transfers=4` | Number of parallel transfers |
| `--checkers=8` | Number of parallel checkers |
| `--verbose` | Log all operations for debugging |

### Backup And Recovery Semantics

**Local-Primary Backup Approach:**

When `rclone sync E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/` runs:

1. **If a local file is new or updated:** The remote backup copy is created or replaced from local
2. **If a remote file changed independently:** The next sync replaces the remote copy with the local source-of-truth version
3. **If a local file was deleted:** The remote copy is moved to `.trash/` because of `--backup-dir`, rather than being deleted permanently
4. **If recovery is needed:** Restore from the remote backup copy or `.trash/`; do not treat Google Drive as a co-equal writable replica

**Operational Rule:** Remote backup content should not be edited directly when using this command model. Direct remote edits are considered drift and will be overwritten by the next scheduled sync.

**Metadata Tracking:**

The `.sync-metadata/` folder can store:
- Last sync timestamp
- File checksums
- Conflict log
- Sync statistics

This supports auditability and future sync-state tooling without implying that the external storage folder is tracked by this repository.

---

## 4. Windows Task Scheduler Configuration

### Automated Daily Sync at 23:00 UTC

**Create scheduled task:**

1. Open Windows Task Scheduler
2. Right-click "Task Scheduler Library" → "Create Task"
3. **General Tab:**
   - Name: `Brand-Ops-rclone-sync`
   - Description: `Daily backup sync to Google Drive at 23:00 UTC`
   - Run with highest privileges: ✓ (check)
   - Hidden: ✓ (optional)

4. **Triggers Tab:**
   - New → Trigger
   - Begin task: On a schedule
   - Daily
   - Start: `2026-04-04` at `23:00:00`
   - Recur: every 1 day
   - OK

5. **Actions Tab:**
   - Action: Start a program
   - Program: `C:\Program Files\rclone\rclone.exe`
   - Arguments:
   ```
   sync --create-empty-src-dirs --delete-during --backup-dir=gdrive:Brand-Ops-Backup/.trash --suffix=.conflict-{LocalTime} --drive-chunk-size=256M --transfers=4 --checkers=8 --log-file=C:\ProgramData\rclone\logs\sync-{Date}.log E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/
   ```
   - Start in: `C:\Program Files\rclone`
   - OK

6. **Conditions Tab:**
   - Run only if user is logged on: ✓ (important for Drive access)
   - Run with highest privileges: ✓
   - Wake computer to run task: ✓ (optional)

7. **Settings Tab:**
   - Stop task if runs longer than: 2 hours
   - If task fails, restart after: 1 minute
   - Retry count: 3
   - OK

**Log file location:**
```
C:\ProgramData\rclone\logs\sync-{Date}.log
```

### Time Zone Consideration

- **Scheduled time:** 23:00 UTC
- **Windows default:** UTC offset varies by region
- **Verify:** Open Task Scheduler → View → "Server Time Zone" to confirm

---

## 5. Monitoring & Troubleshooting

### Check Sync Status

**View recent sync logs:**
```bash
# Show last 50 lines of today's log
Get-Content "C:\ProgramData\rclone\logs\sync-*.log" -Tail 50

# Count synced files
rclone size E:\BRAND-OPS-STORAGE\
rclone size gdrive:Brand-Ops-Backup/
```

**Common commands:**

```bash
# Test connection
rclone ls gdrive:Brand-Ops-Backup/

# Dry run (no changes made)
rclone sync \
  --dry-run \
  --verbose \
  E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/

# Show differences without syncing
rclone diff E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/

# Check for errors
rclone check E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/
```

### Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Auth error" | OAuth token expired | Re-run `rclone config` and re-authenticate |
| "Drive quota exceeded" | Storage limit reached | Archive old files, delete unnecessary backups |
| Sync hangs | Network timeout | Reduce `--transfers` to 2, increase timeout |
| File permission errors | NTFS permissions too restrictive | Grant rclone/user full access to `E:\BRAND-OPS-STORAGE\` |
| Task never runs | Scheduled task disabled | Verify task status in Task Scheduler, enable if needed |

### Monitoring Task Execution

**View Task Scheduler History:**
1. Task Scheduler → Task Scheduler Library
2. Right-click `Brand-Ops-rclone-sync` → View All Properties
3. History tab → View task execution records
4. Check "Last Run Result" column for success/failure

**View Windows Event Log:**
```powershell
# PowerShell: Show task events from last 24 hours
Get-WinEvent -LogName "Windows PowerShell" -MaxEvents 100 | 
  Where-Object {$_.ProviderName -eq "Task Scheduler"} | 
  Select-Object TimeCreated, Message
```

---

## 6. Security & Best Practices

### Protect rclone.conf

The `rclone.conf` file contains sensitive OAuth tokens. Protect it:

```bash
# Windows: Restrict permissions
icacls %APPDATA%\rclone\rclone.conf /grant:r "%USERNAME%":F /inheritance:r

# Never commit rclone.conf to git
# Ensure .gitignore includes: .config/rclone/
```

### Regular Verification

Schedule weekly verification:

```bash
# Weekly checksum verification (slower but thorough)
rclone check --one-way E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/
```

### Backup Retention

Keep monthly backups:

```bash
# Archive old syncs (monthly)
rclone move gdrive:Brand-Ops-Backup/ gdrive:Brand-Ops-Archives/2026-04/
```

---

## 7. Rollback Procedures

### If accidental deletion occurred

**Files deleted locally, but need recovery from remote:**

```bash
# Restore from backup directory
rclone copy gdrive:Brand-Ops-Backup/ E:\BRAND-OPS-STORAGE-RESTORE\

# Review restored files, then merge
```

**Files deleted on remote, but still exist locally:**

Sync will automatically recreate them:
```bash
rclone sync \
  --delete-during \
  --verbose \
  E:\BRAND-OPS-STORAGE\ gdrive:Brand-Ops-Backup/
```

---

**Last Updated:** 2026-04-03  
**rclone Version:** 1.65+ (recommended)  
**Documentation Status:** Complete for Story 0.4
