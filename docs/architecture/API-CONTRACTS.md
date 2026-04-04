# API & Data Contracts

**Project:** Brand-Ops
**Architecture:** Next.js + Prisma (SQLite)

---

## 📝 Prisma Schema Contracts (Core)

### Creative Model
```prisma
model Creative {
  id        String   @id @default(uuid())
  name      String
  type      String   // Image, Video, Document
  path      String   @unique
  versions  Version[]
  metadata  Metadata?
}
```

### Sync Contract (Internal)
```json
{
  "sync_id": "uuid",
  "last_modified": "ISO8601",
  "checksum": "sha256",
  "status": "synced | pending | conflict"
}
```

---

## 🔗 RTK Query Hooks (Frontend)

*   `useGetCreativesQuery()`: Fetches list with FTS search support.
*   `useUpdateMetadataMutation()`: Atomic update of JSON metadata.

---

**Maintainer:** @architect (Aria)
