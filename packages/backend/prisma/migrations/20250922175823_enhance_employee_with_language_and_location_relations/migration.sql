/*
  Warnings:

  - You are about to drop the column `primaryLanguage` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryLanguage` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employees" DROP COLUMN "primaryLanguage",
DROP COLUMN "secondaryLanguage",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "countryId" TEXT,
ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "primaryLanguageId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "secondaryLanguageId" TEXT;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_primaryLanguageId_fkey" FOREIGN KEY ("primaryLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_secondaryLanguageId_fkey" FOREIGN KEY ("secondaryLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
