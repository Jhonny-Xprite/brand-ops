/*
  Warnings:

  - You are about to drop the `Creative` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Metadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `creativeId` on the `SyncMetadata` table. All the data in the column will be lost.
  - Added the required column `fileId` to the `SyncMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Creative_createdAt_idx";

-- DropIndex
DROP INDEX "Metadata_creativeId_idx";

-- DropIndex
DROP INDEX "Metadata_creativeId_key";

-- DropIndex
DROP INDEX "Version_creativeId_versionNumber_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Creative";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Metadata";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Version";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CreativeFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FileMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FileMetadata_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "CreativeFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "versionNum" INTEGER NOT NULL,
    "commitHash" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileVersion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "CreativeFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SyncMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastSyncTime" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "syncError" TEXT,
    "externalId" TEXT,
    "externalSource" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fileId" TEXT NOT NULL,
    CONSTRAINT "SyncMetadata_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "CreativeFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SyncMetadata" ("createdAt", "externalId", "externalSource", "id", "lastSyncTime", "syncError", "syncStatus", "updatedAt") SELECT "createdAt", "externalId", "externalSource", "id", "lastSyncTime", "syncError", "syncStatus", "updatedAt" FROM "SyncMetadata";
DROP TABLE "SyncMetadata";
ALTER TABLE "new_SyncMetadata" RENAME TO "SyncMetadata";
CREATE UNIQUE INDEX "SyncMetadata_fileId_key" ON "SyncMetadata"("fileId");
CREATE INDEX "SyncMetadata_fileId_syncStatus_idx" ON "SyncMetadata"("fileId", "syncStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CreativeFile_path_key" ON "CreativeFile"("path");

-- CreateIndex
CREATE INDEX "CreativeFile_filename_idx" ON "CreativeFile"("filename");

-- CreateIndex
CREATE INDEX "CreativeFile_type_idx" ON "CreativeFile"("type");

-- CreateIndex
CREATE UNIQUE INDEX "FileMetadata_fileId_key" ON "FileMetadata"("fileId");

-- CreateIndex
CREATE INDEX "FileMetadata_fileId_idx" ON "FileMetadata"("fileId");

-- CreateIndex
CREATE INDEX "FileMetadata_type_idx" ON "FileMetadata"("type");

-- CreateIndex
CREATE INDEX "FileMetadata_status_idx" ON "FileMetadata"("status");

-- CreateIndex
CREATE INDEX "FileVersion_fileId_idx" ON "FileVersion"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileVersion_fileId_versionNum_key" ON "FileVersion"("fileId", "versionNum");
