-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "tags" TEXT,
    "properties" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creativeId" TEXT NOT NULL,
    CONSTRAINT "Metadata_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionNumber" INTEGER NOT NULL,
    "changes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creativeId" TEXT NOT NULL,
    CONSTRAINT "Version_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastSyncTime" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "syncError" TEXT,
    "externalId" TEXT,
    "externalSource" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creativeId" TEXT NOT NULL,
    CONSTRAINT "SyncMetadata_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Creative_createdAt_idx" ON "Creative"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_creativeId_key" ON "Metadata"("creativeId");

-- CreateIndex
CREATE INDEX "Metadata_creativeId_idx" ON "Metadata"("creativeId");

-- CreateIndex
CREATE INDEX "Version_creativeId_versionNumber_idx" ON "Version"("creativeId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SyncMetadata_creativeId_key" ON "SyncMetadata"("creativeId");

-- CreateIndex
CREATE INDEX "SyncMetadata_creativeId_syncStatus_idx" ON "SyncMetadata"("creativeId", "syncStatus");
