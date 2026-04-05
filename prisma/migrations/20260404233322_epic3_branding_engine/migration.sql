-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#7c3aed',
    "secondaryColor" TEXT NOT NULL DEFAULT '#fcd34d',
    "accentColor" TEXT NOT NULL DEFAULT '#f97316',
    "neutralBase" TEXT NOT NULL DEFAULT '#1A1427',
    "titleFont" TEXT NOT NULL DEFAULT 'Sora',
    "bodyFont" TEXT NOT NULL DEFAULT 'Inter',
    "clientBrandMode" TEXT NOT NULL DEFAULT 'FULL_SHELL',
    "surfaceStyle" TEXT NOT NULL DEFAULT 'AURORA',
    "visualDensity" TEXT NOT NULL DEFAULT 'BALANCED',
    "brandTone" TEXT NOT NULL DEFAULT 'LUXURY_STRATEGIC',
    "logoFileId" TEXT,
    "iconFileId" TEXT,
    "symbolFileId" TEXT,
    "wordmarkFileId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectConfig_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectConfig_iconFileId_fkey" FOREIGN KEY ("iconFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectConfig_symbolFileId_fkey" FOREIGN KEY ("symbolFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectConfig_wordmarkFileId_fkey" FOREIGN KEY ("wordmarkFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProjectConfig" ("bodyFont", "createdAt", "iconFileId", "id", "logoFileId", "primaryColor", "projectId", "secondaryColor", "titleFont", "updatedAt") SELECT "bodyFont", "createdAt", "iconFileId", "id", "logoFileId", "primaryColor", "projectId", "secondaryColor", "titleFont", "updatedAt" FROM "ProjectConfig";
DROP TABLE "ProjectConfig";
ALTER TABLE "new_ProjectConfig" RENAME TO "ProjectConfig";
CREATE UNIQUE INDEX "ProjectConfig_projectId_key" ON "ProjectConfig"("projectId");
CREATE INDEX "ProjectConfig_projectId_idx" ON "ProjectConfig"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
