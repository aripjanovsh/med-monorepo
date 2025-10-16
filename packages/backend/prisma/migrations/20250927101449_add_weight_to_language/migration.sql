-- AlterTable
ALTER TABLE "languages" ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "languages_weight_idx" ON "languages"("weight");

-- CreateIndex
CREATE INDEX "languages_name_idx" ON "languages"("name");
