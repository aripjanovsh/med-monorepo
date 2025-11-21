/*
  Warnings:

  - Added the required column `organizationId` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add column as nullable first
ALTER TABLE "files" ADD COLUMN "organizationId" TEXT;

-- Update existing records: Extract organizationId from path (first part before '/')
UPDATE "files" 
SET "organizationId" = split_part("path", '/', 1)
WHERE "organizationId" IS NULL;

-- Make column NOT NULL after data is populated
ALTER TABLE "files" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "files_organizationId_idx" ON "files"("organizationId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
