# Data Models and APIs

## Prisma Schema Overview

**Database:** SQLite (file-based, self-hosted)  
**Connection:** Environment variable `DATABASE_URL`  
**Migrations:** Managed by Prisma

### Core Models

**CreativeFile** — Main asset record
```prisma
model CreativeFile {
  id        String   @id @default(cuid())
  path      String   @unique
  filename  String
  type      String
  size      BigInt
  mimeType  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  metadata     FileMetadata?
  versions     FileVersion[]
  syncMetadata SyncMetadata?
  projects     Project[]
  projectLogos ProjectConfig[]
}
```

**FileMetadata** — User-editable metadata
```prisma
model FileMetadata {
  id        String   @id @default(cuid())
  fileId    String   @unique
  type      String   // Asset type (image, video, design, etc.)
  status    String   // Draft, Final, Archived, etc.
  tags      String   // JSON-encoded array for SQLite persistence
  notes     String?
  updatedAt DateTime @updatedAt
}
```

**FileVersion** — Immutable version history
```prisma
model FileVersion {
  id         String   @id @default(cuid())
  fileId     String
  versionNum Int
  commitHash String // Git commit hash for tracking
  message    String // Commit message
  createdAt  DateTime @default(now())
  
  @@unique([fileId, versionNum])
}
```

**SyncMetadata** — Future sync/versioning integration
```prisma
model SyncMetadata {
  id             String   @id @default(cuid())
  fileId         String   @unique
  lastSyncTime   DateTime?
  syncStatus     String   @default("pending")
  syncError      String?
  externalId     String?
  externalSource String?
  // Reserved for future sync integration
}
```

**Project** — Brand/client projects
```prisma
model Project {
  id            String   @id @default(cuid())
  name          String
  niche         String        @default("")
  businessModel String        @default("INFOPRODUTO")
  instagramUrl  String?
  youtubeUrl    String?
  facebookUrl   String?
  tiktokUrl     String?
  logoFileId    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**ProjectConfig** — Project branding configuration
```prisma
model ProjectConfig {
  // Logo, icon, color scheme, etc.
  logoFileId      String? // References CreativeFile
  iconFileId      String?
  symbolFileId    String?
  wordmarkFileId  String?
  // Color definitions
}
```

## API Routes

**GET `/api/files/{id}`** — Fetch creative file  
Returns file metadata + versioning state

**PATCH `/api/files/{id}`** — Update file metadata  
Validates type, status, tags (max 20), notes (max 500)

**GET `/api/files/{id}?asset=preview`** — Download file  
Streams file from disk

**POST/GET `/api/projects/*`** — Project management  
CRUD operations for projects

**GET/POST `/api/versioning/*`** — Version operations  
Request version changes, commit history

---
