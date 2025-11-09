-- Rename parameters column to content and change type from JSONB to TEXT
-- This aligns AnalysisTemplate with ProtocolTemplate structure

-- AlterTable
ALTER TABLE "analysis_templates" 
  RENAME COLUMN "parameters" TO "content";

-- Change column type from JSONB to TEXT
ALTER TABLE "analysis_templates" 
  ALTER COLUMN "content" TYPE TEXT USING "content"::TEXT;
