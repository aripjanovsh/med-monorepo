-- Change default templateType from 'richtext' to 'formbuilder'
-- Note: This migration changes the default value only
-- Existing records with 'richtext' type will remain unchanged
-- New records will default to 'formbuilder'

-- AlterTable
ALTER TABLE "protocol_templates" ALTER COLUMN "templateType" SET DEFAULT 'formbuilder';
