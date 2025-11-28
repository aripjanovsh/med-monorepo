/*
  Warnings:

  - A unique constraint covering the columns `[avatarId]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "avatarId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_avatarId_key" ON "employees"("avatarId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
