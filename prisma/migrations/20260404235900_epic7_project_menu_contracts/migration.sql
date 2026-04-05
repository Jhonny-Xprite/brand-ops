-- CreateTable
CREATE TABLE "ProjectLibraryItemRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceItemId" TEXT NOT NULL,
    "targetItemId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectLibraryItemRelation_sourceItemId_fkey" FOREIGN KEY ("sourceItemId") REFERENCES "ProjectLibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectLibraryItemRelation_targetItemId_fkey" FOREIGN KEY ("targetItemId") REFERENCES "ProjectLibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLibraryItemRelation_sourceItemId_targetItemId_relationT_key" ON "ProjectLibraryItemRelation"("sourceItemId", "targetItemId", "relationType");

-- CreateIndex
CREATE INDEX "ProjectLibraryItemRelation_sourceItemId_idx" ON "ProjectLibraryItemRelation"("sourceItemId");

-- CreateIndex
CREATE INDEX "ProjectLibraryItemRelation_targetItemId_idx" ON "ProjectLibraryItemRelation"("targetItemId");

-- CreateIndex
CREATE INDEX "ProjectLibraryItemRelation_relationType_idx" ON "ProjectLibraryItemRelation"("relationType");
