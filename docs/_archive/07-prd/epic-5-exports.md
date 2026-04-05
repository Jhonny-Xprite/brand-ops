# Epic 5: Multi-Format Exports

**Status:** MVP  
**Esforço Estimado:** 50 horas  
**Owner:** @dev (Dex)  
**Data:** 2026-04-03  

---

## 🎯 Overview

Export creatives and metadata in multiple formats: ZIP (files + metadata), CSV (spreadsheet), JSON (structured data). Preserves 100% metadata. Supports bulk export and scheduled daily backups.

---

## 📦 Features

### Feature 5.1: Export as ZIP
- **Contents:** All files + metadata.json (nested structure)
- **Structure:** /exports/export-{timestamp}.zip
- **Metadata:** metadata.json with all fields per file
- **Performance:** <5s for 1K files

**Acceptance Criteria:**
- [ ] ZIP created with correct structure
- [ ] metadata.json included and valid JSON
- [ ] All file types preserved (images, videos, etc)
- [ ] Compression ratio reasonable (>50% for large files)
- [ ] <5s export time for 1K files

---

### Feature 5.2: Export as CSV
- **Format:** Comma-separated with headers
- **Columns:** filename, type, status, tags, notes, created_at, modified_at
- **Encoding:** UTF-8
- **Storage:** /exports/export-{timestamp}.csv

**Acceptance Criteria:**
- [ ] CSV opens in Excel without corruption
- [ ] Headers correct + sortable
- [ ] Special chars (quotes, commas) escaped properly
- [ ] Tags exported as comma-separated values
- [ ] Date format consistent + sortable

---

### Feature 5.3: Export as JSON
- **Format:** Array of objects with full metadata
- **Schema:** {id, name, type, status, tags[], notes, created_at, modified_at, versions[]}
- **Compression:** Optional gzip
- **Storage:** /exports/export-{timestamp}.json

**Acceptance Criteria:**
- [ ] Valid JSON (no syntax errors)
- [ ] All metadata fields included
- [ ] Version history included (commit hash, date)
- [ ] File paths included (for reimport)
- [ ] <2s export time for 1K files

---

### Feature 5.4: Bulk Export Selected Files
- **Trigger:** Select files in grid → right-click → "Export"
- **Scope:** Only selected files + their metadata
- **Formats:** ZIP, CSV, JSON (user choice)
- **Performance:** <3s for 100 files

**Acceptance Criteria:**
- [ ] Export dialog shows format options
- [ ] Select files first (count shown)
- [ ] Export includes only selected + metadata
- [ ] Filename includes date + count (e.g., "export-2026-04-03-50-files.zip")

---

### Feature 5.5: Scheduled Daily Backups
- **Schedule:** Daily at 22:00 (1 hour before sync)
- **Format:** ZIP with all files + metadata
- **Storage:** /exports/daily-backup-{YYYY-MM-DD}.zip
- **Retention:** Keep last 30 days (auto-delete old)

**Acceptance Criteria:**
- [ ] Task runs daily without manual trigger
- [ ] ZIP contains all files + metadata
- [ ] Old backups auto-deleted (>30 days)
- [ ] Log entry for each backup
- [ ] Backup doesn't block normal work

---

## 🔄 Success Criteria (Story Acceptance)

**Developer Signs Off When:**
- [ ] All 5 features implemented + acceptance criteria pass
- [ ] Exports validated (can be reimported or opened)
- [ ] <5s export time for 1K files
- [ ] All metadata preserved (round-trip test)
- [ ] Zero file corruption on export
- [ ] Unit tests for export logic
- [ ] Integration tests with real file operations

---

**Epic Owner:** @dev (Dex)  
**QA Gate:** @qa (Quinn)  
**Related:** Epic 1 (file source), Epic 6 (metadata schema)
