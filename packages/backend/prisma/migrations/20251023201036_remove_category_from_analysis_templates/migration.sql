/*
  Warnings:

  - You are about to drop the column `category` on the `analysis_templates` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "analysis_templates_category_idx";

-- AlterTable
ALTER TABLE "analysis_templates" DROP COLUMN "category";

-- DropEnum
DROP TYPE "AnalysisTemplateCategory";
