-- DropIndex
DROP INDEX "locations_code_parentId_key";

-- DropIndex
DROP INDEX "locations_name_parentId_key";

-- CreateIndex
CREATE INDEX "locations_name_idx" ON "locations"("name");

-- CreateIndex
CREATE INDEX "locations_code_idx" ON "locations"("code");
