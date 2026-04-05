-- CreateTable
CREATE TABLE "ProjectLibraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "kind" TEXT NOT NULL DEFAULT 'NOTE',
    "payload" TEXT NOT NULL DEFAULT '{}',
    "linkUrl" TEXT,
    "assetFileId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectLibraryItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectLibraryItem_assetFileId_fkey" FOREIGN KEY ("assetFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL DEFAULT '',
    "businessModel" TEXT NOT NULL DEFAULT 'INFOPRODUTO',
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "logoFileId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "id", "logoFileId", "name", "updatedAt") SELECT "createdAt", "id", "logoFileId", "name", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_name_idx" ON "Project"("name");
CREATE INDEX "Project_businessModel_idx" ON "Project"("businessModel");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProjectLibraryItem_projectId_domain_idx" ON "ProjectLibraryItem"("projectId", "domain");

-- CreateIndex
CREATE INDEX "ProjectLibraryItem_projectId_domain_category_idx" ON "ProjectLibraryItem"("projectId", "domain", "category");

-- CreateIndex
CREATE INDEX "ProjectLibraryItem_projectId_updatedAt_idx" ON "ProjectLibraryItem"("projectId", "updatedAt");
