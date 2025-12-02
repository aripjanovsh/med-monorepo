-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "category" TEXT,
    "model" TEXT,
    "temperature" DOUBLE PRECISION DEFAULT 0.7,
    "maxTokens" INTEGER DEFAULT 1000,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "dislikeCount" INTEGER NOT NULL DEFAULT 0,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompts_key_key" ON "ai_prompts"("key");

-- CreateIndex
CREATE INDEX "ai_prompts_key_idx" ON "ai_prompts"("key");

-- CreateIndex
CREATE INDEX "ai_prompts_category_idx" ON "ai_prompts"("category");

-- CreateIndex
CREATE INDEX "ai_prompts_isActive_idx" ON "ai_prompts"("isActive");
