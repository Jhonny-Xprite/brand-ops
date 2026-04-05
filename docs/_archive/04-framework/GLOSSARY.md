# Project Glossary (Ubiquitous Language)

**Project:** Brand-Ops
**Status:** Initial Draft

---

## 📚 Core Terms

| Term | Definition | Domain | Context |
|------|------------|--------|---------|
| **Creative** | The root entity for any managed file (Image, Video, Doc). | Data | Database Model |
| **Collection** | A logical grouping of Creatives (e.g., "Summer Campaign"). | Product | UI |
| **Snapshot** | A fixed version of a Creative metadata set at a point in time. | Sync | Git Versioning |
| **Drift** | When local file metadata differs from the SQLite state. | Health | Operational |
| **Loom** | The background sync process (rclone daemon). | Infra | DevOps |
| **Vault** | The physical storage directory (E:\BRAND-OPS-STORAGE). | Architecture | File System |

---

## ⚠️ Common Confusions

*   **Project vs. Collection:** A "Project" is the entire instance of Brand-Ops. A "Collection" is a folder within it.
*   **Sync vs. Backup:** "Sync" is bi-directional (rclone). "Backup" is a snapshot in the cloud.

---

**Maintainer:** @analyst (Ana)
