/*
  Warnings:

  - A unique constraint covering the columns `[logoId]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "FileCategory" ADD VALUE 'LOGO';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "logoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_logoId_key" ON "organizations"("logoId");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
