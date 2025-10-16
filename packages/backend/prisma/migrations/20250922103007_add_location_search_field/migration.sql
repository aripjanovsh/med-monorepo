-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "searchField" TEXT;

-- CreateIndex
CREATE INDEX "locations_searchField_idx" ON "locations"("searchField");
