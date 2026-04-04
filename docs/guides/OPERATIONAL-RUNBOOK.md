# Operational Runbook

**Project:** Brand-Ops
**Criticality:** High

---

## 🆘 Emergency Procedures

### 1. Database Corruption
*   **Symptom:** "SQLite Database is Malformed" error.
*   **Action:**
    1.  Stop the application.
    2.  Check for `.db-journal` files.
    3.  Run `sqlite3 brand-ops.db "PRAGMA integrity_check;"`.
    4.  If failed, restore from `data/backups/latest.db`.

### 2. Sync Lock (Deadlock)
*   **Symptom:** Files won't upload; "Lock file present" error.
*   **Action:**
    1.  Verify if any agent is running.
    2.  Delete `.sync-locks/*.lock` manually.
    3.  Restart rclone daemon.

---

## 🛠️ Routine Maintenance

*   **Weekly:** `npm run db:vacuum` (SQLite maintenance).
*   **Daily:** Check `docs/health/SYNC_REPORT.md` for drift.

---

**Maintainer:** @devops (Dax)
