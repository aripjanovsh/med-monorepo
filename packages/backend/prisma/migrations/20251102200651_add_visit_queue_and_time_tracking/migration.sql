-- Step 1: Add new enum value (must be committed separately)
ALTER TYPE "VisitStatus" ADD VALUE IF NOT EXISTS 'WAITING';

-- Step 2: Add new columns (without using new enum yet)
ALTER TABLE "visits" 
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "queueNumber" INTEGER,
  ADD COLUMN IF NOT EXISTS "queuedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "serviceTimeMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "waitingTimeMinutes" INTEGER;

-- Step 3: Change default to new enum value (now safe)
ALTER TABLE "visits" ALTER COLUMN "status" SET DEFAULT 'WAITING';

-- CreateIndex
CREATE INDEX "visits_organizationId_employeeId_visitDate_idx" ON "visits"("organizationId", "employeeId", "visitDate");

-- CreateIndex
CREATE INDEX "visits_organizationId_status_idx" ON "visits"("organizationId", "status");

-- CreateIndex
CREATE INDEX "visits_employeeId_status_queuedAt_idx" ON "visits"("employeeId", "status", "queuedAt");
