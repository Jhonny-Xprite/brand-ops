# Integration Points and External Dependencies

## Service Integrations (Current)

**File System**
- Direct filesystem read/write for creative files
- Location: `src/lib/creativeFiles.ts`, `src/pages/api/files/`
- Pattern: Store file path in DB, serve from disk

**Git Integration** (simple-git)
- Version control via simple-git library
- Versioning service creates commits for metadata changes
- Location: `src/lib/versioning/`
- Pattern: Lightweight version tracking without full git history

**Prisma ORM**
- All database operations through Prisma client
- Single prisma.ts singleton instance
- Location: `src/lib/prisma.ts`

## API Design Pattern

**REST-based API routes** in Next.js
- File operations: `/api/files/{id}`
- Project management: `/api/projects/{id}`
- Versioning: `/api/versioning/{endpoint}`
- File uploads: `POST /api/files` (busboy parser)

## External Service Readiness

**Current:** Minimal external dependencies (local-first)  
**Future Integration Points:**
- Cloud storage (AWS S3, Google Cloud Storage) — for file storage
- OAuth providers — for user authentication
- Image processing APIs — for thumbnail generation
- Analytics services — for usage tracking

---
