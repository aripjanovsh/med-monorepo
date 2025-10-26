-- CreateEnum
CREATE TYPE "AnalysisTemplateCategory" AS ENUM ('BLOOD', 'URINE', 'BIOCHEMISTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "ParameterType" AS ENUM ('NUMBER', 'TEXT', 'BOOLEAN');

-- CreateTable
CREATE TABLE "analysis_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "AnalysisTemplateCategory" NOT NULL,
    "description" TEXT,
    "parameters" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "analysis_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_templates_organizationId_idx" ON "analysis_templates"("organizationId");

-- CreateIndex
CREATE INDEX "analysis_templates_category_idx" ON "analysis_templates"("category");

-- CreateIndex
CREATE INDEX "analysis_templates_name_idx" ON "analysis_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_templates_code_organizationId_key" ON "analysis_templates"("code", "organizationId");

-- AddForeignKey
ALTER TABLE "analysis_templates" ADD CONSTRAINT "analysis_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
