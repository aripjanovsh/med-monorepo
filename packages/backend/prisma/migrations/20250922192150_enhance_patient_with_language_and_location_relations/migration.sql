/*
  Warnings:

  - You are about to drop the column `primaryLanguage` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryLanguage` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "primaryLanguage",
DROP COLUMN "secondaryLanguage",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "countryId" TEXT,
ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "primaryLanguageId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "secondaryLanguageId" TEXT;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_primaryLanguageId_fkey" FOREIGN KEY ("primaryLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_secondaryLanguageId_fkey" FOREIGN KEY ("secondaryLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
