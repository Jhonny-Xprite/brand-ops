-- CreateTable
CREATE TABLE "ProjectConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#7c3aed',
    "secondaryColor" TEXT NOT NULL DEFAULT '#fcd34d',
    "titleFont" TEXT NOT NULL DEFAULT 'Sora',
    "bodyFont" TEXT NOT NULL DEFAULT 'Inter',
    "logoFileId" TEXT,
    "iconFileId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectConfig_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectConfig_iconFileId_fkey" FOREIGN KEY ("iconFileId") REFERENCES "CreativeFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectConfig_projectId_key" ON "ProjectConfig"("projectId");

-- CreateIndex
CREATE INDEX "ProjectConfig_projectId_idx" ON "ProjectConfig"("projectId");
