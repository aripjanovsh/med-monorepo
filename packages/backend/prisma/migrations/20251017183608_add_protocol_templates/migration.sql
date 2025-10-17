-- CreateTable
CREATE TABLE "protocol_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "protocol_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "protocol_templates" ADD CONSTRAINT "protocol_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
